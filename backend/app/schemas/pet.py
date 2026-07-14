from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, field_validator

class PetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Name of the pet")
    species: str = Field(..., description="Species/category of the pet (e.g., Dog, Cat, Cow)")
    breed: Optional[str] = Field(None, max_length=50, description="Breed of the pet")
    gender: str = Field("Unknown", description="Gender of the pet (Male, Female, Unknown)")
    weight: Optional[Decimal] = Field(None, ge=0.00, description="Weight of the pet in kg/lbs")
    date_of_birth: Optional[date] = Field(None, description="Date of birth of the pet")
    image_url: Optional[str] = Field(None, description="URL to the pet's photo stored in Supabase storage")
    is_active: bool = Field(True, description="Whether the pet is currently active in records")

    @field_validator("species")
    @classmethod
    def validate_species(cls, v: str) -> str:
        valid_species = {"Dog", "Cat", "Cow", "Buffalo", "Sheep", "Goat", "Horse", "Pig", "Rabbit", "Other"}
        normalized = v.strip().capitalize()
        if normalized not in valid_species:
            raise ValueError(f"Species must be one of: {', '.join(valid_species)}")
        return normalized

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        valid_genders = {"Male", "Female", "Unknown"}
        normalized = v.strip().capitalize()
        if normalized not in valid_genders:
            raise ValueError("Gender must be one of: Male, Female, Unknown")
        return normalized

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: Optional[date]) -> Optional[date]:
        if v and v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50, description="Updated pet name")
    species: Optional[str] = Field(None, description="Updated species")
    breed: Optional[str] = Field(None, max_length=50, description="Updated breed")
    gender: Optional[str] = Field(None, description="Updated gender")
    weight: Optional[Decimal] = Field(None, ge=0.00, description="Updated weight")
    date_of_birth: Optional[date] = Field(None, description="Updated date of birth")
    image_url: Optional[str] = Field(None, description="Updated pet photo URL")
    is_active: Optional[bool] = Field(None, description="Updated active status")

    @field_validator("species")
    @classmethod
    def validate_species(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_species = {"Dog", "Cat", "Cow", "Buffalo", "Sheep", "Goat", "Horse", "Pig", "Rabbit", "Other"}
            normalized = v.strip().capitalize()
            if normalized not in valid_species:
                raise ValueError(f"Species must be one of: {', '.join(valid_species)}")
            return normalized
        return v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_genders = {"Male", "Female", "Unknown"}
            normalized = v.strip().capitalize()
            if normalized not in valid_genders:
                raise ValueError("Gender must be one of: Male, Female, Unknown")
            return normalized
        return v

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: Optional[date]) -> Optional[date]:
        if v and v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v

class PetResponse(PetBase):
    id: UUID = Field(..., description="Database generated UUID of the pet")
    owner_id: UUID = Field(..., description="Owner's user UUID")
    created_at: datetime = Field(..., description="Pet creation timestamp")
    updated_at: datetime = Field(..., description="Pet last update timestamp")

    model_config = ConfigDict(from_attributes=True)
