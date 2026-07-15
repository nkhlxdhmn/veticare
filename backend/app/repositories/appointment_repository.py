"""Database repository for appointment operations."""

from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


class AppointmentRepository:
    """Encapsulates all database operations for the Appointment model."""

    async def get_by_id(self, db: AsyncSession, appointment_id: UUID) -> Appointment | None:
        """Fetch a specific appointment by ID."""
        stmt = (
            select(Appointment)
            .options(selectinload(Appointment.pet))
            .where(Appointment.id == appointment_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_for_owner(
        self,
        db: AsyncSession,
        owner_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Appointment]:
        """Fetch all appointments belonging to a user (across all their pets)."""
        stmt = (
            select(Appointment)
            .options(selectinload(Appointment.pet))
            .where(Appointment.owner_id == owner_id)
            .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_for_pet(
        self,
        db: AsyncSession,
        pet_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Appointment]:
        """Fetch all appointments for a specific pet."""
        stmt = (
            select(Appointment)
            .options(selectinload(Appointment.pet))
            .where(Appointment.pet_id == pet_id)
            .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, appointment_in: AppointmentCreate, owner_id: UUID
    ) -> Appointment:
        """Create a new appointment record."""
        appointment_data = appointment_in.model_dump()
        appointment = Appointment(**appointment_data, owner_id=owner_id)
        db.add(appointment)
        await db.commit()
        await db.refresh(appointment)
        # Eager load pet relation
        return await self.get_by_id(db, appointment.id)

    async def update(
        self, db: AsyncSession, appointment: Appointment, appointment_in: AppointmentUpdate
    ) -> Appointment:
        """Update an existing appointment record."""
        update_data = appointment_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(appointment, field, value)

        db.add(appointment)
        await db.commit()
        await db.refresh(appointment)
        return appointment

    async def delete(self, db: AsyncSession, appointment: Appointment) -> None:
        """Hard delete an appointment record."""
        await db.delete(appointment)
        await db.commit()
