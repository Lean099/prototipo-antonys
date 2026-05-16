from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func
)

from sqlalchemy.orm import relationship
from config.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)

    # Relación con usuario
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # Ejemplo:
    # Casa, Trabajo, Novia, etc
    label = Column(String(50), nullable=False)

    # Dirección
    street = Column(String(120), nullable=False)
    street_number = Column(String(20), nullable=False)

    # Referencias para delivery
    details = Column(Text, nullable=True)

    # Barrio
    neighborhood = Column(String(100), nullable=True)

    # Geolocalización
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Dirección principal
    is_default = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relación ORM
    user = relationship("User", back_populates="addresses")