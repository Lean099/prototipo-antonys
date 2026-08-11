from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from models.order_model import Order

def createOrder(data, db):
    try:
        new_order = Order(
            user_id=data.user_id,
            total_amount=data.total_amount,
            status=data.status
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return {
            "message": "Orden creada correctamente",
            "order": new_order
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al crear la orden"
        )
    
def getAllOrders(db):
    try:
        orders = db.query(Order)\
           .order_by(Order.created_at.desc())\
           .all()
        return orders
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener las órdenes"
        )
    
def getOrderById(idOrder, db):
    try:
        order = db.query(Order).get(idOrder)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Orden no encontrada"
            )

        return order

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener la orden"
        )
    
def toggleOrderStatus(idOrder, db):
    try:
        order = db.query(Order).get(idOrder)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Orden no encontrada"
            )

        # Cambiar el estado de la orden
        # pending | confirmed | preparing | ready
        # on_the_way | delivered | cancelled
        order.status = "confirmed" if order.status == "pending" else "pending"
        db.commit()
        db.refresh(order)

        return {
            "message": "Estado de la orden actualizado correctamente",
            "order": order
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el estado de la orden"
        )
    
def toggleOrderPaymentStatus(idOrder, db):
    try:
        order = db.query(Order).get(idOrder)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Orden no encontrada"
            )

        # Cambiar el estado de pago de la orden
        # pending | paid | failed
        order.payment_status = "paid" if order.payment_status == "pending" else "pending"
        db.commit()
        db.refresh(order)

        return {
            "message": "Estado de pago de la orden actualizado correctamente",
            "order": order
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el estado de pago de la orden"
        )
    
