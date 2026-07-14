from typing import Optional
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator

class VaccinationBase(BaseModel):
    vaccine_name: str = Field(..., min_length=1, max_length=100, description="Name of the administered vaccine")
    dose_number: Optional[int] = Field(None, ge=1, description="The dose number in a series (e.g., 1, 2)")
    batch_number: Optional[str] = Field(None, max_length=100, description="The batch or lot number of the vaccine vial")
    date_administered: date = Field(..., description="Date when the vaccine was administered")
    next_due_date: Optional[date] = Field(None, description="Next vaccination due date")
    clinic_name: Optional[str] = Field(None, max_length=150, description="Clinic or professional administering the vaccine")
    notes: Optional[str] = Field(None, description="Additional notes/records details")

class VaccinationCreate(VaccinationBase):
    @model_validator(mode="after")
    def validate_dates(self) -> "VaccinationCreate":
        if self.next_due_date and self.next_due_date < self.date_administered:
            raise ValueError("Next due date cannot be earlier than administration date")
        return self

class VaccinationUpdate(BaseModel):
    vaccine_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated vaccine name")
    dose_number: Optional[int] = Field(None, ge=1, description="Updated dose number")
    batch_number: Optional[str] = Field(None, max_length=100, description="Updated batch number")
    date_administered: Optional[date] = Field(None, description="Updated administration date")
    next_due_date: Optional[date] = Field(None, description="Updated next due date")
    clinic_name: Optional[str] = Field(None, max_length=150, description="Updated clinic name")
    notes: Optional[str] = Field(None, description="Updated notes")

    @model_validator(mode="after")
    def validate_dates(self) -> "VaccinationUpdate":
        date_admin = self.date_administered
        due_date = self.next_due_date
        if date_admin and due_date and due_date < date_admin:
            raise ValueError("Next due date cannot be earlier than administration date")
        return self

class VaccinationResponse(VaccinationBase):
    id: UUID = Field(..., description="Vaccination record UUID")
    pet_id: UUID = Field(..., description="Associated pet UUID")
    created_at: datetime = Field(..., description="Vaccination record creation timestamp")
    updated_at: datetime = Field(..., description="Vaccination record last update timestamp")

    model_config = ConfigDict(from_attributes=True)
