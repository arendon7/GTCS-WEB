"""Transactional aggregate limits for evidence stored by GREENATICS RED."""
from __future__ import annotations

from collections.abc import Mapping

from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from .models import EvidenceFile, EvidenceQuotaLock


def evidence_usage_by_project(session: Session) -> dict[str, int]:
    """Return the authoritative stored-byte totals, grouped by RED project."""
    rows = session.execute(
        select(EvidenceFile.project_id, func.coalesce(func.sum(EvidenceFile.size_bytes), 0))
        .group_by(EvidenceFile.project_id)
    ).all()
    return {project_id: int(size_bytes or 0) for project_id, size_bytes in rows}


def lock_and_check_evidence_capacity(
    session: Session,
    *,
    project_id: str | None = None,
    incoming_bytes: int = 0,
    incoming_by_project: Mapping[str, int] | None = None,
    total_limit_bytes: int,
    project_limit_bytes: int,
) -> None:
    """Serialize quota checks in the caller's transaction and reject over-capacity writes.

    The lock remains held until the caller commits or rolls back, so every writer
    must call this before persisting an evidence object. Usage is derived from
    ``red_evidence_files``; deletes and restores therefore cannot drift a counter.
    """
    if total_limit_bytes < 1 or project_limit_bytes < 1 or project_limit_bytes > total_limit_bytes:
        raise ValueError("La configuración de cuotas de evidencia no es válida.")
    additions = dict(incoming_by_project or {})
    if project_id is not None:
        additions[project_id] = additions.get(project_id, 0) + incoming_bytes
    if not additions or any(not isinstance(value, int) or value < 0 for value in additions.values()):
        raise ValueError("El tamaño de evidencia que se quiere guardar no es válido.")

    lock_evidence_catalog(session)

    current_by_project = evidence_usage_by_project(session)
    current_total = sum(current_by_project.values())
    requested_total = sum(additions.values())
    if current_total + requested_total > total_limit_bytes:
        raise ValueError("El espacio RED alcanzaría su límite total de evidencia; libera espacio o ajusta la cuota antes de volver a cargar.")

    for target_project, addition in additions.items():
        if current_by_project.get(target_project, 0) + addition > project_limit_bytes:
            raise ValueError("Este expediente alcanzaría su límite de evidencia; libera espacio o ajusta la cuota antes de volver a cargar.")


def lock_evidence_catalog(session: Session) -> None:
    """Serialize evidence mutations and exact-content decisions until commit."""
    connection = session.connection()
    dialect = connection.dialect.name
    table = EvidenceQuotaLock.__table__
    if dialect == "sqlite":
        session.execute(sqlite_insert(table).values(id=1, generation=0).on_conflict_do_nothing(index_elements=[table.c.id]))
    elif dialect == "postgresql":
        session.execute(pg_insert(table).values(id=1, generation=0).on_conflict_do_nothing(index_elements=[table.c.id]))
    else:
        raise ValueError(f"La cuota de evidencia no soporta el motor SQL {dialect!r}; usa SQLite o PostgreSQL.")
    session.execute(update(EvidenceQuotaLock).where(EvidenceQuotaLock.id == 1).values(
        generation=EvidenceQuotaLock.generation + 1,
    ))

