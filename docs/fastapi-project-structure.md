# VetiCare FastAPI Backend Structure

This document defines the production-oriented FastAPI backend layout. Directories
are intentionally empty where implementation has not begun; `.gitkeep` preserves
those directories in Git and contains no application code.

```text
veticare/
├── .github/
│   └── workflows/
│       ├── .gitkeep
│       └── ci.yml                         # Future GitHub Actions validation workflow.
├── backend/
│   ├── app/
│   │   ├── __init__.py                    # Marks the application package.
│   │   ├── main.py                        # Future FastAPI application entry point.
│   │   ├── api/
│   │   │   ├── __init__.py                # API package marker.
│   │   │   ├── deps.py                    # Future shared request dependencies.
│   │   │   └── v1/
│   │   │       ├── __init__.py            # Version 1 API package marker.
│   │   │       ├── auth.py                # Authentication route definitions.
│   │   │       ├── pets.py                # Pet-management route definitions.
│   │   │       ├── predictions.py         # AI prediction route definitions.
│   │   │       └── vaccinations.py        # Vaccination route definitions.
│   │   ├── auth/
│   │   │   ├── .gitkeep
│   │   │   ├── jwt.py                     # Future JWT creation and validation.
│   │   │   ├── passwords.py               # Future password hashing helpers.
│   │   │   └── supabase.py                # Future Supabase auth integration.
│   │   ├── core/
│   │   │   ├── .gitkeep
│   │   │   ├── config.py                  # Future Pydantic v2 settings.
│   │   │   ├── constants.py               # Future shared application constants.
│   │   │   └── security.py                # Future security configuration.
│   │   ├── db/
│   │   │   ├── .gitkeep
│   │   │   ├── base.py                    # Future SQLAlchemy declarative base imports.
│   │   │   └── session.py                 # Future PostgreSQL engine/session factory.
│   │   ├── middleware/
│   │   │   ├── .gitkeep
│   │   │   ├── error_handler.py           # Future uniform exception responses.
│   │   │   ├── logging.py                 # Future request logging middleware.
│   │   │   └── rate_limit.py              # Future API rate limiting middleware.
│   │   ├── models/
│   │   │   ├── __init__.py                # Exposes ORM models to Alembic.
│   │   │   ├── base.py                    # Shared SQLAlchemy model fields.
│   │   │   ├── contact.py                 # Contact ORM model.
│   │   │   ├── pet.py                     # Pet ORM model.
│   │   │   ├── prediction.py              # AI prediction ORM model.
│   │   │   ├── user.py                    # User ORM model.
│   │   │   └── vaccination.py             # Vaccination ORM model.
│   │   ├── repositories/
│   │   │   ├── .gitkeep
│   │   │   ├── base.py                    # Future reusable data-access operations.
│   │   │   ├── pet.py                     # Future pet persistence operations.
│   │   │   └── user.py                    # Future user persistence operations.
│   │   ├── schemas/
│   │   │   ├── contact.py                 # Pydantic contact request/response schemas.
│   │   │   ├── pet.py                     # Pydantic pet request/response schemas.
│   │   │   ├── prediction.py              # Pydantic AI prediction schemas.
│   │   │   ├── user.py                    # Pydantic user/auth schemas.
│   │   │   └── vaccination.py             # Pydantic vaccination schemas.
│   │   ├── services/
│   │   │   ├── .gitkeep
│   │   │   ├── pet.py                     # Future pet use cases.
│   │   │   ├── prediction.py              # Future AI prediction orchestration.
│   │   │   ├── storage.py                 # Future Supabase storage operations.
│   │   │   └── vaccination.py             # Future vaccination use cases.
│   │   └── utils/
│   │       ├── .gitkeep
│   │       ├── exceptions.py              # Future domain/application exceptions.
│   │       ├── pagination.py              # Future pagination helpers.
│   │       └── responses.py               # Future API response helpers.
│   ├── alembic/
│   │   ├── env.py                         # Alembic environment configuration.
│   │   ├── script.py.mako                 # Alembic migration template.
│   │   └── versions/
│   │       └── 202607142200_create_initial_schema.py # Initial database migration.
│   ├── tests/
│   │   ├── .gitkeep
│   │   ├── conftest.py                    # Future shared pytest fixtures.
│   │   ├── api/.gitkeep                   # API/router test location.
│   │   ├── services/.gitkeep              # Service-layer test location.
│   │   └── repositories/.gitkeep          # Repository/data-access test location.
│   ├── .dockerignore                      # Excludes local files from Docker builds.
│   ├── .env.example                       # Safe template for required environment variables.
│   ├── alembic.ini                        # Alembic command-line configuration.
│   ├── docker-compose.yml                 # Future local application/PostgreSQL stack.
│   ├── Dockerfile                         # Future FastAPI container image definition.
│   └── requirements.txt                   # Python dependency manifest.
├── docs/
│   └── fastapi-project-structure.md       # This structure reference.
├── .gitignore                             # Repository-wide ignored files.
└── README.md                              # Project overview and setup guide.
```

## Dependency direction

`api` handles HTTP concerns, calls `services`, and uses `schemas` for I/O.
`services` contain business use cases and coordinate `repositories`, `auth`, and
external clients such as Supabase. `repositories` isolate SQLAlchemy persistence.
`models` are database mappings, while `schemas` are Pydantic v2 contracts.
`core`, `db`, `middleware`, and `utils` provide cross-cutting infrastructure.

## Planned environment variables

The existing `backend/.env.example` is the single safe-to-commit template. Its
future variables should cover `ENVIRONMENT`, `DATABASE_URL`, `JWT_SECRET_KEY`,
`JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `SUPABASE_URL`,
`SUPABASE_KEY`, and `SUPABASE_BUCKET`. Keep the actual `.env` untracked.
