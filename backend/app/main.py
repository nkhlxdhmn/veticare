"""FastAPI application entry point."""

import json
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.core.ml_model import load_model
from app.core.rate_limit import RateLimitMiddleware

logger = logging.getLogger(__name__)


def _safe_body(body: bytes) -> str:
    """Return a sanitised request body string suitable for logging."""
    if not body:
        return ""
    try:
        obj = json.loads(body)
        if isinstance(obj, dict):
            obj = {k: ("****" if "password" in k.lower() else v) for k, v in obj.items()}
        return json.dumps(obj)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return "(non-json body)"


_REQUIRED_ENV_VARS = [
    "VETICARE_SUPABASE_URL",
    "VETICARE_SUPABASE_KEY",
]


class RequestLogMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, duration, and sanitised body."""

    async def dispatch(self, request: Request, call_next):
        body = await request.body()
        request._body = body

        start = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - start

        safe = _safe_body(body)
        extra = f" body={safe}" if safe else ""
        logger.info(
            "%s %s %s %.0fms%s",
            request.method,
            request.url.path,
            response.status_code,
            elapsed * 1000,
            extra,
        )
        return response


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Run startup and shutdown actions around the application lifecycle."""
    settings: Settings = application.state.settings
    configure_logging(debug=settings.debug)
    logger.info("VetiCare API starting — environment=%s", settings.environment)

    # ── Print env var names (not values) ────────────────────────────
    for var in _REQUIRED_ENV_VARS:
        val = os.environ.get(var, "")
        logger.info("  %s %s", "✓" if val else "✗", var)
    jwt_status = "✗ (still using default)" if settings.jwt_secret_key.get_secret_value() == "development-only-change-me" else "✓"
    logger.info("  %s JWT_SECRET_KEY", jwt_status)

    # ── Validate required env vars at startup; abort if missing ─────
    missing = []
    if not settings.veticare_supabase_url:
        missing.append("VETICARE_SUPABASE_URL")
    if not settings.veticare_supabase_key:
        missing.append("VETICARE_SUPABASE_KEY")
    if settings.environment == "production" and settings.jwt_secret_key.get_secret_value() == "development-only-change-me":
        missing.append("JWT_SECRET_KEY (still using default)")
    if missing:
        msg = "Missing required environment variables: " + ", ".join(missing)
        logger.critical(msg)
        raise RuntimeError(msg)

    # ── Test Supabase connection ──────────────────────────────────────
    try:
        from app.core.supabase import get_supabase_client

        client = get_supabase_client()
        application.state.supabase_ok = True
        logger.info("Supabase connection verified (service_role key)")
    except RuntimeError as e:
        logger.critical("Supabase connection failed: %s", e)
        raise
    except Exception:
        logger.exception("Supabase connection failed with unexpected error")
        raise RuntimeError("Supabase connection failed — see logs above")

    # ── Log registered routes ────────────────────────────────────────
    route_list = []
    for route in application.routes:
        if hasattr(route, "methods") and hasattr(route, "path"):
            for method in sorted(route.methods):
                if method in ("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"):
                    route_list.append(f"  {method:7s} {route.path}")
    logger.info("Registered routes (%d):\n%s", len(route_list), "\n".join(sorted(route_list)))

    # ── Load ML model ────────────────────────────────────────────────
    try:
        application.state.model = load_model()
        logger.info("ML model loaded into app.state.model")
    except FileNotFoundError:
        logger.warning("ML model not found — prediction endpoint will be unavailable")
        application.state.model = None
    except Exception:
        logger.exception("Failed to load ML model")
        application.state.model = None

    yield
    logger.info("VetiCare API shutting down")


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        description="Backend API for the VetiCare platform.",
        version="1.0.0",
        debug=settings.debug,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    application.state.settings = settings

    application.add_middleware(RateLimitMiddleware)
    application.add_middleware(RequestLogMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if settings.environment == "production":
        application.add_middleware(
            TrustedHostMiddleware, allowed_hosts=["*.vercel.app", "*.onrender.com"]
        )

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    # ── Global exception handler with trace_id ───────────────────────
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        trace_id = str(uuid.uuid4())
        body = await request.body()
        safe = _safe_body(body)
        logger.exception(
            "trace_id=%s unhandled exception on %s %s body=%s",
            trace_id,
            request.method,
            request.url.path,
            safe,
        )
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
                "trace_id": trace_id,
            },
        )

    # ── Health endpoint ──────────────────────────────────────────────
    @application.get("/health", tags=["health"])
    async def health_check() -> dict:
        model_status = "loaded" if getattr(application.state, "model", None) is not None else "unavailable"
        return {
            "status": "ok",
            "version": "1.0.0",
            "database": "connected" if getattr(application.state, "supabase_ok", False) else "unknown",
            "supabase": "connected" if getattr(application.state, "supabase_ok", False) else "unknown",
            "model": model_status,
        }

    # ── Debug: Supabase status ───────────────────────────────────────
    @application.get("/debug/supabase", tags=["debug"])
    async def debug_supabase() -> dict:
        from app.core.supabase import verify_supabase

        return verify_supabase()

    # ── Debug: Environment variable names ────────────────────────────
    @application.get("/debug/env", tags=["debug"])
    async def debug_env() -> dict:
        statuses = {}
        for var in sorted(_REQUIRED_ENV_VARS):
            statuses[var] = "set" if os.environ.get(var) else "missing"
        statuses["JWT_SECRET_KEY"] = "set (default)" if settings.jwt_secret_key.get_secret_value() == "development-only-change-me" else "set (custom)"
        statuses["ENVIRONMENT"] = settings.environment
        statuses["DEBUG"] = str(settings.debug)
        return statuses

    return application


app = create_application()
