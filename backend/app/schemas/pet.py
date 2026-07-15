"""Pet request and response schemas."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PetCreate(BaseModel):
    animal_id: uuid.UUID | None = None
    name: str = Field(min_length=1, max_length=100)
    breed: str | None = Field(default=None, max_length=100)
    dob: date | None = None
    gender: str | None = Field(default=None, max_length=30)
    weight: float | None = Field(default=None, gt=0)
    height: float | None = Field(default=None, gt=0)
    color: str | None = Field(default=None, max_length=80)
    microchip_number: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=2048)
    notes: str | None = None


class PetUpdate(BaseModel):
    animal_id: uuid.UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=100)
    breed: str | None = Field(default=None, max_length=100)
    dob: date | None = None
    gender: str | None = Field(default=None, max_length=30)
    weight: float | None = Field(default=None, gt=0)
    height: float | None = Field(default=None, gt=0)
    color: str | None = Field(default=None, max_length=80)
    microchip_number: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=2048)
    notes: str | None = None


class AnimalBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    scientific_name: str | None = None


class PetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    animal_id: uuid.UUID | None
    name: str
    breed: str | None
    dob: date | None
    gender: str | None
    weight: float | None
    height: float | None
    color: str | None
    microchip_number: str | None
    image_url: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    animal: AnimalBrief | None = None
