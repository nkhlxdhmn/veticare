"""Application role definitions."""

from enum import StrEnum


class UserRole(StrEnum):
    """Roles used by role-based access control."""

    PET_OWNER = "pet_owner"
    VETERINARIAN = "veterinarian"
    CLINIC_ADMIN = "clinic_admin"
    SUPER_ADMIN = "super_admin"
