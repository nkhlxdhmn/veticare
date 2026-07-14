from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Sender's name")
    email: EmailStr = Field(..., description="Sender's email address")
    subject: str = Field(..., min_length=1, max_length=150, description="Subject of the message")
    message: str = Field(..., min_length=1, description="Content of the query or feedback message")
    status: str = Field("OPEN", description="Inquiry ticket state (OPEN, IN_PROGRESS, CLOSED)")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = {"OPEN", "IN_PROGRESS", "CLOSED"}
        normalized = v.strip().upper()
        if normalized not in valid_statuses:
            raise ValueError("Status must be one of: OPEN, IN_PROGRESS, CLOSED")
        return normalized

class ContactCreate(ContactBase):
    user_id: Optional[UUID] = Field(None, description="Optional link to a registered user ID")

class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated sender's name")
    email: Optional[EmailStr] = Field(None, description="Updated email address")
    subject: Optional[str] = Field(None, min_length=1, max_length=150, description="Updated subject")
    message: Optional[str] = Field(None, min_length=1, description="Updated message content")
    status: Optional[str] = Field(None, description="Updated status")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_statuses = {"OPEN", "IN_PROGRESS", "CLOSED"}
            normalized = v.strip().upper()
            if normalized not in valid_statuses:
                raise ValueError("Status must be one of: OPEN, IN_PROGRESS, CLOSED")
            return normalized
        return v

class ContactResponse(ContactBase):
    id: UUID = Field(..., description="Contact inquiry UUID")
    user_id: Optional[UUID] = Field(None, description="Linked user UUID if authenticated")
    created_at: datetime = Field(..., description="Inquiry creation timestamp")
    updated_at: datetime = Field(..., description="Inquiry last update timestamp")

    model_config = ConfigDict(from_attributes=True)
