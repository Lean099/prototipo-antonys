from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: str

    product_size_id: Optional[str] = None

    quantity: int = Field(
        ...,
        ge=1
    )

    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_size_id: Optional[str] = None

    product_name: str
    product_size_name: Optional[str] = None

    unit_price: Decimal
    quantity: int
    subtotal: Decimal

    notes: Optional[str] = None

    class Config:
        from_attributes = True