from sqlalchemy import Column, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship

from config.database import Base
from utils.idGenerator import generate_uuid


class ProductSize(Base):
    __tablename__ = "product_sizes"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=generate_uuid
    )

    product_id = Column(
        String,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(
        String(30),
        nullable=False
    )

    price = Column(
        Numeric(10, 2),
        nullable=False
    )

    product = relationship(
        "Product",
        back_populates="sizes"
    )