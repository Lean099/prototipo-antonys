from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.categories_services import getAllCategories

from config.database import get_db


router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/getAllCategories")
def getAllCategories(db: Session = Depends(get_db)):
    
    return getAllCategories(db)