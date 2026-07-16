"""ML model registry HTTP endpoints."""

from fastapi import APIRouter, Query

from app.api.dependencies import SupabaseClient
from app.schemas.ml_model import MLModelResponse
from app.services.ml_model import get_ml_models

router = APIRouter(prefix="/ml-models", tags=["ml-models"])


@router.get("", response_model=list[MLModelResponse])
def list_ml_models(
    supabase: SupabaseClient,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[dict]:
    """Return registered ML models with pagination."""
    return get_ml_models(supabase, offset=offset, limit=limit)
