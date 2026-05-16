from pydantic import BaseModel
from typing import List
from schemas.product_schema import Item

class OrderRequest(BaseModel):
    items: List[Item]
    total: float

class OrderCreate(BaseModel):
    user_id: int
    total_amount: float


class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    preference_id: str | None
    payment_id: str | None

    class Config:
        from_attributes = True