from __future__ import annotations

import hashlib
import json
import stat
from types import SimpleNamespace
from urllib.parse import parse_qs, urlsplit

import pytest

from app import drive


class FakeResponse:
    def __init__(self, body: bytes = b"", *, status: int = 200, headers: dict | None = None):
        self._body = body
        self.status = status
        self.headers = headers or {}

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, size=-1):
        if size < 0:
            return self._body
        body, self._body = self._body[:size], self._body[size:]
        return body


def test_drive_oauth_uses_minimal_file_scope_and_offline_access(monkeypatch):
    monkeypatch.setattr(drive, "settings", SimpleNamespace(
        google_oauth_ready=True,
        google_client_id="synthetic-client-id",
        google_redirect_uri="https://red.example.test/drive/callback",
    ))

    url = drive.authorization_url("synthetic-state")
    params = parse_qs(urlsplit(url).query)

    assert params["scope"] == ["openid email https://www.googleapis.com/auth/drive.file"]
    assert "https://www.googleapis.com/auth/drive" not in params["scope"][0].split()
    assert "https://www.googleapis.com/auth/drive.readonly" not in params["scope"][0].split()
    assert params["access_type"] == ["offline"]
    assert params["prompt"] == ["consent"]
    assert params["include_granted_scopes"] == ["false"]
    assert params["redirect_uri"] == ["https://red.example.test/drive/callback"]
    assert params["state"] == ["synthetic-state"]


def test_drive_scope_validator_requires_exactly_the_requested_scopes():
    drive.require_expected_scopes("openid email https://www.googleapis.com/auth/drive.file")

    with pytest.raises(drive.DriveSetupError, match="no confirmó"):
        drive.require_expected_scopes(None)
    with pytest.raises(drive.DriveSetupError, match="acceso limitado"):
        drive.require_expected_scopes(
            "openid email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive"
        )
    with pytest.raises(drive.DriveSetupError, match="acceso limitado"):
        drive.require_expected_scopes("openid email")


@pytest.mark.parametrize("scope", [
    None,
    "openid email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
])
def test_drive_authorization_code_exchange_rejects_unverifiable_or_broader_grants(monkeypatch, scope):
    monkeypatch.setattr(drive, "settings", SimpleNamespace(
        google_client_id="synthetic-client-id",
        google_client_secret="synthetic-client-secret",
        google_redirect_uri="https://red.example.test/drive/callback",
    ))
    monkeypatch.setattr(drive, "_request_json", lambda *_args, **_kwargs: {
        "access_token": "synthetic-access-token", "refresh_token": "synthetic-refresh-token", "scope": scope,
    })

    with pytest.raises(drive.DriveSetupError):
        drive.exchange_code("synthetic-code")


def test_drive_refresh_rejects_a_preexisting_broader_grant(monkeypatch):
    monkeypatch.setattr(drive, "settings", SimpleNamespace(
        google_client_id="synthetic-client-id", google_client_secret="synthetic-client-secret",
    ))
    monkeypatch.setattr(drive, "decrypt_refresh_token", lambda _value: "synthetic-refresh-token")
    monkeypatch.setattr(drive, "_request_json", lambda *_args, **_kwargs: {
        "access_token": "synthetic-access-token",
        "scope": "openid email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
    })

    with pytest.raises(drive.DriveSetupError, match="acceso limitado"):
        drive.refresh_access_token(SimpleNamespace(encrypted_refresh_token="synthetic-ciphertext"))


def test_drive_refresh_accepts_the_exact_expected_grant(monkeypatch):
    monkeypatch.setattr(drive, "settings", SimpleNamespace(
        google_client_id="synthetic-client-id", google_client_secret="synthetic-client-secret",
    ))
    monkeypatch.setattr(drive, "decrypt_refresh_token", lambda _value: "synthetic-refresh-token")
    monkeypatch.setattr(drive, "_request_json", lambda *_args, **_kwargs: {
        "access_token": "synthetic-access-token",
        "scope": "https://www.googleapis.com/auth/drive.file email openid",
    })

    token = drive.refresh_access_token(SimpleNamespace(encrypted_refresh_token="synthetic-ciphertext"))

    assert token == "synthetic-access-token"


def _resumable_request_harness(monkeypatch, completion_body: dict, metadata_body: dict | None = None):
    requests = []

    def fake_urlopen(request, timeout=0):
        requests.append((request, timeout))
        if len(requests) == 1:
            return FakeResponse(headers={
                "Location": "https://www.googleapis.com/upload/drive/v3/files?upload_id=synthetic-session",
            })
        if len(requests) == 2:
            return FakeResponse(json.dumps(completion_body).encode("utf-8"), status=201)
        if len(requests) == 3 and metadata_body is not None:
            return FakeResponse(json.dumps(metadata_body).encode("utf-8"))
        raise AssertionError("La carga hizo una solicitud HTTP inesperada.")

    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-access-token")
    monkeypatch.setattr(drive.urllib.request, "urlopen", fake_urlopen)
    return requests


