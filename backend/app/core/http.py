"""Shared HTTP client for external API calls."""

from __future__ import annotations

from functools import lru_cache

import httpx


@lru_cache
def get_http_client() -> httpx.AsyncClient:
    """Return a process-wide async HTTP client with connection pooling."""
    return httpx.AsyncClient(timeout=10.0, limits=httpx.Limits(max_connections=20, max_keepalive_connections=10))
