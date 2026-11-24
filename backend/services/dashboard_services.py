from sqlalchemy.orm import Session
from datetime import datetime, date, time, timedelta, timezone
from zoneinfo import ZoneInfo
from sqlalchemy import func, case, and_

from models.user_model import User
from models.order_model import Order
from models.order_item_model import OrderItem
from models.product_model import Product

ARGENTINA_TZ = ZoneInfo("America/Argentina/Buenos_Aires")

BUSINESS_OPEN = time(21, 0)
BUSINESS_CLOSE = time(3, 0)

def getBusinessDayRange(reference: datetime | None = None):

    if reference is None:
        reference = datetime.now(ARGENTINA_TZ)
    elif reference.tzinfo is None:
        reference = reference.replace(tzinfo=ARGENTINA_TZ)
    else:
        reference = reference.astimezone(ARGENTINA_TZ)

    current_date = reference.date()

    if reference.time() < BUSINESS_CLOSE:
        start_date = current_date - timedelta(days=1)

    elif reference.time() < BUSINESS_OPEN:
        start_date = current_date - timedelta(days=1)

    else:
        start_date = current_date

    start_datetime = datetime.combine(
        start_date,
        BUSINESS_OPEN,
        tzinfo=ARGENTINA_TZ
    )

    end_datetime = start_datetime + timedelta(hours=6)

    return start_datetime, end_datetime

def getBusinessWeekRange(reference: datetime | None = None):

    if reference is None:
        reference = datetime.now(ARGENTINA_TZ)
    elif reference.tzinfo is None:
        reference = reference.replace(tzinfo=ARGENTINA_TZ)
    else:
        reference = reference.astimezone(ARGENTINA_TZ)

    current_date = reference.date()

    # weekday(): lunes = 0, jueves = 3
    days_since_thursday = (
        current_date.weekday() - 3
    ) % 7

    thursday_date = current_date - timedelta(
        days=days_since_thursday
    )

    # Si todavía no comenzó la jornada del jueves,
    # corresponde consultar la semana anterior.
    if (
        days_since_thursday == 0
        and reference.time() < BUSINESS_OPEN
    ):
        thursday_date -= timedelta(days=7)

    start_datetime = datetime.combine(
        thursday_date,
        BUSINESS_OPEN,
        tzinfo=ARGENTINA_TZ
    )

    end_datetime = start_datetime + timedelta(days=3, hours=6)

    return start_datetime, end_datetime


def toDatabaseDateTime(value: datetime):

    return value.astimezone(timezone.utc).replace(
        tzinfo=None
    )

def getDashboardSummary(db: Session):

    # Clientes
    active_customers = db.query(User).filter(
        User.role == "customer",
        User.is_active == True
    ).count()

    inactive_customers = db.query(User).filter(
        User.role == "customer",
        User.is_active == False
    ).count()

    # Personal administrativo
    employees = db.query(User).filter(
        User.role == "employee"
    ).count()

    admins = db.query(User).filter(
        User.role == "admin"
    ).count()

    # Productos registrados
    products = db.query(Product).count()

    # Todos los pedidos históricos, incluidos los cancelados
    total_orders = db.query(Order).count()

    return {
        "users": {
            "active_customers": active_customers,
            "inactive_customers": inactive_customers,
            "employees": employees,
            "admins": admins
        },
        "products": products,
        "total_orders": total_orders
    }

def getBusinessDaySummary(db: Session,  reference_date: date | None = None):

    # Si recibimos una fecha, ubicarnos dentro de su jornada
    reference = None

    if reference_date:
        reference = datetime.combine(
            reference_date,
            time(22, 0),
            tzinfo=ARGENTINA_TZ
        )

    # Obtener el rango de la jornada comercial en Argentina
    start_datetime, end_datetime = getBusinessDayRange(reference)

    # Convertir los límites a UTC para consultar SQLite
    start_utc = toDatabaseDateTime(start_datetime)
    end_utc = toDatabaseDateTime(end_datetime)

    # Pedidos creados dentro de la jornada
    orders_query = db.query(Order).filter(
        Order.created_at >= start_utc,
        Order.created_at < end_utc
    )

    # Separar pedidos cancelados de los que cuentan como ventas
    valid_orders = orders_query.filter(
        Order.status != "cancelled"
    )

    cancelled_orders = orders_query.filter(
        Order.status == "cancelled"
    )

    # Función auxiliar para sumar importes
    def getTotal(query, field):
        return query.with_entities(
            func.coalesce(func.sum(field), 0)
        ).scalar()

    # Ingresos por medio de pago
    cash_total = getTotal(
        valid_orders.filter(Order.payment_method == "cash"),
        Order.total
    )

    transfer_total = getTotal(
        valid_orders.filter(Order.payment_method == "transfer"),
        Order.total
    )

    mercadopago_total = getTotal(
        valid_orders.filter(Order.payment_method == "mercadopago"),
        Order.total
    )

    return {
        "period": {
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat()
        },
        "orders": {
            "total": orders_query.count(),
            "sales": valid_orders.count(),
            "cancelled": cancelled_orders.count()
        },
        "sales": {
            "subtotal": getTotal(valid_orders, Order.subtotal),
            "delivery_fee": getTotal(valid_orders, Order.delivery_fee),
            "total": getTotal(valid_orders, Order.total)
        },
        "payment_methods": {
            "cash": cash_total,
            "transfer": transfer_total,
            "mercadopago": mercadopago_total
        }
    }

