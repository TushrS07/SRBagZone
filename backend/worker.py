"""
ARQ worker entrypoint — runs as the Render Background Worker.

Start command:
    arq worker.WorkerSettings

It consumes jobs from Upstash Redis and sends emails via Brevo. It does NOT
touch the database: every job carries a self-contained, JSON-safe context, so
the worker stays stateless and independent of the API.
"""
import logging
from arq.connections import RedisSettings
from config import settings
from notifications.tasks import send_notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker")


async def startup(ctx):
    logger.info("[worker] started (env=%s)", settings.app_env)


async def shutdown(ctx):
    logger.info("[worker] shutting down")


class WorkerSettings:
    functions = [send_notification]
    redis_settings = RedisSettings.from_dsn(settings.redis_url) if settings.redis_url else RedisSettings()
    on_startup = startup
    on_shutdown = shutdown
    max_tries = 4          # retry a failed send a few times (exponential backoff)
    job_timeout = 30       # seconds per job
