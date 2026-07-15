"""Pet CRUD endpoint tests."""

import uuid

from fastapi.testclient import TestClient


def test_create_pet(client: TestClient, auth_headers: dict):
    response = client.post(
        "/api/v1/pets",
        json={"name": "Buddy", "breed": "Golden Retriever"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Buddy"
    assert data["breed"] == "Golden Retriever"
    assert "id" in data
    assert "owner_id" in data


def test_list_pets(client: TestClient, auth_headers: dict):
    client.post("/api/v1/pets", json={"name": "Pet1"}, headers=auth_headers)
    client.post("/api/v1/pets", json={"name": "Pet2"}, headers=auth_headers)
    response = client.get("/api/v1/pets", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_pets_pagination(client: TestClient, auth_headers: dict):
    for i in range(5):
        client.post("/api/v1/pets", json={"name": f"Pet{i}"}, headers=auth_headers)
    response = client.get("/api/v1/pets?limit=2&offset=0", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2
    response = client.get("/api/v1/pets?limit=2&offset=4", headers=auth_headers)
    assert len(response.json()) == 1


def test_get_pet_by_id(client: TestClient, auth_headers: dict):
    create = client.post("/api/v1/pets", json={"name": "Solo"}, headers=auth_headers)
    pet_id = create.json()["id"]
    response = client.get(f"/api/v1/pets/{pet_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Solo"


def test_get_pet_not_found(client: TestClient, auth_headers: dict):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/pets/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


def test_update_pet(client: TestClient, auth_headers: dict):
    create = client.post("/api/v1/pets", json={"name": "Old"}, headers=auth_headers)
    pet_id = create.json()["id"]
    response = client.patch(
        f"/api/v1/pets/{pet_id}",
        json={"name": "New"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New"


def test_delete_pet(client: TestClient, auth_headers: dict):
    create = client.post("/api/v1/pets", json={"name": "Doomed"}, headers=auth_headers)
    pet_id = create.json()["id"]
    response = client.delete(f"/api/v1/pets/{pet_id}", headers=auth_headers)
    assert response.status_code == 204
    response = client.get(f"/api/v1/pets/{pet_id}", headers=auth_headers)
    assert response.status_code == 404


def test_pet_unauthorized(client: TestClient):
    response = client.get("/api/v1/pets")
    assert response.status_code == 401


def test_cannot_access_other_users_pet(client: TestClient, auth_headers: dict):
    create = client.post("/api/v1/pets", json={"name": "Mine"}, headers=auth_headers)
    pet_id = create.json()["id"]

    client.post(
        "/api/v1/auth/register",
        json={
            "email": "other@example.com",
            "password": "securepass123",
            "full_name": "Other",
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": "securepass123"},
    )
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    response = client.get(f"/api/v1/pets/{pet_id}", headers=other_headers)
    assert response.status_code == 404
