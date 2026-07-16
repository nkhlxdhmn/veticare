"""Logging configuration for the application."""

import logging
import sys


def configure_logging(debug: bool = False) -> None:
    """Configure the process-wide application logger once at startup."""
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
        stream=sys.stdout,
        force=True,
    )

    # Ensure uvicorn error logs are captured by our handler
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        u_logger = logging.getLogger(name)
        u_logger.handlers.clear()
        u_logger.propagate = True
