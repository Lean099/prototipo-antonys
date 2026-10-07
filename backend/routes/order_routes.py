from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.order_schema import OrderCreate, OrderItemNotesUpdate
from services.order_services import (
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    toggleOrderStatus,
    toggleOrderPaymentStatus,
    updateOrderItemNotes,
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


@router.get("/getAllOrders")
def get_all_orders(
    db: Session = Depends(get_db)
):
    return getAllOrders(db)

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

@router.put("/toggleOrderStatus/{order_id}")
def toggle_order_status(
    order_id: str,
    db: Session = Depends(get_db)
):
    return toggleOrderStatus(order_id, db)


@router.put("/toggleOrderPaymentStatus/{order_id}")
def toggle_order_payment_status(
    order_id: str,
    db: Session = Depends(get_db)
):
    return toggleOrderPaymentStatus(order_id, db)

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