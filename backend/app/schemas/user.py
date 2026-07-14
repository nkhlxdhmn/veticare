from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
import re

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="Unique email address of the user")
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=30, 
        description="Unique username consisting of lowercase alphanumeric characters, dots, underscores, or hyphens"
    )
    first_name: Optional[str] = Field(None, max_length=50, description="User's first name")
    last_name: Optional[str] = Field(None, max_length=50, description="User's last name")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r"^[a-z0-9_.-]+$", v):
            raise ValueError("Username must be lowercase, alphanumeric, and can only contain dots, underscores, or hyphens")
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Plain text password (will be hashed by backend)")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Updated email address")
    username: Optional[str] = Field(None, min_length=3, max_length=30, description="Updated username")
    first_name: Optional[str] = Field(None, max_length=50, description="Updated first name")
    last_name: Optional[str] = Field(None, max_length=50, description="Updated last name")
    is_active: Optional[bool] = Field(None, description="Status of the user account")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not re.match(r"^[a-z0-9_.-]+$", v):
                raise ValueError("Username must be lowercase, alphanumeric, and can only contain dots, underscores, or hyphens")
        return v

class UserResponse(UserBase):
    id: UUID = Field(..., description="Database generated UUID of the user")
    is_active: bool = Field(..., description="Whether the user account is active")
    created_at: datetime = Field(..., description="User creation timestamp")
    updated_at: datetime = Field(..., description="User last update timestamp")

    # Pydantic v2 configuration to read from ORM models directly
    model_config = ConfigDict(from_attributes=True)
