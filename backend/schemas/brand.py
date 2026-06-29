from pydantic import BaseModel
from typing import Optional


class BrandCreate(BaseModel):
    name: str
    description: Optional[str] = None


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
