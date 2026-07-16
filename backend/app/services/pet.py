"""Pet business logic."""

import uuid

from supabase import Client

from app.schemas.pet import PetCreate, PetUpdate


def _enrich_pet(pet: dict) -> dict:
    """Normalize pet record: expose `species` from the `animal` column."""
    if "animal" in pet:
        if isinstance(pet["animal"], dict):
            pet["species"] = pet["animal"].get("name")
        else:
            pet["species"] = pet.pop("animal")
    elif "species" not in pet:
        pet["species"] = None
    return pet


def _load_animal(supabase: Client, pet: dict) -> dict:
    """Attach animal brief if animal_id is set."""
    pet = _enrich_pet(pet)
    if pet.get("animal_id") and not isinstance(pet.get("animal"), dict):
        animal_result = supabase.table("animals").select("id", "name", "scientific_name").eq("id", pet["animal_id"]).execute()
        if animal_result.data:
            pet["animal"] = animal_result.data[0]
    return pet


def create_pet(supabase: Client, owner_id: uuid.UUID, data: PetCreate) -> dict:
    """Create a new pet belonging to the given owner."""
    payload = data.model_dump(exclude_none=True, mode="json")
    payload["owner_id"] = str(owner_id)
    # Map species -> animal (DB column name)
    if payload.get("species"):
        payload["animal"] = payload.pop("species")
    if payload.get("animal_id"):
        payload["animal_id"] = str(payload["animal_id"])
    result = supabase.table("pets").insert(payload).execute()
    pet = result.data[0]
    return _load_animal(supabase, pet)


def get_pets_by_owner(supabase: Client, owner_id: uuid.UUID, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return all pets owned by a specific user, with animal info loaded."""
    result = supabase.table("pets").select("*").eq("owner_id", str(owner_id)).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return [_load_animal(supabase, p) for p in result.data]


def get_pet_by_id(supabase: Client, pet_id: uuid.UUID, owner_id: uuid.UUID) -> dict | None:
    """Return a single pet only if it belongs to the given owner."""
    result = supabase.table("pets").select("*").eq("id", str(pet_id)).eq("owner_id", str(owner_id)).execute()
    if not result.data:
        return None
    return _load_animal(supabase, result.data[0])


def update_pet(supabase: Client, pet_id: uuid.UUID, data: PetUpdate) -> dict | None:
    """Apply partial updates to a pet and persist."""
    payload = data.model_dump(exclude_unset=True, exclude_none=True, mode="json")
    # Map species -> animal (DB column name)
    if payload.get("species"):
        payload["animal"] = payload.pop("species")
    if payload.get("animal_id"):
        payload["animal_id"] = str(payload["animal_id"])
    if not payload:
        result = supabase.table("pets").select("*").eq("id", str(pet_id)).execute()
        return _load_animal(supabase, result.data[0]) if result.data else None
    result = supabase.table("pets").update(payload).eq("id", str(pet_id)).execute()
    if not result.data:
        return None
    return _load_animal(supabase, result.data[0])


def delete_pet(supabase: Client, pet_id: uuid.UUID) -> None:
    """Remove a pet — cascading deletes handled by Supabase."""
    supabase.table("pets").delete().eq("id", str(pet_id)).execute()
