from dotenv import load_dotenv
import os
from services.payments import create_preference, get_payment, refund_payment

load_dotenv()
NOTIFICATION_URL = os.getenv("NOTIFICATION_URL")  # opcionalmente la llenás con ngrok

@app.post("/crear-preferencia")
async def crear_preferencia(order: OrderRequest, db: Session = Depends(get_db)):
    print(order)
    """
    body esperado:
    {
      "amount": 1500.0,
      "title": "Pedido #123"
    }
    """
    
    # 🔐 recalcular total real (anti-trampa)
    calculated_total = sum(
        item.price * item.quantity for item in order.items
    )

    if calculated_total != order.total:
        raise HTTPException(
            status_code=400,
            detail="El total no coincide con los items"
        )

    # 🛒 items para Mercado Pago
    """mp_items = [
        {
            "title": item.title,
            "quantity": item.quantity,
            "unit_price": item.price,
            "currency_id": "ARS"
        }
        for item in order.items
    ]"""

    mp_items = [
        {
            "title": f"Pedido Antony's ({len(order.items)} items)",
            "quantity": 1,
            "unit_price": calculated_total,
            "currency_id": "ARS"
        }
    ]


    # 🧾 título del pedido
    title = f"Pedido Antony's ({len(order.items)} items)"

    # 💳 crear preferencia REAL
    pref = create_preference(
        title,
        items=mp_items,
        notification_url=NOTIFICATION_URL
    )


    # Aca tengo que guardar los datos porque aca recien me da el id para checkear el estado

    print(pref)
    return {
        "init_point": pref["init_point"],
        "id": pref["id"]
    }

@app.post("/webhook/mercadopago")
async def mercadopago_webhook(request: Request):
    payload = await request.json()
    # loguear para desarrollo:
    print("Webhook recibido:", payload)
    # Normalmente: extraer data.id -> llamar a MP para consultar estado y actualizar DB
    # Ejemplo mínimo:
    try:
        # algunos webhooks vienen con data.id
        data = payload.get("data", {})
        payment_id = data.get("id")
        if payment_id:
            payment_info = get_payment(str(payment_id))
            print("Estado del pago:", payment_info.get("status"))
            # acá guardás en DB o actualizás el pedido
    except Exception as e:
        print("Error procesando webhook:", e)
    return {"status": "ok"}

@app.get("/pago/{payment_id}")
async def consulta_pago(payment_id: str):
    info = get_payment(payment_id)
    return info

@app.post("/refund/{payment_id}")
async def refund(payment_id: str):
    res = refund_payment(payment_id)
    return res
