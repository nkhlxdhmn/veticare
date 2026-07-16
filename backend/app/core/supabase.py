"""Singleton Supabase client for the entire application."""

import logging
from functools import lru_cache

from fastapi import HTTPException, status
from supabase import Client, create_client

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@lru_cache
def get_supabase_client() -> Client:
    """Create and cache a single Supabase client instance.

    Uses the service_role key (VETICARE_SUPABASE_KEY) which bypasses RLS
    so the backend can read and write all tables. The anon key is used
    by the frontend only.
    """
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
        client = create_client(settings.veticare_supabase_url, settings.veticare_supabase_key)
        # Verify access by performing a test query
        client.table("profiles").select("id").limit(1).execute()
        return client
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to create Supabase client")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Could not connect to Supabase. "
            "Ensure VETICARE_SUPABASE_KEY is the service_role key (not the anon key), "
            "or disable RLS on the profiles/pets/vaccinations tables.",
        )
