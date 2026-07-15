"""HTTP security headers and a lightweight in-memory rate limiter."""

from collections import defaultdict, deque
from time import monotonic

from app.core.config import settings
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Apply conservative security headers to every response."""

    async def dispatch(self, request: Request, call_next: object) -> Response:
        """Process a request and attach browser security controls."""
        response = await call_next(request)  # type: ignore[operator]
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=()"
        )
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply a process-local fixed-window rate limit by client address."""

    def __init__(self, app: object) -> None:
        super().__init__(app)  # type: ignore[arg-type]
        self.requests: defaultdict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: object) -> Response:
        """Reject requests that exceed the configured client quota."""
        client_ip = request.client.host if request.client else "unknown"
        now = monotonic()
        history = self.requests[client_ip]
        while history and now - history[0] >= settings.rate_limit_window_seconds:
            history.popleft()
        if len(history) >= settings.rate_limit_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "message": "Rate limit exceeded",
                    "error": "rate_limited",
                },
            )
        history.append(now)
        return await call_next(request)  # type: ignore[operator]
