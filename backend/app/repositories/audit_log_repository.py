"""Database access for append-only audit logs."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditLogRepository:
    """Persist immutable audit events."""

    async def create(self, db: AsyncSession, event: AuditLog) -> None:
        """Add an audit event to the current transaction."""
        db.add(event)
        await db.flush()
