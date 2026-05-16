from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from services.address_services import createAddress, updateAddress, deleteAddress
from schemas.address_schema import AddressCreate


router = APIRouter(prefix="/address", tags=["Address"])

@router.post("/createAddress/{idUser}")
def getUserData(idUser: str, data: AddressCreate, db: Session = Depends(get_db)):
    return createAddress(idUser, data, db)

@router.post("/createAddress/{idUser}")
def getUserData(idUser: str, data: AddressCreate, db: Session = Depends(get_db)):
    return createAddress(idUser, data, db)