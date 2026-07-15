# Performance

Database sessions are async, created lazily, use connection-pool pre-ping, and
are rolled back on request failures. Prediction queries eager-load related pets
with `selectinload`, avoiding N+1 accesses when building history responses.

Future Redis caching should target dashboard aggregates, reference data, and
frequently accessed pet lists. Long-running AI inference should move to a queue
worker when real model inference replaces the current synchronous integration.

The existing feature modules retain legacy style debt and are intentionally
outside the initial CI lint scope; migrate them incrementally, module by module,
instead of mixing a formatting rewrite with behavioral changes.
