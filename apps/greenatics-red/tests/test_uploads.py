from __future__ import annotations

from io import BytesIO
import zipfile

import pytest

from app.uploads import UploadContentError, validate_upload_content


def _heif_sample(brand: bytes, compatible: tuple[bytes, ...] = ()) -> bytes:
    payload = b"ftyp" + brand + b"\x00\x00\x00\x00" + b"".join(compatible)
    return (len(payload) + 4).to_bytes(4, "big") + payload


def _office_sample(member: str) -> bytes:
    output = BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr(member, "synthetic office document")
    return output.getvalue()


@pytest.mark.parametrize(("extension", "content", "media_type"), [
    (".pdf", b"%PDF-1.7\nsynthetic", "application/pdf"),
    (".jpg", b"\xff\xd8\xffsynthetic", "image/jpeg"),
    (".jpeg", b"\xff\xd8\xffsynthetic", "image/jpeg"),
    (".png", b"\x89PNG\r\n\x1a\nsynthetic", "image/png"),
    (".heic", _heif_sample(b"heic"), "image/heic"),
    (".heif", _heif_sample(b"mif1", (b"heic",)), "image/heif"),
    (".docx", _office_sample("word/document.xml"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    (".xlsx", _office_sample("xl/workbook.xml"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    (".csv", b"tipo,peso\norganico,1.2\n", "text/csv"),
    (".txt", "evidencia sintética\n".encode(), "text/plain"),
])
def test_upload_content_returns_server_mime_for_allowed_formats(extension, content, media_type):
    assert validate_upload_content(content, extension) == media_type


@pytest.mark.parametrize(("extension", "content"), [
    (".pdf", b"<html>not a pdf</html>"),
    (".jpg", b"plain text disguised as a photo"),
    (".png", b"\x89PNG wrong-signature"),
    (".heic", b"ftypheic without a valid box header"),
    (".docx", _office_sample("xl/workbook.xml")),
    (".xlsx", b"not a zip package"),
    (".txt", b"binary\x00content"),
])
def test_upload_content_rejects_extension_and_content_mismatches(extension, content):
    with pytest.raises(UploadContentError):
        validate_upload_content(content, extension)


def test_upload_content_reads_large_file_signatures_and_text_nuls_from_path(tmp_path):
    path = tmp_path / "large-evidence.csv"
    path.write_bytes(b"header\n" + b"a" * (1024 * 1024) + b"\x00")

    with pytest.raises(UploadContentError):
        validate_upload_content(path, ".csv")


def test_upload_content_rejects_unknown_extensions():
    with pytest.raises(UploadContentError):
        validate_upload_content(b"plain", ".svg")
