"""Prediction history request and response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """Input for the ML disease prediction pipeline."""
    animal_name: str = Field(min_length=1, max_length=100, examples=["Dog"])
    symptoms: list[str] = Field(min_length=1, max_length=10, examples=[["Fever", "Cough", "Lethargy"]])
    breed: str | None = Field(default=None, max_length=100)
    age: int | None = Field(default=None, ge=0, le=100)
    gender: str | None = Field(default=None, max_length=20)
    pet_id: str | None = Field(default=None, description="Optional pet UUID to link prediction")


class SavePredictionRequest(BaseModel):
    """Input for saving a completed prediction to history."""
    animal_name: str = Field(min_length=1, max_length=100)
    symptoms: list[str] = Field(min_length=1)
    predicted_disease: str = Field(min_length=1, max_length=160)
    confidence: float = Field(ge=0, le=1)
    breed: str | None = Field(default=None, max_length=100)
    age: int | None = Field(default=None, ge=0, le=100)
    gender: str | None = Field(default=None, max_length=20)
    pet_id: str | None = Field(default=None, description="Optional pet UUID to link prediction")


class PredictionCreate(BaseModel):
    """Prediction record for database insertion."""
    user_id: str
    predicted_disease: str = Field(min_length=1, max_length=160)
    confidence: float = Field(ge=0, le=1)
    model_version: str = Field(min_length=1, max_length=80)
    species: str
    symptoms: list[str]
    breed: str | None = None
    age: int | None = None
    gender: str | None = None
    pet_id: str | None = None
    prediction_json: dict | None = None


class PredictionResponse(BaseModel):
    id: str
    user_id: str | None = None
    pet_id: str | None = None
    species: str | None = None
    breed: str | None = None
    age: int | None = None
    gender: str | None = None
    symptoms: list | None = None
    predicted_disease: str
    confidence: float
    model_version: str
    prediction_json: dict | None = None
    created_at: str | None = None
