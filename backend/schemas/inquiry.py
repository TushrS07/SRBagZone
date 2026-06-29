from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re


PHONE_RE = re.compile(r"^[6-9]\d{9}$")  # 10-digit Indian mobile


class InquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    # Phone is optional so the Home page newsletter form (email-only) can also
    # land here. When provided, it must be a valid 10-digit Indian mobile.
    phone: Optional[str] = Field(default=None, max_length=15)
    email: Optional[EmailStr] = None
    requirement: str = Field(default="General Inquiry", max_length=50)
    message: str = Field(min_length=1)

    @field_validator("phone")
    @classmethod
    def _valid_phone(cls, v):
        if v is None:
            return None
        v = v.strip().replace(" ", "").replace("-", "")
        if not v:
            return None
        if not PHONE_RE.match(v):
            raise ValueError("Phone must be a 10-digit Indian mobile number")
        return v

    @field_validator("name", "message", "requirement")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()
