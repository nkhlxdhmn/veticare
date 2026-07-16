"""Request and response schemas."""

from app.schemas.auth import LoginRequest, ProfileResponse as AuthProfileResponse, RegisterRequest, TokenResponse
from app.schemas.care_guide import CareGuideResponse
from app.schemas.animal import AnimalResponse
from app.schemas.disease import DiseaseResponse
from app.schemas.ml_model import MLModelResponse
from app.schemas.pet import PetCreate, PetResponse, PetUpdate
from app.schemas.prediction import PredictionCreate, PredictionResponse
from app.schemas.profile import ProfileResponse as ProfileDetailResponse
from app.schemas.profile import ProfileUpdate
from app.schemas.vaccination import VaccinationCreate, VaccinationResponse, VaccinationUpdate

__all__ = [
    "AnimalResponse",
    "CareGuideResponse",
    "DiseaseResponse",
    "LoginRequest",
    "MLModelResponse",
    "PetCreate",
    "PetResponse",
    "PetUpdate",
    "PredictionCreate",
    "PredictionResponse",
    "ProfileDetailResponse",
    "AuthProfileResponse",
    "ProfileUpdate",
    "RegisterRequest",
    "TokenResponse",
    "VaccinationCreate",
    "VaccinationResponse",
    "VaccinationUpdate",
]
