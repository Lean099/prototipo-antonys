from typing import Optional
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class UpdateUser(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

