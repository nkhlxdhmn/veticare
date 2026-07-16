"""Singleton Supabase client for the entire application."""

import logging
from functools import lru_cache

from fastapi import HTTPException, status
from supabase import Client, create_client

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@lru_cache
def get_supabase_client() -> Client:
    """Create and cache a single Supabase client instance."""
    settings = get_settings()
    if not settings.veticare_supabase_url:
        logger.error("VETICARE_SUPABASE_URL is not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Supabase URL is missing",
        )
    if not settings.veticare_supabase_key:
        logger.error("VETICARE_SUPABASE_KEY is not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Supabase key is missing",
        )
    try:
        return create_client(settings.veticare_supabase_url, settings.veticare_supabase_key)
    except Exception:
        logger.exception("Failed to create Supabase client")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Could not connect to Supabase",
        )
