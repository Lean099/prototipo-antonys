from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine
from models.user_model import Base
from routes import user_routes, auth_routes, test_routes

app = FastAPI()

# Crear tablas
Base.metadata.create_all(bind=engine)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(test_routes.router)

@app.get("/")
def root():
    return {"message": "API Running"}