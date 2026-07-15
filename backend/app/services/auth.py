"""Authentication business logic."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Profile
from app.schemas.auth import RegisterRequest
from app.utils.security import hash_password, verify_password


def get_profile_by_email(session: Session, email: str) -> Profile | None:
    """Find a profile by normalized email address."""
    return session.scalar(select(Profile).where(Profile.email == email.lower()))


def register_profile(session: Session, request: RegisterRequest) -> Profile:
    """Create and persist a new profile after uniqueness validation."""
    profile = Profile(
        email=str(request.email).lower(),
        hashed_password=hash_password(request.password),
        full_name=request.full_name.strip(),
        phone=request.phone,
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def authenticate_profile(session: Session, email: str, password: str) -> Profile | None:
    """Return an active profile only when its credentials are valid."""
    profile = get_profile_by_email(session, email)
    if not profile or not profile.is_active or not verify_password(password, profile.hashed_password):
        return None
    return profile
