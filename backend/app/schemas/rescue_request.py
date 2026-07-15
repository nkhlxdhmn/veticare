from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RescueRequestBase(BaseModel):
    user_id: UUID
    ngo_id: Optional[UUID] = None
    pet_id: Optional[UUID] = None
    
    description: str = Field(..., max_length=1000)
    latitude: float
    longitude: float
    
    priority: bool = False
    status: str = Field(default="Pending", max_length=50)
    image_url: Optional[str] = Field(None, max_length=255)


class RescueRequestCreate(BaseModel):
    description: str = Field(..., max_length=1000)
    latitude: float
    longitude: float
    priority: bool = False
    image_url: Optional[str] = Field(None, max_length=255)
    ngo_id: Optional[UUID] = None
    pet_id: Optional[UUID] = None


class RescueRequestUpdate(BaseModel):
    ngo_id: Optional[UUID] = None
    status: Optional[str] = Field(None, max_length=50)


class RescueRequestResponse(RescueRequestBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
