"""Service layer for appointment-related business logic."""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.pet_repository import PetRepository
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


class AppointmentService:
    """Orchestrate appointment-related logic."""

    def __init__(
        self,
        appointment_repo: AppointmentRepository = Depends(),
        pet_repo: PetRepository = Depends(),
    ) -> None:
        self.appointment_repo = appointment_repo
        self.pet_repo = pet_repo

    async def get_appointment_by_id(
        self, db: AsyncSession, appointment_id: UUID, owner_id: UUID
    ) -> Appointment:
        """Retrieve an appointment and verify ownership."""
        appointment = await self.appointment_repo.get_by_id(db, appointment_id=appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
            )
        if appointment.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this appointment",
            )
        return appointment

    async def get_all_appointments(
        self, db: AsyncSession, owner_id: UUID, skip: int, limit: int
    ) -> list[Appointment]:
        """Retrieve all appointments for the current user."""
        return await self.appointment_repo.get_all_for_owner(
            db=db, owner_id=owner_id, skip=skip, limit=limit
        )

    async def create_appointment(
        self, db: AsyncSession, appointment_in: AppointmentCreate, owner_id: UUID
    ) -> Appointment:
        """Create a new appointment after verifying pet ownership."""
        pet = await self.pet_repo.get_by_id(db, pet_id=appointment_in.pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create appointments for this pet",
            )
            
        return await self.appointment_repo.create(
            db=db, appointment_in=appointment_in, owner_id=owner_id
        )

    async def update_appointment(
        self,
        db: AsyncSession,
        appointment_id: UUID,
        appointment_in: AppointmentUpdate,
        owner_id: UUID,
    ) -> Appointment:
        """Update an appointment's information after verifying ownership."""
        appointment = await self.get_appointment_by_id(
            db=db, appointment_id=appointment_id, owner_id=owner_id
        )
        return await self.appointment_repo.update(
            db=db, appointment=appointment, appointment_in=appointment_in
        )

    async def delete_appointment(
        self, db: AsyncSession, appointment_id: UUID, owner_id: UUID
    ) -> None:
        """Delete an appointment after verifying ownership."""
        appointment = await self.get_appointment_by_id(
            db=db, appointment_id=appointment_id, owner_id=owner_id
        )
        await self.appointment_repo.delete(db=db, appointment=appointment)
