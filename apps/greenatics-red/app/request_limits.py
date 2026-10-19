from __future__ import annotations

from collections.abc import Awaitable, Callable

from starlette.responses import JSONResponse


MIB = 1024 * 1024
MULTIPART_OVERHEAD_BYTES = 4 * MIB
AUTH_FORM_LIMIT_BYTES = 64 * 1024
SIGNATURE_FORM_LIMIT_BYTES = 256 * 1024
OVERSIZE_HEADERS = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
}


def request_body_limit_bytes(max_file_mb: int) -> int:
    """Bound multipart parsing to the four-file form limit plus framing and fields."""
    return max(1, int(max_file_mb)) * 4 * MIB + MULTIPART_OVERHEAD_BYTES


def request_body_limit_for_path(method: str, path: str, default_limit: int) -> int:
    """Keep credential forms small while leaving room for encoded signature strokes."""
    if method.upper() != "POST":
        return default_limit
    if path == "/login" or path.startswith(("/password-reset/", "/invitations/accept/")):
        return AUTH_FORM_LIMIT_BYTES
    if path.endswith("/sign") and (path.startswith("/records/") or path.startswith("/pmirs/versions/")):
        return SIGNATURE_FORM_LIMIT_BYTES
    return default_limit


class _RequestBodyTooLarge(Exception):
    pass


class RequestBodyLimitMiddleware:
    """Reject oversized request bodies before multipart files are spooled to disk."""

    def __init__(self, app, *, max_bytes: int) -> None:
        self.app = app
        self.max_bytes = max(1, int(max_bytes))

    async def __call__(self, scope, receive: Callable[[], Awaitable[dict]], send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path_limit = request_body_limit_for_path(
            scope.get("method", "GET"), scope.get("path", ""), self.max_bytes,
        )
        if self._content_length_exceeds_limit(scope, path_limit):
            response = JSONResponse(
                status_code=413,
                content={"detail": "El cuerpo de la solicitud supera el límite de carga de RED."},
                headers=OVERSIZE_HEADERS,
            )
            await response(scope, receive, send)
            return

        received_bytes = 0
        response_started = False

        async def limited_receive():
            nonlocal received_bytes
            message = await receive()
            if message["type"] == "http.request":
                received_bytes += len(message.get("body", b""))
                if received_bytes > path_limit:
                    raise _RequestBodyTooLarge
            return message

        async def tracked_send(message):
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, limited_receive, tracked_send)
        except _RequestBodyTooLarge:
            if response_started:
                return
            response = JSONResponse(
                status_code=413,
                content={"detail": "El cuerpo de la solicitud supera el límite de carga de RED."},
                headers=OVERSIZE_HEADERS,
            )
            await response(scope, receive, send)

    def _content_length_exceeds_limit(self, scope, limit: int) -> bool:
        for key, value in scope.get("headers", []):
            if key.lower() != b"content-length":
                continue
            try:
                return int(value) > limit
            except (TypeError, ValueError):
                return False
        return False
