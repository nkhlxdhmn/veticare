"""FastAPI application entry point."""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
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


class RequestLogMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - start
        logger.info(
            "%s %s %s %.0fms",
            request.method,
            request.url.path,
            response.status_code,
            elapsed * 1000,
        )
        return response


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Run startup and shutdown actions around the application lifecycle."""
    settings: Settings = application.state.settings
    configure_logging(debug=settings.debug)
    logger.info("VetiCare API starting")

    # ── Validate required env vars at startup ────────────────────────
    missing = []
    if not settings.veticare_supabase_url:
        missing.append("VETICARE_SUPABASE_URL")
    if not settings.veticare_supabase_key:
        missing.append("VETICARE_SUPABASE_KEY")
    if missing:
        logger.error(
            "Missing required environment variables: %s — auth and data endpoints will fail",
            ", ".join(missing),
        )

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

    # Middleware order: outermost first (Starlette reverses internally,
    # so the LAST added runs FIRST for incoming requests).
    #
    # Correct order for incoming requests:
    #   TrustedHost -> CORS -> RequestLog -> RateLimit -> Router
    #
    # So we add them in reverse: RateLimit first, RequestLog second,
    # CORS third, TrustedHost last.
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

    # ── Global exception handler ────────────────────────────────────
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    # ── Root health endpoint ────────────────────────────────────────
    @application.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        """Return a lightweight service liveness response."""
        model_status = "loaded" if getattr(application.state, "model", None) is not None else "unavailable"
        return {
            "status": "ok",
            "version": "1.0.0",
            "model": model_status,
        }

    return application


app = create_application()
