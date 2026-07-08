"""
Email template registry.

`render(event, context)` returns `(subject, html_body, text_body)` for a given
event name. Adding a new notification = add one entry here. The routers/worker
never build subject/body strings themselves; they pass an event + a plain-dict
context (JSON-safe: str / int / float / list / dict only).
"""
from config import settings

BRAND = "SR Bagz Zone"


def _shell(title: str, inner_html: str) -> str:
    """Wrap body HTML in a minimal branded layout."""
    return f"""\
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
  <div style="padding:20px 0;border-bottom:2px solid #111">
    <span style="font-size:20px;font-weight:700;letter-spacing:.5px">{BRAND}</span>
  </div>
  <div style="padding:24px 0">
    <h2 style="font-size:18px;margin:0 0 16px">{title}</h2>
    {inner_html}
  </div>
  <div style="padding:16px 0;border-top:1px solid #eee;font-size:12px;color:#888">
    This is an automated message from {BRAND}. Please do not reply.
  </div>
</div>"""


def _items_html(items: list[dict]) -> str:
    rows = "".join(
        f"<tr>"
        f"<td style='padding:6px 0'>{i.get('name','')} × {i.get('quantity',0)}</td>"
        f"<td style='padding:6px 0;text-align:right'>₹{i.get('subtotal',0):.2f}</td>"
        f"</tr>"
        for i in items
    )
    return f"<table style='width:100%;border-collapse:collapse;margin:12px 0'>{rows}</table>"


def _items_text(items: list[dict]) -> str:
    return "\n".join(
        f"  - {i.get('name','')} x{i.get('quantity',0)}  ₹{i.get('subtotal',0):.2f}" for i in items
    )


# ── Per-event renderers ────────────────────────────────────────────────────
# Each returns (subject, html, text).

def _verify_email_otp(c: dict):
    subject = f"Your {BRAND} verification code"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>Use this code to verify your email. It expires in {settings.otp_ttl_minutes} minutes.</p>"
        f"<p style='font-size:30px;font-weight:700;letter-spacing:6px;margin:16px 0'>{c['code']}</p>"
        f"<p>If you didn't create an account, you can ignore this email.</p>"
    )
    text = (
        f"Hi {c.get('name','there')},\n\n"
        f"Your {BRAND} verification code is: {c['code']}\n"
        f"It expires in {settings.otp_ttl_minutes} minutes.\n"
    )
    return subject, _shell("Verify your email", body), text


def _reset_password_otp(c: dict):
    subject = f"Your {BRAND} password reset code"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>Use this code to reset your password. It expires in {settings.otp_ttl_minutes} minutes.</p>"
        f"<p style='font-size:30px;font-weight:700;letter-spacing:6px;margin:16px 0'>{c['code']}</p>"
        f"<p>If you didn't request this, you can safely ignore this email.</p>"
    )
    text = (
        f"Hi {c.get('name','there')},\n\n"
        f"Your {BRAND} password reset code is: {c['code']}\n"
        f"It expires in {settings.otp_ttl_minutes} minutes.\n"
    )
    return subject, _shell("Reset your password", body), text


def _order_placed(c: dict):
    subject = f"Order #{c['order_id']} received — {BRAND}"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>Thanks for your order! We've received it and it's awaiting payment.</p>"
        f"{_items_html(c.get('items', []))}"
        f"<p style='font-weight:700'>Total: ₹{c.get('total',0):.2f}</p>"
        f"<p>Please submit your payment to confirm the order.</p>"
    )
    text = (
        f"Hi {c.get('name','there')},\n\nWe've received order #{c['order_id']}.\n\n"
        f"{_items_text(c.get('items', []))}\n\nTotal: ₹{c.get('total',0):.2f}\n\n"
        f"Please submit your payment to confirm the order.\n"
    )
    return subject, _shell(f"Order #{c['order_id']} received", body), text


def _payment_received(c: dict):
    subject = f"Payment received for order #{c['order_id']} — under review"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>We've received your payment of ₹{c.get('amount',0):.2f} for order "
        f"#{c['order_id']} and it's now under review. We'll email you once it's confirmed.</p>"
    )
    text = (
        f"Hi {c.get('name','there')},\n\nWe've received your payment of "
        f"₹{c.get('amount',0):.2f} for order #{c['order_id']}. It's under review.\n"
    )
    return subject, _shell("Payment under review", body), text


def _payment_confirmed(c: dict):
    subject = f"Payment confirmed for order #{c['order_id']} — {BRAND}"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>Your payment for order #{c['order_id']} is confirmed and your order is "
        f"now being processed. Thank you!</p>"
    )
    text = (
        f"Hi {c.get('name','there')},\n\nYour payment for order #{c['order_id']} is "
        f"confirmed. Your order is being processed.\n"
    )
    return subject, _shell("Payment confirmed", body), text


