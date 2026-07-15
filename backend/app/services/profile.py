"""Profile business logic."""

from sqlalchemy.orm import Session

from app.models import Profile
from app.schemas.profile import ProfileUpdate


def get_profile(session: Session, profile_id) -> Profile | None:
    """Fetch a profile by primary key."""
    return session.get(Profile, profile_id)


def update_profile(session: Session, profile: Profile, data: ProfileUpdate) -> Profile:
    """Apply partial updates to a profile and persist."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    session.commit()
    session.refresh(profile)
    return profile
