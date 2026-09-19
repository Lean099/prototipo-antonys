from fastapi import HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError

from models.product_model import Product
from schemas.product_schema import ProductCreate, ProductUpdate
from services.cloudinary_services import (
    CloudinaryService,
    CloudinaryServiceError
)


async def createProduct(data: ProductCreate, db, image: UploadFile | None = None):
    uploaded_image = None

    try:
        existing_product = db.query(Product).filter(
            Product.name == data.name
        ).first()

        if existing_product:
            raise HTTPException(
                status_code=400,
                detail="El producto ya existe"
            )
        
        # Subir imagen a Cloudinary si existe
        if image:
            uploaded_image = await CloudinaryService.upload_image(image)

        # Crear nuevo producto
        new_product = Product(
            category_id=data.category_id,
            name=data.name,
            description=data.description,
            price=data.price,
            has_stock=data.has_stock,
            stock=data.stock,
            image_url=(
                uploaded_image["secure_url"]
                if uploaded_image
                else None
            ),
            image_public_id=(
                uploaded_image["public_id"]
                if uploaded_image
                else None
            ),
            is_available=data.is_available
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {
            "message": "Producto creado correctamente",
            "product": new_product
        }

    except HTTPException:
        raise

    except CloudinaryServiceError as exc:
        db.rollback()
        print("ERROR CLOUDINARY EN PRODUCT SERVICE:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Error al subir la imagen del producto"
        )

    except SQLAlchemyError as exc:
        db.rollback()
        print("ERROR SQLALCHEMY:", repr(exc))

        # Si Cloudinary subió la imagen pero falló la BD,
        # eliminamos la imagen para no dejarla huérfana.
        if uploaded_image:
            try:
                await CloudinaryService.delete_image(
                    uploaded_image["public_id"]
                )
            except CloudinaryServiceError:
                pass

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


def getProductByCategoryId(category_id, db) -> list[Product]:
    try:
        products = db.query(Product).filter(
            Product.category_id == category_id
        ).all()

        return products

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener los productos por categoría"
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

    except HTTPException:
        raise

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener el producto"
        )


async def updateProduct(
    idProduct,
    data: ProductUpdate,
    db,
    image: UploadFile | None = None
):
    uploaded_image = None
    old_public_id = None

    try:
        product = db.query(Product).get(idProduct)

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        # Verificar que el nuevo nombre no pertenezca
        # a otro producto
        if data.name is not None and data.name != product.name:
            existing_product = db.query(Product).filter(
                Product.name == data.name,
                Product.id != idProduct
            ).first()

            if existing_product:
                raise HTTPException(
                    status_code=400,
                    detail="El producto ya existe"
                )

        # Actualizar campos
        if data.category_id is not None:
            product.category_id = data.category_id

        if data.name is not None:
            product.name = data.name

        if data.description is not None:
            product.description = data.description

        if data.price is not None:
            product.price = data.price

        if data.has_stock is not None:
            product.has_stock = data.has_stock

        if data.stock is not None:
            product.stock = data.stock

        if data.is_available is not None:
            product.is_available = data.is_available

        # Reemplazar imagen
        if image:
            # Guardamos el public_id anterior
            old_public_id = product.image_public_id

            # Subimos primero la nueva imagen
            uploaded_image = await CloudinaryService.upload_image(image)

            product.image_url = uploaded_image["secure_url"]
            product.image_public_id = uploaded_image["public_id"]

        db.commit()
        db.refresh(product)

        # La BD ya tiene la nueva imagen.
        # Ahora podemos eliminar la anterior.
        if uploaded_image and old_public_id:
            try:
                await CloudinaryService.delete_image(old_public_id)

            except CloudinaryServiceError:
                # No hacemos rollback porque el producto
                # ya fue actualizado correctamente.
                pass

        return {
            "message": "Producto actualizado correctamente",
            "product": product
        }

    except HTTPException:
        raise

    except CloudinaryServiceError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al subir la nueva imagen del producto"
        )

    except SQLAlchemyError:
        db.rollback()

        # Si la nueva imagen se subió pero falló la BD,
        # eliminamos la nueva imagen.
        if uploaded_image:
            try:
                await CloudinaryService.delete_image(
                    uploaded_image["public_id"]
                )
            except CloudinaryServiceError:
                pass

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

        # Cambiar el estado de disponibilidad
        product.is_available = not product.is_available

        db.commit()
        db.refresh(product)

        return {
            "message": "Estado de disponibilidad del producto cambiado correctamente",
            "product": product
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al cambiar el estado de disponibilidad del producto"
        )


async def deleteProduct(idProduct, db):
    old_public_id = None

    try:
        product = db.query(Product).get(idProduct)

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        # Guardamos el public_id antes de eliminar el producto
        old_public_id = product.image_public_id

        db.delete(product)
        db.commit()

        # Eliminamos la imagen después de eliminar el producto
        if old_public_id:
            try:
                await CloudinaryService.delete_image(old_public_id)

            except CloudinaryServiceError:
                # El producto ya fue eliminado correctamente.
                # La imagen queda como huérfana en Cloudinary.
                pass

        return {
            "message": "Producto eliminado correctamente"
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar el producto"
        )