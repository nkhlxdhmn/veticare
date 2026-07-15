"""Structured request logging middleware."""

import logging
from time import perf_counter

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger("veticare.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log method, path, status, latency, client IP, and request identity."""

    async def dispatch(self, request: Request, call_next: object) -> Response:
        """Record completion details after each request."""
        started_at = perf_counter()
        response = await call_next(request)  # type: ignore[operator]
        client_ip = request.client.host if request.client else "unknown"
        logger.info(
            "request_completed",
            extra={
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": response.status_code,
                "latency_ms": round((perf_counter() - started_at) * 1_000, 2),
                "client_ip": client_ip,
                "user_id": getattr(request.state, "user_id", None),
            },
        )
        return response
