from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from services.user_services import (
    createUser,
    getOneUser,
    getAllUsers,
    updateData,
    deleteUser
)
from services.address_services import getAddresses
from schemas.user_schema import UpdateUser, UserCreate, UserRole, SortOrder

router = APIRouter(prefix="/user", tags=["User"])


@router.post("/createUser")
def createUserData(data: UserCreate, db: Session = Depends(get_db)):
    return createUser(data, db)


@router.get("/getOneUser/{idUser}")
def getUserData(idUser: str, db: Session = Depends(get_db)):
    return getOneUser(idUser, db)


@router.get("/getAllUsers")
def getAllUsersData(
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    role: UserRole | None = None,
    is_active: bool | None = None,
    sort_order: SortOrder = SortOrder.DESC,
    db: Session = Depends(get_db)
):
    return getAllUsers(
        db,
        page=page,
        limit=limit,
        search=search,
        role=role,
        is_active=is_active,
        sort_order=sort_order
    )


@router.get("/getUserAddresses/{idUser}")
def getUserAddresses(idUser: str, db: Session = Depends(get_db)):
    return getAddresses(idUser, db)


@router.put("/updateUser/{idUser}")
def updateUserData(
    idUser: str,
    data: UpdateUser,
    db: Session = Depends(get_db)
):
    return updateData(idUser, data, db)


@router.delete("/deleteUser/{idUser}")
def deleteAccount(idUser: str, db: Session = Depends(get_db)):
    return deleteUser(idUser, db)