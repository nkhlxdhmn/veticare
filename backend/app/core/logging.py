"""Structured JSON logging setup."""

import json
import logging
from datetime import UTC, datetime
from typing import Any

from app.middleware.request_context import request_id_context


class JsonFormatter(logging.Formatter):
    """Serialize log records into a compact JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        """Format one log record with request correlation metadata."""
        payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_context.get(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        for attribute in (
            "method",
            "endpoint",
            "status_code",
            "latency_ms",
            "client_ip",
            "user_id",
            "error_code",
        ):
            if hasattr(record, attribute):
                payload[attribute] = getattr(record, attribute)
        return json.dumps(payload, default=str)


def configure_logging() -> None:
    """Configure root logging once for application startup."""
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO)
