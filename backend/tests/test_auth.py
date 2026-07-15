"""Authentication endpoint tests."""

from fastapi.testclient import TestClient


def test_register_success(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new@example.com",
            "password": "securepass123",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client: TestClient):
    payload = {
        "email": "dup@example.com",
        "password": "securepass123",
        "full_name": "Dup User",
    }
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


def test_register_short_password(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "a@b.com", "password": "short", "full_name": "X"},
    )
    assert response.status_code == 422


def test_login_success(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "securepass123",
            "full_name": "Login User",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "securepass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrong@example.com",
            "password": "securepass123",
            "full_name": "Wrong User",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "incorrectpass"},
    )
    assert response.status_code == 401


def test_login_nonexistent_email(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@example.com", "password": "securepass123"},
    )
    assert response.status_code == 401


def test_get_me_authenticated(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert data["is_active"] is True


def test_get_me_unauthenticated(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_invalid_token(client: TestClient):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401
