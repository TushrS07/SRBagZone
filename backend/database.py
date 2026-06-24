import uuid
from typing import AsyncGenerator
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from config import settings


def _build_url():
    """
    Build the connection URL. Prefer SERVER_HOST/DATABASE_NAME (handles
    database names with spaces correctly) over a raw DATABASE_URL.
    """
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

# NullPool + statement_cache_size=0 + unique prepared-statement names = safe
# for Neon's PgBouncer-style transaction pooler.
engine: AsyncEngine = create_async_engine(
    _url,
    echo=False,
    future=True,
    poolclass=NullPool,
    connect_args={
        "ssl": "require",
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
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
