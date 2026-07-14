"""Smoke tests for public application endpoints."""

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_root_returns_welcome_message() -> None:
    """The root endpoint exposes the expected welcome message."""
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to VetiCare API"}


def test_health_reports_healthy() -> None:
    """The health endpoint confirms the application is running."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
