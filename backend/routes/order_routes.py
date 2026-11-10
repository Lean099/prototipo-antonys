from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.order_schema import (
    OrderCreate,
    OrderItemNotesUpdate,
    OrderBulkNotesUpdate,
    AdminOrderCreate,
    AdminOrderUpdate,
    OrderStatusUpdate,
    OrderPaymentStatusUpdate
)
from services.order_services import (
    createOrder,
    adminCreateOrder,
    getAllOrders,
    adminGetOrders,
    adminUpdateOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    updateOrderPaymentStatus,
    updateOrderItemNotes,
    updateOrderNotesBulk,
    cancelOrder
)


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.post("/createOrder")
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db)
):
    return createOrder(data, db)

@router.post("/adminCreateOrder")
def admin_create_order(
    data: AdminOrderCreate,
    db: Session = Depends(get_db)
):
    return adminCreateOrder(data, db)


@router.put("/adminUpdateOrder/{order_id}")
def admin_update_order(
    order_id: str,
    data: AdminOrderUpdate,
    db: Session = Depends(get_db)
):
    return adminUpdateOrder(
        order_id,
        data,
        db
    )


@router.get("/getAllOrders")
def get_all_orders(
    db: Session = Depends(get_db)
):
    return getAllOrders(db)

@router.get("/adminGetOrders")
def admin_get_orders(
    page: int = 1,
    limit: int = 10,
    status: str | None = None,
    order_type: str | None = None,
    order_source: str | None = None,
    sort: str = "newest",
    db: Session = Depends(get_db)
):
    return adminGetOrders(
        db,
        page,
        limit,
        status,
        order_type,
        order_source,
        sort
    )

@router.get("/getMyOrders/{user_id}")
def get_my_orders(
    user_id: str,
    page: int = 1,
    limit: int = 10,
    status: str | None = None,
    sort: str = "newest",
    db: Session = Depends(get_db)
):
    return getMyOrders(
        user_id,
        db,
        page,
        limit,
        status,
        sort
    )

@router.get("/getOrderById/{order_id}")
def get_order_by_id(
    order_id: str,
    db: Session = Depends(get_db)
):
    return getOrderById(order_id, db)


@router.put("/updateOrderStatus/{order_id}")
def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    return updateOrderStatus(
        order_id,
        data.status,
        db
    )

@router.put("/updateOrderPaymentStatus/{order_id}")
def update_order_payment_status(
    order_id: str,
    data: OrderPaymentStatusUpdate,
    db: Session = Depends(get_db)
):
    return updateOrderPaymentStatus(
        order_id,
        data.payment_status,
        db
    )

@router.put("/updateOrderItemNotes/{order_id}/{item_id}/{unit_number}")
def update_order_item_notes(
    order_id: str,
    item_id: str,
    unit_number: int,
    user_id: str,
    data: OrderItemNotesUpdate,
    db: Session = Depends(get_db)
):
    return updateOrderItemNotes(
        order_id,
        item_id,
        unit_number,
        user_id,
        data.notes,
        db
    )

@router.put("/updateOrderNotesBulk/{order_id}")
def update_order_notes_bulk(
    order_id: str,
    user_id: str,
    data: OrderBulkNotesUpdate,
    db: Session = Depends(get_db)
):
    return updateOrderNotesBulk(
        order_id,
        user_id,
        data,
        db
    )

@router.put("/cancelOrder/{order_id}")
def cancel_order(
    order_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    return cancelOrder(
        order_id,
        user_id,
        db
    )