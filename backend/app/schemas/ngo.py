from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class NGOServiceBase(BaseModel):
    service_name: str = Field(..., max_length=150)
    description: Optional[str] = Field(None)


class NGOServiceCreate(NGOServiceBase):
    pass


class NGOServiceResponse(NGOServiceBase):
    id: UUID
    ngo_id: UUID

    class Config:
        from_attributes = True


class NGOBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    registration_number: Optional[str] = Field(None, max_length=100)
    verified: bool = False
    
    address: str = Field(..., max_length=500)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    phone: str = Field(..., max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)


class NGOCreate(NGOBase):
    pass


class NGOUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    registration_number: Optional[str] = Field(None, max_length=100)
    verified: Optional[bool] = None
    
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)


class NGOResponse(NGOBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    ngo_services: list[NGOServiceResponse] = []

    class Config:
        from_attributes = True
