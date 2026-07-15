"""Vaccination record HTTP endpoints."""

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from app.api.dependencies import CurrentUser, DatabaseSession
from app.schemas.vaccination import VaccinationCreate, VaccinationResponse, VaccinationUpdate
from app.services.pet import get_pet_by_id
from app.services.vaccination import (
    create_vaccination,
    delete_vaccination,
    get_vaccination_by_id,
    get_vaccinations_by_pet,
    update_vaccination,
)

router = APIRouter(prefix="/vaccinations", tags=["vaccinations"])


def _verify_pet_owner(session: DatabaseSession.__origin__, pet_id: uuid.UUID, user_id: uuid.UUID):
    """Ensure the pet exists and belongs to the authenticated user."""
    pet = get_pet_by_id(session, pet_id, user_id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.get("/{pet_id}", response_model=list[VaccinationResponse])
def list_vaccinations(
    pet_id: uuid.UUID,
    current_user: CurrentUser,
    session: DatabaseSession,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[VaccinationResponse]:
    """Return vaccination records for a specific pet."""
    _verify_pet_owner(session, pet_id, current_user.id)
    return get_vaccinations_by_pet(session, pet_id, offset=offset, limit=limit)


@router.post("", response_model=VaccinationResponse, status_code=status.HTTP_201_CREATED)
def add_vaccination(body: VaccinationCreate, current_user: CurrentUser, session: DatabaseSession) -> VaccinationResponse:
    """Create a vaccination record (pet must belong to user)."""
    _verify_pet_owner(session, body.pet_id, current_user.id)
    return create_vaccination(session, body)


@router.patch("/{record_id}", response_model=VaccinationResponse)
def patch_vaccination(record_id: uuid.UUID, body: VaccinationUpdate, current_user: CurrentUser, session: DatabaseSession) -> VaccinationResponse:
    """Update a vaccination record."""
    record = get_vaccination_by_id(session, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccination record not found")
    _verify_pet_owner(session, record.pet_id, current_user.id)
    return update_vaccination(session, record, body)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_vaccination(record_id: uuid.UUID, current_user: CurrentUser, session: DatabaseSession) -> None:
    """Delete a vaccination record."""
    record = get_vaccination_by_id(session, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccination record not found")
    _verify_pet_owner(session, record.pet_id, current_user.id)
    delete_vaccination(session, record)
