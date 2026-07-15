"""Database access for refresh-token sessions."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    """Own refresh-token persistence and revocation queries."""

    async def create(self, db: AsyncSession, token: RefreshToken) -> RefreshToken:
        """Persist a refresh session."""
        db.add(token)
        await db.flush()
        return token

    async def get_active(self, db: AsyncSession, token_id: UUID) -> RefreshToken | None:
        """Return a non-revoked, non-expired refresh session."""
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.id == token_id,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > datetime.now(UTC),
            )
        )
        return result.scalar_one_or_none()

    async def revoke(self, db: AsyncSession, token: RefreshToken) -> None:
        """Mark a refresh session unusable."""
        token.revoked_at = datetime.now(UTC)
        await db.flush()

    async def revoke_all_for_user(self, db: AsyncSession, user_id: UUID) -> None:
        """Revoke every active refresh session for a user."""
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
