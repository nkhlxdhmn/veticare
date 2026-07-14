# VetiCare Backend Rules

## Tech Stack

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- PostgreSQL (Supabase)
- Alembic
- Pydantic v2
- JWT Authentication
- Docker
- Pytest

## Architecture

Use Clean Architecture: Router → Service → Repository → Database. Business
logic belongs in services, database access belongs in repositories, and routers
must never contain SQL queries.

## Code Style

- Fully typed
- Async where possible
- Small functions
- Google-style docstrings
- No duplicated code

## Database

- UUID primary keys
- `created_at`
- `updated_at`
- Alembic migrations
- PostgreSQL best practices

## APIs

All feature APIs live under `/api/v1/`. Every endpoint requires a request model,
response model, validation, and OpenAPI documentation. The Sprint 1 root and
health endpoints are explicit infrastructure exceptions.

## Testing

Use pytest. Every module should include tests.

## Git

One feature equals one commit. Never generate unrelated files or modify
completed modules unless requested.
