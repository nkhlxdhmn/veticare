"""API endpoints for appointments."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
)
from app.services.appointment_service import AppointmentService

router = APIRouter()

# Factory to avoid needing it in deps.py
def get_appointment_service() -> AppointmentService:
    return AppointmentService()


@router.get("/", response_model=list[AppointmentResponse])
async def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    appointment_service: AppointmentService = Depends(get_appointment_service),
):
    """Retrieve all appointments for the current user."""
    appointments = await appointment_service.get_all_appointments(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    # Map the eager loaded pet name
    return [
        {
            **appointment.__dict__,
            "pet_name": appointment.pet.name if appointment.pet else None,
        }
        for appointment in appointments
    ]


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    appointment_service: AppointmentService = Depends(get_appointment_service),
):
    """Retrieve a specific appointment by ID."""
    appointment = await appointment_service.get_appointment_by_id(
        db=db, appointment_id=appointment_id, owner_id=current_user.id
    )
    return {
        **appointment.__dict__,
        "pet_name": appointment.pet.name if appointment.pet else None,
    }


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_in: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    appointment_service: AppointmentService = Depends(get_appointment_service),
):
    """Schedule a new appointment."""
    appointment = await appointment_service.create_appointment(
        db=db, appointment_in=appointment_in, owner_id=current_user.id
    )
    return {
        **appointment.__dict__,
        "pet_name": appointment.pet.name if appointment.pet else None,
    }


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: UUID,
    appointment_in: AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    appointment_service: AppointmentService = Depends(get_appointment_service),
):
    """Update an appointment."""
    appointment = await appointment_service.update_appointment(
        db=db,
        appointment_id=appointment_id,
        appointment_in=appointment_in,
        owner_id=current_user.id,
    )
    return {
        **appointment.__dict__,
        "pet_name": appointment.pet.name if appointment.pet else None,
    }


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    appointment_service: AppointmentService = Depends(get_appointment_service),
):
    """Cancel (delete) an appointment."""
    await appointment_service.delete_appointment(
        db=db, appointment_id=appointment_id, owner_id=current_user.id
    )
