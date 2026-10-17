from __future__ import annotations

import io
import hashlib
import json
import os
import re
import stat
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Barrier

import pytest

from app.storage import StorageError, StorageService


class MissingObject(Exception):
    response = {"Error": {"Code": "404"}}


class FakeS3Client:
    def __init__(self):
        self.objects: dict[tuple[str, str], tuple[bytes, str]] = {}
        self.presigned: dict | None = None

    def put_object(self, *, Bucket, Key, Body, ContentType):
        self.objects[(Bucket, Key)] = (bytes(Body), ContentType)

    def upload_file(self, filename, bucket, key, ExtraArgs):
        self.objects[(bucket, key)] = (Path(filename).read_bytes(), ExtraArgs["ContentType"])

    def get_object(self, *, Bucket, Key):
        try:
            body, content_type = self.objects[(Bucket, Key)]
        except KeyError as exc:
            raise MissingObject from exc
        return {"Body": io.BytesIO(body), "ContentType": content_type}

    def head_object(self, *, Bucket, Key):
        if (Bucket, Key) not in self.objects:
            raise MissingObject
        return {"ContentLength": len(self.objects[(Bucket, Key)][0])}

    def head_bucket(self, *, Bucket):
        return {"ResponseMetadata": {"HTTPStatusCode": 200}}

    def delete_object(self, *, Bucket, Key):
        self.objects.pop((Bucket, Key), None)

    def copy_object(self, *, Bucket, Key, CopySource):
        source = (CopySource["Bucket"], CopySource["Key"])
        self.objects[(Bucket, Key)] = self.objects[source]

    def generate_presigned_url(self, operation, *, Params, ExpiresIn):
        self.presigned = {"operation": operation, "params": Params, "expires": ExpiresIn}
        return "https://private-storage.test/signed"


def test_s3_storage_upload_download_presign_and_quarantine(tmp_path):
    client = FakeS3Client()
    storage = StorageService(backend="s3", bucket="red-private", s3_client=client)
    storage.health_check()
    upload = tmp_path / "evidence.pdf"
    upload.write_bytes(b"evidence contents")

    storage.put_file("evidence/file.pdf", upload, "application/pdf")
    assert storage.exists("evidence/file.pdf")
    assert storage.checksum("evidence/file.pdf") == (len(b"evidence contents"), hashlib.sha256(b"evidence contents").hexdigest())
    assert storage.get_bytes("evidence/file.pdf") == b"evidence contents"

    url = storage.presigned_download_url("evidence/file.pdf", "evidencia con espacio.pdf")
    assert url == "https://private-storage.test/signed"
    assert client.presigned == {
        "operation": "get_object",
        "params": {
            "Bucket": "red-private",
            "Key": "evidence/file.pdf",
            "ResponseContentType": "application/octet-stream",
            "ResponseContentDisposition": "attachment; filename*=UTF-8''evidencia%20con%20espacio.pdf",
        },
        "expires": 300,
    }

    quarantined = storage.quarantine("evidence/file.pdf")
    assert quarantined is not None
    assert not storage.exists("evidence/file.pdf")
    assert storage.exists(quarantined)
    storage.restore_quarantined(quarantined, "evidence/file.pdf")
    assert storage.get_bytes("evidence/file.pdf") == b"evidence contents"


def test_local_storage_checksum_streams_file_without_get_bytes(tmp_path, monkeypatch):
    storage = StorageService(backend="local", local_root=tmp_path / "private")
    source = tmp_path / "checksum.bin"
    payload = b"synthetic checksum payload" * 100
    source.write_bytes(payload)
    storage.put_file("evidence/checksum.bin", source, "application/octet-stream")

    def get_bytes_must_not_be_used(_key):
        pytest.fail("checksum cargó el archivo completo mediante get_bytes.")

    monkeypatch.setattr(storage, "get_bytes", get_bytes_must_not_be_used)
    assert storage.checksum("evidence/checksum.bin") == (len(payload), hashlib.sha256(payload).hexdigest())

    quarantined = storage.quarantine("evidence/file.pdf")
    storage.delete(quarantined)
    assert not storage.exists("evidence/file.pdf")


