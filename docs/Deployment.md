# Deployment

Run `docker compose up --build` from `backend/` after copying `.env.example` to
`.env` and supplying production secrets. The application container exposes port
8000 and uses `/health/live` for its health check. PostgreSQL must be healthy
before the API service starts.

Set `ENVIRONMENT=production`, use a strong `SECRET_KEY`, and configure explicit
`CORS_ORIGINS` and `TRUSTED_HOSTS` values for the deployed domain.
