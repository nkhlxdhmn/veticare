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


def test_requests_receive_correlation_and_security_headers() -> None:
    """Public responses include correlation and browser security headers."""
    response = client.get("/health", headers={"X-Request-ID": "test-request"})

    assert response.headers["X-Request-ID"] == "test-request"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"


def test_not_found_errors_use_the_standard_envelope() -> None:
    """Unexpected paths receive the documented JSON error response."""
    response = client.get("/missing", headers={"X-Request-ID": "missing-path"})

    assert response.status_code == 404
    assert response.json()["success"] is False
    assert response.json()["request_id"] == "missing-path"
