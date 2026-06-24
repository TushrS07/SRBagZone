"""
Email sender — DEV MODE.

In dev (`APP_ENV != production`) we just log the email to stdout so you can
copy the verification / reset link manually. For production, replace
`send_email()` with a real SMTP / SendGrid / SES integration.
"""
import logging
from config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> None:
    if settings.app_env != "production":
        # DEV: print the email content to the backend console
        logger.warning(
            "\n────────────── DEV EMAIL ──────────────\n"
            "To:      %s\n"
            "Subject: %s\n"
            "\n%s\n"
            "────────────────────────────────────────",
            to,
            subject,
            body,
        )
        return

    # PRODUCTION TODO: integrate SendGrid / SES / SMTP. Example sketch:
    #
    #   from sendgrid import SendGridAPIClient
    #   from sendgrid.helpers.mail import Mail
    #   client = SendGridAPIClient(settings.sendgrid_api_key)
    #   msg = Mail(from_email='noreply@srbagzone.com', to_emails=to,
    #              subject=subject, plain_text_content=body)
    #   client.send(msg)
    logger.error("[email] PRODUCTION email sending is not configured — email to %s was DROPPED", to)
