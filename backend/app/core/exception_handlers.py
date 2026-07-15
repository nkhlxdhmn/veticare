"""Central exception handlers with consistent error envelopes."""

import logging
from datetime import UTC, datetime

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import DatabaseException, VetiCareException

logger = logging.getLogger(__name__)


def _error_response(
    request: Request, status_code: int, message: str, error: str
) -> JSONResponse:
    """Create the documented standard error response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "error": error,
            "request_id": getattr(request.state, "request_id", ""),
            "timestamp": datetime.now(UTC).isoformat(),
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register transport mappings for domain and infrastructure exceptions."""

    @app.exception_handler(VetiCareException)
    async def handle_domain_exception(
        request: Request, exc: VetiCareException
    ) -> JSONResponse:
        logger.info("domain_error", extra={"error_code": exc.error_code})
        return _error_response(request, exc.status_code, exc.message, exc.error_code)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_exception(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return _error_response(
            request, 422, "Request validation failed", "validation_error"
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return _error_response(request, exc.status_code, str(exc.detail), "http_error")

    @app.exception_handler(SQLAlchemyError)
    async def handle_database_exception(
        request: Request, exc: SQLAlchemyError
    ) -> JSONResponse:
        logger.exception("database_error")
        domain_exception = DatabaseException("A database operation failed")
        return _error_response(
            request,
            domain_exception.status_code,
            domain_exception.message,
            domain_exception.error_code,
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_exception(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception("unexpected_error")
        return _error_response(
            request, 500, "An unexpected error occurred", "internal_error"
        )
