from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Numeric,
    String,
    Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.database import Base
from utils.idGenerator import generate_uuid


class Order(Base):
    __tablename__ = "orders"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=generate_uuid
    )

    # Usuario que realizó el pedido
    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    # Dirección seleccionada (puede ser null para pickup o mesa)
    address_id = Column(
        String,
        ForeignKey("addresses.id"),
        nullable=True
    )

    # Snapshot del cliente
    customer_username = Column(
        String(30),
        nullable=False
    )

    customer_email = Column(
        String(100),
        nullable=True
    )

    customer_phone = Column(
        String(20),
        nullable=True
    )

    # Estado del pedido
    # pending | confirmed | preparing | ready
    # on_the_way | delivered | cancelled
    status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    # cash | transfer | mercadopago
    payment_method = Column(
        String(30),
        nullable=False
    )

    # pending | paid | failed
    payment_status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    # Totales
    subtotal = Column(
        Numeric(10, 2),
        nullable=False
    )

    delivery_fee = Column(
        Numeric(10, 2),
        nullable=False,
        default=0
    )

    total = Column(
        Numeric(10, 2),
        nullable=False
    )

    # Observaciones generales
    notes = Column(
        Text,
        nullable=True
    )

    # delivery | pickup | table
    order_type = Column(
        String(20),
        nullable=False
    )

    # Solo para pedidos en mesas
    table_number = Column(
        String(10),
        nullable=True
    )

    # Snapshot de dirección
    delivery_street = Column(
        String(120),
        nullable=True
    )

    delivery_number = Column(
        String(20),
        nullable=True
    )

    delivery_details = Column(
        Text,
        nullable=True
    )

    delivery_neighborhood = Column(
        String(100),
        nullable=True
    )

    delivery_latitude = Column(
        Float,
        nullable=True
    )

    delivery_longitude = Column(
        Float,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relaciones

    user = relationship(
        "User",
        back_populates="orders"
    )

    address = relationship(
        "Address",
        back_populates="orders"
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )