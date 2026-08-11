from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from models.product_model import Product

def createProduct(data, db):
    try:
        existing_product = db.query(Product).filter(Product.name == data.name).first()
        if existing_product:
            raise HTTPException(
                status_code=400,
                detail="El producto ya existe"
            )

        # Crear nuevo producto
        new_product = Product(
            name=data.name,
            description=data.description,
            price=data.price,
            stock=data.stock,
            category_id=data.category_id
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {
            "message": "Producto creado correctamente",
            "product": new_product
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al crear el producto"
        )

def getAllProducts(db):
    try:
        products = db.query(Product).all()
        return products
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener los productos"
        )
    
def getProductById(idProduct, db):
    try:
        product = db.query(Product).get(idProduct)

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        return product

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener el producto"
        )

def updateProduct(idProduct, data, db):
    try:
        product = db.query(Product).get(idProduct)

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        # Actualizar los campos del producto
        if data.name:
            product.name = data.name
        if data.description:
            product.description = data.description
        if data.price is not None:
            product.price = data.price
        if data.image_url is not None:
            product.image_url = data.image_url
        if data.stock is not None:
            product.stock = data.stock
        if data.category_id is not None:
            product.category_id = data.category_id

        db.commit()
        db.refresh(product)

        return {
            "message": "Producto actualizado correctamente",
            "product": product
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el producto"
        )
    
def toggleProductAvailability(idProduct, db):
    try:
        product = db.query(Product).get(idProduct)

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        # Cambiar el estado de disponibilidad del producto
        product.is_available = not product.is_available

        db.commit()
        db.refresh(product)

        return {
            "message": "Estado de disponibilidad del producto cambiado correctamente",
            "product": product
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al cambiar el estado de disponibilidad del producto"
        )
    
def deleteProduct(idProduct, db):
    try:
        product = db.query(Product).get(idProduct)

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        db.delete(product)
        db.commit()

        return {
            "message": "Producto eliminado correctamente"
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar el producto"
        )