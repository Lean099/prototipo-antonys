from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from services.user_services import getOneUser, updateData, deleteUser
from services.address_services import getAddresses
from schemas.user_schema import UpdateUser

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/getOneUser/{idUser}")
def getUserData(idUser: str, db: Session = Depends(get_db)):
    return getOneUser(idUser, db)

@router.get("/getUserAddresses/{idUser}")
def getUserAddresses(idUser: str, db: Session = Depends(get_db)):
    return getAddresses(idUser, db)

@router.post("/updateUser/{idUser}")
def updateUserData(idUser: str, data: UpdateUser, db: Session = Depends(get_db)):
    return updateData(idUser, data, db)

@router.delete("/deleteUser/{idUser}")
def deleteAccount(idUser: str, db: Session = Depends(get_db)):
    return deleteUser(idUser, db)
