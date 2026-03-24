from services.mp_client import sdk
import os

def create_preference(title: str, items: dict, notification_url: str | None = None):
    # amount en la moneda que use MP (ej. ARS) - pasar float
    pref = {
        "title": title,
        "items": items,
        "notification_url": notification_url,
        "payment_methods": {
            "excluded_payment_types": [
                {"id": "ticket"}  # rapipago / pagofacil
            ]
        },
        # back_urls opcional (cliente vuelve al sitio)
        "back_urls": {
            "success": "https://www.tu-sitio/success",
            "failure": "https://www.tu-sitio/failure",
            "pending": "https://www.tu-sitio/pendings"
        },
        "auto_return": "approved"
    }

    if notification_url:
        pref["notification_url"] = notification_url

    result = sdk.preference().create(pref)
    return result["response"]  # contiene init_point, id, etc.

def get_payment(payment_id: str):
    result = sdk.payment().get(payment_id)
    return result["response"]

def refund_payment(payment_id: str):
    # crea un refund (simple). Para usar en algunos países requiere permisos.
    result = sdk.payment().refund(payment_id)
    return result["response"]
