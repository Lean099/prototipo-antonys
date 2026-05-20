from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from models.user_model import User
from models.address_model import Address

def getOneUser(idUser, db):
    user = db.query(User).get(idUser)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "phone": user.phone
    }

# Faltaria agregar para actualizar la contraseña, pero decidir si hacerlo en una funcion aparte
def updateData(idUser, data, db):

    user = db.query(User).get(idUser)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # Validar username único
    if data.username:

        username_exists = db.query(User).filter(
            User.username == data.username,
            User.id != idUser
        ).first()

        if username_exists:
            raise HTTPException(
                status_code=400,
                detail="El username ya está en uso"
            )

        user.username = data.username

    # Validar email único
    if data.email:

        email_exists = db.query(User).filter(
            User.email == data.email,
            User.id != idUser
        ).first()

        if email_exists:
            raise HTTPException(
                status_code=400,
                detail="El email ya está en uso"
            )

        user.email = data.email

    # Actualizar teléfono solo si viene
    if data.phone:
        user.phone = data.phone

    db.commit()
    db.refresh(user)

    return {
        "message": "Usuario actualizado correctamente",
        "user": user
    }

def deleteUser(idUser, db):
    user = db.query(User).get(idUser)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # Faltaria agregar logica para que elimine tambien todas las direcciones y pedidos relacionados a este usuario
    db.delete(user)
    db.commit()

    return {
        "details": "Usuario eliminado correctamente"
    }
