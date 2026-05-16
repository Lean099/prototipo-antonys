from pydantic import BaseModel
from typing import Optional

class AddressCreate(BaseModel):
    label: str
    street: str
    street_number: str
    details: Optional[str] = None
    neighborhood: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None
    

class UpdateAddress(BaseModel):
    label: Optional[str] = None
    street: Optional[str] = None
    street_number: Optional[str] = None
    details: Optional[str] = None
    neighborhood: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None