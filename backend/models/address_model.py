from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.database import Base
from utils.idGenerator import generate_uuid


class Address(Base):
    __tablename__ = "addresses"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=generate_uuid
    )

    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # Casa, Trabajo, Novia, etc.
    label = Column(
        String(50),
        nullable=False
    )

    street = Column(
        String(120),
        nullable=False
    )

    street_number = Column(
        String(20),
        nullable=False
    )

    # Referencias para el delivery
    details = Column(
        Text,
        nullable=True
    )

    neighborhood = Column(
        String(100),
        nullable=True
    )

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )

    is_default = Column(
        Boolean,
        nullable=False,
        default=False
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
        back_populates="addresses"
    )

    orders = relationship(
        "Order",
        back_populates="address"
    )