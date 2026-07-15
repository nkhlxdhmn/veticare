"""SQLAlchemy ORM models for VetiCare."""

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TimestampUUIDMixin:
    """Give records UUID primary keys and database-managed timestamps."""

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Profile(TimestampUUIDMixin, Base):
    __tablename__ = "profiles"
    __table_args__ = (Index("ix_profiles_email", "email", unique=True),)

    email: Mapped[str] = mapped_column(String(320), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30))
    avatar_url: Mapped[str | None] = mapped_column(String(2_048))
    role: Mapped[str] = mapped_column(String(30), default="pet_owner", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    pets: Mapped[list["Pet"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Animal(TimestampUUIDMixin, Base):
    __tablename__ = "animals"
    __table_args__ = (UniqueConstraint("name", "scientific_name", name="uq_animals_name_scientific_name"),)

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    scientific_name: Mapped[str | None] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(2_048))
    diet: Mapped[str | None] = mapped_column(Text)
    average_lifespan: Mapped[str | None] = mapped_column(String(100))
    vaccination_schedule: Mapped[dict | None] = mapped_column(JSON)
    care_guide: Mapped[dict | None] = mapped_column(JSON)
    diseases: Mapped[list["AnimalDisease"]] = relationship(back_populates="animal", cascade="all, delete-orphan")
    pets: Mapped[list["Pet"]] = relationship(back_populates="animal")


class Pet(TimestampUUIDMixin, Base):
    __tablename__ = "pets"
    __table_args__ = (Index("ix_pets_owner_id_created_at", "owner_id", "created_at"),)

    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    animal_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("animals.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    breed: Mapped[str | None] = mapped_column(String(100))
    dob: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(30))
    weight: Mapped[float | None] = mapped_column(Float)
    height: Mapped[float | None] = mapped_column(Float)
    color: Mapped[str | None] = mapped_column(String(80))
    microchip_number: Mapped[str | None] = mapped_column(String(100), unique=True)
    image_url: Mapped[str | None] = mapped_column(String(2_048))
    notes: Mapped[str | None] = mapped_column(Text)
    owner: Mapped[Profile] = relationship(back_populates="pets")
    animal: Mapped[Animal | None] = relationship(back_populates="pets")
    vaccinations: Mapped[list["VaccinationRecord"]] = relationship(back_populates="pet", cascade="all, delete-orphan")
    predictions: Mapped[list["PredictionHistory"]] = relationship(back_populates="pet", cascade="all, delete-orphan")


class VaccinationRecord(TimestampUUIDMixin, Base):
    __tablename__ = "vaccination_records"
    __table_args__ = (Index("ix_vaccinations_pet_due", "pet_id", "next_due_date"),)

    pet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    vaccine_name: Mapped[str] = mapped_column(String(160), nullable=False)
    vaccination_date: Mapped[date] = mapped_column(Date, nullable=False)
    next_due_date: Mapped[date | None] = mapped_column(Date)
    dose: Mapped[str | None] = mapped_column(String(80))
    clinic_name: Mapped[str | None] = mapped_column(String(160))
    veterinarian: Mapped[str | None] = mapped_column(String(160))
    certificate_url: Mapped[str | None] = mapped_column(String(2_048))
    notes: Mapped[str | None] = mapped_column(Text)
    pet: Mapped[Pet] = relationship(back_populates="vaccinations")


class AnimalDisease(TimestampUUIDMixin, Base):
    __tablename__ = "animal_diseases"
    __table_args__ = (UniqueConstraint("animal_id", "disease_name", name="uq_animal_disease_name"),)

    animal_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("animals.id", ondelete="CASCADE"), nullable=False)
    disease_name: Mapped[str] = mapped_column(String(160), nullable=False)
    symptoms: Mapped[str | None] = mapped_column(Text)
    causes: Mapped[str | None] = mapped_column(Text)
    treatment: Mapped[str | None] = mapped_column(Text)
    prevention: Mapped[str | None] = mapped_column(Text)
    animal: Mapped[Animal] = relationship(back_populates="diseases")


class CareGuide(TimestampUUIDMixin, Base):
    __tablename__ = "care_guides"

    animal: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    disease: Mapped[str | None] = mapped_column(String(160), index=True)
    diet: Mapped[str | None] = mapped_column(Text)
    dos: Mapped[str | None] = mapped_column(Text)
    donts: Mapped[str | None] = mapped_column(Text)
    medication: Mapped[str | None] = mapped_column(Text)
    warning_signs: Mapped[str | None] = mapped_column(Text)
    recovery_time: Mapped[str | None] = mapped_column(String(100))


class MLModel(TimestampUUIDMixin, Base):
    __tablename__ = "ml_models"
    __table_args__ = (UniqueConstraint("model_name", "version", name="uq_ml_models_name_version"),)

    model_name: Mapped[str] = mapped_column(String(160), nullable=False)
    version: Mapped[str] = mapped_column(String(80), nullable=False)
    accuracy: Mapped[float | None] = mapped_column(Float)
    bucket_path: Mapped[str] = mapped_column(String(2_048), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PredictionHistory(TimestampUUIDMixin, Base):
    __tablename__ = "prediction_history"
    __table_args__ = (CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_prediction_confidence"),)

    pet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_disease: Mapped[str] = mapped_column(String(160), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    model_version: Mapped[str] = mapped_column(String(80), nullable=False)
    prediction_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    pet: Mapped[Pet] = relationship(back_populates="predictions")
