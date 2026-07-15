"""Domain exceptions independent from the HTTP transport layer."""


class VetiCareException(Exception):
    """Base exception for expected VetiCare domain failures."""

    status_code = 400
    error_code = "veticare_error"

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class PetNotFoundException(VetiCareException):
    """Raised when a requested pet does not exist."""

    status_code = 404
    error_code = "pet_not_found"


class PredictionFailedException(VetiCareException):
    """Raised when an AI prediction cannot be generated."""

    status_code = 503
    error_code = "prediction_failed"


class AppointmentConflictException(VetiCareException):
    """Raised when an appointment conflicts with an existing booking."""

    status_code = 409
    error_code = "appointment_conflict"


class UnauthorizedPetAccessException(VetiCareException):
    """Raised when a user attempts to access another owner's pet."""

    status_code = 403
    error_code = "unauthorized_pet_access"


class ModelUnavailableException(VetiCareException):
    """Raised when the configured prediction model is unavailable."""

    status_code = 503
    error_code = "model_unavailable"


class ValidationException(VetiCareException):
    """Raised when a request is semantically invalid."""

    status_code = 422
    error_code = "validation_error"


class DatabaseException(VetiCareException):
    """Raised when persistent storage cannot complete an operation."""

    status_code = 503
    error_code = "database_error"
