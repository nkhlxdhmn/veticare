"""Service for recording security-relevant actions."""

from datetime import UTC, datetime
from uuid import UUID

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import AuditLogRepository


class AuditService:
    """Create audit events without exposing persistence to routers."""

    def __init__(self, repository: AuditLogRepository | None = None) -> None:
        self.repository = repository or AuditLogRepository()

    async def record(
        self,
        db: AsyncSession,
        request: Request,
        action: str,
        resource_type: str,
        user_id: UUID | None = None,
        resource_id: str | None = None,
        metadata: dict | None = None,
    ) -> None:
        """Append a request-correlated audit event to the current transaction."""
        await self.repository.create(
            db,
            AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                request_id=getattr(request.state, "request_id", None),
                client_ip=request.client.host if request.client else None,
                metadata_json=metadata,
                created_at=datetime.now(UTC),
            ),
        )
