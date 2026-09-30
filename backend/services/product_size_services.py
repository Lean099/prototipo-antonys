from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from models.product_model import Product
from models.product_size_model import ProductSize
from schemas.product_size_schema import (
    ProductSizeCreate,
    ProductSizeUpdate
)


def createProductSize(data: ProductSizeCreate, db):
    try:
        product = db.query(Product).filter(
            Product.id == data.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        existing_size = db.query(ProductSize).filter(
            ProductSize.product_id == data.product_id,
            ProductSize.name == data.name
        ).first()

        if existing_size:
            raise HTTPException(
                status_code=400,
                detail="Este tamaño ya existe para el producto"
            )

        new_size = ProductSize(
            product_id=data.product_id,
            name=data.name,
            price=data.price
        )

        db.add(new_size)
        db.commit()
        db.refresh(new_size)

        return {
            "message": "Tamaño creado correctamente",
            "size": new_size
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al crear el tamaño"
        )


def getSizesByProductId(product_id, db):
    try:
        product = db.query(Product).filter(
            Product.id == product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        sizes = db.query(ProductSize).filter(
            ProductSize.product_id == product_id
        ).all()

        return sizes

    except HTTPException:
        raise

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener los tamaños del producto"
        )


def getProductSizeById(size_id, db):
    try:
        size = db.query(ProductSize).filter(
            ProductSize.id == size_id
        ).first()

        if not size:
            raise HTTPException(
                status_code=404,
                detail="Tamaño no encontrado"
            )

        return size

    except HTTPException:
        raise

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener el tamaño"
        )


def updateProductSize(size_id, data: ProductSizeUpdate, db):
    try:
        size = db.query(ProductSize).filter(
            ProductSize.id == size_id
        ).first()

        if not size:
            raise HTTPException(
                status_code=404,
                detail="Tamaño no encontrado"
            )

        if data.name is not None or data.price is not None:

            new_name = (
                data.name
                if data.name is not None
                else size.name
            )

            existing_size = db.query(ProductSize).filter(
                ProductSize.product_id == size.product_id,
                ProductSize.name == new_name,
                ProductSize.id != size_id
            ).first()

            if existing_size:
                raise HTTPException(
                    status_code=400,
                    detail="Este tamaño ya existe para el producto"
                )

        if data.name is not None:
            size.name = data.name

        if data.price is not None:
            size.price = data.price

        db.commit()
        db.refresh(size)

        return {
            "message": "Tamaño actualizado correctamente",
            "size": size
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el tamaño"
        )


def deleteProductSize(size_id, db):
    try:
        size = db.query(ProductSize).filter(
            ProductSize.id == size_id
        ).first()

        if not size:
            raise HTTPException(
                status_code=404,
                detail="Tamaño no encontrado"
            )

        db.delete(size)
        db.commit()

        return {
            "message": "Tamaño eliminado correctamente"
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar el tamaño"
        )