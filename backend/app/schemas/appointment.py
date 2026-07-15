"""Pydantic schemas for appointments."""

from datetime import date, datetime, time
from typing import Literal
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AppointmentBase(BaseModel):
    veterinarian_id: UUID | None = None
    appointment_date: date
    appointment_time: time
    reason: str = Field(max_length=255)
    notes: str | None = None


class AppointmentCreate(AppointmentBase):
    pet_id: UUID


class AppointmentUpdate(BaseModel):
    veterinarian_id: UUID | None = None
    appointment_date: date | None = None
    appointment_time: time | None = None
    reason: str | None = Field(default=None, max_length=255)
    status: Literal["scheduled", "confirmed", "completed", "cancelled"] | None = None
    notes: str | None = None


class AppointmentResponse(AppointmentBase):
    id: UUID
    pet_id: UUID
    pet_name: str | None = None
    owner_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
