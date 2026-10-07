from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field

from schemas.order_item_schema import (
    OrderItemCreate,
    OrderItemResponse
)


class OrderCreate(BaseModel):
    user_id: str

    order_type: Literal[
        "delivery",
        "pickup",
        "table"
    ]

    address_id: Optional[str] = None

    payment_method: Literal[
        "cash",
        "transfer",
        "mercado_pago"
    ]

    items: list[OrderItemCreate] = Field(
        ...,
        min_length=1
    )

    notes: Optional[str] = None


class OrderItemResponseNested(OrderItemResponse):
    pass


class OrderResponse(BaseModel):
    id: str

    user_id: str

    customer_username: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

    status: str
    payment_method: str
    payment_status: str

    subtotal: Decimal
    delivery_fee: Decimal
    total: Decimal

    notes: Optional[str] = None

    order_type: str

    delivery_street: Optional[str] = None
    delivery_number: Optional[str] = None
    delivery_details: Optional[str] = None
    delivery_neighborhood: Optional[str] = None

    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None

    created_at: object
    updated_at: object

    items: list[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderItemNotesUpdate(BaseModel):
    notes: Optional[str] = None