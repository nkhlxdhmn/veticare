"""Simple in-memory rate limiter middleware."""

from __future__ import annotations

import time
from collections import defaultdict
from collections.abc import Callable
from typing import Any

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

# Default limits: (requests, window_seconds)
_DEFAULT_LIMITS: dict[str, tuple[int, int]] = {
    "/api/v1/auth/register": (10, 60),
    "/api/v1/auth/login": (20, 60),
    "/api/v1/auth/token": (20, 60),
    "/api/v1/predictions/predict": (30, 60),
    "/api/v1/services/nearby": (20, 60),
}


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Track request counts per client IP with a sliding-window counter."""

    _shared_hits: dict[str, list[float]] = defaultdict(list)

    def __init__(self, app: Any, default_limit: tuple[int, int] = (100, 60)) -> None:
        super().__init__(app)
        self._default_limit = default_limit
        self._hits = self._shared_hits

    @classmethod
    def clear_hits(cls) -> None:
        """Reset all counters — useful in tests."""
        cls._shared_hits.clear()

    def _client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _is_rate_limited(self, key: str, limit: int, window: int) -> bool:
        now = time.monotonic()
        cutoff = now - window
        self._hits[key] = [t for t in self._hits[key] if t > cutoff]
        if len(self._hits[key]) >= limit:
            return True
        self._hits[key].append(now)
        return False

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        limit, window = _DEFAULT_LIMITS.get(path, self._default_limit)
        key = f"{self._client_ip(request)}:{path}"

        if self._is_rate_limited(key, limit, window):
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
                headers={"Retry-After": str(window)},
            )

        return await call_next(request)
