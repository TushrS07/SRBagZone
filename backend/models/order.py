from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime


class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    address_id: int = Field(foreign_key="addresses.id")
    total_amount: Decimal = Field(decimal_places=2, max_digits=12)
    order_status: str = Field(default="pending", max_length=30)
    payment_status: str = Field(default="pending", max_length=30)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", index=True)
    product_id: int = Field(foreign_key="products.id")
    quantity: int
    price: Decimal = Field(decimal_places=2, max_digits=10)
    subtotal: Decimal = Field(decimal_places=2, max_digits=12)
