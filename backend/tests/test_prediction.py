"""Prediction endpoint tests."""

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
        "name": "TestPet",
    }
    defaults.update(overrides)
    return defaults


def test_add_prediction_manually(client: TestClient, auth_headers: dict, mock_supabase):
    """Manual prediction returns 201 with prediction data."""
    pet = _make_pet(name="TestPet")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[pet]),
        MagicMock(data=[{
            "id": str(uuid.uuid4()),
            "pet_id": pet["id"],
            "predicted_disease": "Canine Parvovirus",
            "confidence": 0.85,
            "model_version": "12345",
            "prediction_json": {"symptoms": ["Fever", "Vomiting"]},
            "created_at": "2025-01-01T00:00:00Z",
        }]),
    ]

    response = client.post(
        "/api/v1/predictions",
        json={
            "pet_id": pet["id"],
            "predicted_disease": "Canine Parvovirus",
            "confidence": 0.85,
            "model_version": "12345",
            "prediction_json": {"symptoms": ["Fever", "Vomiting"]},
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert "predicted_disease" in data


def test_list_predictions(client: TestClient, auth_headers: dict, mock_supabase):
    """Listing predictions returns history for a pet."""
    pet = _make_pet(name="HistPet")
    pred = {
        "id": str(uuid.uuid4()),
        "pet_id": pet["id"],
        "predicted_disease": "Disease A",
        "confidence": 0.7,
        "model_version": "v1",
        "prediction_json": {},
        "created_at": "2025-01-01T00:00:00Z",
    }

    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[pet]),
        MagicMock(data=[pred]),
    ]

    response = client.get(f"/api/v1/predictions/{pet['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_prediction_pet_not_found(client: TestClient, auth_headers: dict, mock_supabase):
    """Predictions for non-existent pet return 404."""
    from unittest.mock import MagicMock
    fake_id = str(uuid.uuid4())
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[]),
    ]

    response = client.post(
        "/api/v1/predictions",
        json={
            "pet_id": fake_id,
            "predicted_disease": "X",
            "confidence": 0.5,
            "model_version": "v1",
            "prediction_json": {},
        },
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_confidence_out_of_range(client: TestClient, auth_headers: dict, mock_supabase):
    """Confidence > 1 returns 422."""
    pet = _make_pet(name="RangePet")
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[TEST_PROFILE]),
        MagicMock(data=[pet]),
    ]

    response = client.post(
        "/api/v1/predictions",
        json={
            "pet_id": pet["id"],
            "predicted_disease": "X",
            "confidence": 1.5,
            "model_version": "v1",
            "prediction_json": {},
        },
        headers=auth_headers,
    )
    assert response.status_code == 422
