"""Care guide HTTP endpoints."""

from fastapi import APIRouter, HTTPException, Query, status

from app.api.dependencies import SupabaseClient
from app.schemas.care_guide import CareGuideResponse
from app.services.care_guide import get_care_guide_by_disease, get_care_guides

router = APIRouter(prefix="/care-guides", tags=["care-guides"])


@router.get("", response_model=list[CareGuideResponse])
def list_care_guides(
    supabase: SupabaseClient,
    animal: str | None = Query(default=None),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[dict]:
    """Return care guides with pagination, optionally filtered by animal name."""
    return get_care_guides(supabase, animal, offset=offset, limit=limit)


@router.get("/{disease}", response_model=CareGuideResponse)
def read_care_guide(disease: str, supabase: SupabaseClient) -> dict:
    """Return the care guide for a specific disease."""
    guide = get_care_guide_by_disease(supabase, disease)
    if not guide:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care guide not found")
    return guide
