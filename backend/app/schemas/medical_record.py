from typing import Optional
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict

class MedicalRecordBase(BaseModel):
    visit_date: date = Field(..., description="Date of the veterinary visit")
    diagnosis: str = Field(..., min_length=1, max_length=255, description="Diagnosis from the visit")
    treatment: Optional[str] = Field(None, description="Treatment plan provided")
    medicines: Optional[str] = Field(None, description="List of prescribed medicines")
    doctor_name: Optional[str] = Field(None, max_length=100, description="Name of the attending veterinarian")
    clinic_name: Optional[str] = Field(None, max_length=150, description="Name of the clinic")
    pet_id: UUID
    veterinarian_id: Optional[UUID] = None
    appointment_id: Optional[UUID] = None
    visit_date: date
    diagnosis: str = Field(..., max_length=255)
    treatment: Optional[str] = None
    prescription: Optional[str] = None
    medicines: Optional[str] = None
    next_visit: Optional[date] = None
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    veterinarian_id: Optional[UUID] = None
    visit_date: Optional[date] = None
    diagnosis: Optional[str] = Field(None, max_length=255)
    treatment: Optional[str] = None
    prescription: Optional[str] = None
    medicines: Optional[str] = None
    next_visit: Optional[date] = None
    notes: Optional[str] = None

class MedicalRecordResponse(MedicalRecordBase):
    id: UUID = Field(..., description="Medical record UUID")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Record last update timestamp")

    model_config = ConfigDict(from_attributes=True)