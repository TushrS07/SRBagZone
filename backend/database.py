from typing import AsyncGenerator
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from config import settings


def _build_url():
    if settings.server_host and settings.database_name:
        return URL.create(
            drivername="postgresql+asyncpg",
            username=settings.database_user,
            password=settings.database_password,
            host=settings.server_host,
            port=settings.server_port,
            database=settings.database_name,
        )
    return settings.database_url


_url = _build_url()

# Use the Neon pooler endpoint for faster cold starts (~2-5s vs 20-30s).
# PgBouncer doesn't support prepared statements, so we disable statement cache.
engine: AsyncEngine = create_async_engine(
    _url,
    echo=False,
    future=True,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "ssl": "require",
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
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
