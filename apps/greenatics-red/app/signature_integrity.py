from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from typing import Any


def pmirs_document_sha256(version: Mapping[str, Any] | object) -> str:
    """Fingerprint the immutable PMIRS version content used by signing and restore."""
    if isinstance(version, Mapping):
        value = version.get
    else:
        value = lambda key, default=None: getattr(version, key, default)

    snapshot = value("snapshot") or {}
    if not isinstance(snapshot, dict):
        raise ValueError("La captura de versión PMIRS no tiene una estructura válida.")
    project = snapshot.get("project", {})
    if not isinstance(project, dict):
        raise ValueError("La identidad de proyecto en la versión PMIRS no es válida.")
    material = {
        "version_id": value("id"), "version_label": value("version_label"),
        "project": project, "snapshot": snapshot,
        "change_summary": value("change_summary"), "change_reason": value("change_reason"),
        "baseline_reference": value("baseline_reference"),
    }
    canonical = json.dumps(material, ensure_ascii=False, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def form_record_document_snapshot(
    project: Mapping[str, Any] | object,
    record: Mapping[str, Any] | object,
    evidence: list[Mapping[str, Any] | object] | None = None,
) -> dict[str, Any]:
    """Capture the exact form-record revision and its project/evidence context."""
    def value(row: Mapping[str, Any] | object, key: str, default: Any = None) -> Any:
        if isinstance(row, Mapping):
            return row.get(key, default)
        return getattr(row, key, default)

    material = {
        "project": {
            "id": value(project, "id"), "name": value(project, "name"),
            "municipality": value(project, "municipality"), "department": value(project, "department"),
        },
        "record": {
            "id": value(record, "id"), "form_code": value(record, "form_code"),
            "title": value(record, "title"), "record_date": value(record, "record_date"),
            "source_kind": value(record, "source_kind"), "source_note": value(record, "source_note"),
            "payload": value(record, "payload") or {}, "version": value(record, "version"),
            "status": value(record, "status"), "review_note": value(record, "review_note"),
        },
        "evidence": [
            {
                "id": value(item, "id"), "field_id": value(item, "field_id"),
                "original_name": value(item, "original_name"), "sha256": value(item, "sha256"),
                "size_bytes": value(item, "size_bytes"),
            }
            for item in sorted(evidence or [], key=lambda row: value(row, "id", ""))
        ],
    }
    return material


def form_record_snapshot_sha256(snapshot: Mapping[str, Any]) -> str:
    """Fingerprint a previously captured form document snapshot."""
    canonical = json.dumps(snapshot, ensure_ascii=False, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def form_record_document_sha256(
    project: Mapping[str, Any] | object,
    record: Mapping[str, Any] | object,
    evidence: list[Mapping[str, Any] | object] | None = None,
) -> str:
    """Fingerprint the exact form-record revision and its project/evidence context."""
    return form_record_snapshot_sha256(form_record_document_snapshot(project, record, evidence))