def getBusinessWeekSummary(
    db: Session,
    reference_date: date | None = None
):

    # Si recibimos una fecha, ubicarnos dentro de esa semana
    reference = None

    if reference_date:
        reference = datetime.combine(
            reference_date,
            time(22, 0),
            tzinfo=ARGENTINA_TZ
        )

    # Obtener el rango de la semana comercial
    start_datetime, end_datetime = getBusinessWeekRange(reference)

    # Convertir los límites a UTC para consultar SQLite
    start_utc = toDatabaseDateTime(start_datetime)
    end_utc = toDatabaseDateTime(end_datetime)

    # Pedidos creados dentro de la semana
    orders_query = db.query(Order).filter(
        Order.created_at >= start_utc,
        Order.created_at < end_utc
    )

    # Separar pedidos cancelados de los que cuentan como ventas
    valid_orders = orders_query.filter(
        Order.status != "cancelled"
    )

    cancelled_orders = orders_query.filter(
        Order.status == "cancelled"
    )

    # Función auxiliar para sumar importes
    def getTotal(query, field):
        return query.with_entities(
            func.coalesce(func.sum(field), 0)
        ).scalar()

    # Ingresos por medio de pago
    cash_total = getTotal(
        valid_orders.filter(Order.payment_method == "cash"),
        Order.total
    )

    transfer_total = getTotal(
        valid_orders.filter(Order.payment_method == "transfer"),
        Order.total
    )

    mercadopago_total = getTotal(
        valid_orders.filter(Order.payment_method == "mercadopago"),
        Order.total
    )

    return {
        "period": {
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat()
        },
        "orders": {
            "total": orders_query.count(),
            "sales": valid_orders.count(),
            "cancelled": cancelled_orders.count()
        },
        "sales": {
            "subtotal": getTotal(valid_orders, Order.subtotal),
            "delivery_fee": getTotal(valid_orders, Order.delivery_fee),
            "total": getTotal(valid_orders, Order.total)
        },
        "payment_methods": {
            "cash": cash_total,
            "transfer": transfer_total,
            "mercadopago": mercadopago_total
        }
    }

def getDashboardOrders(
    db: Session,
    period: str = "day",
    reference_date: date | None = None
):

    # Determinar el rango según el período solicitado
    reference = None

    if reference_date:
        reference = datetime.combine(
            reference_date,
            time(22, 0),
            tzinfo=ARGENTINA_TZ
        )

    if period == "day":
        start_datetime, end_datetime = getBusinessDayRange(reference)

    elif period == "week":
        start_datetime, end_datetime = getBusinessWeekRange(reference)

    else:
        raise ValueError("Período no válido. Usá 'day' o 'week'.")

    # Convertir los límites a UTC para consultar SQLite
    start_utc = toDatabaseDateTime(start_datetime)
    end_utc = toDatabaseDateTime(end_datetime)

    # Obtener los pedidos del período
    orders_query = db.query(Order).filter(
        Order.created_at >= start_utc,
        Order.created_at < end_utc
    )

    # Cantidad de pedidos por estado
    statuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "on_the_way",
        "delivered",
        "cancelled"
    ]

    orders_by_status = {
        status: orders_query.filter(
            Order.status == status
        ).count()
        for status in statuses
    }

    # Cantidad de pedidos por tipo
    order_types = ["delivery", "pickup", "table"]

    orders_by_type = {
        order_type: orders_query.filter(
            Order.order_type == order_type
        ).count()
        for order_type in order_types
    }

    # Cantidad de pedidos según su origen
    orders_by_source = {
        "customer": orders_query.filter(
            Order.order_source == "customer"
        ).count(),
        "employee": orders_query.filter(
            Order.order_source == "employee"
        ).count()
    }

    return {
        "period": {
            "type": period,
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat()
        },
        "total_orders": orders_query.count(),
        "by_status": orders_by_status,
        "by_type": orders_by_type,
        "by_source": orders_by_source
    }