def _payment_rejected(c: dict):
    remarks = c.get("remarks")
    note = f"<p><b>Reason:</b> {remarks}</p>" if remarks else ""
    note_txt = f"Reason: {remarks}\n" if remarks else ""
    subject = f"Payment could not be verified for order #{c['order_id']}"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>Unfortunately we couldn't verify your payment for order #{c['order_id']}.</p>"
        f"{note}"
        f"<p>Please resubmit your payment from your orders page.</p>"
    )
    text = (
        f"Hi {c.get('name','there')},\n\nWe couldn't verify your payment for order "
        f"#{c['order_id']}.\n{note_txt}Please resubmit from your orders page.\n"
    )
    return subject, _shell("Payment not verified", body), text


def _order_completed(c: dict):
    subject = f"Order #{c['order_id']} completed — {BRAND}"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>Your order #{c['order_id']} is complete. We hope you love it — thank you "
        f"for shopping with {BRAND}!</p>"
    )
    text = f"Hi {c.get('name','there')},\n\nYour order #{c['order_id']} is complete. Thank you!\n"
    return subject, _shell("Order completed", body), text


def _order_cancelled(c: dict):
    subject = f"Order #{c['order_id']} cancelled — {BRAND}"
    body = (
        f"<p>Hi {c.get('name','there')},</p>"
        f"<p>Your order #{c['order_id']} has been cancelled. If this is unexpected, "
        f"please get in touch with us.</p>"
    )
    text = f"Hi {c.get('name','there')},\n\nYour order #{c['order_id']} has been cancelled.\n"
    return subject, _shell("Order cancelled", body), text


def _admin_new_order(c: dict):
    subject = f"[Admin] New order #{c['order_id']} — ₹{c.get('total',0):.2f}"
    body = (
        f"<p>New order placed.</p>"
        f"<p><b>Order:</b> #{c['order_id']}<br>"
        f"<b>Customer:</b> {c.get('customer_name','')} ({c.get('customer_email','')})</p>"
        f"{_items_html(c.get('items', []))}"
        f"<p style='font-weight:700'>Total: ₹{c.get('total',0):.2f}</p>"
    )
    text = (
        f"New order #{c['order_id']}\nCustomer: {c.get('customer_name','')} "
        f"({c.get('customer_email','')})\n{_items_text(c.get('items', []))}\n"
        f"Total: ₹{c.get('total',0):.2f}\n"
    )
    return subject, _shell("New order", body), text


def _admin_new_payment(c: dict):
    subject = f"[Admin] Payment to verify — order #{c['order_id']}"
    body = (
        f"<p>A payment was submitted and needs verification.</p>"
        f"<p><b>Order:</b> #{c['order_id']}<br>"
        f"<b>Customer:</b> {c.get('customer_name','')}<br>"
        f"<b>Amount:</b> ₹{c.get('amount',0):.2f}<br>"
        f"<b>UPI ref:</b> {c.get('upi_reference') or '—'}</p>"
    )
    text = (
        f"Payment to verify for order #{c['order_id']}\nCustomer: {c.get('customer_name','')}\n"
        f"Amount: ₹{c.get('amount',0):.2f}\nUPI ref: {c.get('upi_reference') or '-'}\n"
    )
    return subject, _shell("Payment to verify", body), text


def _admin_new_inquiry(c: dict):
    subject = f"[Admin] New inquiry — {c.get('requirement','General')}"
    body = (
        f"<p>New contact inquiry received.</p>"
        f"<p><b>Name:</b> {c.get('name','')}<br>"
        f"<b>Email:</b> {c.get('email') or '—'}<br>"
        f"<b>Phone:</b> {c.get('phone') or '—'}<br>"
        f"<b>Requirement:</b> {c.get('requirement','')}</p>"
        f"<p><b>Message:</b><br>{c.get('message','')}</p>"
    )
    text = (
        f"New inquiry\nName: {c.get('name','')}\nEmail: {c.get('email') or '-'}\n"
        f"Phone: {c.get('phone') or '-'}\nRequirement: {c.get('requirement','')}\n\n"
        f"{c.get('message','')}\n"
    )
    return subject, _shell("New inquiry", body), text


_REGISTRY = {
    "verify_email_otp": _verify_email_otp,
    "reset_password_otp": _reset_password_otp,
    "order_placed": _order_placed,
    "payment_received": _payment_received,
    "payment_confirmed": _payment_confirmed,
    "payment_rejected": _payment_rejected,
    "order_completed": _order_completed,
    "order_cancelled": _order_cancelled,
    "admin_new_order": _admin_new_order,
    "admin_new_payment": _admin_new_payment,
    "admin_new_inquiry": _admin_new_inquiry,
}


def render(event: str, context: dict) -> tuple[str, str, str]:
    try:
        renderer = _REGISTRY[event]
    except KeyError:
        raise ValueError(f"Unknown notification event: {event!r}")
    return renderer(context)
