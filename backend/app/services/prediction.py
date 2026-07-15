"""Prediction history business logic."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import PredictionHistory
from app.schemas.prediction import PredictionCreate


def create_prediction(session: Session, data: PredictionCreate) -> PredictionHistory:
    """Store a new disease prediction result."""
    record = PredictionHistory(**data.model_dump())
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def get_predictions_by_pet(session: Session, pet_id: uuid.UUID) -> list[PredictionHistory]:
    """Return prediction history for a specific pet."""
    return list(
        session.scalars(
            select(PredictionHistory)
            .where(PredictionHistory.pet_id == pet_id)
            .order_by(PredictionHistory.created_at.desc())
        )
    )
