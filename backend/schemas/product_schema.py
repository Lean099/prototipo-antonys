import json
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from schemas.product_size_schema import ProductSizeInput, ProductSizeResponse


class ProductBase(BaseModel):
    category_id: str
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    price: Decimal = Field(
        ...,
        ge=0,
        max_digits=10,
        decimal_places=2
    )
    has_stock: bool = False
    stock: Optional[int] = Field(None, ge=0)
    is_available: bool = True


class ProductCreate(ProductBase):
    sizes: list[ProductSizeInput] = Field(default_factory=list)

    @field_validator("sizes", mode="before")
    @classmethod
    def parse_sizes(cls, value):
        if not value:
            return []

        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                raise ValueError("El formato de sizes no es válido")

        return value


class ProductUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(
        None,
        ge=0,
        max_digits=10,
        decimal_places=2
    )
    has_stock: Optional[bool] = None
    stock: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None

    sizes: list[ProductSizeInput] | None = None

    @field_validator("sizes", mode="before")
    @classmethod
    def parse_sizes(cls, value):
        if value is None or value == "":
            return None

        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                raise ValueError("El formato de sizes no es válido")

        return value


class ProductResponse(ProductBase):
    id: str
    image_url: Optional[str] = None
    sizes: list[ProductSizeResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)