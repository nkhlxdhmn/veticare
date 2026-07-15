from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    user_id: UUID
    health_centre_id: Optional[UUID] = None
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = None


class ReviewCreate(BaseModel):
    health_centre_id: UUID
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
