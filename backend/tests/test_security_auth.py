import asyncio
import uuid
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.api.deps import has_required_role
from app.core import security
from app.models.role import UserRole
from app.services.auth_service import AuthService


class StubRefreshTokenRepository:
    async def create(self, db, refresh_session):
        return None

    async def get_active(self, db, refresh_id):
        return None

    async def revoke(self, db, refresh_session):
        return None

    async def revoke_all_for_user(self, db, user_id):
        return None


class StubUserRepository:
    def __init__(self, user=None):
        self.user = user

    async def get_by_email(self, db, email):
        return self.user

    async def get_by_username(self, db, username):
        return None

    async def create(self, db, user_in, hashed_password):
        return SimpleNamespace(id=uuid.uuid4())


def test_login_user_returns_access_and_refresh_tokens() -> None:
    user = SimpleNamespace(
        id=uuid.uuid4(),
        email="owner@example.com",
        hashed_password="hashed",
        is_active=True,
    )
    service = AuthService(
        user_repo=StubUserRepository(user=user),
        refresh_token_repo=StubRefreshTokenRepository(),
    )

    class StubDb:
        pass

    async def run_login() -> tuple[str, str]:
        return await service.login_user(email="owner@example.com", password="Password1!", db=StubDb())

    access_token, refresh_token = asyncio.run(run_login())

    assert access_token
    assert refresh_token


def test_has_required_role_checks_role_membership() -> None:
    user = SimpleNamespace(role=UserRole.VETERINARIAN)

    assert has_required_role(user, (UserRole.VETERINARIAN, UserRole.CLINIC_ADMIN))

    with pytest.raises(HTTPException):
        has_required_role(user, (UserRole.SUPER_ADMIN,))

    with pytest.raises(HTTPException):
        has_required_role(SimpleNamespace(role=UserRole.PET_OWNER), (UserRole.VETERINARIAN,))
