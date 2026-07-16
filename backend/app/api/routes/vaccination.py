"""Vaccination record HTTP endpoints."""

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from app.api.dependencies import CurrentUser, SupabaseClient
from app.schemas.vaccination import VaccinationCreate, VaccinationResponse, VaccinationUpdate
from app.services.pet import get_pet_by_id
from app.services.vaccination import (
    create_vaccination,
    delete_vaccination,
    get_vaccination_by_id,
    get_vaccinations_by_owner,
    get_vaccinations_by_pet,
    update_vaccination,
)

router = APIRouter(prefix="/vaccinations", tags=["vaccinations"])


def _verify_pet_owner(supabase, pet_id: uuid.UUID, user_id: uuid.UUID):
    """Ensure the pet exists and belongs to the authenticated user."""
    pet = get_pet_by_id(supabase, pet_id, user_id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.get("/user/all", response_model=list[VaccinationResponse])
def list_user_vaccinations(
    current_user: CurrentUser,
    supabase: SupabaseClient,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
) -> list[dict]:
    """Return vaccination records across all of the user's pets."""
    return get_vaccinations_by_owner(supabase, current_user["id"], offset=offset, limit=limit)


@router.get("/{pet_id}", response_model=list[VaccinationResponse])
def list_vaccinations(
    pet_id: uuid.UUID,
    current_user: CurrentUser,
    supabase: SupabaseClient,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[dict]:
    """Return vaccination records for a specific pet."""
    _verify_pet_owner(supabase, pet_id, current_user["id"])
    return get_vaccinations_by_pet(supabase, pet_id, offset=offset, limit=limit)


@router.post("", response_model=VaccinationResponse, status_code=status.HTTP_201_CREATED)
def add_vaccination(body: VaccinationCreate, current_user: CurrentUser, supabase: SupabaseClient) -> dict:
    """Create a vaccination record (pet must belong to user)."""
    _verify_pet_owner(supabase, body.pet_id, current_user["id"])
    return create_vaccination(supabase, body)


@router.patch("/{record_id}", response_model=VaccinationResponse)
def patch_vaccination(record_id: uuid.UUID, body: VaccinationUpdate, current_user: CurrentUser, supabase: SupabaseClient) -> dict:
    """Update a vaccination record."""
    record = get_vaccination_by_id(supabase, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccination record not found")
    _verify_pet_owner(supabase, record["pet_id"], current_user["id"])
    result = update_vaccination(supabase, record_id, body)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccination record not found")
    return result


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_vaccination(record_id: uuid.UUID, current_user: CurrentUser, supabase: SupabaseClient) -> None:
    """Delete a vaccination record."""
    record = get_vaccination_by_id(supabase, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccination record not found")
    _verify_pet_owner(supabase, record["pet_id"], current_user["id"])
    delete_vaccination(supabase, record_id)
