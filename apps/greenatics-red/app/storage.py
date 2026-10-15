from __future__ import annotations

import os
import stat
import shutil
import hashlib
from pathlib import Path, PurePosixPath
from uuid import uuid4
from urllib.parse import quote

from .config import settings


STORAGE_HASH_CHUNK_BYTES = 1024 * 1024


class StorageError(RuntimeError):
    pass


class StorageService:
    """Private local, mounted-filesystem, or S3-compatible evidence storage."""

    def __init__(
        self,
        *,
        backend: str | None = None,
        local_root: Path | None = None,
        s3_client=None,
        bucket: str | None = None,
    ) -> None:
        self.backend = backend or settings.storage_backend
        self.local_root = Path(local_root or settings.storage_root).expanduser().resolve()
        self.bucket = bucket if bucket is not None else settings.s3_bucket
        self._client = s3_client
        if self.backend in {"local", "filesystem"}:
            self._ensure_private_directory(self.local_root)
        elif self.backend == "s3" and self._client is None:
            if not self.bucket:
                raise StorageError("S3_BUCKET es obligatorio para almacenamiento S3.")
            try:
                import boto3
                from botocore.config import Config
            except ImportError as exc:  # pragma: no cover - dependency is pinned in production
                raise StorageError("Instala boto3 para usar almacenamiento S3.") from exc
            endpoint = settings.s3_endpoint_url or None
            self._client = boto3.client(
                "s3",
                endpoint_url=endpoint,
                region_name=settings.s3_region or None,
                aws_access_key_id=settings.s3_access_key or None,
                aws_secret_access_key=settings.s3_secret_key or None,
                config=Config(
                    signature_version="s3v4",
                    s3={"addressing_style": "path" if endpoint else "virtual"},
                    connect_timeout=5,
                    read_timeout=30,
                    retries={"max_attempts": 2, "mode": "standard"},
                ),
            )
        elif self.backend not in {"local", "filesystem", "s3"}:
            raise StorageError("STORAGE_BACKEND debe ser local, filesystem o s3.")

    @property
    def remote(self) -> bool:
        return self.backend == "s3"

    @staticmethod
    def _ensure_private_directory(path: Path) -> None:
        path.mkdir(parents=True, exist_ok=True, mode=0o700)
        if os.name == "posix":
            path.chmod(0o700)

    @staticmethod
    def _write_private_file(path: Path, writer) -> None:
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
        if hasattr(os, "O_NOFOLLOW"):
            flags |= os.O_NOFOLLOW
        descriptor = os.open(path, flags, 0o600)
        with os.fdopen(descriptor, "wb") as output:
            writer(output)

    @staticmethod
    def normalize_key(key: str) -> str:
        clean = str(key).strip()
        if not clean or clean.startswith("/") or "\x00" in clean:
            raise StorageError("La clave de almacenamiento no es válida.")
        raw_parts = clean.split("/")
        if any(part in {"", ".", ".."} for part in raw_parts):
            raise StorageError("La clave de almacenamiento no es válida.")
        parts = PurePosixPath(clean).parts
        if not parts:
            raise StorageError("La clave de almacenamiento no es válida.")
        return "/".join(parts)

    def local_path(self, key: str) -> Path | None:
        if self.remote:
            return None
        path = (self.local_root / self.normalize_key(key)).resolve()
        if self.local_root not in path.parents:
            raise StorageError("La ruta de almacenamiento no está permitida.")
        return path

    def put_bytes(self, key: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        key = self.normalize_key(key)
        if self.remote:
            self._client.put_object(
                Bucket=self.bucket, Key=key, Body=content, ContentType=content_type,
            )
            return key
        path = self.local_path(key)
        assert path is not None
        self._ensure_private_directory(path.parent)
        temporary = path.with_name(f"{path.name}.upload-{uuid4().hex}")
        try:
            self._write_private_file(temporary, lambda output: output.write(content))
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)
        return key

    def put_file(self, key: str, source: Path, content_type: str = "application/octet-stream") -> str:
        key = self.normalize_key(key)
        if not source.is_file():
            raise FileNotFoundError(source)
        if self.remote:
            self._client.upload_file(
                str(source), self.bucket, key, ExtraArgs={"ContentType": content_type},
            )
            return key
        path = self.local_path(key)
        assert path is not None
        self._ensure_private_directory(path.parent)
        temporary = path.with_name(f"{path.name}.upload-{uuid4().hex}")
        try:
            def copy_source(output):
                with source.open("rb") as input_file:
                    shutil.copyfileobj(input_file, output)

            self._write_private_file(temporary, copy_source)
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)
        return key

    def get_bytes(self, key: str) -> bytes:
        key = self.normalize_key(key)
        if self.remote:
            response = self._client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        path = self.local_path(key)
        if not path or not path.is_file():
            raise FileNotFoundError(key)
        return path.read_bytes()

    def checksum(self, key: str) -> tuple[int, str]:
        """Return an object's size and SHA-256 without loading it all into memory."""
        key = self.normalize_key(key)
        digest = hashlib.sha256()
        size_bytes = 0
        if self.remote:
            response = self._client.get_object(Bucket=self.bucket, Key=key)
            body = response["Body"]
            try:
                while chunk := body.read(STORAGE_HASH_CHUNK_BYTES):
                    size_bytes += len(chunk)
                    digest.update(chunk)
            finally:
                body.close()
            return size_bytes, digest.hexdigest()

        path = self.local_path(key)
        if not path or not path.is_file():
            raise FileNotFoundError(key)
        with path.open("rb") as source:
            while chunk := source.read(STORAGE_HASH_CHUNK_BYTES):
                size_bytes += len(chunk)
                digest.update(chunk)
        return size_bytes, digest.hexdigest()

    def exists(self, key: str) -> bool:
        key = self.normalize_key(key)
        if not self.remote:
            path = self.local_path(key)
            return bool(path and path.is_file())
        try:
            self._client.head_object(Bucket=self.bucket, Key=key)
            return True
        except Exception as exc:
            error = getattr(exc, "response", {}).get("Error", {})
            if error.get("Code") in {"404", "NoSuchKey", "NotFound"}:
                return False
            raise

    def health_check(self) -> None:
        if self.remote:
            self._client.head_bucket(Bucket=self.bucket)
            return
        if not self.local_root.is_dir() or not os.access(self.local_root, os.W_OK):
            raise StorageError("El directorio privado de evidencias no está disponible para lectura y escritura.")
        if os.name == "posix" and stat.S_IMODE(self.local_root.stat().st_mode) & 0o077:
            raise StorageError("El directorio local de evidencias debe estar limitado a la cuenta del servicio.")

    def delete(self, key: str) -> None:
        key = self.normalize_key(key)
        if self.remote:
            self._client.delete_object(Bucket=self.bucket, Key=key)
            return
        path = self.local_path(key)
        if path:
            path.unlink(missing_ok=True)

    def quarantine(self, key: str) -> str | None:
        """Move an object out of reach until its database deletion commits."""
        key = self.normalize_key(key)
        temporary_key = f"{key}.deleting-{uuid4().hex}"
        if self.remote:
            if not self.exists(key):
                return None
            self._client.copy_object(
                Bucket=self.bucket, Key=temporary_key,
                CopySource={"Bucket": self.bucket, "Key": key},
            )
            try:
                self._client.delete_object(Bucket=self.bucket, Key=key)
            except Exception:
                self._client.delete_object(Bucket=self.bucket, Key=temporary_key)
                raise
            return temporary_key
        source = self.local_path(key)
        if not source or not source.is_file():
            return None
        destination = self.local_path(temporary_key)
        assert destination is not None
        destination.parent.mkdir(parents=True, exist_ok=True)
        source.replace(destination)
        return temporary_key

    def restore_quarantined(self, temporary_key: str | None, key: str) -> None:
        if not temporary_key:
            return
        key = self.normalize_key(key)
        temporary_key = self.normalize_key(temporary_key)
        if self.remote:
            if self.exists(temporary_key):
                self._client.copy_object(
                    Bucket=self.bucket, Key=key,
                    CopySource={"Bucket": self.bucket, "Key": temporary_key},
                )
                self._client.delete_object(Bucket=self.bucket, Key=temporary_key)
            return
        source = self.local_path(temporary_key)
        destination = self.local_path(key)
        if source and destination and source.is_file() and not destination.exists():
            destination.parent.mkdir(parents=True, exist_ok=True)
            source.replace(destination)

    def presigned_download_url(self, key: str, filename: str, expires_seconds: int = 300) -> str:
        if not self.remote:
            raise StorageError("Las URL firmadas solo están disponibles con almacenamiento S3.")
        disposition = "attachment; filename*=UTF-8''" + quote(filename, safe="")
        return self._client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": self.normalize_key(key),
                "ResponseContentType": "application/octet-stream",
                "ResponseContentDisposition": disposition,
            },
            ExpiresIn=expires_seconds,
        )


storage = StorageService()
