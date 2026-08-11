from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    String,
    Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.database import Base
from utils.idGenerator import generate_uuid


class Category(Base):
    __tablename__ = "categories"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=generate_uuid
    )

    name = Column(
        String(100),
        nullable=False,
        unique=True
    )

    description = Column(
        Text,
        nullable=True
    )

    is_active = Column(
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

    products = relationship(
        "Product",
        back_populates="category"
    )