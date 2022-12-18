import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel

from app.schemas.default_model import Pagination


class GetUser(BaseModel):
    id: UUID
    name: str
    email: str
    phone_number: Optional[str]
    address_name: Optional[str]
    address: Optional[str]
    city: Optional[str]
    balance: int

    class Config:
        orm_mode = True


class GetUserAddress(BaseModel):
    id: UUID
    address_name: Optional[str]
    phone_number: Optional[str]
    address: Optional[str]
    city: Optional[str]

    class Config:
        orm_mode = True


class PutUserAddress(BaseModel):
    address_name: str
    phone_number: str
    address: str
    city: str

    class Config:
        orm_mode = True


class GetUserBalance(BaseModel):
    id: UUID
    balance: int

    class Config:
        orm_mode = True


class PutUserBalance(BaseModel):
    balance: int

    class Config:
        orm_mode = True


class GetProductDetails(BaseModel):
    quantity: int
    size: str


class GetProducts(BaseModel):
    id: UUID
    details: List[GetProductDetails]
    price: int
    image: str
    name: str


class GetOrder(BaseModel):
    id: UUID
    created_at: datetime.datetime
    products: List[GetProducts]
    shipping_method: str
    shipping_price: int
    phone_number: str
    city: str
    status: str
    shipping_address: str


class GetOrders(BaseModel):
    data: List[GetOrder]
    pagination: Pagination