def test_storage_rejects_traversal_keys(tmp_path):
    storage = StorageService(backend="local", local_root=tmp_path / "private")
    for key in ("", ".", "../secret", "evidence/../../secret", "evidence//secret", "evidence/\x00name"):
        with pytest.raises(StorageError):
            storage.normalize_key(key)


@pytest.mark.skipif(os.name != "posix", reason="Los permisos POSIX no aplican en esta plataforma")
def test_local_storage_keeps_evidence_directories_and_files_private(tmp_path):
    root = tmp_path / "private-storage"
    root.mkdir(mode=0o755)
    root.chmod(0o755)
    storage = StorageService(backend="local", local_root=root)
    source = tmp_path / "evidence-source.txt"
    source.write_bytes(b"synthetic private evidence")

    storage.put_bytes("evidence/from-bytes.txt", b"synthetic bytes")
    storage.put_file("evidence/from-file.txt", source, "text/plain")

    assert stat.S_IMODE(root.stat().st_mode) == 0o700
    assert stat.S_IMODE((root / "evidence").stat().st_mode) == 0o700
    assert stat.S_IMODE((root / "evidence/from-bytes.txt").stat().st_mode) == 0o600
    assert stat.S_IMODE((root / "evidence/from-file.txt").stat().st_mode) == 0o600
    storage.health_check()

    root.chmod(0o755)
    with pytest.raises(StorageError, match="limitado a la cuenta del servicio"):
        storage.health_check()


def test_backup_archive_reads_evidence_through_s3_adapter(workspace):
    from app.backups import build_backup_archive, verify_backup_archive
    from app.db import SessionLocal
    from app.models import EvidenceFile

    client = FakeS3Client()
    storage = StorageService(backend="s3", bucket="red-private", s3_client=client)
    blob = b"synthetic private evidence"
    storage_name = "s3-proof.txt"
    storage.put_bytes(f"evidence/{storage_name}", blob, "text/plain")
    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None, original_name="s3-proof.txt",
            storage_name=storage_name, media_type="text/plain", size_bytes=len(blob),
            sha256=hashlib.sha256(blob).hexdigest(), created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()
        archive_bytes, counts = build_backup_archive(session, storage_service=storage)

    manifest = verify_backup_archive(archive_bytes)
    assert manifest["counts"]["evidence_files"] == counts["evidence_files"] == 1
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        snapshot = json.loads(archive.read("database.json"))
        assert snapshot["evidence"][0]["storage_name"] == storage_name
        assert archive.read(f"evidence/{storage_name}") == blob


