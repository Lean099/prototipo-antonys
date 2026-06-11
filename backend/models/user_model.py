from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from utils.idGenerator import generate_uuid

from config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(
    String,
    primary_key=True,
    index=True,
    default=generate_uuid
    )

    username = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String,
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=True
    )

    role = Column(
        String(20),
        default="user"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    addresses = relationship(
    "Address",
    back_populates="user",
    cascade="all, delete-orphan"
)