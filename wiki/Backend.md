# Backend

## Technology Stack

- **Python 3.11+**
- **FastAPI 0.115** web framework
- **Supabase** PostgreSQL client
- **python-jose** for JWT
- **passlib** (bcrypt) for password hashing
- **scikit-learn** for ML inference
- **pydantic** v2 for validation

## Module Architecture

```
backend/app/
├── main.py              # App factory, middleware, lifespan
├── api/
│   ├── router.py         # Central router (12 route modules)
│   ├── dependencies.py   # Auth, DB, settings dependencies
│   └── routes/           # Route handlers (12 files)
├── core/
│   ├── config.py         # Pydantic settings from env vars
│   ├── database.py       # DB config
│   ├── logging.py        # Logfire + structlog
│   ├── ml_model.py       # ML model loader + prediction
│   ├── rate_limit.py     # Token-bucket rate limiter
│   └── supabase.py       # Supabase client factory
├── models/
│   └── domain.py         # Domain model classes
├── schemas/              # Pydantic request/response (15 files)
├── services/             # Business logic (10 files)
└── utils/
    └── security.py       # JWT + bcrypt helpers
```

## Middleware Stack

1. **RateLimitMiddleware** (`app/core/rate_limit.py`): Token-bucket per IP
2. **RequestLogMiddleware** (`app/main.py`): Logs method, path, status, duration
3. **CORSMiddleware**: Whitelisted origins only
4. **TrustedHostMiddleware**: Production only, restricts hosts

## Lifespan Events

On startup (`app/main.py`, `lifespan()` function):
1. Configure logging (Logfire)
2. Validate environment variables
3. Test Supabase connection
4. Log registered routes
5. Load ML model from `dataset/Random1.joblib`

On shutdown: Log shutdown message

## Error Handling

Global exception handler catches all unhandled exceptions, generates a `trace_id`, logs the full traceback, and returns a sanitized 500 response.

See `veticare/backend/app/main.py:165-181`.
