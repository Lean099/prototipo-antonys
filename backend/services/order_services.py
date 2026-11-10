from decimal import Decimal
from math import ceil
from datetime import datetime, timezone
import secrets
from sqlalchemy import String, cast, update

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from models.order_model import Order
from models.order_item_model import OrderItem
from models.product_model import Product
from models.product_size_model import ProductSize
from models.user_model import User
from models.address_model import Address

from schemas.order_schema import (
    AdminOrderCreate,
    AdminOrderUpdate,
    OrderBulkNotesUpdate
)
from utils.hashPassword import hash_password

from sqlalchemy import text


DELIVERY_FEE = Decimal("1000.00")


def touch_order(order):
    """
    Registra la fecha y hora de la última modificación del pedido.
    Se usa datetime UTC sin zona horaria para mantener compatibilidad
    con los DateTime almacenados actualmente en SQLite.
    """
    order.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)


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
            order_source="customer",

            table_number=(
                data.table_number
                if data.order_type == "table"
                else None
            ),

            delivery_street=address.street if address else None,
            delivery_number=address.street_number if address else None,
            delivery_details=address.details if address else None,
            delivery_neighborhood=address.neighborhood if address else None,
            delivery_latitude=address.latitude if address else None,
            delivery_longitude=address.longitude if address else None,
            delivery_location_url=address.location_url if address else None
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


