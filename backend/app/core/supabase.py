"""Singleton Supabase client for the entire application."""

import logging
from functools import lru_cache

from fastapi import HTTPException, status
from supabase import Client, create_client

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _verify_table_columns(client: Client) -> dict:
    """Verify the profiles table has all required columns and return its status."""
    required = {"id", "email", "hashed_password", "is_active", "full_name", "phone"}
    try:
        # Fetch one row to check the schema
        result = client.table("profiles").select("*").limit(1).execute()
        if result.data:
            actual = set(result.data[0].keys())
        else:
            # Table is empty — try inserting a temp row to get schema
            from uuid import uuid4
            temp_id = str(uuid4())
            client.table("profiles").insert({
                "id": temp_id, "email": "schema-check@temp.local",
                "hashed_password": "x", "full_name": "Schema Check",
            }).execute()
            result = client.table("profiles").select("*").eq("id", temp_id).execute()
            if result.data:
                actual = set(result.data[0].keys())
            # Clean up
            client.table("profiles").delete().eq("id", temp_id).execute()
            actual = set()

        missing = required - actual
        return {"exists": True, "columns": list(actual), "missing": list(missing)}
    except Exception as exc:
        err = str(exc).lower()
        if "does not exist" in err or "relation" in err:
            return {"exists": False, "columns": [], "missing": list(required), "error": "Table 'profiles' does not exist"}
        if "permission denied" in err or "policy" in err:
            return {"exists": True, "columns": [], "missing": [], "error": "RLS / permission denied — check your service_role key"}
        return {"exists": None, "columns": [], "missing": [], "error": str(exc)}


@lru_cache
def get_supabase_client() -> Client:
    """Create and cache a single Supabase client instance.

    Uses VETICARE_SUPABASE_KEY (the service_role key) which bypasses RLS
    so the backend can read and write all tables.
    """
    settings = get_settings()
    if not settings.veticare_supabase_url:
        raise RuntimeError("VETICARE_SUPABASE_URL is not configured — set it in Render Environment Variables")
    if not settings.veticare_supabase_key:
        raise RuntimeError("VETICARE_SUPABASE_KEY is not configured — set it in Render Environment Variables")

    try:
        client = create_client(settings.veticare_supabase_url, settings.veticare_supabase_key)
        # Test query to verify connectivity
        client.table("profiles").select("id").limit(1).execute()
        return client
    except Exception:
        logger.exception("Supabase create_client() failed")
        raise RuntimeError(
            "Failed to connect to Supabase. Check that VETICARE_SUPABASE_URL and "
            "VETICARE_SUPABASE_KEY (service_role key) are correct in Render Environment Variables."
        )


def verify_supabase() -> dict:
    """Return a detailed status dict for the /debug/supabase endpoint."""
    try:
        client = get_supabase_client()
    except RuntimeError as e:
        return {"connected": False, "error": str(e)}
    except Exception:
        logger.exception("Unexpected error in get_supabase_client")
        return {"connected": False, "error": "Unexpected error"}

    try:
        result = client.table("profiles").select("id").limit(1).execute()
        row_count = len(result.data)
    except Exception as exc:
        err = str(exc).lower()
        if "does not exist" in err:
            return {"connected": True, "table_exists": False, "error": "Table 'profiles' does not exist"}
        return {"connected": True, "table_exists": None, "error": str(exc)}

    table_info = _verify_table_columns(client)

    return {
        "connected": True,
        "table_exists": table_info.get("exists"),
        "columns": table_info.get("columns"),
        "missing_columns": table_info.get("missing"),
        "row_count": row_count,
        "table_error": table_info.get("error"),
    }
