from decimal import Decimal

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from config.database import get_db

from services.product_services import (
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
)

from schemas.product_schema import ProductCreate, ProductUpdate


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/createProduct")
async def create_product(
    category_id: str = Form(...),
    name: str = Form(...),
    description: str | None = Form(None),
    price: Decimal = Form(...),
    has_stock: bool = Form(False),
    stock: int | None = Form(None),
    is_available: bool = Form(True),
    sizes: str | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    data = ProductCreate(
        category_id=category_id,
        name=name,
        description=description,
        price=price,
        has_stock=has_stock,
        stock=stock,
        is_available=is_available,
        sizes=sizes
    )

    return await createProduct(
        data,
        db,
        image=image
    )


@router.get("/getAllProducts")
def get_all_products(db: Session = Depends(get_db)):
    products = getAllProducts(db)

    return [
        {
            "id": product.id,
            "category_id": product.category_id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "has_stock": product.has_stock,
            "stock": product.stock,
            "image_url": product.image_url,
            "is_available": product.is_available,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "sizes": [
                {
                    "id": size.id,
                    "product_id": size.product_id,
                    "name": size.name,
                    "price": size.price
                }
                for size in product.sizes
            ]
        }
        for product in products
    ]


@router.get("/getProductById/{idProduct}")
def get_product_by_id(
    idProduct: str,
    db: Session = Depends(get_db)
):
    return getProductById(idProduct, db)


@router.put("/updateProduct/{idProduct}")
async def update_product(
    idProduct: str,

    category_id: str | None = Form(None),
    name: str | None = Form(None),
    description: str | None = Form(None),
    price: Decimal | None = Form(None),
    has_stock: bool | None = Form(None),
    stock: int | None = Form(None),
    is_available: bool | None = Form(None),
    sizes: str | None = Form(None),

    image: UploadFile | None = File(None),

    db: Session = Depends(get_db)
):
    data = ProductUpdate(
        category_id=category_id,
        name=name,
        description=description,
        price=price,
        has_stock=has_stock,
        stock=stock,
        is_available=is_available,
        sizes=sizes
    )

    return await updateProduct(
        idProduct,
        data,
        db,
        image=image
    )


@router.delete("/deleteProduct/{idProduct}")
async def delete_product(
    idProduct: str,
    db: Session = Depends(get_db)
):
    return await deleteProduct(idProduct, db)