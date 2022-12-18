from sqlalchemy import Column, ForeignKey, UniqueConstraint

from app.db import Base
from app.models.default import DefaultModel


class Wishlist(DefaultModel, Base):
    __tablename__ = "wishlists"

    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "product_id"),)

    @classmethod
    def seed(cls, fake, user_id, product_id):
        order = Wishlist(
            id=fake.uuid4(),
            user_id=user_id,
            product_id=product_id,
        )
        return order
