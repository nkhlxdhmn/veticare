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
    notes: Optional[str] = Field(None, description="Additional notes from the visit")

class MedicalRecordCreate(MedicalRecordBase):
    pet_id: UUID = Field(..., description="The pet to which this record belongs")

class MedicalRecordUpdate(BaseModel):
    visit_date: Optional[date] = Field(None, description="Updated visit date")
    diagnosis: Optional[str] = Field(None, min_length=1, max_length=255, description="Updated diagnosis")
    treatment: Optional[str] = Field(None, description="Updated treatment plan")
    medicines: Optional[str] = Field(None, description="Updated list of medicines")
    doctor_name: Optional[str] = Field(None, max_length=100, description="Updated doctor's name")
    clinic_name: Optional[str] = Field(None, max_length=150, description="Updated clinic name")
    notes: Optional[str] = Field(None, description="Updated notes")

class MedicalRecordResponse(MedicalRecordBase):
    id: UUID = Field(..., description="Medical record UUID")
    pet_id: UUID = Field(..., description="Associated pet UUID")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Record last update timestamp")

    model_config = ConfigDict(from_attributes=True)