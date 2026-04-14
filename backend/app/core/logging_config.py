"""
Structured logging configuration.

When JSON_LOGS=true (production default), every log record is emitted as a
single JSON line — easy to ingest into Logtail, Datadog, or any log aggregator.
In dev mode (JSON_LOGS unset / false) plain text is used instead.
"""
import json
import logging
import sys
from datetime import datetime, timezone


class _JSONFormatter(logging.Formatter):
    """Emit each log record as a single JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        # Optional request_id injected by middleware
        if hasattr(record, "request_id"):
            payload["request_id"] = record.request_id
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(json_logs: bool = False, log_level: str = "INFO") -> None:
    """
    Call once at application startup.

    Args:
        json_logs:  Emit JSON-structured lines when True.
        log_level:  Root log level string (e.g. "INFO", "DEBUG", "WARNING").
    """
    handler = logging.StreamHandler(sys.stdout)
    if json_logs:
        handler.setFormatter(_JSONFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)-8s %(name)s  %(message)s")
        )

    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        handlers=[handler],
        force=True,
    )

    # Suppress chatty third-party loggers in production
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
