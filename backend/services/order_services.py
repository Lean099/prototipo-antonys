from decimal import Decimal
from math import ceil

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from models.order_model import Order
from models.order_item_model import OrderItem
from models.product_model import Product
from models.product_size_model import ProductSize
from models.user_model import User
from models.address_model import Address


DELIVERY_FEE = Decimal("1000.00")


def createOrder(data, db: Session):
    try:
        # -----------------------------------------
        # 1. Verificar usuario
        # -----------------------------------------

        user = db.query(User).filter(
            User.id == data.user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

        # -----------------------------------------
        # 2. Verificar dirección
        # -----------------------------------------

        address = None

        if data.order_type == "delivery":

            if not data.address_id:
                raise HTTPException(
                    status_code=400,
                    detail="La entrega a domicilio requiere una dirección"
                )

            address = db.query(Address).filter(
                Address.id == data.address_id,
                Address.user_id == data.user_id
            ).first()

            if not address:
                raise HTTPException(
                    status_code=404,
                    detail="Dirección no encontrada"
                )

        # -----------------------------------------
        # 3. Crear datos de la orden
        # -----------------------------------------

        order_items = []
        subtotal = Decimal("0.00")

        for item_data in data.items:

            product = db.query(Product).filter(
                Product.id == item_data.product_id
            ).first()

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Producto no encontrado: {item_data.product_id}"
                )

            if not product.is_available:
                raise HTTPException(
                    status_code=400,
                    detail=f"El producto '{product.name}' no está disponible"
                )

            # -----------------------------------------
            # 4. Determinar precio
            # -----------------------------------------

            product_size = None
            unit_price = product.price
            size_name = None

            if product.sizes:

                if not item_data.product_size_id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"El producto '{product.name}' requiere seleccionar un tamaño"
                    )

                product_size = db.query(ProductSize).filter(
                    ProductSize.id == item_data.product_size_id,
                    ProductSize.product_id == product.id
                ).first()

                if not product_size:
                    raise HTTPException(
                        status_code=404,
                        detail="Tamaño de producto no encontrado"
                    )

                unit_price = product_size.price
                size_name = product_size.name

            elif item_data.product_size_id:

                raise HTTPException(
                    status_code=400,
                    detail=f"El producto '{product.name}' no tiene tamaños"
                )

            # -----------------------------------------
            # 5. Calcular subtotal del item
            # -----------------------------------------

            item_subtotal = unit_price * item_data.quantity

            subtotal += item_subtotal

            order_item = OrderItem(
                product_id=product.id,
                product_size_id=product_size.id if product_size else None,
                product_name=product.name,
                product_size_name=size_name,
                unit_price=unit_price,
                quantity=item_data.quantity,
                subtotal=item_subtotal,
                notes=item_data.notes
            )

            order_items.append(order_item)

        # -----------------------------------------
        # 6. Calcular envío
        # -----------------------------------------

        delivery_fee = (
            DELIVERY_FEE
            if data.order_type == "delivery"
            else Decimal("0.00")
        )

        total = subtotal + delivery_fee

        # -----------------------------------------
        # 7. Crear orden
        # -----------------------------------------

        new_order = Order(
            user_id=user.id,
            address_id=address.id if address else None,

            customer_username=user.username,
            customer_email=user.email,
            customer_phone=user.phone,

            status="pending",
            payment_method=data.payment_method,
            payment_status="pending",

            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,

            notes=data.notes,

            order_type=data.order_type,

            delivery_street=address.street if address else None,
            delivery_number=address.street_number if address else None,
            delivery_details=address.details if address else None,
            delivery_neighborhood=address.neighborhood if address else None,
            delivery_latitude=address.latitude if address else None,
            delivery_longitude=address.longitude if address else None
        )

        db.add(new_order)

        # -----------------------------------------
        # 8. Asociar los items a la orden
        # -----------------------------------------

        for order_item in order_items:
            order_item.order = new_order
            db.add(order_item)

        # -----------------------------------------
        # 9. Guardar todo
        # -----------------------------------------

        db.commit()
        db.refresh(new_order)

        new_order.items

        return new_order

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al crear la orden"
        )


def getAllOrders(db: Session):
    try:
        return db.query(Order)\
            .order_by(Order.created_at.desc())\
            .all()

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener las órdenes"
        )
    
    
