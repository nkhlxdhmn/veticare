"""Prediction history request and response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PredictRequest(BaseModel):
    """Input for the ML disease prediction pipeline."""
    pet_id: uuid.UUID
    animal_name: str = Field(min_length=1, max_length=100, examples=["Dog"])
    symptoms: list[str] = Field(min_length=1, max_length=5, examples=[["Fever", "Diarrhea", "Vomiting"]])


class PredictionCreate(BaseModel):
    """Manual prediction record (used when storing externally-sourced results)."""
    pet_id: uuid.UUID
    predicted_disease: str = Field(min_length=1, max_length=160)
    confidence: float = Field(ge=0, le=1)
    model_version: str = Field(min_length=1, max_length=80)
    prediction_json: dict


class PredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pet_id: uuid.UUID
    predicted_disease: str
    confidence: float
    model_version: str
    prediction_json: dict
    created_at: datetime
