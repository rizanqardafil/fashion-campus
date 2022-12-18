from sqlalchemy import Column, String

from app.db import Base
from app.models.default import DefaultModel


class Size(DefaultModel, Base):
    __tablename__ = "sizes"

    size = Column(String(length=64), nullable=False, unique=True)

    @classmethod
    def seed(cls, fake, size):
        size = Size(
            id=fake.uuid4(),
            size=size,
        )
        return size
