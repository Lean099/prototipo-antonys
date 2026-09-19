from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from models.categories_model import Category


def createCategory(data, db):
    try:
        existing_category = db.query(Category).filter(
            Category.name == data.name
        ).first()

        if existing_category:
            raise HTTPException(
                status_code=400,
                detail="La categoría ya existe"
            )

        new_category = Category(
            name=data.name,
            description=data.description,
            is_active=data.is_active
        )

        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        return {
            "message": "Categoría creada correctamente",
            "category": new_category
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al crear la categoría"
        )


def getAllCategories(db):
    try:
        categories = db.query(Category).all()
        return categories

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener las categorías"
        )


def updateCategory(idCategory, data, db):
    try:
        category = db.query(Category).get(idCategory)

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Categoría no encontrada"
            )

        # Validar nombre único
        if data.name and data.name != category.name:
            name_exists = db.query(Category).filter(
                Category.name == data.name,
                Category.id != idCategory
            ).first()

            if name_exists:
                raise HTTPException(
                    status_code=400,
                    detail="El nombre de la categoría ya está en uso"
                )

            category.name = data.name

        # Actualizar descripción
        if data.description is not None:
            category.description = data.description

        # Actualizar disponibilidad
        if data.is_active is not None:
            category.is_active = data.is_active

        db.commit()
        db.refresh(category)

        return {
            "message": "Categoría actualizada correctamente",
            "category": category
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar la categoría"
        )


def deleteCategory(idCategory, db):
    try:
        category = db.query(Category).get(idCategory)

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Categoría no encontrada"
            )

        db.delete(category)
        db.commit()

        return {
            "message": "Categoría eliminada correctamente"
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar la categoría"
        )
