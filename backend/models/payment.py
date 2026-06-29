from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", unique=True)
    payment_method: Optional[str] = Field(default="UPI", max_length=50)
    upi_reference_number: Optional[str] = Field(default=None, max_length=100)
    screenshot_url: Optional[str] = None
    amount: Decimal = Field(decimal_places=2, max_digits=12)
    payment_status: str = Field(default="pending", max_length=30)
    verified_by: Optional[int] = Field(default=None, foreign_key="users.id")
    verified_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    remarks: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
