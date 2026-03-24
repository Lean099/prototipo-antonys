from pydantic import BaseModel
from typing import List

class UserCreate(BaseModel):
    name: str
    email: str
    passw: str

class UserLogin(BaseModel):
    email: str
    passw: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class Item(BaseModel):
    id: int
    title: str
    price: float
    quantity: int

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
