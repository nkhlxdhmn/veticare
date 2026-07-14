# VetiCare Backend

Production-ready FastAPI foundation for the VetiCare AI-powered pet healthcare
platform. Sprint 1 provides the application shell and health endpoints only;
authentication, database models, CRUD features, and AI services are deliberately
out of scope.

## Structure

```text
backend/
├── app/
│   ├── api/           # HTTP routers and API dependencies
│   ├── ai/            # Future AI integration boundary
│   ├── core/          # Shared configuration and application settings
│   ├── database/      # Future SQLAlchemy session and database configuration
│   ├── models/        # Future SQLAlchemy ORM models
│   ├── repositories/  # Future persistence abstractions
│   ├── schemas/       # Future Pydantic request/response models
│   ├── services/      # Future business use cases
│   ├── middleware/    # Future HTTP middleware
│   ├── utils/         # Shared utility functions
│   ├── __init__.py    # Application package marker
│   └── main.py        # FastAPI application and public endpoints
├── alembic/           # Database migration scaffolding
├── tests/             # Automated tests
├── .env.example       # Safe environment-variable template
├── Dockerfile         # Container image definition
├── pyproject.toml     # Ruff and pytest configuration
└── requirements.txt   # Python dependencies
```

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open Swagger UI at <http://127.0.0.1:8000/docs>.

## Checks

```bash
ruff check .
pytest
```
