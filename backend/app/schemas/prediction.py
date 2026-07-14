from typing import Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class PredictionBase(BaseModel):
    # Any allows lists (e.g. ['fever']) or dictionary lists (with severities)
    symptoms: Any = Field(..., description="Flexible JSON object/array representing symptoms list or severities mapping")
    predicted_disease: str = Field(..., min_length=1, max_length=100, description="Name of the predicted disease")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model prediction confidence score percentage ratio (between 0.0 and 1.0)")
    dangerous: bool = Field(False, description="Flag indicating if the predicted disease is dangerous/critical")
    model_version: str = Field(..., max_length=50, description="Version tag of the ML model performing inference")
    processing_time_ms: int = Field(..., ge=0, description="Inference runtime execution latency in milliseconds")

class PredictionCreate(PredictionBase):
    pass

class PredictionUpdate(BaseModel):
    symptoms: Optional[Any] = Field(None, description="Updated symptoms JSON object/array")
    predicted_disease: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated predicted disease")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Updated confidence ratio")
    dangerous: Optional[bool] = Field(None, description="Updated dangerous flag")
    model_version: Optional[str] = Field(None, max_length=50, description="Updated model version")
    processing_time_ms: Optional[int] = Field(None, ge=0, description="Updated latency tracking in ms")

class PredictionResponse(PredictionBase):
    id: UUID = Field(..., description="Prediction log UUID")
    pet_id: UUID = Field(..., description="Associated pet UUID")
    created_at: datetime = Field(..., description="Prediction creation timestamp")
    updated_at: datetime = Field(..., description="Prediction last update timestamp")

    model_config = ConfigDict(from_attributes=True)
