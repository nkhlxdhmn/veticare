"""FastAPI application entry point for VetiCare."""

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1 import appointments, auth, medical_records, notifications, pets, predictions, uploads, vaccinations, ngos, health_centres, rescue_requests
from app.core.config import settings
from app.core.exception_handlers import register_exception_handlers
from app.core.logging import configure_logging
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.request_context import RequestIDMiddleware
from app.middleware.security import RateLimitMiddleware, SecurityHeadersMiddleware
from app.schemas.system import HealthResponse, ProbeResponse, WelcomeResponse

configure_logging()
app = FastAPI(
    title=settings.app_name,
    description="Production-ready FastAPI backend for VetiCare with authentication, RBAC, audit logging, and AI predictions.",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Authentication", "description": "Registration, login, token refresh, and logout flows."},
        {"name": "Pets", "description": "Pet lifecycle management and ownership checks."},
        {"name": "Predictions", "description": "AI-powered disease predictions and history."},
        {"name": "Vaccinations", "description": "Vaccination scheduling and records."},
        {"name": "Appointments", "description": "Veterinary clinic appointment scheduling."},
        {"name": "Medical Records", "description": "Veterinary visit and medical record management."},
        {"name": "Uploads", "description": "Storage-backed file upload operations."},
        {"name": "Health", "description": "Service health and readiness probes."},
    ],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(settings.trusted_hosts))
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RequestIDMiddleware)
register_exception_handlers(app)


def custom_openapi() -> dict[str, Any]:
    """Add security scheme metadata so the OpenAPI docs clearly describe JWT auth."""
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=app.openapi_tags,
    )
    openapi_schema.setdefault("components", {}).setdefault("securitySchemes", {})["OAuth2PasswordBearer"] = {
        "type": "oauth2",
        "flows": {
            "password": {
                "tokenUrl": "/api/v1/auth/login",
                "scopes": {},
            }
        },
    }
    openapi_schema["security"] = [{"OAuth2PasswordBearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(pets.router, prefix="/api/v1/pets", tags=["Pets"])
app.include_router(
    predictions.router, prefix="/api/v1/predictions", tags=["Predictions"]
)
app.include_router(
    vaccinations.router, prefix="/api/v1/vaccinations", tags=["Vaccinations"]
)
app.include_router(
    medical_records.router,
    prefix="/api/v1/medical-records",
    tags=["Medical Records"],
)
app.include_router(
    appointments.router,
    prefix="/api/v1/appointments",
    tags=["Appointments"],
)
app.include_router(uploads.router, prefix="/api/v1/uploads", tags=["Uploads"])
app.include_router(
    notifications.router, prefix="/api/v1/notifications", tags=["Notifications"]
)
app.include_router(ngos.router, prefix="/api/v1/ngos", tags=["NGOs"])
app.include_router(health_centres.router, prefix="/api/v1/clinics", tags=["Health Centres"])
app.include_router(rescue_requests.router, prefix="/api/v1/rescues", tags=["Rescue Requests"])


@app.get("/", response_model=WelcomeResponse, tags=["Root"])
def read_root() -> WelcomeResponse:
    """Return a welcome message for the API."""
    return WelcomeResponse(message="Welcome to VetiCare API")


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """Report that the API process is healthy."""
    return HealthResponse(status="healthy")


@app.get("/health/live", response_model=ProbeResponse, tags=["Health"])
def liveness_probe() -> ProbeResponse:
    """Confirm that the application process is accepting requests."""
    return ProbeResponse(status="healthy", component="application")


@app.get("/health/ready", response_model=ProbeResponse, tags=["Health"])
def readiness_probe() -> ProbeResponse:
    """Report whether the service is ready to accept traffic."""
    return ProbeResponse(status="healthy", component="application")