def getDashboardUsers(
    db: Session,
    period: str = "day",
    reference_date: date | None = None
):

    # Determinar el rango según el período solicitado
    reference = None

    if reference_date:
        reference = datetime.combine(
            reference_date,
            time(22, 0),
            tzinfo=ARGENTINA_TZ
        )

    if period == "day":
        start_datetime, end_datetime = getBusinessDayRange(reference)

    elif period == "week":
        start_datetime, end_datetime = getBusinessWeekRange(reference)

    else:
        raise ValueError("Período no válido. Usá 'day' o 'week'.")

    # Convertir los límites a UTC para consultar SQLite
    start_utc = toDatabaseDateTime(start_datetime)
    end_utc = toDatabaseDateTime(end_datetime)

    # Clientes históricos
    active_customers = db.query(User).filter(
        User.role == "customer",
        User.is_active == True
    ).count()

    inactive_customers = db.query(User).filter(
        User.role == "customer",
        User.is_active == False
    ).count()

    # Personal histórico
    employees = db.query(User).filter(
        User.role == "employee"
    ).count()

    admins = db.query(User).filter(
        User.role == "admin"
    ).count()

    # Usuarios registrados durante el período
    new_users_query = db.query(User).filter(
        User.created_at >= start_utc,
        User.created_at < end_utc
    )

    new_customers = new_users_query.filter(
        User.role == "customer"
    ).count()

    new_employees = new_users_query.filter(
        User.role == "employee"
    ).count()

    new_admins = new_users_query.filter(
        User.role == "admin"
    ).count()

    return {
        "period": {
            "type": period,
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat()
        },
        "customers": {
            "total": active_customers + inactive_customers,
            "active": active_customers,
            "inactive": inactive_customers,
            "new": new_customers
        },
        "employees": {
            "total": employees,
            "new": new_employees
        },
        "admins": {
            "total": admins,
            "new": new_admins
        }
    }

def getDashboardProducts(
    db: Session,
    period: str = "day",
    reference_date: date | None = None
):

    # Indicadores generales de productos

    total_products = db.query(Product).count()

    available_products = db.query(Product).filter(
        Product.is_available == True
    ).count()

    unavailable_products = db.query(Product).filter(
        Product.is_available == False
    ).count()

    products_with_stock = db.query(Product).filter(
        Product.has_stock == True
    ).count()

    low_stock_products = db.query(Product).filter(
        Product.has_stock == True,
        Product.stock > 0,
        Product.stock <= 5
    ).count()

    out_of_stock_products = db.query(Product).filter(
        Product.has_stock == True,
        Product.stock == 0
    ).count()

        # Determinar el rango según el período solicitado

    reference = None

    if reference_date:
        reference = datetime.combine(
            reference_date,
            time(22, 0),
            tzinfo=ARGENTINA_TZ
        )

    if period == "day":
        start_datetime, end_datetime = getBusinessDayRange(reference)

    elif period == "week":
        start_datetime, end_datetime = getBusinessWeekRange(reference)

    else:
        raise ValueError("Período no válido. Usá 'day' o 'week'.")

    # Convertir los límites a UTC para consultar SQLite

    start_utc = toDatabaseDateTime(start_datetime)
    end_utc = toDatabaseDateTime(end_datetime)

        # Consultar artículos de pedidos no cancelados
    sales_query = db.query(
        OrderItem.product_id,
        OrderItem.product_name,
        OrderItem.product_size_name,
        func.sum(OrderItem.quantity).label("units_sold"),
        func.sum(OrderItem.subtotal).label("total_sold")
    ).join(
        Order,
        Order.id == OrderItem.order_id
    ).filter(
        Order.created_at >= start_utc,
        Order.created_at < end_utc,
        Order.status != "cancelled"
    ).group_by(
        OrderItem.product_id,
        OrderItem.product_name,
        OrderItem.product_size_name
    )

    sales_results = sales_query.all()

        # Ranking agrupado por producto
    products_ranking = {}

    # Ranking separado por producto y tamaño
    sizes_ranking = []

    for item in sales_results:

        product_id = item.product_id

        # Acumular ventas del producto sin separar tamaños
        if product_id not in products_ranking:
            products_ranking[product_id] = {
                "product_id": product_id,
                "product_name": item.product_name,
                "units_sold": 0,
                "total_sold": 0
            }

        products_ranking[product_id]["units_sold"] += item.units_sold
        products_ranking[product_id]["total_sold"] += item.total_sold

        # Guardar el detalle de cada tamaño
        sizes_ranking.append({
            "product_id": product_id,
            "product_name": item.product_name,
            "size": item.product_size_name or "Sin tamaño",
            "units_sold": item.units_sold,
            "total_sold": item.total_sold
        })

    # Convertir el ranking general a una lista
    products_ranking = sorted(
        products_ranking.values(),
        key=lambda item: item["units_sold"],
        reverse=True
    )

    # Ordenar el ranking por tamaño
    sizes_ranking = sorted(
        sizes_ranking,
        key=lambda item: item["units_sold"],
        reverse=True
    )

        # Identificar productos sin ventas durante el período

    sold_product_ids = {
        item.product_id
        for item in sales_results
    }

    products_without_sales = db.query(Product).filter(
        ~Product.id.in_(sold_product_ids)
    ).all()

    products_without_sales = [
        {
            "product_id": product.id,
            "product_name": product.name
        }
        for product in products_without_sales
    ]

    return {
        "period": {
            "type": period,
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat()
        },
        "products": {
            "total": total_products,
            "available": available_products,
            "unavailable": unavailable_products,
            "with_stock_control": products_with_stock,
            "low_stock": low_stock_products,
            "out_of_stock": out_of_stock_products
        },
        "sales": {
            "total_units_sold": sum(
                item["units_sold"] for item in products_ranking
            ),
            "products_ranking": products_ranking,
            "sizes_ranking": sizes_ranking,
            "without_sales": products_without_sales,
            "without_sales_count": len(products_without_sales)
        }
    }