def _drive_file_metadata(payload: bytes, *, file_id="synthetic-drive-file", folder_id="red-private-folder"):
    return {
        "id": file_id,
        "name": "respaldo-sintetico.zip",
        "size": str(len(payload)),
        "sha256Checksum": hashlib.sha256(payload).hexdigest(),
        "parents": [folder_id],
        "mimeType": "application/zip",
    }


def test_resumable_drive_upload_verifies_returned_sha_size_type_and_parent(monkeypatch):
    payload = b"synthetic zip payload"
    completion = _drive_file_metadata(payload)
    requests = _resumable_request_harness(monkeypatch, completion)
    connection = SimpleNamespace(backup_folder_id="red-private-folder")

    result = drive.upload_backup(connection, "respaldo-sintetico.zip", payload)

    assert result == completion
    assert len(requests) == 2
    start, _timeout = requests[0]
    assert start.get_method() == "POST"
    assert start.full_url.startswith("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable")
    assert "sha256Checksum" in start.full_url and "parents" in start.full_url
    assert json.loads(start.data) == {
        "name": "respaldo-sintetico.zip", "mimeType": "application/zip", "parents": ["red-private-folder"],
    }
    upload, _timeout = requests[1]
    assert upload.get_method() == "PUT"
    assert upload.data == payload
    assert upload.get_header("Content-range") == f"bytes 0-{len(payload) - 1}/{len(payload)}"


def test_resumable_drive_upload_fetches_metadata_when_completion_omits_integrity_fields(monkeypatch):
    payload = b"synthetic zip payload"
    metadata = _drive_file_metadata(payload)
    requests = _resumable_request_harness(monkeypatch, {"id": metadata["id"], "name": metadata["name"]}, metadata)
    connection = SimpleNamespace(backup_folder_id="red-private-folder")

    result = drive.upload_backup(connection, "respaldo-sintetico.zip", payload)

    assert result == metadata
    assert len(requests) == 3
    metadata_request, _timeout = requests[2]
    assert metadata_request.get_method() == "GET"
    assert metadata_request.full_url == (
        "https://www.googleapis.com/drive/v3/files/synthetic-drive-file"
        "?fields=id,size,sha256Checksum,parents,mimeType"
    )
    assert metadata_request.get_header("Authorization") == "Bearer synthetic-access-token"


def test_resumable_drive_upload_rejects_wrong_remote_sha_and_keeps_file_id(monkeypatch):
    payload = b"synthetic zip payload"
    invalid_metadata = {**_drive_file_metadata(payload), "sha256Checksum": "0" * 64}
    _resumable_request_harness(monkeypatch, invalid_metadata)
    connection = SimpleNamespace(backup_folder_id="red-private-folder")

    with pytest.raises(drive.DriveBackupVerificationError) as exc_info:
        drive.upload_backup(connection, "respaldo-sintetico.zip", payload)

    assert exc_info.value.uploaded_file_id == "synthetic-drive-file"
    assert "SHA-256" in str(exc_info.value)


def test_resumable_drive_upload_continues_after_partial_chunk_acknowledgement(monkeypatch):
    chunk_size = 5 * 1024 * 1024
    payload = b"x" * (chunk_size + 17)
    completion = _drive_file_metadata(payload)
    requests = []

    def fake_urlopen(request, timeout=0):
        requests.append((request, timeout))
        if len(requests) == 1:
            return FakeResponse(headers={
                "Location": "https://www.googleapis.com/upload/drive/v3/files?upload_id=synthetic-session",
            })
        if len(requests) == 2:
            return FakeResponse(status=308, headers={"Range": f"bytes=0-{chunk_size - 1}"})
        if len(requests) == 3:
            return FakeResponse(json.dumps(completion).encode("utf-8"), status=201)
        raise AssertionError("La carga hizo una solicitud HTTP inesperada.")

    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-access-token")
    monkeypatch.setattr(drive.urllib.request, "urlopen", fake_urlopen)
    connection = SimpleNamespace(backup_folder_id="red-private-folder")

    result = drive.upload_backup(connection, "respaldo-sintetico.zip", payload)

    assert result == completion
    assert len(requests) == 3
    first_chunk, second_chunk = requests[1][0], requests[2][0]
    assert len(first_chunk.data) == chunk_size
    assert first_chunk.get_header("Content-range") == f"bytes 0-{chunk_size - 1}/{len(payload)}"
    assert second_chunk.data == payload[chunk_size:]
    assert second_chunk.get_header("Content-range") == f"bytes {chunk_size}-{len(payload) - 1}/{len(payload)}"


