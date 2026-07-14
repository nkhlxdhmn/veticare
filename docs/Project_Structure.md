# Backend Project Architecture & Directory Layout - VetiCare

This document details the production-ready directory layout designed for VetiCare's FastAPI-based microservice architecture, adhering to Clean Architecture principles.

---

## 📁 Directory Tree View

```text
backend/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions continuous integration workflow
├── alembic/                     # Database migrations
│   ├── env.py                   # Migration execution configuration
│   ├── script.py.mako           # Migration template file
│   └── versions/                # Generated database version scripts
├── app/                         # Core application package
│   ├── api/                     # Routing & request handlers
│   │   ├── v1/                  # API version 1 routers
│   │   │   ├── auth.py          # User authentication endpoints
│   │   │   ├── pets.py          # Pet CRUD handlers
│   │   │   ├── predictions.py   # ML prediction logs/inferences
│   │   │   ├── vaccinations.py  # Health schedule updates
│   │   │   └── contacts.py      # Support ticket updates
│   │   ├── deps.py              # Common route dependencies (Auth, DB)
│   │   └── __init__.py
│   ├── core/                    # System configuration & services
│   │   ├── config.py            # Environment configurations (Pydantic-Settings)
│   │   ├── security.py          # Cryptography and JWT utilities
│   │   ├── supabase.py          # Supabase client instantiation
│   │   └── __init__.py
│   ├── database/                # DB engine & session settings
│   │   ├── base.py              # Imports all models for metadata aggregation
│   │   ├── session.py           # Async engine and session maker
│   │   └── __init__.py
│   ├── middleware/              # Custom ASGI middlewares
│   │   ├── logging.py           # Logging and request execution time tracking
│   │   └── __init__.py
│   ├── models/                  # SQLAlchemy 2.0 ORM models
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── pet.py
│   │   ├── vaccination.py
│   │   ├── prediction.py
│   │   └── contact.py
│   ├── schemas/                 # Pydantic v2 schemas
│   │   ├── user.py
│   │   ├── pet.py
│   │   ├── vaccination.py
│   │   ├── prediction.py
│   │   └── contact.py
│   ├── services/                # Business logic layer
│   │   ├── user_service.py      # User logic, sign-up and authentication
│   │   ├── pet_service.py       # Pet profiles and Supabase uploads logic
│   │   ├── ai_service.py        # ML Prediction pipelines and processing logs
│   │   ├── contact_service.py   # Inquiry ticketing systems management
│   │   └── __init__.py
│   ├── utils/                   # General utility utilities
│   │   ├── logger.py            # Logging setup
│   │   └── __init__.py
│   ├── main.py                  # Main entry point (FastAPI app factory)
│   └── __init__.py
├── tests/                       # Testing module
│   ├── api/                     # Endpoint router tests
│   │   ├── test_auth.py
│   │   └── test_pets.py
│   ├── services/                # Service execution tests
│   │   └── test_ai.py
│   ├── conftest.py              # Pytest DB and client test fixtures
│   └── __init__.py
├── .dockerignore                # Excludes items from Docker contexts
├── .env.example                 # Environment variables checklist
├── alembic.ini                  # Alembic CLI config file
├── docker-compose.yml           # Local multi-container deployment orchestration
├── Dockerfile                   # Docker packaging container configuration
└── requirements.txt             # Project library requirements list
```

---

## 📖 Component Descriptions & Purpose

### 1. Root Level Infrastructure Configs
*   **`.github/workflows/ci.yml`**: Automates executing unit tests, code lint check steps, and validation workflows on repository updates.
*   **`Dockerfile`**: Defines container compilation instructions using multi-stage builds to produce a lightweight production Uvicorn environment.
*   **`docker-compose.yml`**: Configures multi-container setups (FastAPI service + PostgreSQL database container) to simplify local development environments.
*   **`alembic.ini`**: Configures database migration targets and location parameters for the Alembic CLI execution.
*   **`.env.example`**: Standard configuration template representing required credentials (DB URLs, Supabase API keys, JWT secret keys) without exposing sensitive keys to source control.

### 2. `app/` (FastAPI Application Root)
Contains the core python packages of the microservice.

*   #### `app/api/` (Routing Layer)
    Responsible for accepting incoming requests, processing route params, and returning structured data.
    *   `v1/`: Version-controlled endpoint routers mapping request verbs (`GET`, `POST`, etc.) directly to schemas.
    *   `deps.py`: Manages route-level dependency injections (e.g. database sessions via `yield`, extracting tokens for current user retrieval).
*   #### `app/core/` (System Configuration & Core Services)
    Hosts baseline system properties and configurations.
    *   `config.py`: Exposes configuration values via a type-safe `Settings` class powered by Pydantic-Settings.
    *   `security.py`: Handles JWT token signatures, verification steps, and password salting hashing mechanisms.
    *   `supabase.py`: Configures authentication client setups to interact with Supabase storage buckets.
*   #### `app/database/` (Database Connection Controls)
    *   `session.py`: Exposes async engine declarations and local session generators using SQLAlchemy's async interface.
    *   `base.py`: Resolves circular reference imports for SQLAlchemy base entities to enable smooth migrations.
*   #### `app/middleware/` (Interceptors)
    Implements ASGI middleware layers. Useful for injecting headers, tracking request processing latency (`processing_time_ms`), or catching exceptions globally.
*   #### `app/models/` (SQLAlchemy ORM Entities)
    Defines database schema tables mapped as Python classes. Uses SQLAlchemy 2.0 type declarations.
*   #### `app/schemas/` (Pydantic v2 Models)
    Performs data sanitization and output structural enforcement. Defines classes for data creation (`Create`), updates (`Update`), and serialized outputs (`Response`).
*   #### `app/services/` (Business Logic Layer)
    Contains core business computations separated from API endpoints. API endpoints call these services, which execute logic and interact with database entities or external systems (like Supabase storage).
*   #### `app/utils/` (Helper Libraries)
    Implements helper utilities such as logger configs, string converters, and time formatters.
*   #### `app/main.py`
    Instantiates the FastAPI app instance, registers CORS parameters, configures exception handlers, hooks middleware stacks, and routes endpoints.

### 3. `tests/` (Testing Suite)
Holds unit and integration test scripts using Pytest.
*   `conftest.py`: Declares reusable test fixtures, such as setup/teardown steps for mock PostgreSQL testing database instances.
*   `api/`: Simulates HTTP client requests checking routing, authentication access, and expected JSON structures.
*   `services/`: Tests logic components directly without API routing dependencies.
