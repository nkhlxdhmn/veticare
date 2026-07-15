"""Service layer for authentication-related business logic."""

from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.services.audit_service import AuditService


class AuthService:
    """Orchestrate authentication logic and refresh-token lifecycle."""

    def __init__(
        self,
        user_repo: UserRepository | None = None,
        refresh_token_repo: RefreshTokenRepository | None = None,
    ) -> None:
        self.user_repo = user_repo or UserRepository()
        self.refresh_token_repo = refresh_token_repo or RefreshTokenRepository()
        self.audit_service = AuditService()

    async def register_user(
        self,
        user_in: UserCreate,
        db: AsyncSession,
        request: Request | None = None,
    ) -> User:
        """Register a new user after validating input."""
        existing_user = await self.user_repo.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        existing_user_by_username = await self.user_repo.get_by_username(
            db, username=user_in.username
        )
        if existing_user_by_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )

        hashed_password = security.get_password_hash(user_in.password)
        user = await self.user_repo.create(
            db, user_in=user_in, hashed_password=hashed_password
        )
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="register",
                resource_type="user",
                user_id=user.id,
                resource_id=str(user.id),
            )
        return user

    async def login_user(
        self,
        email: str,
        password: str,
        db: AsyncSession,
        request: Request | None = None,
    ) -> tuple[str, str]:
        """Authenticate a user and return access/refresh token pair."""
        user = await self.user_repo.get_by_email(db, email=email)
        if not user or not security.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

        access_token = security.create_access_token(
            data={"sub": str(user.id), "type": "access"}
        )
        refresh_token, refresh_id = security.create_refresh_token(user_id=user.id)
        token_hash = security.hash_token(refresh_token)
        expires_at = datetime.now(UTC) + timedelta(days=14)
        refresh_session = RefreshToken(
            id=refresh_id,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        await self.refresh_token_repo.create(db, refresh_session)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="login",
                resource_type="auth",
                user_id=user.id,
                resource_id=str(user.id),
            )
        return access_token, refresh_token

    async def refresh_access_token(
        self,
        db: AsyncSession,
        refresh_token_value: str,
        request: Request | None = None,
    ) -> tuple[str, str]:
        """Rotate a refresh token and issue a new access/refresh pair."""
        try:
            user_id, refresh_id = security.decode_refresh_token(refresh_token_value)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            ) from exc

        refresh_session = await self.refresh_token_repo.get_active(db, refresh_id)
        if not refresh_session or refresh_session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if not security.token_hashes_match(refresh_token_value, refresh_session.token_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        await self.refresh_token_repo.revoke(db, refresh_session)
        access_token = security.create_access_token(
            data={"sub": str(user_id), "type": "access"}
        )
        new_refresh_token, new_refresh_id = security.create_refresh_token(user_id=user_id)
        new_session = RefreshToken(
            id=new_refresh_id,
            user_id=user_id,
            token_hash=security.hash_token(new_refresh_token),
            expires_at=datetime.now(UTC) + timedelta(days=14),
            replaced_by_id=refresh_session.id,
        )
        await self.refresh_token_repo.create(db, new_session)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="refresh_token",
                resource_type="auth",
                user_id=user_id,
                resource_id=str(user_id),
            )
        return access_token, new_refresh_token

    async def revoke_refresh_token(
        self,
        db: AsyncSession,
        refresh_token_value: str,
        request: Request | None = None,
    ) -> None:
        """Revoke a refresh token session."""
        try:
            user_id, refresh_id = security.decode_refresh_token(refresh_token_value)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            ) from exc

        refresh_session = await self.refresh_token_repo.get_active(db, refresh_id)
        if not refresh_session or refresh_session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if not security.token_hashes_match(refresh_token_value, refresh_session.token_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        await self.refresh_token_repo.revoke(db, refresh_session)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="logout",
                resource_type="auth",
                user_id=user_id,
                resource_id=str(user_id),
            )

    async def logout_user(
        self,
        db: AsyncSession,
        user_id: UUID,
        request: Request | None = None,
    ) -> None:
        """Revoke every refresh session belonging to a user."""
        await self.refresh_token_repo.revoke_all_for_user(db, user_id)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="logout",
                resource_type="auth",
                user_id=user_id,
                resource_id=str(user_id),
            )