def getMyOrders(
    user_id,
    db: Session,
    page: int = 1,
    limit: int = 10,
    status: str | None = None,
    sort: str = "newest"
):
    try:
        if page < 1:
            raise HTTPException(
                status_code=400,
                detail="La página debe ser mayor a 0"
            )

        if limit < 1 or limit > 50:
            raise HTTPException(
                status_code=400,
                detail="El límite debe estar entre 1 y 50"
            )

        query = db.query(Order).filter(
            Order.user_id == user_id
        )

        if status:
            query = query.filter(
                Order.status == status
            )

        if sort == "oldest":
            query = query.order_by(
                Order.created_at.asc()
            )
        else:
            query = query.order_by(
                Order.created_at.desc()
            )

        total = query.count()

        total_pages = ceil(total / limit) if total > 0 else 0

        offset = (page - 1) * limit

        orders = query.offset(offset).limit(limit).all()

        for order in orders:
            order.items

        return {
            "items": orders,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener los pedidos del usuario"
        )


def getOrderById(idOrder, db: Session):
    try:
        order = db.query(Order).filter(
            Order.id == idOrder
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Orden no encontrada"
            )

        # Forzamos la carga de los items
        order.items

        return order

    except HTTPException:
        raise

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener la orden"
        )


def toggleOrderStatus(idOrder, db: Session):
    try:
        order = db.query(Order).filter(
            Order.id == idOrder
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Orden no encontrada"
            )

        order.status = (
            "confirmed"
            if order.status == "pending"
            else "pending"
        )

        db.commit()
        db.refresh(order)

        return {
            "message": "Estado de la orden actualizado correctamente",
            "order": order
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el estado de la orden"
        )


def toggleOrderPaymentStatus(idOrder, db: Session):
    try:
        order = db.query(Order).filter(
            Order.id == idOrder
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Orden no encontrada"
            )

        order.payment_status = (
            "paid"
            if order.payment_status == "pending"
            else "pending"
        )

        db.commit()
        db.refresh(order)

        return {
            "message": "Estado de pago de la orden actualizado correctamente",
            "order": order
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el estado de pago de la orden"
        )
    
def updateOrderItemNotes(
    order_id,
    item_id,
    unit_number,
    user_id,
    notes,
    db: Session
):
    try:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado"
            )

        if order.status != "pending":
            raise HTTPException(
                status_code=400,
                detail="Solo se pueden modificar pedidos pendientes"
            )

        order_item = db.query(OrderItem).filter(
            OrderItem.id == item_id,
            OrderItem.order_id == order.id
        ).first()

        if not order_item:
            raise HTTPException(
                status_code=404,
                detail="Producto del pedido no encontrado"
            )

        if unit_number < 1 or unit_number > order_item.quantity:
            raise HTTPException(
                status_code=400,
                detail="Número de unidad inválido"
            )

        observations = []

        if order_item.notes:
            parts = order_item.notes.split(" | ")

            for part in parts:
                if part.startswith("Unidad "):
                    try:
                        number_text, observation = part.split(": ", 1)
                        number = int(
                            number_text.replace("Unidad ", "")
                        )

                        observations.append(
                            (number, observation)
                        )

                    except ValueError:
                        continue

        updated_observations = {
            number: observation
            for number, observation in observations
        }

        if notes and notes.strip():
            updated_observations[unit_number] = notes.strip()
        else:
            updated_observations.pop(unit_number, None)

        order_item.notes = " | ".join(
            f"Unidad {number}: {observation}"
            for number, observation in sorted(
                updated_observations.items()
            )
        ) or None

        db.commit()
        db.refresh(order_item)

        return order_item

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al actualizar la observación"
        )

def cancelOrder(
    order_id,
    user_id,
    db: Session
):
    try:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado"
            )

        if order.status == "cancelled":
            raise HTTPException(
                status_code=400,
                detail="El pedido ya está cancelado"
            )

        if order.status != "pending":
            raise HTTPException(
                status_code=400,
                detail="Solo se pueden cancelar pedidos pendientes"
            )

        order.status = "cancelled"

        db.commit()
        db.refresh(order)

        return order

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al cancelar el pedido"
        )