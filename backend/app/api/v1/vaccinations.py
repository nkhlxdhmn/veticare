"""
API endpoints for managing pet vaccinations.
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.vaccination import VaccinationCreate, VaccinationResponse, VaccinationUpdate
from app.services.vaccination_service import VaccinationService

router = APIRouter()

@router.post("/", response_model=VaccinationResponse, status_code=status.HTTP_201_CREATED)
async def add_vaccination_record(
    pet_id: UUID,
    vaccination_in: VaccinationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    vaccination_service: VaccinationService = Depends(),
):
    """Add a new vaccination record for a specific pet."""
    return await vaccination_service.add_vaccination(
        db=db, vaccination_in=vaccination_in, pet_id=pet_id, owner_id=current_user.id
    )

@router.get("/pet/{pet_id}", response_model=List[VaccinationResponse])
async def get_pet_vaccination_history(
    pet_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    vaccination_service: VaccinationService = Depends(),
):
    """Retrieve the vaccination history for a specific pet."""
    return await vaccination_service.get_vaccinations_for_pet(
        db=db, pet_id=pet_id, owner_id=current_user.id, skip=skip, limit=limit
    )

@router.get("/upcoming", response_model=List[VaccinationResponse])
async def get_upcoming_vaccinations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    vaccination_service: VaccinationService = Depends(),
):
    """Retrieve upcoming vaccinations for all pets of the current user (next 30 days)."""
    return await vaccination_service.get_upcoming_vaccinations(db=db, owner_id=current_user.id)

@router.put("/{vaccination_id}", response_model=VaccinationResponse)
async def update_vaccination_record(
    vaccination_id: UUID,
    vaccination_in: VaccinationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    vaccination_service: VaccinationService = Depends(),
):
    """Update an existing vaccination record."""
    return await vaccination_service.update_vaccination(
        db=db, vaccination_id=vaccination_id, vaccination_in=vaccination_in, owner_id=current_user.id
    )