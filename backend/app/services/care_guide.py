"""Care guide business logic."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CareGuide


def _escape_ilike(value: str) -> str:
    """Escape special ILIKE characters to prevent pattern injection."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def get_care_guides(session: Session, animal: str | None = None, offset: int = 0, limit: int = 20) -> list[CareGuide]:
    """Return care guides with pagination, optionally filtered by animal name."""
    query = select(CareGuide)
    if animal:
        query = query.where(CareGuide.animal.ilike(_escape_ilike(animal)))
    return list(session.scalars(query.order_by(CareGuide.animal).offset(offset).limit(limit)))


def get_care_guide_by_disease(session: Session, disease: str) -> CareGuide | None:
    """Return the care guide matching a specific disease name."""
    return session.scalar(
        select(CareGuide).where(CareGuide.disease.ilike(_escape_ilike(disease)))
    )
