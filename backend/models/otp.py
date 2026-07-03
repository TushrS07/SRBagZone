from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime


class OtpCode(SQLModel, table=True):
    """
    One-time codes for email verification and password reset. The plaintext
    code is never stored — only an HMAC (see utils/otp.py). At most one active
    (unconsumed) code should exist per (email, purpose); issuing a new code
    invalidates older ones.
    """
    __tablename__ = "otp_codes"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, max_length=255)
    purpose: str = Field(max_length=30)  # 'verify_email' | 'reset_password'
    code_hash: str = Field(max_length=128)
    expires_at: datetime = Field(sa_type=DateTime(timezone=True))
    attempts: int = Field(default=0)
    max_attempts: int = Field(default=5)
    consumed_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
