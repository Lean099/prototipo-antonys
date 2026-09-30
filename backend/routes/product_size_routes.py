from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.product_size_schema import (
    ProductSizeCreate,
    ProductSizeUpdate
)
from services.product_size_services import (
    createProductSize,
    getSizesByProductId,
    getProductSizeById,
    updateProductSize,
    deleteProductSize
)


router = APIRouter(
    prefix="/product-sizes",
    tags=["Product Sizes"]
)


@router.post("/createProductSize")
def create_product_size(
    data: ProductSizeCreate,
    db: Session = Depends(get_db)
):
    return createProductSize(data, db)


@router.get("/getSizesByProduct/{product_id}")
def get_sizes_by_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    return getSizesByProductId(product_id, db)


@router.get("/getProductSizeById/{size_id}")
def get_product_size_by_id(
    size_id: str,
    db: Session = Depends(get_db)
):
    return getProductSizeById(size_id, db)


@router.put("/updateProductSize/{size_id}")
def update_product_size(
    size_id: str,
    data: ProductSizeUpdate,
    db: Session = Depends(get_db)
):
    return updateProductSize(size_id, data, db)


@router.delete("/deleteProductSize/{size_id}")
def delete_product_size(
    size_id: str,
    db: Session = Depends(get_db)
):
    return deleteProductSize(size_id, db)