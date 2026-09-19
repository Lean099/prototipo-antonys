from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.database import Base
from utils.idGenerator import generate_uuid


class Product(Base):
    __tablename__ = "products"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=generate_uuid
    )

    category_id = Column(
        String,
        ForeignKey("categories.id"),
        nullable=False
    )

    name = Column(
        String(150),
        nullable=False,
        unique=True
    )

    description = Column(
        Text,
        nullable=True
    )

    price = Column(
        Numeric(10, 2),
        nullable=False
    )

    # Control de stock opcional
    has_stock = Column(
        Boolean,
        nullable=False,
        default=False
    )

    stock = Column(
        Integer,
        nullable=True
    )

    image_url = Column(
        String(500),
        nullable=True
    )

    image_public_id = Column(
        String(255),
        nullable=True
    )

    is_available = Column(
        Boolean,
        nullable=False,
        default=True
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

    category = relationship(
        "Category",
        back_populates="products"
    )

    order_items = relationship(
        "OrderItem",
        back_populates="product"
    )