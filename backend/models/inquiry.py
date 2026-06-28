from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime


class Inquiry(SQLModel, table=True):
    __tablename__ = "inquiries"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    phone: Optional[str] = Field(default=None, max_length=15)
    email: Optional[str] = Field(default=None, max_length=255)
    requirement: str = Field(default="General Inquiry", max_length=50)
    message: str
    is_read: bool = False
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
