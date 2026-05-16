from fastapi import APIRouter, Depends
from requests import Session

from config.database import get_db

router = APIRouter(prefix="/test", tags=["Test"])

# Endpoint para probar el estado de la base de datos
@router.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"status": "ok"}

# Endpoint para hacer ping desde el frontend para ver si estan conectados
@router.get("/health")
def health_check():
    return {
        "ok": True
    }