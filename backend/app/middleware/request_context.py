"""Request correlation middleware and request-scoped context."""

from contextvars import ContextVar
from uuid import uuid4

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

request_id_context: ContextVar[str] = ContextVar("request_id", default="")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a request ID to request state, response headers, and log context."""

    async def dispatch(self, request: Request, call_next: object) -> Response:
        """Process a request with a safe client-provided or generated identifier."""
        request_id = request.headers.get("X-Request-ID") or str(uuid4())
        request.state.request_id = request_id
        token = request_id_context.set(request_id)
        try:
            response = await call_next(request)  # type: ignore[operator]
        finally:
            request_id_context.reset(token)
        response.headers["X-Request-ID"] = request_id
        return response
