from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

class ProductSizeInput(BaseModel):
    name: Literal["simple", "doble", "triple", "cuadruple"]
    price: Decimal = Field(
        ...,
        ge=0,
        max_digits=10,
        decimal_places=2
    )

class ProductSizeBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=30
    )

    price: Decimal = Field(
        ...,
        ge=0,
        max_digits=10,
        decimal_places=2
    )


class ProductSizeCreate(ProductSizeBase):
    product_id: str


class ProductSizeUpdate(BaseModel):
    name: str | None = Field(
        None,
        min_length=1,
        max_length=30
    )

    price: Decimal | None = Field(
        None,
        ge=0,
        max_digits=10,
        decimal_places=2
    )


class ProductSizeResponse(ProductSizeBase):
    id: str
    product_id: str

    model_config = ConfigDict(from_attributes=True)