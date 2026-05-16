from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from schemas.auth_schema import UserLogin, UserRegister
from services.auth_services import login_user, register_user
from config.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    return register_user(data, db)

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    return login_user(data, db)