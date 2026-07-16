"""Singleton Supabase client for the entire application."""

from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    """Create and cache a single Supabase client instance."""
    settings = get_settings()
    if not settings.veticare_supabase_url or not settings.veticare_supabase_key:
        raise RuntimeError("VETICARE_SUPABASE_URL and VETICARE_SUPABASE_KEY must be configured")
    return create_client(settings.veticare_supabase_url, settings.veticare_supabase_key)
