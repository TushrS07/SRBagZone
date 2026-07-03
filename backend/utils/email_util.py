"""
Email sender.

Two modes, chosen automatically:
  • DEV / no key  → log the message to stdout so you can read OTPs and links
    from the backend console (when APP_ENV != production or BREVO_API_KEY is
    unset).
  • PRODUCTION    → send via Brevo's transactional email HTTP API.

`send_email` is async and safe to call from either the ARQ worker or, as a
fallback, directly from a request handler.
"""
import logging
import httpx
from config import settings

logger = logging.getLogger(__name__)

BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email"


async def send_email(to: str, subject: str, html_body: str, text_body: str | None = None) -> None:
    use_real = settings.app_env == "production" and bool(settings.brevo_api_key)

    if not use_real:
        logger.warning(
            "\n────────────── DEV EMAIL ──────────────\n"
            "To:      %s\n"
            "Subject: %s\n"
            "\n%s\n"
            "────────────────────────────────────────",
            to,
            subject,
            text_body or html_body,
        )
        return

    payload = {
        "sender": {"name": settings.email_from_name, "email": settings.email_from},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html_body,
    }
    if text_body:
        payload["textContent"] = text_body

    headers = {
        "api-key": settings.brevo_api_key,
        "content-type": "application/json",
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(BREVO_ENDPOINT, json=payload, headers=headers)

    if resp.status_code >= 400:
        # Raise so the ARQ worker records the failure and retries the job.
        logger.error("[email] Brevo rejected message to %s (%s): %s", to, resp.status_code, resp.text)
        resp.raise_for_status()

    logger.info("[email] sent '%s' to %s", subject, to)