def adminCreateOrder(data: AdminOrderCreate, db: Session):
    try:
        # -----------------------------------------
        # 1. Buscar el cliente o utilizar el genérico
        # -----------------------------------------

        user = None

        if data.user_id:
            user = db.query(User).filter(
                User.id == data.user_id
            ).first()

            if not user:
                raise HTTPException(
                    status_code=404,
                    detail="Cliente no encontrado"
                )

            if not user.is_active or user.deleted_at is not None:
                raise HTTPException(
                    status_code=400,
                    detail="El cliente no tiene una cuenta activa"
                )

        else:
            guest_username = "consumidor_ocasional"
            guest_email = "consumidor-ocasional@antony.local"

            user = db.query(User).filter(
                User.username == guest_username
            ).first()

            if user is None:
                # Evitar colisionar con otro usuario que tenga
                # reservado el email del usuario genérico.
                email_in_use = db.query(User).filter(
                    User.email == guest_email
                ).first()

                if email_in_use:
                    raise HTTPException(
                        status_code=409,
                        detail=(
                            "El email reservado para el usuario "
                            "ocasional ya está en uso."
                        )
                    )

                # No guardamos la contraseña original.
                random_password = secrets.token_urlsafe(32)

                user = User(
                    username=guest_username,
                    email=guest_email,
                    password=hash_password(random_password),
                    role="customer",
                    is_active=True
                )

                db.add(user)
                db.flush()

            elif user.deleted_at is not None or not user.is_active:
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "El usuario de pedidos ocasionales está "
                        "inactivo. Revisá su estado en la base de datos."
                    )
                )

        # -----------------------------------------
        # 2. Validar dirección, si corresponde
        # -----------------------------------------

        address = None

        if data.order_type == "delivery" and data.address_id:
            address = db.query(Address).filter(
                Address.id == data.address_id,
                Address.user_id == user.id
            ).first()

            if not address:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        "La dirección no existe o no pertenece "
                        "al cliente seleccionado."
                    )
                )

        # Si se envía una dirección guardada, usamos sus datos.
        # En caso contrario, utilizamos los campos manuales.
        if data.order_type == "delivery":
            if address:
                delivery_street = address.street
                delivery_number = address.street_number
                delivery_details = address.details
                delivery_neighborhood = address.neighborhood
                delivery_latitude = address.latitude
                delivery_longitude = address.longitude
                delivery_location_url = address.location_url

            else:
                delivery_street = (data.delivery_street or "").strip()
                delivery_number = (data.delivery_number or "").strip()

                if not delivery_street or not delivery_number:
                    raise HTTPException(
                        status_code=400,
                        detail="El delivery requiere calle y número."
                    )

                delivery_details = (
                    data.delivery_details.strip()
                    if data.delivery_details and data.delivery_details.strip()
                    else None
                )

                delivery_neighborhood = (
                    data.delivery_neighborhood.strip()
                    if data.delivery_neighborhood
                    and data.delivery_neighborhood.strip()
                    else None
                )

                delivery_location_url = (
                    data.delivery_location_url.strip()
                    if data.delivery_location_url
                    and data.delivery_location_url.strip()
                    else None
                )

                delivery_latitude = data.delivery_latitude
                delivery_longitude = data.delivery_longitude

        else:
            delivery_street = None
            delivery_number = None
            delivery_details = None
            delivery_neighborhood = None
            delivery_latitude = None
            delivery_longitude = None
            delivery_location_url = None

        # -----------------------------------------
        # 3. Preparar los datos del cliente
        # -----------------------------------------

        customer_name = (
            data.customer_name.strip()
            if data.customer_name and data.customer_name.strip()
            else None
        )

        customer_phone = (
            data.customer_phone.strip()
            if data.customer_phone and data.customer_phone.strip()
            else user.phone
        )

        customer_email = (
            data.customer_email.strip().lower()
            if data.customer_email and data.customer_email.strip()
            else (user.email if data.user_id else None)
        )

        if customer_name:
            customer_username = customer_name
        elif data.order_type == "table":
            customer_username = f"Mesa {data.table_number.strip()}"
        elif data.user_id:
            customer_username = user.username
        else:
            customer_username = "Cliente ocasional"

        # -----------------------------------------
        # 4. Validar productos y calcular importes
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
                    detail=(
                        f"Producto no encontrado: "
                        f"{item_data.product_id}"
                    )
                )

            if not product.is_available:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"El producto '{product.name}' "
                        "no está disponible"
                    )
                )

            product_size = None
            unit_price = product.price
            size_name = None

            if product.sizes:
                if not item_data.product_size_id:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"El producto '{product.name}' "
                            "requiere seleccionar un tamaño"
                        )
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
                    detail=(
                        f"El producto '{product.name}' "
                        "no tiene tamaños"
                    )
                )

            item_subtotal = unit_price * item_data.quantity
            subtotal += item_subtotal

            order_item = OrderItem(
                product_id=product.id,
                product_size_id=(
                    product_size.id if product_size else None
                ),
                product_name=product.name,
                product_size_name=size_name,
                unit_price=unit_price,
                quantity=item_data.quantity,
                subtotal=item_subtotal,
                notes=item_data.notes
            )

            order_items.append(order_item)

        # -----------------------------------------
        # 5. Calcular envío y total
        # -----------------------------------------

        delivery_fee = (
            DELIVERY_FEE
            if data.order_type == "delivery"
            else Decimal("0.00")
        )

        total = subtotal + delivery_fee

        # -----------------------------------------
        # 6. Crear pedido administrativo
        # -----------------------------------------

        new_order = Order(
            user_id=user.id,
            address_id=address.id if address else None,

            customer_username=customer_username,
            customer_email=customer_email,
            customer_phone=customer_phone,

            status="pending",
            payment_method=data.payment_method,
            payment_status="pending",

            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,

            notes=data.notes,
            order_type=data.order_type,

            # Siempre se creó desde el panel administrativo.
            order_source="employee",

            table_number=(
                data.table_number.strip()
                if data.order_type == "table"
                else None
            ),

            delivery_street=delivery_street,
            delivery_number=delivery_number,
            delivery_details=delivery_details,
            delivery_neighborhood=delivery_neighborhood,
            delivery_latitude=delivery_latitude,
            delivery_longitude=delivery_longitude,
            delivery_location_url=delivery_location_url
        )

        db.add(new_order)

        for order_item in order_items:
            order_item.order = new_order
            db.add(order_item)

        # -----------------------------------------
        # 7. Guardar el pedido
        # -----------------------------------------

        db.commit()
        db.refresh(new_order)

        # Cargar los items para la respuesta.
        new_order.items

        return new_order

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al crear el pedido administrativo"
        )


