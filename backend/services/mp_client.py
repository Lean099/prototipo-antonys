import os
import mercadopago
from dotenv import load_dotenv

load_dotenv()

ACCESS_TOKEN = os.getenv("TEST_ACCESS_TOKEN")
if not ACCESS_TOKEN:
    raise RuntimeError("TEST_ACCESS_TOKEN no definido en .env")

sdk = mercadopago.SDK(ACCESS_TOKEN)
