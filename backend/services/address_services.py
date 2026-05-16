from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from models.user_model import User
from models.address_model import Address

def createAddress(idUser, data, db):

    try:
        user = db.query(User).get(idUser)

        if not user:
                raise HTTPException(
                    status_code=404,
                    detail="Usuario no encontrado"
                )
        
        newAddress = Address()
        if data.label is not None:
            newAddress.label = data.label

        if data.street is not None:
            newAddress.street = data.street

        if data.street_number is not None:
            newAddress.street_number = data.street_number

        if data.details is not None:
            newAddress.details = data.details

        if data.neighborhood is not None:
            newAddress.neighborhood = data.neighborhood

        if data.latitude is not None:
            newAddress.latitude = data.latitude

        if data.longitude is not None:
            newAddress.longitude = data.longitude

        if data.is_default is not None:
            newAddress.is_default = data.is_default

        db.add(newAddress)
        db.commit()
        db.refresh(newAddress)

        return {
            "message": "Dirección creada correctamente",
            "address": newAddress
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al crear la direccion"
        )


def getAddresses(idUser, db):
     
    try:
        user = db.query(User).get(idUser)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

        addresses = (
            db.query(Address)
            .filter(Address.user_id == idUser)
            .all()
        )

        return addresses

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener las direcciones"
        )
    
def updateAddress(idUser, idAddress, data, db):

    try:

        # Buscar dirección y verificar pertenencia
        address = (
            db.query(Address)
            .filter(
                Address.id == idAddress,
                Address.user_id == idUser
            )
            .first()
        )

        if not address:
            raise HTTPException(
                status_code=404,
                detail="Dirección no encontrada"
            )

        # Actualizaciones parciales

        if data.label is not None:
            address.label = data.label

        if data.street is not None:
            address.street = data.street

        if data.street_number is not None:
            address.street_number = data.street_number

        if data.details is not None:
            address.details = data.details

        if data.neighborhood is not None:
            address.neighborhood = data.neighborhood

        if data.latitude is not None:
            address.latitude = data.latitude

        if data.longitude is not None:
            address.longitude = data.longitude

        if data.is_default is not None:
            address.is_default = data.is_default

        # Guardar cambios
        db.commit()

        # Refrescar objeto
        db.refresh(address)

        return {
            "message": "Dirección actualizada correctamente",
            "address": address
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al actualizar la dirección"
        )
    
def deleteAddress(idAddress, db):
    address = db.query(Address).get(idAddress)
    if not address:
        raise HTTPException(
            status_code=404,
            detail="Direccion no encontrada"
        )
    db.delete(address)
    db.commit()
    return {
        "details": "Direccion eliminada correctamente"
    }