"""
Notification delivery — the actual work run by the ARQ worker.

`deliver()` renders the template for an event and sends the email. It is shared
by both the ARQ task (`send_notification`) and the inline fallback in
`job_queue.py`, so a Redis outage still delivers mail (just synchronously).
"""
import logging
from notifications.templates import render
from utils.email_util import send_email

logger = logging.getLogger(__name__)


async def deliver(event: str, to: str, context: dict) -> None:
    if not to:
        logger.warning("[notify] skipping %s — no recipient", event)
        return
    subject, html, text = render(event, context)
    await send_email(to=to, subject=subject, html_body=html, text_body=text)


async def send_notification(ctx, event: str, to: str, context: dict) -> None:
    """ARQ task. `ctx` is the worker context (unused here)."""
    await deliver(event, to, context)
