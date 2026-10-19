from __future__ import annotations

import logging
from urllib.parse import unquote, urlsplit


class UvicornAccessQueryRedactionFilter(logging.Filter):
    """Remove query strings and bearer tokens from Uvicorn access logs."""

    def filter(self, record: logging.LogRecord) -> bool:
        args = record.args
        if record.name != "uvicorn.access" or not isinstance(args, tuple) or len(args) < 3:
            return True
        request_target = args[2]
        if isinstance(request_target, str):
            path = unquote(urlsplit(request_target).path)
            if path.startswith("/password-reset/"):
                request_target = "/password-reset/[redacted]"
            elif path.startswith("/invitations/accept/"):
                request_target = "/invitations/accept/[redacted]"
            elif "?" in request_target:
                request_target = request_target.split("?", 1)[0]
            if request_target != args[2]:
                record.args = (*args[:2], request_target, *args[3:])
        return True


def install_uvicorn_access_log_query_redaction() -> None:
    access_logger = logging.getLogger("uvicorn.access")
    if not any(isinstance(item, UvicornAccessQueryRedactionFilter) for item in access_logger.filters):
        access_logger.addFilter(UvicornAccessQueryRedactionFilter())
