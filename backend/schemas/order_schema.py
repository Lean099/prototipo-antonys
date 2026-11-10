from decimal import Decimal
from typing import Literal, Optional
from datetime import datetime

from pydantic import BaseModel, Field, model_validator

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

    # Solo utilizado para pedidos de mesa
    table_number: Optional[str] = None

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

    # customer | employee
    order_source: str

    payment_method: str
    payment_status: str

    subtotal: Decimal
    delivery_fee: Decimal
    total: Decimal

    notes: Optional[str] = None

    order_type: str

    # Solo para pedidos de mesa
    table_number: Optional[str] = None

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



from pydantic import model_validator


class AdminOrderCreate(BaseModel):
    # Si se selecciona un cliente registrado, se utiliza su cuenta.
    # Si queda vacío, se utiliza el usuario genérico.
    user_id: Optional[str] = None

    # Datos para identificar al cliente en este pedido.
    # Especialmente útiles para pedidos ocasionales.
    customer_name: Optional[str] = Field(
        default=None,
        max_length=30
    )
    customer_phone: Optional[str] = Field(
        default=None,
        max_length=20
    )
    customer_email: Optional[str] = Field(
        default=None,
        max_length=100
    )

    order_type: Literal["delivery", "pickup", "table"]

    # Puede utilizarse una dirección guardada o una dirección manual.
    address_id: Optional[str] = None
    delivery_street: Optional[str] = Field(
        default=None,
        max_length=120
    )
    delivery_number: Optional[str] = Field(
        default=None,
        max_length=20
    )
    delivery_details: Optional[str] = None
    delivery_neighborhood: Optional[str] = Field(
        default=None,
        max_length=100
    )
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    delivery_location_url: Optional[str] = Field(
        default=None,
        max_length=500
    )

    table_number: Optional[str] = Field(
        default=None,
        max_length=10
    )

    payment_method: Literal["cash", "transfer", "mercado_pago"]

    items: list[OrderItemCreate] = Field(
        ...,
        min_length=1
    )

    notes: Optional[str] = None

    
    @model_validator(mode="after")
    def validate_order_details(self):
        if self.order_type == "delivery":
            has_saved_address = bool(
                self.address_id and self.address_id.strip()
            )

            has_manual_address = bool(
                self.delivery_street
                and self.delivery_street.strip()
                and self.delivery_number
                and self.delivery_number.strip()
            )

            if not has_saved_address and not has_manual_address:
                raise ValueError(
                    "El delivery requiere una dirección guardada "
                    "o una calle y número."
                )

        if self.order_type == "table":
            if not self.table_number or not self.table_number.strip():
                raise ValueError(
                    "El pedido de mesa requiere un número de mesa."
                )

        return self



class OrderStatusUpdate(BaseModel):
    status: Literal[
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "on_the_way",
        "delivered",
        "cancelled"
    ]


class OrderPaymentStatusUpdate(BaseModel):
    payment_status: Literal[
        "pending",
        "paid",
        "failed"
    ]


class AdminOrderUpdate(BaseModel):
    # Datos para identificar al cliente en este pedido.
    customer_name: Optional[str] = Field(
        default=None,
        max_length=30
    )
    customer_phone: Optional[str] = Field(
        default=None,
        max_length=20
    )
    customer_email: Optional[str] = Field(
        default=None,
        max_length=100
    )

    order_type: Literal["delivery", "pickup", "table"]

    # Dirección guardada o manual.
    address_id: Optional[str] = None

    delivery_street: Optional[str] = Field(
        default=None,
        max_length=120
    )
    delivery_number: Optional[str] = Field(
        default=None,
        max_length=20
    )
    delivery_details: Optional[str] = None
    delivery_neighborhood: Optional[str] = Field(
        default=None,
        max_length=100
    )
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    delivery_location_url: Optional[str] = Field(
        default=None,
        max_length=500
    )

    table_number: Optional[str] = Field(
        default=None,
        max_length=10
    )

    payment_method: Literal[
        "cash",
        "transfer",
        "mercado_pago"
    ]

    # La lista representa todos los artículos que tendrá
    # el pedido después de la edición.
    items: list[OrderItemCreate] = Field(
        ...,
        min_length=1
    )

    notes: Optional[str] = None

    expected_updated_at: datetime

    @model_validator(mode="after")
    def validate_order_details(self):
        if self.order_type == "delivery":
            has_saved_address = bool(
                self.address_id and self.address_id.strip()
            )

            has_manual_address = bool(
                self.delivery_street
                and self.delivery_street.strip()
                and self.delivery_number
                and self.delivery_number.strip()
            )

            if not has_saved_address and not has_manual_address:
                raise ValueError(
                    "El delivery requiere una dirección guardada "
                    "o una calle y número."
                )

        if self.order_type == "table":
            if not self.table_number or not self.table_number.strip():
                raise ValueError(
                    "El pedido de mesa requiere un número de mesa."
                )

        return self

class OrderItemUnitNoteUpdate(BaseModel):
    unit_number: int = Field(ge=1)
    notes: Optional[str] = None


class OrderItemBulkNotesUpdate(BaseModel):
    item_id: str

    units: list[OrderItemUnitNoteUpdate] = Field(
        default_factory=list
    )


class OrderBulkNotesUpdate(BaseModel):
    expected_updated_at: datetime

    items: list[OrderItemBulkNotesUpdate] = Field(
        ...,
        min_length=1
    )