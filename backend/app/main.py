"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.core.ml_model import load_model
from app.core.rate_limit import RateLimitMiddleware

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Run startup and shutdown actions around the application lifecycle."""
    settings: Settings = application.state.settings
    configure_logging(debug=settings.debug)
    logger.info("VetiCare API starting")

    try:
        application.state.model = load_model()
        logger.info("ML model loaded into app.state.model")
    except FileNotFoundError:
        logger.warning("ML model not found — prediction endpoint will be unavailable")
        application.state.model = None

    yield
    logger.info("VetiCare API shutting down")


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        description="Backend API for the VetiCare platform.",
        version="0.1.0",
        debug=settings.debug,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )
    application.state.settings = settings

    application.add_middleware(RateLimitMiddleware)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )

    if settings.environment == "production":
        application.add_middleware(TrustedHostMiddleware, allowed_hosts=["*.vercel.app", "*.onrender.com"])

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    @application.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        """Return a lightweight service liveness response."""
        return {"status": "ok"}

    return application


app = create_application()
