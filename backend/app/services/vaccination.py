"""Vaccination record business logic."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import VaccinationRecord
from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate


def create_vaccination(session: Session, data: VaccinationCreate) -> VaccinationRecord:
    """Create a new vaccination record for a pet."""
    record = VaccinationRecord(**data.model_dump())
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def get_vaccinations_by_pet(session: Session, pet_id: uuid.UUID, offset: int = 0, limit: int = 20) -> list[VaccinationRecord]:
    """Return vaccination records for a specific pet with pagination."""
    return list(
        session.scalars(
            select(VaccinationRecord)
            .where(VaccinationRecord.pet_id == pet_id)
            .order_by(VaccinationRecord.vaccination_date.desc())
            .offset(offset)
            .limit(limit)
        )
    )


def get_vaccination_by_id(session: Session, record_id: uuid.UUID) -> VaccinationRecord | None:
    """Fetch a single vaccination record by primary key."""
    return session.get(VaccinationRecord, record_id)


def update_vaccination(session: Session, record: VaccinationRecord, data: VaccinationUpdate) -> VaccinationRecord:
    """Apply partial updates to a vaccination record."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    session.commit()
    session.refresh(record)
    return record


def delete_vaccination(session: Session, record: VaccinationRecord) -> None:
    """Remove a vaccination record."""
    session.delete(record)
    session.commit()
