"""Read-only endpoint tests (animals, care-guides, diseases)."""

from fastapi.testclient import TestClient


def test_list_animals(client: TestClient):
    response = client.get("/api/v1/animals")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_animals_pagination(client: TestClient):
    response = client.get("/api/v1/animals?limit=5&offset=0")
    assert response.status_code == 200


def test_list_diseases(client: TestClient):
    response = client.get("/api/v1/diseases")
    assert response.status_code == 200


def test_list_care_guides(client: TestClient):
    response = client.get("/api/v1/care-guides")
    assert response.status_code == 200


def test_list_ml_models(client: TestClient):
    response = client.get("/api/v1/ml-models")
    assert response.status_code == 200


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_api_status(client: TestClient):
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    assert "service" in response.json()
