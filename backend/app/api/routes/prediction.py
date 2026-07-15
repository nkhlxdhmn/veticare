"""Prediction HTTP endpoints."""

import logging
import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import CurrentUser, DatabaseSession
from app.core.ml_model import get_model_version, predict_disease
from app.schemas.prediction import PredictionCreate, PredictionResponse, PredictRequest
from app.services.pet import get_pet_by_id
from app.services.prediction import create_prediction, get_predictions_by_pet

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predictions", tags=["predictions"])


def _get_pet_or_404(session, pet_id: uuid.UUID, user_id: uuid.UUID):
    """Return the pet or raise 404. Verifies ownership."""
    pet = get_pet_by_id(session, pet_id, user_id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.get("/{pet_id}", response_model=list[PredictionResponse])
def list_predictions(pet_id: uuid.UUID, current_user: CurrentUser, session: DatabaseSession) -> list[PredictionResponse]:
    """Return prediction history for a specific pet."""
    _get_pet_or_404(session, pet_id, current_user.id)
    return get_predictions_by_pet(session, pet_id)


@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def add_prediction(body: PredictionCreate, current_user: CurrentUser, session: DatabaseSession) -> PredictionResponse:
    """Store a new disease prediction result (pet must belong to user)."""
    _get_pet_or_404(session, body.pet_id, current_user.id)
    return create_prediction(session, body)


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def run_prediction(body: PredictRequest, current_user: CurrentUser, session: DatabaseSession) -> PredictionResponse:
    """Run the ML model pipeline, store the result, and return it.

    Flow: Request → Validation → DataFrame → Model → Prediction → Database → Response
    """
    _get_pet_or_404(session, body.pet_id, current_user.id)

    try:
        result = predict_disease(body.animal_name, body.symptoms)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="ML model is not available")
    except Exception:
        logger.exception("Prediction pipeline failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Prediction failed")

    prediction_data = PredictionCreate(
        pet_id=body.pet_id,
        predicted_disease=result["disease"],
        confidence=result["confidence"],
        model_version=get_model_version(),
        prediction_json={
            "animal_name": body.animal_name,
            "symptoms": body.symptoms,
            "top_predictions": result["top_predictions"],
        },
    )

    return create_prediction(session, prediction_data)
