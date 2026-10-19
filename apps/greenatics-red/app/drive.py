from __future__ import annotations

import hashlib
import io
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from typing import BinaryIO

from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .models import DriveConnection

OAUTH_SCOPE = "openid email https://www.googleapis.com/auth/drive.file"
OAUTH_SCOPES = frozenset(OAUTH_SCOPE.split())


class DriveSetupError(RuntimeError):
    pass


class DriveBackupVerificationError(DriveSetupError):
    """A Drive upload completed, but RED could not verify the stored copy."""

    def __init__(self, message: str, uploaded_file_id: str = "") -> None:
        super().__init__(message)
        self.uploaded_file_id = uploaded_file_id


def encrypt_refresh_token(token: str) -> str:
    if not settings.token_encryption_key:
        raise DriveSetupError("Falta TOKEN_ENCRYPTION_KEY para proteger el acceso a Drive.")
    try:
        return Fernet(settings.token_encryption_key.encode("ascii")).encrypt(token.encode("utf-8")).decode("ascii")
    except (ValueError, TypeError) as exc:
        raise DriveSetupError("TOKEN_ENCRYPTION_KEY no tiene el formato Fernet esperado.") from exc


def decrypt_refresh_token(value: str) -> str:
    if not settings.token_encryption_key:
        raise DriveSetupError("Falta TOKEN_ENCRYPTION_KEY.")
    try:
        return Fernet(settings.token_encryption_key.encode("ascii")).decrypt(value.encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError, TypeError) as exc:
        raise DriveSetupError("No se pudo descifrar el token de Drive; revisa la clave de cifrado configurada.") from exc


def authorization_url(state: str) -> str:
    if not settings.google_oauth_ready:
        raise DriveSetupError("Faltan variables de OAuth de Google en el entorno de RED.")
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": OAUTH_SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        # Do not inherit unrelated permissions granted earlier to this OAuth app.
        "include_granted_scopes": "false",
        "state": state,
    }
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)


def require_expected_scopes(scope_value: object) -> None:
    """Fail closed unless Google confirms exactly the scopes RED requested."""
    if not isinstance(scope_value, str):
        raise DriveSetupError(
            "Google no confirmó los permisos concedidos. Vuelve a autorizar RED con su acceso limitado."
        )
    granted = frozenset(scope_value.split())
    if granted != OAUTH_SCOPES:
        raise DriveSetupError(
            "Los permisos concedidos no coinciden con el acceso limitado que RED requiere. "
            "Revoca el permiso anterior de RED en tu cuenta Google y vuelve a autorizarlo."
        )


