from pydantic import BaseModel
from typing import Optional, List


class CartLine(BaseModel):
    product_id: int
    quantity: int


class AddressInput(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str


class OrderCreate(BaseModel):
    # Either pick a saved address by id, or send the fields inline:
    address_id: Optional[int] = None
    address: Optional[AddressInput] = None
    items: List[CartLine]


class OrderStatusUpdate(BaseModel):
    order_status: str  # pending | acknowledged | completed | cancelled