def adminUpdateOrder(order_id: str, data: AdminOrderUpdate, db: Session):
    try:
        # 1. Buscar el pedido existente
        order = db.query(Order).filter(
            Order.id == order_id
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado"
            )

        # Normalizar la fecha esperada para comparar con el valor
        # almacenado directamente en SQLite.
        expected_date = data.expected_updated_at

        expected_date_values = [
            expected_date.strftime("%Y-%m-%d %H:%M:%S.%f")
        ]

        # Los registros creados mediante server_default=func.now()
        # pueden estar almacenados sin microsegundos.
        if expected_date.microsecond == 0:
            expected_date_values.append(
                expected_date.strftime("%Y-%m-%d %H:%M:%S")
            )

        claim_time = datetime.now(timezone.utc).replace(tzinfo=None)

        result = db.execute(
            update(Order)
            .where(
                Order.id == order_id,
                cast(Order.updated_at, String).in_(expected_date_values),
                Order.status != "cancelled",
            )
            .values(updated_at=claim_time)
            .execution_options(synchronize_session=False)
        )

        if result.rowcount != 1:
            db.rollback()

            current_order = db.query(Order).filter(
                Order.id == order_id
            ).first()

            if current_order and current_order.status == "cancelled":
                raise HTTPException(
                    status_code=409,
                    detail="Este pedido fue cancelado mientras lo estabas editando. No se guardaron tus cambios."
                )

            if not current_order:
                raise HTTPException(
                    status_code=404,
                    detail="El pedido ya no existe."
                )

            raise HTTPException(
                status_code=409,
                detail="El pedido fue modificado por otra persona mientras lo estabas editando. No se guardaron tus cambios. Cerrá el formulario y volvé a abrir el pedido para revisar la versión actual."
            )

        # Sincronizar la instancia ORM con la versión reclamada.
        db.refresh(order)


        # 2. Validar dirección guardada o manual
        address = None

        if data.order_type == "delivery" and data.address_id:
            address = db.query(Address).filter(
                Address.id == data.address_id,
                Address.user_id == order.user_id
            ).first()

            if not address:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        "La dirección no existe o no pertenece "
                        "al cliente del pedido."
                    )
                )

        if data.order_type == "delivery":
            if address:
                delivery_street = address.street
                delivery_number = address.street_number
                delivery_details = address.details
                delivery_neighborhood = address.neighborhood
                delivery_latitude = address.latitude
                delivery_longitude = address.longitude
                delivery_location_url = address.location_url
            else:
                delivery_street = (data.delivery_street or "").strip()
                delivery_number = (data.delivery_number or "").strip()

                if not delivery_street or not delivery_number:
                    raise HTTPException(
                        status_code=400,
                        detail="El delivery requiere calle y número."
                    )

                delivery_details = (
                    data.delivery_details.strip()
                    if data.delivery_details
                    and data.delivery_details.strip()
                    else None
                )

                delivery_neighborhood = (
                    data.delivery_neighborhood.strip()
                    if data.delivery_neighborhood
                    and data.delivery_neighborhood.strip()
                    else None
                )

                delivery_latitude = data.delivery_latitude
                delivery_longitude = data.delivery_longitude

                delivery_location_url = (
                    data.delivery_location_url.strip()
                    if data.delivery_location_url
                    and data.delivery_location_url.strip()
                    else None
                )
        else:
            address = None
            delivery_street = None
            delivery_number = None
            delivery_details = None
            delivery_neighborhood = None
            delivery_latitude = None
            delivery_longitude = None
            delivery_location_url = None

        # 3. Preparar los artículos nuevos y recalcular subtotal
        new_items = []
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

            product_size = None
            unit_price = product.price
            size_name = None

            if product.sizes:
                if not item_data.product_size_id:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"El producto '{product.name}' "
                            "requiere seleccionar un tamaño"
                        )
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
                    detail=(
                        f"El producto '{product.name}' "
                        "no tiene tamaños"
                    )
                )

            item_subtotal = unit_price * item_data.quantity
            subtotal += item_subtotal

            new_items.append(
                OrderItem(
                    product_id=product.id,
                    product_size_id=(
                        product_size.id if product_size else None
                    ),
                    product_name=product.name,
                    product_size_name=size_name,
                    unit_price=unit_price,
                    quantity=item_data.quantity,
                    subtotal=item_subtotal,
                    notes=item_data.notes
                )
            )

        # 4. Recalcular el envío y el total
        delivery_fee = (
            DELIVERY_FEE
            if data.order_type == "delivery"
            else Decimal("0.00")
        )

        total = subtotal + delivery_fee

        # 5. Actualizar los datos del pedido
        customer_name = (
            data.customer_name.strip()
            if data.customer_name and data.customer_name.strip()
            else None
        )

        if customer_name:
            order.customer_username = customer_name

        elif data.order_type == "table":
            order.customer_username = f"Mesa {data.table_number.strip()}"

        elif order.customer_username.startswith("Mesa "):
            # Si deja de ser un pedido de mesa, recuperar un nombre
            # adecuado cuando el nombre anterior era solo "Mesa N".
            if order.user and order.user.username != "consumidor_ocasional":
                order.customer_username = order.user.username
            else:
                order.customer_username = "Cliente ocasional"

        if "customer_phone" in data.model_fields_set:
            order.customer_phone = (
                data.customer_phone.strip()
                if data.customer_phone and data.customer_phone.strip()
                else None
            )

        if "customer_email" in data.model_fields_set:
            order.customer_email = (
                data.customer_email.strip().lower()
                if data.customer_email and data.customer_email.strip()
                else None
            )

        order.order_type = data.order_type
        order.address_id = address.id if address else None

        order.delivery_street = delivery_street
        order.delivery_number = delivery_number
        order.delivery_details = delivery_details
        order.delivery_neighborhood = delivery_neighborhood
        order.delivery_latitude = delivery_latitude
        order.delivery_longitude = delivery_longitude
        order.delivery_location_url = delivery_location_url

        order.table_number = (
            data.table_number.strip()
            if data.order_type == "table"
            else None
        )

        order.payment_method = data.payment_method
        if "notes" in data.model_fields_set:
            order.notes = data.notes
        order.subtotal = subtotal
        order.delivery_fee = delivery_fee
        order.total = total

        # 6. Reemplazar los artículos anteriores
        order.items.clear()
        order.items.extend(new_items)

        # 7. Registrar la modificación y guardar todo
        touch_order(order)

        db.commit()
        db.refresh(order)

        # Asegurar que la relación esté disponible para la respuesta
        order.items

        return order

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el pedido administrativo"
        )


