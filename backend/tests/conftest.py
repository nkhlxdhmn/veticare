"""Test configuration and shared fixtures."""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from supabase import Client

from app.core.supabase import get_supabase_client
from app.main import app


@pytest.fixture(autouse=True)
def mock_supabase():
    """Replace the real Supabase client with a mock for all tests."""
    mock_client = MagicMock(spec=Client)

    mock_table_obj = MagicMock()
    mock_table_obj.select.return_value = mock_table_obj
    mock_table_obj.insert.return_value = mock_table_obj
    mock_table_obj.update.return_value = mock_table_obj
    mock_table_obj.delete.return_value = mock_table_obj
    mock_table_obj.eq.return_value = mock_table_obj
    mock_table_obj.neq.return_value = mock_table_obj
    mock_table_obj.ilike.return_value = mock_table_obj
    mock_table_obj.order.return_value = mock_table_obj
    mock_table_obj.range.return_value = mock_table_obj
    mock_table_obj.limit.return_value = mock_table_obj
    mock_table_obj.execute.return_value = MagicMock(data=[])
    mock_client.table.return_value = mock_table_obj

    app.dependency_overrides[get_supabase_client] = lambda: mock_client
    yield mock_client
    app.dependency_overrides.clear()


@pytest.fixture
def client() -> TestClient:
    """Provide a FastAPI test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_headers(client: TestClient, mock_supabase) -> dict:
    """Register a test user and return Authorization headers."""
    from app.utils.security import create_access_token

    test_id = "00000000-0000-0000-0000-000000000001"
    mock_supabase.table.return_value.execute.return_value = MagicMock(data=[{
        "id": test_id,
        "email": "test@example.com",
        "full_name": "Test User",
        "hashed_password": "fakehash",
        "phone": None,
        "role": "pet_owner",
        "is_active": True,
        "created_at": "2025-01-01T00:00:00Z",
    }])

    token = create_access_token(test_id)
    return {"Authorization": f"Bearer {token}"}
