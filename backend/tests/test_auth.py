"""Authentication endpoint tests."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient


def test_register_success(client: TestClient, mock_supabase):
    """Registration returns 201 with access token."""
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[]),  # get_profile_by_email -> no conflict
        MagicMock(data=[{"id": "new-id"}]),  # register_profile -> return new profile
    ]
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


def test_register_duplicate_email(client: TestClient, mock_supabase):
    """Registration with existing email returns 409."""
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[{"id": "existing"}]),
    ]
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "dup@example.com",
            "password": "securepass123",
            "full_name": "Dup User",
        },
    )
    assert response.status_code == 409


def test_register_short_password(client: TestClient, mock_supabase):
    """Registration with short password returns 422."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "a@b.com", "password": "short", "full_name": "X"},
    )
    assert response.status_code == 422


def test_login_success(client: TestClient, mock_supabase):
    """Login with valid credentials returns 200 with access token."""
    from app.utils.security import hash_password

    hashed = hash_password("securepass123")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[{
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "login@example.com",
            "hashed_password": hashed,
            "is_active": True,
        }]),
    ]
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "securepass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client: TestClient, mock_supabase):
    """Login with wrong password returns 401."""
    from app.utils.security import hash_password

    hashed = hash_password("correctpass")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[{
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "wrong@example.com",
            "hashed_password": hashed,
            "is_active": True,
        }]),
    ]
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "incorrectpass"},
    )
    assert response.status_code == 401


def test_login_nonexistent_email(client: TestClient, mock_supabase):
    """Login with unregistered email returns 401."""
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[]),
    ]
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@example.com", "password": "securepass123"},
    )
    assert response.status_code == 401


def test_get_me_authenticated(client: TestClient, auth_headers: dict):
    """Authenticated user can access /me."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert data["is_active"] is True


def test_get_me_unauthenticated(client: TestClient):
    """Unauthenticated request to /me returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_invalid_token(client: TestClient):
    """Invalid token returns 401."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401
