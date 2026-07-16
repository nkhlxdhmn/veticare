"""Animal encyclopedia business logic."""

import uuid

from supabase import Client


def get_animals(supabase: Client, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return animal species with pagination."""
    result = supabase.table("animals").select("*").order("name").range(offset, offset + limit - 1).execute()
    return result.data


def get_animal_by_id(supabase: Client, animal_id: uuid.UUID) -> dict | None:
    """Fetch a single animal by primary key."""
    result = supabase.table("animals").select("*").eq("id", str(animal_id)).execute()
    return result.data[0] if result.data else None
