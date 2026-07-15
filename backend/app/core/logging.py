"""Logging configuration for the application."""

import logging


def configure_logging(debug: bool = False) -> None:
    """Configure the process-wide application logger once at startup."""
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
