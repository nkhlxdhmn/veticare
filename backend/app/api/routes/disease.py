"""Animal disease HTTP endpoints."""

import uuid

from fastapi import APIRouter, Query

from app.api.dependencies import DatabaseSession
from app.schemas.disease import DiseaseResponse
from app.services.disease import get_all_diseases, get_diseases_by_animal

router = APIRouter(prefix="/diseases", tags=["diseases"])


@router.get("", response_model=list[DiseaseResponse])
def list_diseases(
    session: DatabaseSession,
    animal_id: uuid.UUID | None = Query(default=None),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[DiseaseResponse]:
    """Return diseases with pagination, optionally filtered by animal species."""
    if animal_id:
        return get_diseases_by_animal(session, animal_id, offset=offset, limit=limit)
    return get_all_diseases(session, offset=offset, limit=limit)
