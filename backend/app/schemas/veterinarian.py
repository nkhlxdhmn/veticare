from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class VeterinarianBase(BaseModel):
    health_centre_id: UUID
    full_name: str = Field(..., max_length=255)
    specialization: str = Field(default="General Practice", max_length=100)
    qualification: Optional[str] = Field(None, max_length=255)
    experience: Optional[int] = None
    
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    consultation_fee: Optional[float] = None
    available: bool = True


class VeterinarianCreate(VeterinarianBase):
    pass


class VeterinarianUpdate(BaseModel):
    health_centre_id: Optional[UUID] = None
    full_name: Optional[str] = Field(None, max_length=255)
    specialization: Optional[str] = Field(None, max_length=100)
    qualification: Optional[str] = Field(None, max_length=255)
    experience: Optional[int] = None
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    consultation_fee: Optional[float] = None
    available: Optional[bool] = None


class VeterinarianResponse(VeterinarianBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