def getAllOrders(db: Session):
    try:
        return (
            db.query(Order)
            .order_by(Order.created_at.desc())
            .all()
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener las órdenes"
        )


def adminGetOrders(
    db: Session,
    page: int = 1,
    limit: int = 10,
    status: str | None = None,
    order_type: str | None = None,
    order_source: str | None = None,
    sort: str = "newest"
):
    try:
        # -----------------------------------------
        # 1. Validar paginación
        # -----------------------------------------

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

        # -----------------------------------------
        # 2. Consulta base
        # -----------------------------------------

        query = db.query(Order)

        # -----------------------------------------
        # 3. Filtros
        # -----------------------------------------

        if status:
            query = query.filter(
                Order.status == status
            )

        if order_type:
            query = query.filter(
                Order.order_type == order_type
            )

        if order_source:
            query = query.filter(
                Order.order_source == order_source
            )

        # -----------------------------------------
        # 4. Ordenamiento
        # -----------------------------------------

        if sort == "oldest":
            query = query.order_by(
                Order.created_at.asc()
            )
        else:
            query = query.order_by(
                Order.created_at.desc()
            )

        # -----------------------------------------
        # 5. Paginación
        # -----------------------------------------

        total = query.count()
        total_pages = ceil(total / limit) if total > 0 else 0
        offset = (page - 1) * limit

        orders = query.offset(offset).limit(limit).all()

        # Forzar carga de items
        for order in orders:
            order.items

        # -----------------------------------------
        # 6. Respuesta
        # -----------------------------------------

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
            detail="Error al obtener las órdenes administrativas"
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


def updateOrderStatus(idOrder, status, db: Session):
    try:
        order = db.query(Order).filter(
            Order.id == idOrder
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado"
            )

        order.status = status
        touch_order(order)

        db.commit()
        db.refresh(order)

        return {
            "message": "Estado del pedido actualizado correctamente",
            "order": order
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el estado del pedido"
        )


