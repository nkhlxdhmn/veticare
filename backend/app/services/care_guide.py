"""Care guide business logic."""

from supabase import Client


def get_care_guides(supabase: Client, animal: str | None = None, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return care guides with pagination, optionally filtered by animal name."""
    query = supabase.table("care_guides").select("*")
    if animal:
        query = query.ilike("animal", f"%{animal}%")
    result = query.order("animal").range(offset, offset + limit - 1).execute()
    return result.data


def get_care_guide_by_disease(supabase: Client, disease: str) -> dict | None:
    """Return the care guide matching a specific disease name."""
    result = supabase.table("care_guides").select("*").ilike("disease", disease).execute()
    return result.data[0] if result.data else None
