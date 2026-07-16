"""Prediction history business logic."""

import logging
import uuid

from postgrest.exceptions import APIError
from supabase import Client

from app.schemas.prediction import PredictionCreate

logger = logging.getLogger(__name__)

# Columns that exist in the DB table before migration
_KNOWN_COLUMNS = {"id", "pet_id", "predicted_disease", "confidence", "model_version", "prediction_json", "created_at"}


def create_prediction(supabase: Client, data: PredictionCreate) -> dict:
    """Store a new disease prediction result.

    Tries full payload first (post-migration); falls back to known columns if
    the DB hasn't been migrated yet.
    """
    payload = data.model_dump(exclude_none=True, mode="json")

    try:
        result = supabase.table("prediction_history").insert(payload).execute()
        return result.data[0]
    except APIError:
        logger.warning("Full insert failed — retrying with known columns only")
        safe = {k: v for k, v in payload.items() if k in _KNOWN_COLUMNS}
        result = supabase.table("prediction_history").insert(safe).execute()
        return result.data[0]


def get_predictions_by_pet(supabase: Client, pet_id: uuid.UUID) -> list[dict]:
    """Return prediction history for a specific pet."""
    result = supabase.table("prediction_history").select("*").eq("pet_id", str(pet_id)).order("created_at", desc=True).execute()
    return result.data


def get_predictions_by_owner(supabase: Client, owner_id: uuid.UUID, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return all predictions for a user.

    Tries direct user_id query first (post-migration); falls back to pet join
    query if the user_id column doesn't exist yet.
    """
    try:
        result = supabase.table("prediction_history").select("*").eq("user_id", str(owner_id)).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        if result.data:
            return result.data
    except APIError:
        logger.info("user_id column not found — falling back to pet-based query")

    # Fallback: join via pet ownership
    pets_result = supabase.table("pets").select("id").eq("owner_id", str(owner_id)).execute()
    pet_ids = [p["id"] for p in pets_result.data]
    if not pet_ids:
        return []
    result = supabase.table("prediction_history").select("*").in_("pet_id", pet_ids).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data
