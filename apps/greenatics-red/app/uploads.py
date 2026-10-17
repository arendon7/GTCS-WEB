from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import TypeAlias
import zipfile


UPLOAD_MEDIA_TYPES = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".csv": "text/csv",
    ".txt": "text/plain",
}

UploadSource: TypeAlias = Path | bytes


class UploadContentError(ValueError):
    """The selected filename extension does not match the uploaded content."""


def _has_nul_byte(source: UploadSource) -> bool:
    if isinstance(source, bytes):
        return b"\x00" in source
    with source.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            if b"\x00" in chunk:
                return True
    return False


def _valid_heif_brand(prefix: bytes) -> bool:
    if len(prefix) < 16 or prefix[4:8] != b"ftyp":
        return False
    box_size = int.from_bytes(prefix[:4], "big")
    if box_size not in {0, 1} and box_size < 16:
        return False
    brands = {prefix[8:12]}
    brands.update(prefix[index:index + 4] for index in range(16, len(prefix) - 3, 4))
    return bool(brands & {b"heic", b"heix", b"hevc", b"hevx", b"heim", b"heis", b"hevm", b"hevs", b"mif1", b"msf1"})


def _valid_office_package(source: UploadSource, extension: str) -> bool:
    try:
        with zipfile.ZipFile(source if isinstance(source, Path) else BytesIO(source)) as archive:
            names = set(archive.namelist())
    except (OSError, zipfile.BadZipFile, ValueError):
        return False
    required_part = "word/document.xml" if extension == ".docx" else "xl/workbook.xml"
    return "[Content_Types].xml" in names and required_part in names


def validate_upload_content(source: UploadSource, extension: str) -> str:
    """Validate a small format signature and return a server-derived MIME type.

    Text formats have no reliable magic signature; they are accepted by extension
    after rejecting NUL bytes. All other supported formats must match their
    signature or package structure before RED stores them.
    """
    extension = str(extension or "").strip().casefold()
    media_type = UPLOAD_MEDIA_TYPES.get(extension)
    if not media_type:
        raise UploadContentError("Formato no permitido.")

    if isinstance(source, Path):
        try:
            with source.open("rb") as stream:
                prefix = stream.read(4096)
        except OSError as exc:
            raise UploadContentError("No se pudo leer el archivo adjunto.") from exc
    else:
        prefix = source[:4096]
    if not prefix:
        raise UploadContentError("El archivo está vacío.")

    valid = True
    if extension == ".pdf":
        valid = prefix.startswith(b"%PDF-")
    elif extension in {".jpg", ".jpeg"}:
        valid = prefix.startswith(b"\xff\xd8\xff")
    elif extension == ".png":
        valid = prefix.startswith(b"\x89PNG\r\n\x1a\n")
    elif extension in {".heic", ".heif"}:
        valid = _valid_heif_brand(prefix)
    elif extension in {".docx", ".xlsx"}:
        valid = _valid_office_package(source, extension)
    elif extension in {".csv", ".txt"}:
        valid = not _has_nul_byte(source)

    if not valid:
        raise UploadContentError("El contenido del archivo no coincide con el formato seleccionado.")
    return media_type
