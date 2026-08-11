from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    Numeric,
    String
)
from sqlalchemy.orm import relationship

from config.database import Base
from utils.idGenerator import generate_uuid


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=generate_uuid
    )

    order_id = Column(
        String,
        ForeignKey("orders.id"),
        nullable=False
    )

    product_id = Column(
        String,
        ForeignKey("products.id"),
        nullable=False
    )

    # Snapshot del producto
    product_name = Column(
        String(150),
        nullable=False
    )

    unit_price = Column(
        Numeric(10, 2),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    subtotal = Column(
        Numeric(10, 2),
        nullable=False
    )

    # Relaciones

    order = relationship(
        "Order",
        back_populates="items"
    )

    product = relationship(
        "Product",
        back_populates="order_items"
    )