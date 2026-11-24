from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from fastapi.responses import StreamingResponse
from io import BytesIO

from services.dashboard_excel_service import createDashboardExcel

from config.database import get_db
from services.dashboard_services import (
    getDashboardSummary,
    getBusinessDaySummary,
    getBusinessWeekSummary,
    getDashboardOrders,
    getDashboardUsers,
    getDashboardProducts
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db)
):
    return getDashboardSummary(db)

@router.get("/business-day")
def get_business_day_summary(
    reference_date: date | None = None,
    db: Session = Depends(get_db)
):
    return getBusinessDaySummary(db, reference_date)

@router.get("/business-week")
def get_business_week_summary(
    reference_date: date | None = None,
    db: Session = Depends(get_db)
):
    return getBusinessWeekSummary(db, reference_date)

@router.get("/orders")
def get_dashboard_orders(
    period: str = "day",
    reference_date: date | None = None,
    db: Session = Depends(get_db)
):
    return getDashboardOrders(
        db,
        period,
        reference_date
    )

@router.get("/users")
def get_dashboard_users(
    period: str = "day",
    reference_date: date | None = None,
    db: Session = Depends(get_db)
):
    return getDashboardUsers(db, period, reference_date)


@router.get("/products")
def get_dashboard_products(
    period: str = "day",
    reference_date: date | None = None,
    db: Session = Depends(get_db)
):
    return getDashboardProducts(db, period, reference_date)

@router.get("/export")
def export_dashboard_excel(
    period: str = "day",
    reference_date: date | None = None,
    db: Session = Depends(get_db)
):
    if period not in ["day", "week"]:
        raise HTTPException(
            status_code=400,
            detail="Período inválido. Debe ser 'day' o 'week'."
        )

    try:
        excel_file = createDashboardExcel(
            db,
            period,
            reference_date
        )

        filename = f"dashboard_{period}.xlsx"

        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar el Excel: {str(e)}"
        )