def test_backup_restore_writes_evidence_through_s3_adapter(tmp_path, workspace):
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import sessionmaker

    from app.backups import build_backup_archive, restore_backup_archive
    from app.db import Base, SessionLocal
    from app.models import EvidenceFile, OperationalReference, new_id

    source_client = FakeS3Client()
    source_storage = StorageService(backend="s3", bucket="red-source", s3_client=source_client)
    target_client = FakeS3Client()
    target_storage = StorageService(backend="s3", bucket="red-target", s3_client=target_client)
    blob = b"evidence restored to private object storage"
    storage_name = "restore-s3-proof.txt"
    reference_id = new_id()
    source_storage.put_bytes(f"evidence/{storage_name}", blob, "text/plain")
    with SessionLocal() as source:
        evidence = EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None, original_name=storage_name,
            field_id=f"operational-reference:{reference_id}", storage_name=storage_name, media_type="text/plain", size_bytes=len(blob),
            sha256=hashlib.sha256(blob).hexdigest(), created_by=workspace["user_ids"]["admin"],
        )
        source.add(evidence)
        source.flush()
        source.add(OperationalReference(
            id=reference_id, project_id=workspace["project_ids"][0], category="guia_operativa",
            title="Guía sintética de respaldo", version_label="v1", status="pendiente_revision",
            source_note="Documento sintético para verificar copia y restauración.", review_note="",
            evidence_id=evidence.id, created_by=workspace["user_ids"]["admin"],
        ))
        source.commit()
        archive_bytes, _counts = build_backup_archive(source, storage_service=source_storage)

    target_engine = create_engine(
        f"sqlite:///{tmp_path / 'restored-s3.sqlite3'}", connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    result = restore_backup_archive(
        archive_bytes,
        admin_email="recovery@red.test",
        admin_name="Administradora recuperada",
        admin_password="New-Synthetic-Admin-Password-2026",
        session_factory=target_sessions,
        target_engine=target_engine,
        storage_service=target_storage,
    )
    assert result["counts"]["evidence_files"] == 1
    assert result["counts"]["operational_references"] == 1
    assert target_storage.get_bytes(f"evidence/{storage_name}") == blob
    with target_sessions() as restored:
        evidence = restored.scalar(select(EvidenceFile).where(EvidenceFile.storage_name == storage_name))
        assert evidence is not None
        assert evidence.sha256 == hashlib.sha256(blob).hexdigest()
        reference = restored.scalar(select(OperationalReference).where(OperationalReference.evidence_id == evidence.id))
        assert reference is not None
        assert reference.title == "Guía sintética de respaldo"
        assert reference.status == "pendiente_revision"


def test_backup_restore_rejects_corrupt_destination_evidence_and_rolls_back(tmp_path, workspace):
    from sqlalchemy import create_engine, func, select
    from sqlalchemy.orm import sessionmaker

    from app.backups import build_backup_archive, restore_backup_archive
    from app.db import Base, SessionLocal
    from app.models import AuditEvent, EvidenceFile, Project, User

    class CorruptingS3Client(FakeS3Client):
        def upload_file(self, filename, bucket, key, ExtraArgs):
            self.objects[(bucket, key)] = (b"corrupted destination bytes", ExtraArgs["ContentType"])

    source_storage = StorageService(backend="local", local_root=tmp_path / "source-private")
    target_storage = StorageService(
        backend="s3", bucket="red-restore-target", s3_client=CorruptingS3Client(),
    )
    evidence_name = "restore-integrity-proof.txt"
    evidence_blob = b"synthetic evidence that must survive restoration unchanged"
    source_storage.put_bytes(f"evidence/{evidence_name}", evidence_blob, "text/plain")

    with SessionLocal() as source:
        source.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None,
            original_name=evidence_name, storage_name=evidence_name,
            media_type="text/plain", size_bytes=len(evidence_blob),
            sha256=hashlib.sha256(evidence_blob).hexdigest(),
            created_by=workspace["user_ids"]["admin"],
        ))
        source.commit()
        archive_bytes, _counts = build_backup_archive(source, storage_service=source_storage)

    target_engine = create_engine(
        f"sqlite:///{tmp_path / 'corrupt-restore-target.sqlite3'}", connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)

    with pytest.raises(ValueError, match="no conserva su integridad en el almacenamiento de destino"):
        restore_backup_archive(
            archive_bytes,
            admin_email="recovery@red.test",
            admin_name="Administradora recuperada",
            admin_password="New-Synthetic-Admin-Password-2026",
            session_factory=target_sessions,
            target_engine=target_engine,
            storage_service=target_storage,
        )

    assert not target_storage.exists(f"evidence/{evidence_name}")
    with target_sessions() as target:
        assert target.scalar(select(func.count()).select_from(User)) == 0
        assert target.scalar(select(func.count()).select_from(Project)) == 0
        assert target.scalar(select(func.count()).select_from(AuditEvent)) == 0
    target_engine.dispose()


