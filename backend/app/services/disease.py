"""Animal disease business logic."""

import uuid

from supabase import Client


def get_diseases_by_animal(supabase: Client, animal_id: uuid.UUID, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return diseases for a specific animal species with pagination."""
    result = supabase.table("animal_diseases").select("*").eq("animal_id", str(animal_id)).order("disease_name").range(offset, offset + limit - 1).execute()
    return result.data


def get_all_diseases(supabase: Client, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return all disease records with pagination."""
    result = supabase.table("animal_diseases").select("*").order("disease_name").range(offset, offset + limit - 1).execute()
    return result.data