def _request_json(url: str, *, method: str = "GET", headers: dict[str, str] | None = None, body: bytes | None = None) -> dict:
    request = urllib.request.Request(url, data=body, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            raw = response.read()
    except urllib.error.HTTPError as exc:
        # Do not bubble up token-bearing or provider response bodies into the UI.
        raise DriveSetupError(f"Google Drive respondió con estado {exc.code}.") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise DriveSetupError("No fue posible contactar Google Drive.") from exc
    try:
        return json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise DriveSetupError("Google Drive devolvió una respuesta no válida.") from exc


def exchange_code(code: str) -> dict:
    body = urllib.parse.urlencode({
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": settings.google_redirect_uri,
        "grant_type": "authorization_code",
    }).encode("utf-8")
    result = _request_json(
        "https://oauth2.googleapis.com/token",
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        body=body,
    )
    require_expected_scopes(result.get("scope"))
    return result


def refresh_access_token(connection: DriveConnection) -> str:
    refresh_token = decrypt_refresh_token(connection.encrypted_refresh_token)
    body = urllib.parse.urlencode({
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }).encode("utf-8")
    result = _request_json(
        "https://oauth2.googleapis.com/token",
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        body=body,
    )
    require_expected_scopes(result.get("scope"))
    token = str(result.get("access_token", ""))
    if not token:
        raise DriveSetupError("Google no entregó un token de acceso para Drive.")
    return token


def current_account_email(access_token: str) -> str:
    result = _request_json(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return str(result.get("email", ""))


def create_backup_folder(access_token: str) -> str:
    body = json.dumps({"name": "GREENATICS RED - Respaldos", "mimeType": "application/vnd.google-apps.folder"}).encode("utf-8")
    result = _request_json(
        "https://www.googleapis.com/drive/v3/files?fields=id,name",
        method="POST",
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json; charset=UTF-8"},
        body=body,
    )
    folder_id = str(result.get("id", ""))
    if not folder_id:
        raise DriveSetupError("Google Drive no confirmó la carpeta de respaldos.")
    return folder_id


def verify_uploaded_backup_metadata(
    access_token: str,
    uploaded_metadata: dict,
    *,
    expected_size: int,
    expected_sha256: str,
    expected_parent_id: str,
) -> dict:
    """Confirm Drive stored the exact ZIP in RED's private backup folder."""
    file_id = str(uploaded_metadata.get("id", ""))
    if not file_id:
        raise DriveBackupVerificationError("Drive no confirmó el ID del respaldo subido.")

    metadata = uploaded_metadata
    required_fields = {"id", "size", "sha256Checksum", "parents", "mimeType"}
    if not required_fields.issubset(metadata):
        url = (
            "https://www.googleapis.com/drive/v3/files/"
            + urllib.parse.quote(file_id, safe="")
            + "?fields=id,size,sha256Checksum,parents,mimeType"
        )
        try:
            metadata = _request_json(url, headers={"Authorization": f"Bearer {access_token}"})
        except DriveSetupError as exc:
            raise DriveBackupVerificationError(
                "Drive recibió el ZIP, pero RED no pudo verificar sus metadatos.", file_id,
            ) from exc

    try:
        stored_size = int(metadata.get("size", ""))
    except (TypeError, ValueError):
        stored_size = -1
    parents = metadata.get("parents")
    if (
        str(metadata.get("id", "")) != file_id
        or stored_size != expected_size
        or str(metadata.get("sha256Checksum", "")).lower() != expected_sha256.lower()
        or metadata.get("mimeType") != "application/zip"
        or not isinstance(parents, list)
        or set(str(parent) for parent in parents) != {expected_parent_id}
    ):
        raise DriveBackupVerificationError(
            "Drive recibió el ZIP, pero el tamaño, SHA-256, tipo o carpeta no coincide; el respaldo no se marcó como completado.",
            file_id,
        )
    return metadata


def upload_backup(connection: DriveConnection, filename: str, payload: bytes | BinaryIO) -> dict:
    if isinstance(payload, bytes):
        with io.BytesIO(payload) as source:
            return _upload_backup_stream(connection, filename, source)
    return _upload_backup_stream(connection, filename, payload)


def _upload_backup_stream(connection: DriveConnection, filename: str, payload: BinaryIO) -> dict:
    try:
        payload.seek(0, 2)
        payload_size = payload.tell()
        payload.seek(0)
    except (AttributeError, OSError) as exc:
        raise DriveSetupError("El respaldo temporal no permite lectura por bloques.") from exc
    if payload_size <= 0:
        raise DriveSetupError("El archivo de respaldo está vacío.")
    payload_hasher = hashlib.sha256()
    for digest_chunk in iter(lambda: payload.read(1024 * 1024), b""):
        payload_hasher.update(digest_chunk)
    payload_sha256 = payload_hasher.hexdigest()
    payload.seek(0)
    access_token = refresh_access_token(connection)
    metadata = json.dumps({
        "name": filename,
        "mimeType": "application/zip",
        "parents": [connection.backup_folder_id],
    }).encode("utf-8")
    # Start a resumable upload so backups containing several evidence files are
    # not constrained to a small multipart request.
    request = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable"
        "&fields=id,name,size,sha256Checksum,parents,mimeType,webViewLink",
        data=metadata,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Type": "application/zip",
            "X-Upload-Content-Length": str(payload_size),
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            upload_url = response.headers.get("Location", "")
    except urllib.error.HTTPError as exc:
        raise DriveSetupError(f"Google Drive no inició la carga (estado {exc.code}).") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise DriveSetupError("No fue posible iniciar la carga de respaldo a Drive.") from exc
    parsed_upload_url = urllib.parse.urlsplit(upload_url)
    if (
        parsed_upload_url.scheme != "https"
        or parsed_upload_url.hostname != "www.googleapis.com"
        or parsed_upload_url.path != "/upload/drive/v3/files"
    ):
        raise DriveSetupError("Google Drive no entregó una URL segura de carga.")

    result = {}
    chunk_size = 5 * 1024 * 1024
    offset = 0
    stalled_chunks = 0
    while offset < payload_size:
        payload.seek(offset)
        chunk = payload.read(min(chunk_size, payload_size - offset))
        if not chunk:
            raise DriveSetupError("El archivo de respaldo terminó antes de completar la carga.")
        end = offset + len(chunk) - 1
        request = urllib.request.Request(
            upload_url,
            data=chunk,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/zip",
                "Content-Length": str(len(chunk)),
                "Content-Range": f"bytes {offset}-{end}/{payload_size}",
            },
            method="PUT",
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                status = response.status
                response_body = response.read()
                received_range = response.headers.get("Range", "")
        except urllib.error.HTTPError as exc:
            if exc.code == 308:
                status = 308
                response_body = b""
                received_range = exc.headers.get("Range", "") if exc.headers else ""
            else:
                raise DriveSetupError(f"Google Drive rechazó una parte del respaldo (estado {exc.code}).") from exc
        except (urllib.error.URLError, TimeoutError) as exc:
            raise DriveSetupError("La carga del respaldo a Drive se interrumpió.") from exc
        if status in {200, 201}:
            try:
                result = json.loads(response_body.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise DriveSetupError("Google Drive no devolvió los datos del archivo cargado.") from exc
            break
        if status != 308:
            raise DriveSetupError(f"Google Drive detuvo la carga (estado {status}).")
        match = re.fullmatch(r"bytes=0-(\d+)", received_range.strip())
        next_offset = int(match.group(1)) + 1 if match else offset
        if next_offset > payload_size:
            raise DriveSetupError("Google Drive informó un avance de carga no válido.")
        if next_offset <= offset:
            stalled_chunks += 1
            if stalled_chunks > 3:
                raise DriveSetupError("La carga del respaldo no avanzó después de varios intentos.")
        else:
            stalled_chunks = 0
        offset = next_offset
    if not result.get("id"):
        raise DriveBackupVerificationError("Google Drive no confirmó el archivo de respaldo.")
    try:
        return verify_uploaded_backup_metadata(
            access_token,
            result,
            expected_size=payload_size,
            expected_sha256=payload_sha256,
            expected_parent_id=connection.backup_folder_id,
        )
    except DriveBackupVerificationError:
        raise
    except DriveSetupError as exc:
        raise DriveBackupVerificationError(str(exc), str(result["id"])) from exc


def download_backup_archive(connection: DriveConnection, backup, destination: str | os.PathLike[str]) -> dict:
    """Download one registered RED backup without overwriting or trusting Drive bytes."""
    if (
        backup.status != "completado"
        or not backup.drive_file_id
        or not backup.sha256
        or not re.fullmatch(r"[0-9a-fA-F]{64}", backup.sha256)
        or backup.bytes_total <= 0
        or not backup.drive_folder_id
        or backup.drive_folder_id != connection.backup_folder_id
    ):
        raise DriveSetupError("El respaldo no está completo o no pertenece a la carpeta Drive actualmente conectada.")

    access_token = refresh_access_token(connection)
    file_id = urllib.parse.quote(backup.drive_file_id, safe="")
    metadata_url = (
        f"https://www.googleapis.com/drive/v3/files/{file_id}"
        "?fields=id,size,sha256Checksum,parents,mimeType"
    )
    metadata = _request_json(metadata_url, headers={"Authorization": f"Bearer {access_token}"})
    if str(metadata.get("id", "")) != backup.drive_file_id:
        raise DriveBackupVerificationError("Google Drive devolvió metadatos para un archivo distinto al respaldo registrado.")
    verify_uploaded_backup_metadata(
        access_token,
        metadata,
        expected_size=backup.bytes_total,
        expected_sha256=backup.sha256,
        expected_parent_id=connection.backup_folder_id,
    )

    output_path = os.fspath(destination)
    try:
        descriptor = os.open(output_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError as exc:
        raise DriveSetupError("El archivo de destino ya existe; elige una ruta nueva para evitar sobrescribirlo.") from exc
    except OSError as exc:
        raise DriveSetupError("No se pudo crear el archivo local de respaldo.") from exc

    digest = hashlib.sha256()
    downloaded = 0
    try:
        request = urllib.request.Request(
            f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media",
            headers={"Authorization": f"Bearer {access_token}"},
            method="GET",
        )
        with os.fdopen(descriptor, "wb") as target:
            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    while chunk := response.read(1024 * 1024):
                        downloaded += len(chunk)
                        if downloaded > backup.bytes_total:
                            raise DriveSetupError("La descarga supera el tamaño registrado para el respaldo.")
                        digest.update(chunk)
                        target.write(chunk)
            except urllib.error.HTTPError as exc:
                raise DriveSetupError(f"Google Drive no permitió descargar el respaldo (estado {exc.code}).") from exc
            except (urllib.error.URLError, TimeoutError) as exc:
                raise DriveSetupError("La descarga del respaldo desde Drive se interrumpió.") from exc
            target.flush()
            os.fsync(target.fileno())
        if downloaded != backup.bytes_total or digest.hexdigest().lower() != backup.sha256.lower():
            raise DriveSetupError("La descarga no coincide con el tamaño y SHA-256 del respaldo registrado.")
        return {"path": output_path, "bytes_total": downloaded, "sha256": digest.hexdigest(), "metadata": metadata}
    except Exception:
        try:
            os.unlink(output_path)
        except FileNotFoundError:
            pass
        raise


def get_connection(session: Session) -> DriveConnection | None:
    return session.scalar(select(DriveConnection).order_by(DriveConnection.connected_at.desc()).limit(1))
