from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from services.address_services import getAddresses, createAddress, updateAddress, deleteAddress
from schemas.address_schema import AddressCreate, UpdateAddress

router = APIRouter(prefix="/address", tags=["Address"])

@router.post("/getAddresses/{idUser}")
def getAddressesData(idUser: str, db: Session = Depends(get_db)):
    return getAddresses(idUser, db)

@router.post("/createAddress/{idUser}")
def createAddressData(idUser: str, data: AddressCreate, db: Session = Depends(get_db)):
    return createAddress(idUser, data, db)

@router.post("/updateAddress/{idUser}/{idAddress}")
def updateAddressData(idUser: str, idAddress: str, data: UpdateAddress, db: Session = Depends(get_db)):
    return updateAddress(idUser, idAddress, data, db)

@router.delete("/deleteAddress/{idAddress}")
def deleteAddressData(idAddress: str, db: Session = Depends(get_db)):
    return deleteAddress(idAddress, db)