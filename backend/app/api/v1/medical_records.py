"""API endpoints for managing pet medical records (vet visits)."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, get_medical_record_service, require_roles
from app.models.role import UserRole
from app.models.user import User
from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordResponse,
    MedicalRecordUpdate,
)
from app.services.medical_record_service import MedicalRecordService

router = APIRouter()


@router.post(
    "/",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_medical_record(
    request: Request,
    record_in: MedicalRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    record_service: MedicalRecordService = Depends(get_medical_record_service),
):
    """Create a new medical record for a vet visit."""
    return await record_service.create_record(
        db=db,
        record_in=record_in,
        owner_id=current_user.id,
        request=request,
    )


@router.get("/pet/{pet_id}", response_model=list[MedicalRecordResponse])
async def get_pet_medical_history(
    pet_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    record_service: MedicalRecordService = Depends(get_medical_record_service),
):
    """Retrieve the medical history for a specific pet."""
    return await record_service.get_records_for_pet(
        db=db,
        pet_id=pet_id,
        owner_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.get("/visit/{record_id}", response_model=MedicalRecordResponse)
async def get_single_visit(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    record_service: MedicalRecordService = Depends(get_medical_record_service),
):
    """Retrieve details of a single medical visit."""
    return await record_service._get_record_and_verify_ownership(
        db=db,
        record_id=record_id,
        owner_id=current_user.id,
    )


@router.put("/{record_id}", response_model=MedicalRecordResponse)
async def update_medical_record(
    request: Request,
    record_id: UUID,
    record_in: MedicalRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    record_service: MedicalRecordService = Depends(get_medical_record_service),
):
    """Update an existing medical record."""
    return await record_service.update_record(
        db=db,
        record_id=record_id,
        record_in=record_in,
        owner_id=current_user.id,
        request=request,
    )


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_record(
    request: Request,
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    record_service: MedicalRecordService = Depends(get_medical_record_service),
):
    """Delete a medical record."""
    await record_service.delete_record(
        db=db,
        record_id=record_id,
        owner_id=current_user.id,
        request=request,
    )
    return None


router.dependencies.append(
    require_roles((UserRole.PET_OWNER, UserRole.VETERINARIAN, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN))
)
