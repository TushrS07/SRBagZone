from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime


class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id", index=True)
    brand_id: Optional[int] = Field(default=None, foreign_key="brands.id", index=True)
    name: str = Field(max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(decimal_places=2, max_digits=10)
    stock_quantity: int = 0
    image_url: Optional[str] = None  # Primary/legacy image; multi-image lives in product_images.
    is_active: bool = True
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )


class ProductImage(SQLModel, table=True):
    __tablename__ = "product_images"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id", index=True)
    url: str
    public_id: Optional[str] = Field(default=None, max_length=255)
    position: int = 0
    is_primary: bool = False
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
