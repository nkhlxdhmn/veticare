from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class AIAssistantPredictRequest(BaseModel):
    animal_type: str = Field(..., min_length=1, max_length=50, description="Type of animal (Dog, Cat, Cattle, etc.)")
    breed: Optional[str] = Field(None, max_length=100, description="Breed of the animal")
    age: Optional[float] = Field(None, ge=0, le=100, description="Age in years")
    weight: Optional[float] = Field(None, gt=0, le=5000, description="Weight in kg")
    symptoms: list[str] = Field(..., min_length=1, max_length=50, description="List of observed symptoms")
    duration: Optional[str] = Field(None, max_length=200, description="How long symptoms have persisted")
    eating: Optional[str] = Field(None, max_length=100, description="Is the animal eating normally?")
    drinking: Optional[str] = Field(None, max_length=100, description="Is the animal drinking water?")
    vaccinated: Optional[bool] = Field(None, description="Vaccination status")

    @field_validator("animal_type")
    @classmethod
    def normalize_animal_type(cls, v: str) -> str:
        return v.strip().title()

    @field_validator("symptoms")
    @classmethod
    def normalize_symptoms(cls, v: list[str]) -> list[str]:
        return [s.strip().lower() for s in v if s.strip()]


class AIAssistantPredictionResult(BaseModel):
    disease: str = Field(..., description="Predicted disease name")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    top_predictions: list[dict] = Field(default_factory=list, description="Top-N predictions with scores")


class AIAssistantRequest(AIAssistantPredictRequest):
    pass


class AIAssistantResponse(BaseModel):
    prediction: AIAssistantPredictionResult = Field(..., description="ML/KB prediction result")
    summary: str = Field(..., description="Plain-language summary of the condition")
    possible_causes: list[str] = Field(default_factory=list, description="Possible causes")
    home_care: list[str] = Field(default_factory=list, description="Home care recommendations")
    warning_signs: list[str] = Field(default_factory=list, description="Warning signs to monitor")
    vet_priority: str = Field(default="Monitor at home", description="Veterinary urgency level")
    prevention: list[str] = Field(default_factory=list, description="Prevention tips")
    disclaimer: str = Field(default="", description="Standard medical disclaimer")
    emergency: bool = Field(default=False, description="Whether an emergency was detected")
    emergency_message: Optional[str] = Field(None, description="Emergency instructions")


class AIAssistantErrorResponse(BaseModel):
    detail: str = Field(..., description="Human-readable error message")
    trace_id: Optional[str] = Field(None, description="Correlation ID for debugging")


class AIAssistantHealthResponse(BaseModel):
    status: str = Field(default="ok", description="Service health status")
    version: str = Field(default="1.0.0", description="API version")
    gemini_configured: bool = Field(default=False, description="Whether Gemini API key is set")
    knowledge_base_size: int = Field(default=0, description="Number of diseases in knowledge base")
