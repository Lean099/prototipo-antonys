from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.order_schema import OrderCreate
from services.order_services import (
    createOrder,
    getAllOrders,
    getOrderById,
    toggleOrderStatus,
    toggleOrderPaymentStatus
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