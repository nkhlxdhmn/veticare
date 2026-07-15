"""ML model registry business logic."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import MLModel


def get_ml_models(session: Session, offset: int = 0, limit: int = 20) -> list[MLModel]:
    """Return registered ML models with pagination."""
    return list(
        session.scalars(
            select(MLModel).order_by(MLModel.created_at.desc()).offset(offset).limit(limit)
        )
    )


def get_active_model(session: Session) -> MLModel | None:
    """Return the currently active ML model."""
    return session.scalar(select(MLModel).where(MLModel.is_active.is_(True)))