def test_concurrent_backup_restores_do_not_delete_successful_evidence(tmp_path, workspace):
    from sqlalchemy import create_engine, func, select
    from sqlalchemy.orm import sessionmaker

    from app.backups import build_backup_archive, restore_backup_archive
    from app.db import Base, SessionLocal
    from app.models import EvidenceFile, Project, User

    source_storage = StorageService(backend="local", local_root=tmp_path / "restore-concurrency-source")
    target_root = tmp_path / "restore-concurrency-target-files"
    evidence_name = "concurrent-restore-proof.txt"
    evidence_blob = b"synthetic evidence kept intact by serialized restore"
    source_storage.put_bytes(f"evidence/{evidence_name}", evidence_blob, "text/plain")
    with SessionLocal() as source:
        source.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None,
            original_name=evidence_name, storage_name=evidence_name,
            media_type="text/plain", size_bytes=len(evidence_blob),
            sha256=hashlib.sha256(evidence_blob).hexdigest(),
            created_by=workspace["user_ids"]["admin"],
        ))
        source.commit()
        archive_bytes, _counts = build_backup_archive(source, storage_service=source_storage)

    target_engine = create_engine(
        f"sqlite:///{tmp_path / 'concurrent-restore-target.sqlite3'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    start_together = Barrier(2)

    def restore_once(_index):
        start_together.wait()
        try:
            result = restore_backup_archive(
                archive_bytes,
                admin_email="recovery@red.test",
                admin_name="Administradora recuperada",
                admin_password="New-Synthetic-Admin-Password-2026",
                session_factory=target_sessions,
                target_engine=target_engine,
                storage_root=target_root,
            )
            return ("restored", result)
        except ValueError as exc:
            return ("rejected", str(exc))

    with ThreadPoolExecutor(max_workers=2) as pool:
        outcomes = list(pool.map(restore_once, range(2)))

    assert sorted(kind for kind, _value in outcomes) == ["rejected", "restored"]
    rejected_message = next(value for kind, value in outcomes if kind == "rejected")
    assert "La base de destino contiene datos RED" in rejected_message
    restored_storage = StorageService(backend="local", local_root=target_root)
    assert restored_storage.get_bytes(f"evidence/{evidence_name}") == evidence_blob
    with target_sessions() as target:
        assert target.scalar(select(func.count()).select_from(User)) == 6
        assert target.scalar(select(func.count()).select_from(Project)) == 4
    target_engine.dispose()


def test_restore_refuses_to_merge_an_existing_privacy_case(tmp_path, workspace):
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import sessionmaker

    from app.backups import build_backup_archive, restore_backup_archive
    from app.db import Base, SessionLocal
    from app.models import PrivacyCase, User, new_id

    with SessionLocal() as source:
        archive_bytes, _counts = build_backup_archive(source)

    target_engine = create_engine(
        f"sqlite:///{tmp_path / 'restore-with-privacy-case.sqlite3'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    owner_id = new_id()
    case_id = new_id()
    with target_sessions() as target:
        target.add(User(
            id=owner_id, email="privacy-owner@red.test", full_name="Responsable sintético",
            password_hash="disabled$synthetic", is_platform_admin=True, active=False,
        ))
        target.add(PrivacyCase(
            id=case_id, case_type="consulta", project_scope="red_global", project_id=None,
            classification="consulta", identity_status="no_aplica", status="recibida",
            received_on="2026-10-11", external_reference="RAD-RED-001", target_response_on="",
            target_rule_reference="", response_on="", response_reference="",
            owner_user_id=owner_id, created_by=owner_id, updated_by=owner_id,
        ))
        target.commit()

    with pytest.raises(ValueError, match="red_privacy_cases"):
        restore_backup_archive(
            archive_bytes, admin_email="recovery@red.test", admin_name="Administradora recuperada",
            admin_password="New-Synthetic-Admin-Password-2026",
            session_factory=target_sessions, target_engine=target_engine,
        )

    with target_sessions() as target:
        preserved = target.get(PrivacyCase, case_id)
        assert preserved is not None and preserved.external_reference == "RAD-RED-001"
        assert target.scalar(select(User).where(User.id == owner_id)) is not None
    target_engine.dispose()


def test_restore_lock_selects_database_specific_serialization():
    from types import SimpleNamespace

    from app.backups import _acquire_restore_lock

    class FakeConnection:
        def __init__(self, dialect_name):
            self.dialect = SimpleNamespace(name=dialect_name)
            self.statements = []

        def exec_driver_sql(self, statement):
            self.statements.append(statement)

    class FakeSession:
        def __init__(self, connection):
            self._connection = connection

        def connection(self):
            return self._connection

    sqlite_connection = FakeConnection("sqlite")
    _acquire_restore_lock(FakeSession(sqlite_connection))
    assert sqlite_connection.statements == ["BEGIN IMMEDIATE"]

    postgres_connection = FakeConnection("postgresql")
    _acquire_restore_lock(FakeSession(postgres_connection))
    assert postgres_connection.statements == [
        "SET TRANSACTION ISOLATION LEVEL READ COMMITTED",
        "SELECT pg_advisory_xact_lock(5139246288751121481)",
    ]

    unsupported_connection = FakeConnection("mysql")
    with pytest.raises(ValueError, match="no soporta el motor SQL"):
        _acquire_restore_lock(FakeSession(unsupported_connection))


def test_form_upload_and_authorized_download_use_s3_adapter(client, workspace, monkeypatch):
    from app import main
    from app.db import SessionLocal
    from app.models import AuditEvent, EvidenceFile
    from conftest import PASSWORD
    from sqlalchemy import select

    s3_client = FakeS3Client()
    evidence_storage = StorageService(backend="s3", bucket="red-private", s3_client=s3_client)
    monkeypatch.setattr(main, "storage", evidence_storage)

    login = client.get("/login")
    csrf_match = re.search(r'name="csrf" value="([^"]+)"', login.text)
    assert csrf_match
    signed_in = client.post(
        "/login",
        data={"email": "field@red.test", "password": PASSWORD, "csrf": csrf_match.group(1)},
        follow_redirects=False,
    )
    assert signed_in.status_code == 303

    project_id = workspace["project_ids"][0]
    form_path = f"/projects/{project_id}/records/new?form_code=D-07"
    form = client.get(form_path)
    form_csrf = re.search(r'name="csrf" value="([^"]+)"', form.text)
    assert form.status_code == 200 and form_csrf
    response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": form_csrf.group(1), "form_code": "D-07", "record_title": "Captura sintética S3",
            "record_date": "2026-10-08", "source_kind": "medido",
            "source_note": "Carga sintética usada para comprobar almacenamiento remoto privado.",
            "action": "draft",
        },
        files={"evidence__D07-010": ("bascula.jpg", b"\xff\xd8\xffsynthetic image bytes", "image/jpeg")},
        follow_redirects=False,
    )
    assert response.status_code == 303
    with SessionLocal() as session:
        evidence = session.scalar(select(EvidenceFile).where(EvidenceFile.project_id == project_id))
        assert evidence is not None and evidence.field_id == "D07-010"
        storage_key = f"evidence/{evidence.storage_name}"
        evidence_id = evidence.id
    assert s3_client.objects[("red-private", storage_key)][0] == b"\xff\xd8\xffsynthetic image bytes"

    download = client.get(f"/evidence/{evidence_id}", follow_redirects=False)
    assert download.status_code == 302
    assert download.headers["location"] == "https://private-storage.test/signed"
    assert download.headers["cache-control"] == "private, no-store"
    assert s3_client.presigned["params"]["Key"] == storage_key
    with SessionLocal() as session:
        authorization = session.scalar(select(AuditEvent).where(
            AuditEvent.action == "evidence_download_authorized",
            AuditEvent.entity_id == evidence_id,
        ))
        assert authorization is not None
