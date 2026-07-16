"""Vaccination record business logic."""

import logging
import uuid

from postgrest.exceptions import APIError
from supabase import Client

from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate

logger = logging.getLogger(__name__)

_BASE_COLUMNS = {"id", "pet_id", "vaccine_name", "vaccination_date", "next_due_date", "dose", "clinic_name", "veterinarian", "certificate_url", "notes", "created_at", "updated_at"}


def _safe_insert(supabase: Client, table: str, payload: dict) -> list:
    """Try insert with full payload; fall back to known columns on error."""
    try:
        return supabase.table(table).insert(payload).execute().data
    except APIError:
        logger.warning("Full insert failed for %s — retrying with known columns", table)
        safe = {k: v for k, v in payload.items() if k in _BASE_COLUMNS}
        return supabase.table(table).insert(safe).execute().data


def _safe_update(supabase: Client, table: str, record_id: str, payload: dict) -> list:
    """Try update with full payload; fall back to known columns on error."""
    try:
        return supabase.table(table).update(payload).eq("id", record_id).execute().data
    except APIError:
        logger.warning("Full update failed for %s — retrying with known columns", table)
        safe = {k: v for k, v in payload.items() if k in _BASE_COLUMNS}
        if not safe:
            return supabase.table(table).select("*").eq("id", record_id).execute().data
        return supabase.table(table).update(safe).eq("id", record_id).execute().data


def create_vaccination(supabase: Client, data: VaccinationCreate) -> dict:
    """Create a new vaccination record for a pet."""
    payload = data.model_dump(mode="json")
    data = _safe_insert(supabase, "vaccination_records", payload)
    return data[0]


def get_vaccinations_by_pet(supabase: Client, pet_id: uuid.UUID, offset: int = 0, limit: int = 20) -> list[dict]:
    """Return vaccination records for a specific pet with pagination."""
    result = supabase.table("vaccination_records").select("*").eq("pet_id", str(pet_id)).order("vaccination_date", desc=True).range(offset, offset + limit - 1).execute()
    return result.data


def get_vaccination_by_id(supabase: Client, record_id: uuid.UUID) -> dict | None:
    """Fetch a single vaccination record by primary key."""
    result = supabase.table("vaccination_records").select("*").eq("id", str(record_id)).execute()
    return result.data[0] if result.data else None


def update_vaccination(supabase: Client, record_id: uuid.UUID, data: VaccinationUpdate) -> dict | None:
    """Apply partial updates to a vaccination record."""
    payload = data.model_dump(exclude_unset=True, mode="json")
    if not payload:
        return get_vaccination_by_id(supabase, record_id)
    data = _safe_update(supabase, "vaccination_records", str(record_id), payload)
    return data[0] if data else None


def get_vaccinations_by_owner(supabase: Client, owner_id: uuid.UUID, offset: int = 0, limit: int = 100) -> list[dict]:
    """Return all vaccination records for the given owner's pets."""
    pets_result = supabase.table("pets").select("id").eq("owner_id", str(owner_id)).execute()
    pet_ids = [p["id"] for p in pets_result.data]
    if not pet_ids:
        return []
    result = supabase.table("vaccination_records").select("*").in_("pet_id", pet_ids).order("next_due_date", desc=False).range(offset, offset + limit - 1).execute()
    return result.data


def delete_vaccination(supabase: Client, record_id: uuid.UUID) -> None:
    """Remove a vaccination record."""
    supabase.table("vaccination_records").delete().eq("id", str(record_id)).execute()
