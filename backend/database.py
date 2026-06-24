from typing import AsyncGenerator
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from config import settings


def _direct_neon_host(host: str) -> str:
    """
    Neon exposes two hostnames for every database:
      • `<endpoint>-pooler...` — PgBouncer-style transaction pooler. Saves on
        connection setup but does NOT support server-side prepared statements,
        which forces us to disable connection pooling app-side (NullPool) AND
        statement caching — every query becomes much slower.
      • `<endpoint>...` (no -pooler) — direct connection. Full prepared statement
        support; SQLAlchemy can pool + cache plans normally.

    For our workload (medium traffic, latency-sensitive product list endpoint),
    direct is dramatically faster. We transparently strip `-pooler` if present.
    """
    return host.replace("-pooler", "") if "-pooler" in host else host


def _build_url():
    if settings.server_host and settings.database_name:
        return URL.create(
            drivername="postgresql+asyncpg",
            username=settings.database_user,
            password=settings.database_password,
            host=_direct_neon_host(settings.server_host),
            port=settings.server_port,
            database=settings.database_name,
        )
    return settings.database_url


_url = _build_url()

# Normal connection pool. Direct endpoint supports prepared statements, so
# SQLAlchemy's asyncpg dialect can cache plans → much lower per-query latency.
engine: AsyncEngine = create_async_engine(
    _url,
    echo=False,
    future=True,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,  # Neon may close idle conns; recycle proactively
    connect_args={
        "ssl": "require",
    },
)

async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def connect_db() -> None:
    """
    Verify the connection on startup. The schema is externally managed
    (live DB; migrations live in `migrations/`), so we do NOT call
    SQLModel.metadata.create_all here.
    """
    from sqlalchemy import text

    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT current_database()"))
        row = result.scalar()
        print(f"[db] Connected to '{row}'")


async def close_db() -> None:
    await engine.dispose()
    print("[db] Connection pool disposed")


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