def test_drive_backup_download_checks_metadata_stream_hash_and_private_file_mode(monkeypatch, tmp_path):
    payload = b"synthetic backup archive bytes"
    metadata = _drive_file_metadata(payload, file_id="registered-backup")
    requests = []

    def fake_urlopen(request, timeout=0):
        requests.append((request, timeout))
        if "alt=media" in request.full_url:
            return FakeResponse(payload)
        return FakeResponse(json.dumps(metadata).encode("utf-8"))

    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-access-token")
    monkeypatch.setattr(drive.urllib.request, "urlopen", fake_urlopen)
    connection = SimpleNamespace(backup_folder_id="red-private-folder")
    backup = SimpleNamespace(
        status="completado", drive_file_id="registered-backup", sha256=hashlib.sha256(payload).hexdigest(),
        bytes_total=len(payload), drive_folder_id="red-private-folder",
    )
    destination = tmp_path / "verified.zip"

    result = drive.download_backup_archive(connection, backup, destination)

    assert destination.read_bytes() == payload
    assert stat.S_IMODE(destination.stat().st_mode) == 0o600
    assert result["sha256"] == backup.sha256
    assert len(requests) == 2
    assert requests[0][0].full_url.endswith("/files/registered-backup?fields=id,size,sha256Checksum,parents,mimeType")
    assert requests[1][0].full_url.endswith("/files/registered-backup?alt=media")
    assert requests[1][0].get_header("Authorization") == "Bearer synthetic-access-token"


def test_drive_backup_download_rejects_metadata_mismatch_before_creating_file(monkeypatch, tmp_path):
    payload = b"synthetic backup archive bytes"
    metadata = {**_drive_file_metadata(payload, file_id="registered-backup"), "parents": ["other-folder"]}
    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-access-token")
    monkeypatch.setattr(
        drive.urllib.request, "urlopen",
        lambda _request, timeout=0: FakeResponse(json.dumps(metadata).encode("utf-8")),
    )
    connection = SimpleNamespace(backup_folder_id="red-private-folder")
    backup = SimpleNamespace(
        status="completado", drive_file_id="registered-backup", sha256=hashlib.sha256(payload).hexdigest(),
        bytes_total=len(payload), drive_folder_id="red-private-folder",
    )
    destination = tmp_path / "mismatch.zip"

    with pytest.raises(drive.DriveBackupVerificationError):
        drive.download_backup_archive(connection, backup, destination)

    assert not destination.exists()


def test_drive_backup_download_does_not_overwrite_existing_file(monkeypatch, tmp_path):
    payload = b"synthetic backup archive bytes"
    metadata = _drive_file_metadata(payload, file_id="registered-backup")
    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-access-token")
    monkeypatch.setattr(
        drive.urllib.request, "urlopen",
        lambda _request, timeout=0: FakeResponse(json.dumps(metadata).encode("utf-8")),
    )
    connection = SimpleNamespace(backup_folder_id="red-private-folder")
    backup = SimpleNamespace(
        status="completado", drive_file_id="registered-backup", sha256=hashlib.sha256(payload).hexdigest(),
        bytes_total=len(payload), drive_folder_id="red-private-folder",
    )
    destination = tmp_path / "already-exists.zip"
    destination.write_bytes(b"keep this file")

    with pytest.raises(drive.DriveSetupError, match="ya existe"):
        drive.download_backup_archive(connection, backup, destination)

    assert destination.read_bytes() == b"keep this file"


def test_drive_backup_download_removes_partial_file_when_stream_hash_is_wrong(monkeypatch, tmp_path):
    expected = b"expected archive"
    returned = b"altered archive"
    metadata = _drive_file_metadata(expected, file_id="registered-backup")

    def fake_urlopen(request, timeout=0):
        if "alt=media" in request.full_url:
            return FakeResponse(returned)
        return FakeResponse(json.dumps(metadata).encode("utf-8"))

    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-access-token")
    monkeypatch.setattr(drive.urllib.request, "urlopen", fake_urlopen)
    connection = SimpleNamespace(backup_folder_id="red-private-folder")
    backup = SimpleNamespace(
        status="completado", drive_file_id="registered-backup", sha256=hashlib.sha256(expected).hexdigest(),
        bytes_total=len(expected), drive_folder_id="red-private-folder",
    )
    destination = tmp_path / "corrupt.zip"

    with pytest.raises(drive.DriveSetupError, match="SHA-256"):
        drive.download_backup_archive(connection, backup, destination)

    assert not destination.exists()
