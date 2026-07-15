"""Vaccination record request and response schemas."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class VaccinationCreate(BaseModel):
    pet_id: uuid.UUID
    vaccine_name: str = Field(min_length=1, max_length=160)
    vaccination_date: date
    next_due_date: date | None = None
    dose: str | None = Field(default=None, max_length=80)
    clinic_name: str | None = Field(default=None, max_length=160)
    veterinarian: str | None = Field(default=None, max_length=160)
    certificate_url: str | None = Field(default=None, max_length=2048)
    notes: str | None = None


class VaccinationUpdate(BaseModel):
    vaccine_name: str | None = Field(default=None, min_length=1, max_length=160)
    vaccination_date: date | None = None
    next_due_date: date | None = None
    dose: str | None = Field(default=None, max_length=80)
    clinic_name: str | None = Field(default=None, max_length=160)
    veterinarian: str | None = Field(default=None, max_length=160)
    certificate_url: str | None = Field(default=None, max_length=2048)
    notes: str | None = None


class VaccinationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pet_id: uuid.UUID
    vaccine_name: str
    vaccination_date: date
    next_due_date: date | None
    dose: str | None
    clinic_name: str | None
    veterinarian: str | None
    certificate_url: str | None
    notes: str | None
    created_at: datetime
