from __future__ import annotations

import asyncio

from app.request_limits import (
    AUTH_FORM_LIMIT_BYTES, SIGNATURE_FORM_LIMIT_BYTES, RequestBodyLimitMiddleware,
    request_body_limit_bytes, request_body_limit_for_path,
)


def _run_middleware(body_chunks: list[bytes], *, limit: int, content_length: int | None = None):
    messages = [
        {"type": "http.request", "body": chunk, "more_body": index < len(body_chunks) - 1}
        for index, chunk in enumerate(body_chunks)
    ]
    sent = []

    async def receive():
        if messages:
            return messages.pop(0)
        return {"type": "http.disconnect"}

    async def send(message):
        sent.append(message)

    async def consume_body(scope, receive, send):
        while True:
            message = await receive()
            if message["type"] == "http.disconnect" or not message.get("more_body"):
                break
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b"accepted"})

    headers = []
    if content_length is not None:
        headers.append((b"content-length", str(content_length).encode("ascii")))
    scope = {"type": "http", "method": "POST", "path": "/upload", "headers": headers}
    middleware = RequestBodyLimitMiddleware(consume_body, max_bytes=limit)
    asyncio.run(middleware(scope, receive, send))
    return sent


def _status(sent: list[dict]) -> int:
    return next(message["status"] for message in sent if message["type"] == "http.response.start")


def test_request_body_limit_rejects_declared_oversize_before_reading():
    async def forbidden_receive():
        raise AssertionError("Oversize Content-Length must be rejected before reading the body.")

    sent = []

    async def send(message):
        sent.append(message)

    async def unused_app(_scope, _receive, _send):
        raise AssertionError("Oversize Content-Length must be rejected before calling the app.")

    middleware = RequestBodyLimitMiddleware(unused_app, max_bytes=10)
    scope = {
        "type": "http", "method": "POST", "path": "/upload",
        "headers": [(b"content-length", b"11")],
    }
    asyncio.run(middleware(scope, forbidden_receive, send))
    assert _status(sent) == 413
    response_headers = dict(next(
        message["headers"] for message in sent if message["type"] == "http.response.start"
    ))
    assert response_headers[b"cache-control"] == b"private, no-store"
    assert response_headers[b"x-content-type-options"] == b"nosniff"


def test_request_body_limit_counts_streamed_chunks_without_content_length():
    sent = _run_middleware([b"12345", b"67890", b"x"], limit=10)
    assert _status(sent) == 413


def test_request_body_limit_allows_exact_limit():
    sent = _run_middleware([b"12345", b"67890"], limit=10)
    assert _status(sent) == 200


def test_request_body_limit_allows_four_configured_files_plus_multipart_overhead():
    assert request_body_limit_bytes(20) == 84 * 1024 * 1024


def test_authentication_and_signature_forms_use_small_path_specific_limits():
    assert request_body_limit_for_path("POST", "/login", 84 * 1024 * 1024) == AUTH_FORM_LIMIT_BYTES
    assert request_body_limit_for_path("POST", "/password-reset/token", 84 * 1024 * 1024) == AUTH_FORM_LIMIT_BYTES
    assert request_body_limit_for_path("POST", "/invitations/accept/token", 84 * 1024 * 1024) == AUTH_FORM_LIMIT_BYTES
    assert request_body_limit_for_path("POST", "/records/abc/sign", 84 * 1024 * 1024) == SIGNATURE_FORM_LIMIT_BYTES
    assert request_body_limit_for_path("POST", "/pmirs/versions/abc/sign", 84 * 1024 * 1024) == SIGNATURE_FORM_LIMIT_BYTES
    assert request_body_limit_for_path("POST", "/records/abc/evidence", 84 * 1024 * 1024) == 84 * 1024 * 1024
    assert request_body_limit_for_path("GET", "/login", 84 * 1024 * 1024) == 84 * 1024 * 1024


def test_request_body_limit_rejects_large_login_form_before_calling_app():
    async def forbidden_receive():
        raise AssertionError("Oversize login bodies must be rejected before reading.")

    sent = []

    async def send(message):
        sent.append(message)

    async def unused_app(_scope, _receive, _send):
        raise AssertionError("Oversize login bodies must be rejected before parsing.")

    middleware = RequestBodyLimitMiddleware(unused_app, max_bytes=84 * 1024 * 1024)
    scope = {
        "type": "http", "method": "POST", "path": "/login",
        "headers": [(b"content-length", str(AUTH_FORM_LIMIT_BYTES + 1).encode("ascii"))],
    }
    asyncio.run(middleware(scope, forbidden_receive, send))
    assert _status(sent) == 413


def test_red_app_installs_body_limiter_before_multipart_and_other_middleware():
    from app.config import settings
    from app.main import app

    limiter = app.user_middleware[0]
    assert limiter.cls is RequestBodyLimitMiddleware
    assert limiter.kwargs["max_bytes"] == request_body_limit_bytes(settings.max_upload_mb)
