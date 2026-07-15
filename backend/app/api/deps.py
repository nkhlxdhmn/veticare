"""Common route dependencies for database access and authenticated users."""

from collections.abc import AsyncGenerator
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.session import get_session
from app.models.role import UserRole
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.medical_record_service import MedicalRecordService
from app.services.notification_service import NotificationService
from app.services.pet_service import PetService
from app.services.prediction_service import PredictionService
from app.services.storage_service import StorageService
from app.services.vaccination_service import VaccinationService

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get a database session."""
    async for session in get_session():
        yield session


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(reusable_oauth2),
) -> User:
    """Dependency to get the current authenticated user."""
    try:
        payload = jwt.decode(
            token,
            settings.secret_key.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
        )
    except (JWTError, ValidationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    try:
        user_uuid = UUID(str(user_id))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc

    user = await db.get(User, user_uuid)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user


def has_required_role(user: User, required_roles: tuple[UserRole, ...]) -> bool:
    """Ensure the user holds at least one allowed role or raise an authorization error."""
    role_value = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    if role_value in {role.value for role in required_roles}:
        return True
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions",
    )


def require_roles(required_roles: tuple[UserRole, ...]):
    """Create a dependency that enforces role membership."""

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        has_required_role(current_user, required_roles)
        return current_user

    return dependency


def get_auth_service() -> AuthService:
    """Create an authentication service instance for dependency injection."""
    return AuthService()


def get_notification_service() -> NotificationService:
    """Create a notification service instance for dependency injection."""
    return NotificationService()


def get_pet_service() -> PetService:
    """Create a pet service instance for dependency injection."""
    return PetService()


def get_vaccination_service() -> VaccinationService:
    """Create a vaccination service instance for dependency injection."""
    return VaccinationService()


def get_medical_record_service() -> MedicalRecordService:
    """Create a medical record service instance for dependency injection."""
    return MedicalRecordService()


def get_prediction_service() -> PredictionService:
    """Create a prediction service instance for dependency injection."""
    return PredictionService()


def get_storage_service() -> StorageService:
    """Create a storage service instance for dependency injection."""
    return StorageService()
