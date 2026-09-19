from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.category_services import getAllCategories, createCategory, updateCategory, deleteCategory
from services.product_services import getProductByCategoryId
from schemas.category_schema import CategoryCreate, CategoryUpdate

from config.database import get_db


router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/getAllCategories")
def get_all_categories(db: Session = Depends(get_db)):
    return getAllCategories(db)

@router.get("/getProductsByCategoryId/{category_id}")
def get_products_by_category_id(category_id: str, db: Session = Depends(get_db)):
    return getProductByCategoryId(category_id, db)

@router.post("/createCategory")
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return createCategory(data, db)

@router.put("/updateCategory/{idCategory}")
def update_category(idCategory: str, data: CategoryUpdate, db: Session = Depends(get_db)):
    return updateCategory(idCategory, data, db)

@router.delete("/deleteCategory/{idCategory}")
def delete_category(idCategory: str, db: Session = Depends(get_db)):
    return deleteCategory(idCategory, db)