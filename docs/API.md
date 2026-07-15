# API

Swagger UI is available at `/docs`. Versioned product APIs are mounted under
`/api/v1`; public infrastructure endpoints are `/`, `/health`, and
`/health/live`.

Successful existing feature responses retain their legacy shapes for backward
compatibility. Errors use a consistent envelope containing `success`, `message`,
`error`, `request_id`, and `timestamp`.
