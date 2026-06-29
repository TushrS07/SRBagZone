from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime


class User(SQLModel, table=True):
    """
    Unified users table — both admins and customers live here, distinguished
    by the `role` column. Matches the live `SR Bagz Zone` schema exactly,
    plus the verification/reset columns added by 001_extend_live_schema.sql.
    """
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str
    phone: Optional[str] = Field(default=None, max_length=15)
    role: str = Field(default="customer", max_length=20)  # 'customer' | 'admin'
    is_active: bool = True
    is_verified: bool = False
    verification_token: Optional[str] = Field(default=None, max_length=128, index=True)
    reset_token: Optional[str] = Field(default=None, max_length=128, index=True)
    reset_token_expires: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
