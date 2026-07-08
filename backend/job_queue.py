"""
Enqueue side of the notification pipeline (used by the FastAPI API).

The ARQ Redis pool is created once at app startup (see main.py lifespan) and
registered here via `set_pool`. Handlers call `enqueue(event, to, context)`,
which returns immediately after pushing a job.

If Redis is not configured or unreachable, we fall back to sending inline so a
Redis outage degrades to "slower requests" rather than "no email at all".
"""
import logging
from typing import Optional
from arq import create_pool
from arq.connections import ArqRedis, RedisSettings
from config import settings

logger = logging.getLogger(__name__)

_pool: Optional[ArqRedis] = None


def redis_settings() -> RedisSettings:
    return RedisSettings.from_dsn(settings.redis_url)


async def create_redis_pool() -> Optional[ArqRedis]:
    """Create the ARQ pool if REDIS_URL is set. Returns None otherwise."""
    if not settings.redis_url:
        logger.warning("[queue] REDIS_URL not set — notifications will send inline")
        return None
    global _pool
    _pool = await create_pool(redis_settings())
    logger.info("[queue] ARQ Redis pool ready")
    return _pool


async def close_redis_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.aclose()
        _pool = None


def set_pool(pool: Optional[ArqRedis]) -> None:
    global _pool
    _pool = pool


async def enqueue(event: str, to: str, context: dict) -> None:
    """Queue a notification job; fall back to inline delivery on any failure."""
    if _pool is not None:
        try:
            await _pool.enqueue_job("send_notification", event, to, context)
            return
        except Exception:
            logger.exception("[queue] enqueue failed for %s → sending inline", event)

    # Fallback: deliver in-process. Imported lazily to avoid a circular import.
    from notifications.tasks import deliver

    try:
        await deliver(event, to, context)
    except Exception:
        logger.exception("[queue] inline delivery failed for %s to %s", event, to)
