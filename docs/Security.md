# Security

The API adds request IDs, strict CORS configuration, trusted-host validation,
security headers, JSON error envelopes, and a process-local rate limiter. Domain
errors avoid leaking database implementation details.

The in-memory limiter is suitable for one process only. Deploy Redis-backed rate
limiting before horizontally scaling. Store secrets only in the deployment secret
manager; never commit `.env`.
