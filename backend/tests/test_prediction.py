"""Prediction endpoint tests."""

import uuid

from fastapi.testclient import TestClient


def test_add_prediction_manually(client: TestClient, auth_headers: dict):
    pet = client.post("/api/v1/pets", json={"name": "TestPet"}, headers=auth_headers).json()

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
    assert data["predicted_disease"] == "Canine Parvovirus"
    assert data["confidence"] == 0.85


def test_list_predictions(client: TestClient, auth_headers: dict):
    pet = client.post("/api/v1/pets", json={"name": "HistPet"}, headers=auth_headers).json()
    client.post(
        "/api/v1/predictions",
        json={
            "pet_id": pet["id"],
            "predicted_disease": "Disease A",
            "confidence": 0.7,
            "model_version": "v1",
            "prediction_json": {},
        },
        headers=auth_headers,
    )
    response = client.get(f"/api/v1/predictions/{pet['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_prediction_pet_not_found(client: TestClient, auth_headers: dict):
    fake_id = str(uuid.uuid4())
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


def test_confidence_out_of_range(client: TestClient, auth_headers: dict):
    pet = client.post("/api/v1/pets", json={"name": "RangePet"}, headers=auth_headers).json()
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
