from enum import Enum
from typing import Optional
from pydantic import BaseModel


class UserRole(str, Enum):
    CUSTOMER = "customer"
    EMPLOYEE = "employee"
    ADMIN = "admin"


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True


class UpdateUser(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None