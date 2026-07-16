"""ML model registry business logic."""

from supabase import Client


def get_ml_models(supabase: Client, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return registered ML models with pagination."""
    result = supabase.table("ml_models").select("*").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data


def get_active_model(supabase: Client) -> dict | None:
    """Return the currently active ML model."""
    result = supabase.table("ml_models").select("*").eq("is_active", True).execute()
    return result.data[0] if result.data else None
