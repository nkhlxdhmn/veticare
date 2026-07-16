"""Pet CRUD endpoint tests."""

import uuid
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

TEST_PROFILE = {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "test@example.com",
    "full_name": "Test User",
    "hashed_password": "fakehash",
    "phone": None,
    "role": "pet_owner",
    "is_active": True,
    "created_at": "2025-01-01T00:00:00Z",
}


def _make_pet(**overrides):
    defaults = {
        "id": str(uuid.uuid4()),
        "owner_id": TEST_PROFILE["id"],
        "animal_id": None,
        "name": "Buddy",
        "breed": None,
        "dob": None,
        "gender": None,
        "weight": None,
        "height": None,
        "color": None,
        "microchip_number": None,
        "image_url": None,
        "notes": None,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z",
    }
    defaults.update(overrides)
    return defaults


def test_create_pet(client: TestClient, auth_headers: dict, mock_supabase):
    """Creating a pet returns 201 with the pet data."""
    pet = _make_pet(name="Buddy", breed="Golden Retriever")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[pet]),
    ]

    response = client.post(
        "/api/v1/pets",
        json={"name": "Buddy", "breed": "Golden Retriever"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Buddy"
    assert "id" in data
    assert "owner_id" in data


def test_list_pets(client: TestClient, auth_headers: dict, mock_supabase):
    """Listing pets returns all pets for the user."""
    pets = [_make_pet(name="Pet1"), _make_pet(name="Pet2")]
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=pets),
    ]

    response = client.get("/api/v1/pets", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_pets_pagination(client: TestClient, auth_headers: dict, mock_supabase):
    """Pagination parameters are respected."""
    pets = [_make_pet(name=f"Pet{i}") for i in range(5)]
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=pets[:2]),
    ]

    response = client.get("/api/v1/pets?limit=2&offset=0", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_pet_by_id(client: TestClient, auth_headers: dict, mock_supabase):
    """Fetching a pet by ID returns the pet."""
    pet = _make_pet(name="Solo")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[pet]),
    ]

    response = client.get(f"/api/v1/pets/{pet['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Solo"


def test_get_pet_not_found(client: TestClient, auth_headers: dict, mock_supabase):
    """Fetching a non-existent pet returns 404."""
    fake_id = str(uuid.uuid4())
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[]),
    ]
    response = client.get(f"/api/v1/pets/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


def test_update_pet(client: TestClient, auth_headers: dict, mock_supabase):
    """Updating a pet returns the updated pet."""
    pet = _make_pet(name="Old")
    updated = _make_pet(name="New")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),  # get_current_user
        MagicMock(data=[pet]),            # get_pet_by_id
        MagicMock(data=[updated]),        # update_pet
    ]

    response = client.patch(
        f"/api/v1/pets/{pet['id']}",
        json={"name": "New"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New"


def test_delete_pet(client: TestClient, auth_headers: dict, mock_supabase):
    """Deleting a pet returns 204."""
    pet = _make_pet(name="Doomed")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),  # get_current_user
        MagicMock(data=[pet]),            # get_pet_by_id
        MagicMock(data=[]),               # delete_pet
    ]

    response = client.delete(f"/api/v1/pets/{pet['id']}", headers=auth_headers)
    assert response.status_code == 204


def test_pet_unauthorized(client: TestClient):
    """Unauthenticated request returns 401."""
    response = client.get("/api/v1/pets")
    assert response.status_code == 401


def test_cannot_access_other_users_pet(client: TestClient, auth_headers: dict, mock_supabase):
    """Accessing another user's pet returns 404."""
    other_pet = _make_pet(owner_id=str(uuid.uuid4()))
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[]),  # No pet found for this user
    ]

    response = client.get(f"/api/v1/pets/{other_pet['id']}", headers=auth_headers)
    assert response.status_code == 404
