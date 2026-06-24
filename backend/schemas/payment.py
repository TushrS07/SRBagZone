from pydantic import BaseModel
from typing import Optional


class PaymentSubmit(BaseModel):
    upi_reference_number: Optional[str] = None
    # screenshot is uploaded as a multipart file via the route, not in this schema.


class PaymentDecision(BaseModel):
    remarks: Optional[str] = None
