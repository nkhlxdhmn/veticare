"""Prediction HTTP endpoints."""

import logging
import uuid

from fastapi import APIRouter, HTTPException, Query, Request, status

from app.api.dependencies import CurrentUser, SupabaseClient
from app.core.ml_model import (
    get_supported_species,
    get_symptoms_for_species,
    predict_disease,
)
from app.schemas.prediction import (
    PredictionCreate,
    PredictionResponse,
    PredictRequest,
    SavePredictionRequest,
)
from app.services.pet import get_pet_by_id
from app.services.prediction import create_prediction, get_predictions_by_pet, get_predictions_by_owner

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predictions", tags=["predictions"])


def _get_pet_or_404(supabase, pet_id: uuid.UUID, user_id: uuid.UUID):
    """Return the pet or raise 404. Verifies ownership."""
    pet = get_pet_by_id(supabase, pet_id, user_id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


# ── Static data endpoints (must come before /{pet_id}) ──────────────


@router.get("/species", response_model=list[str])
def list_supported_species() -> list[str]:
    """Return all species supported by the ML model."""
    return get_supported_species()


@router.get("/species/{species_name}/symptoms", response_model=list[str])
def list_symptoms_for_species(species_name: str) -> list[str]:
    """Return all known symptoms for a given species."""
    symptoms = get_symptoms_for_species(species_name)
    if not symptoms:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Species '{species_name}' not found")
    return symptoms


# ── Prediction / ML endpoint ────────────────────────────────────────


@router.post("/predict", response_model=dict)
def run_prediction(body: PredictRequest, current_user: CurrentUser, request: Request) -> dict:
    """Run the ML model pipeline and return the result without saving.

    Flow: Request → Validation → DataFrame → Model → Prediction → Response
    """
    model = getattr(request.app.state, "model", None)
    if model is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="ML model is not available")

    try:
        result = predict_disease(model, body.animal_name, body.symptoms)
        result["species"] = body.animal_name
        result["symptoms"] = body.symptoms
        return result
    except Exception:
        logger.exception("Prediction pipeline failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Prediction failed")


# ── Save prediction to history ──────────────────────────────────────


@router.post("/save", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def save_prediction(body: SavePredictionRequest, current_user: CurrentUser, supabase: SupabaseClient) -> dict:
    """Save a prediction result to the user's history.

    If pet_id is provided it must belong to the current user.
    """
    if body.pet_id:
        _get_pet_or_404(supabase, uuid.UUID(body.pet_id), current_user["id"])

    prediction_data = PredictionCreate(
        user_id=str(current_user["id"]),
        pet_id=body.pet_id,
        species=body.animal_name,
        breed=body.breed,
        age=body.age,
        gender=body.gender,
        symptoms=body.symptoms,
        predicted_disease=body.predicted_disease,
        confidence=body.confidence,
        model_version="1.0",
    )
    return create_prediction(supabase, prediction_data)


# ── History endpoints ───────────────────────────────────────────────


@router.get("/user/all", response_model=list[PredictionResponse])
def list_user_predictions(
    current_user: CurrentUser,
    supabase: SupabaseClient,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[dict]:
    """Return all predictions for the current user."""
    return get_predictions_by_owner(supabase, current_user["id"], offset=offset, limit=limit)


@router.get("/{pet_id}", response_model=list[PredictionResponse])
def list_predictions(pet_id: uuid.UUID, current_user: CurrentUser, supabase: SupabaseClient) -> list[dict]:
    """Return prediction history for a specific pet."""
    _get_pet_or_404(supabase, pet_id, current_user["id"])
    return get_predictions_by_pet(supabase, pet_id)
