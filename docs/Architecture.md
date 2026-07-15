# Architecture

VetiCare follows a Clean Architecture dependency flow: API routers call services,
services coordinate repositories, and repositories own SQLAlchemy access. Routers
do not issue SQL queries. Cross-cutting concerns live in `app/config`, `app/core`,
and `app/middleware`.

`app/config` selects development, production, or testing settings from
`ENVIRONMENT`. `app/database` owns the async SQLAlchemy session lifecycle.
Repositories use eager loading where related data is returned, preventing common
N+1 query patterns.