def updateOrderPaymentStatus(idOrder, payment_status, db: Session):
    try:
        order = db.query(Order).filter(
            Order.id == idOrder
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado"
            )

        order.payment_status = payment_status
        touch_order(order)

        db.commit()
        db.refresh(order)

        return {
            "message": "Estado del pago actualizado correctamente",
            "order": order
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el estado del pago"
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

        # Las observaciones pertenecen a un artículo, pero también
        # modifican el pedido y deben actualizar su fecha.
        touch_order(order)

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

def updateOrderNotesBulk(
    order_id: str,
    user_id: str,
    data: OrderBulkNotesUpdate,
    db: Session
):
    try:
        # -----------------------------------------
        # 1. Preparar la versión esperada
        # -----------------------------------------

        expected_date = data.expected_updated_at

        expected_date_values = [
            expected_date.strftime("%Y-%m-%d %H:%M:%S.%f")
        ]

        if expected_date.microsecond == 0:
            expected_date_values.append(
                expected_date.strftime("%Y-%m-%d %H:%M:%S")
            )

        # -----------------------------------------
        # 2. Reclamar atómicamente la modificación
        # -----------------------------------------

        claim_time = datetime.now(timezone.utc).replace(
            tzinfo=None
        )

        result = db.execute(
            update(Order)
            .where(
                Order.id == order_id,
                Order.user_id == user_id,
                Order.status == "pending",
                cast(Order.updated_at, String).in_(
                    expected_date_values
                )
            )
            .values(updated_at=claim_time)
            .execution_options(synchronize_session=False)
        )

        if result.rowcount != 1:
            db.rollback()

            current_order = db.query(Order).filter(
                Order.id == order_id,
                Order.user_id == user_id
            ).first()

            if not current_order:
                raise HTTPException(
                    status_code=404,
                    detail="Pedido no encontrado"
                )

            if current_order.status != "pending":
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "El pedido ya no está pendiente y no "
                        "se pueden modificar sus observaciones."
                    )
                )

            raise HTTPException(
                status_code=409,
                detail=(
                    "El pedido fue modificado mientras estabas "
                    "editando. No se guardaron tus cambios. "
                    "Actualizá la información y volvé a intentarlo."
                )
            )

        # -----------------------------------------
        # 3. Sincronizar el pedido
        # -----------------------------------------

        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado"
            )

        # -----------------------------------------
        # 4. Validar artículos y unidades
        # -----------------------------------------

        item_ids = [item.item_id for item in data.items]

        if len(item_ids) != len(set(item_ids)):
            raise HTTPException(
                status_code=400,
                detail="Hay artículos duplicados en la solicitud."
            )

        order_items = db.query(OrderItem).filter(
            OrderItem.order_id == order_id,
            OrderItem.id.in_(item_ids)
        ).all()

        items_by_id = {
            item.id: item
            for item in order_items
        }

        if len(items_by_id) != len(item_ids):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Uno o más artículos no pertenecen "
                    "a este pedido."
                )
            )

        # -----------------------------------------
        # 5. Preparar todas las observaciones
        # -----------------------------------------

        for item_data in data.items:
            order_item = items_by_id[item_data.item_id]

            # Recuperar las observaciones existentes.
            observations = {}

            if order_item.notes:
                parts = order_item.notes.split(" | ")

                for part in parts:
                    if not part.startswith("Unidad "):
                        continue

                    try:
                        number_text, observation = part.split(
                            ": ", 1
                        )

                        number = int(
                            number_text.replace("Unidad ", "")
                        )

                        if (
                            1 <= number <= order_item.quantity
                            and observation.strip()
                        ):
                            observations[number] = observation.strip()

                    except ValueError:
                        continue

            # Validar que no haya unidades repetidas.
            unit_numbers = [
                unit.unit_number
                for unit in item_data.units
            ]

            if len(unit_numbers) != len(set(unit_numbers)):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Hay números de unidad duplicados "
                        "en un artículo."
                    )
                )

            # Actualizar cada observación recibida.
            for unit in item_data.units:

                if unit.unit_number > order_item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"La unidad {unit.unit_number} "
                            f"no existe en el artículo "
                            f"'{order_item.product_name}'."
                        )
                    )

                if unit.notes and unit.notes.strip():
                    observations[unit.unit_number] = (
                        unit.notes.strip()
                    )
                else:
                    observations.pop(unit.unit_number, None)

            # Reconstruir el formato actual de almacenamiento.
            order_item.notes = " | ".join(
                f"Unidad {number}: {observation}"
                for number, observation in sorted(
                    observations.items()
                )
            ) or None

        # -----------------------------------------
        # 6. Registrar y guardar la modificación
        # -----------------------------------------

        touch_order(order)

        db.commit()
        db.refresh(order)

        # Cargar los artículos actualizados.
        order.items

        return order

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al actualizar las observaciones del pedido"
        )

def cancelOrder(
    order_id,
    user_id,
    db: Session
):
    try:
        cancel_time = datetime.now(timezone.utc).replace(
            tzinfo=None
        )

        result = db.execute(
            update(Order)
            .where(
                Order.id == order_id,
                Order.user_id == user_id,
                Order.status == "pending"
            )
            .values(
                status="cancelled",
                updated_at=cancel_time
            )
            .execution_options(synchronize_session=False)
        )

        if result.rowcount != 1:
            db.rollback()

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

            raise HTTPException(
                status_code=409,
                detail=(
                    "El pedido ya no está pendiente y no puede "
                    "ser cancelado. Actualizá la información "
                    "para consultar su estado actual."
                )
            )

        db.commit()

        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

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
