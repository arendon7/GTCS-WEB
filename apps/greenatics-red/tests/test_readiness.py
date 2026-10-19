from __future__ import annotations
from conftest import rendered_decision_data, bind_synthetic_fraction_source

import csv
from concurrent.futures import ThreadPoolExecutor
import hashlib
from html.parser import HTMLParser
import io
import json
import os
import re
import secrets
import struct
import subprocess
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pytest
from pypdf import PdfReader
from starlette.datastructures import FormData
from sqlalchemy import create_engine, func, select, update
from sqlalchemy.orm import sessionmaker

from app import backups
from app import cli as app_cli
from app import main as app_main
from app.config import PROJECT_DIR, Settings, settings
from app.db import Base, SessionLocal
from app.initial_projects import BELLO_PROJECTS
from app.main import (
    FORM_CATALOG, _record_payload, apply_server_managed_fields, apply_supported_calculations,
    baseline_missing_forms, can_write_form, pmirs_document_sha256, pmirs_item_snapshot, pmirs_version_currentness,
    pmirs_version_currentness_notice, d04_container_display, d04_container_is_legacy,
    can_manage_pmirs, d04_container_rows, d08_relation_options, p01_source_checklist, pmirs_progress_options,
    project_record_export_rows, record_form_error_targets, repeatable_field_display, repeatable_field_limit_error,
    repeatable_field_rows, repeatable_field_rows_by_form, submission_errors,
    encode_multi_select_text, multi_select_context_by_form, multi_select_display,
    multi_select_selected_values, multi_select_text_detail,
    d08_source_record, gps_capture_display, gps_capture_errors, pmirs_item_snapshot, recalculate_d08_group, recalculate_q01_for_shift,
    recalculate_d14_for_visit, relation_options_by_field, relation_selection_errors, utc,
)
from app.models import (
    AuditEvent, Backup, DriveConnection, EvidenceFile, FormRecord, FormRevision, FormSignature, Invitation, LoginThrottle, PasswordReset,
    PMIRSItem, PMIRSItemRevision, PMIRSVersion, PMIRSSignature, PrivacyCase, Project, ProjectMembership,
    ProjectVisitAuthorization, User, now_utc,
)
from app.privacy_cases import validate_opaque_reference
from app.security import MAX_PASSWORD_CHARACTERS, hash_password, hash_token, verify_password
from app.storage import StorageService
from conftest import PASSWORD, PROJECT_NAMES


def csrf_for(client, path: str = "/login") -> str:
    response = client.get(path)
    assert response.status_code == 200
    match = re.search(r'name="csrf" value="([^"]+)"', response.text)
    assert match, f"No se encontró token CSRF en {path}"
    return match.group(1)


def pmirs_version_for_progress(item_id: str) -> int:
    with SessionLocal() as session:
        return session.get(PMIRSItem, item_id).version


def record_version_for_review(record_id: str) -> int:
    with SessionLocal() as session:
        return session.get(FormRecord, record_id).version


def sign_in(client, email: str, password: str = PASSWORD, *, headers: dict[str, str] | None = None) -> None:
    csrf = csrf_for(client)
    response = client.post(
        "/login",
        data={"email": email, "password": password, "csrf": csrf},
        follow_redirects=False,
        headers=headers or {},
    )
    assert response.status_code == 303
    assert response.headers["location"] == "/"


def test_shared_static_assets_use_one_current_cache_revision_across_templates():
    templates = list((PROJECT_DIR / "app" / "templates").glob("*.html"))
    stylesheet_revisions = {
        revision
        for template in templates
        for revision in re.findall(r"/static/red\.css\?v=([^\"']+)", template.read_text(encoding="utf-8"))
    }
    signature_revisions = {
        revision
        for template in templates
        for revision in re.findall(r"/static/signature-capture\.js\?v=([^\"']+)", template.read_text(encoding="utf-8"))
    }

    assert stylesheet_revisions == {"20261013-pmirs-mobile-upload2"}
    assert signature_revisions == {"20261013-retina-canvas1"}


class FormAccessibilityParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.duplicate_ids = set()
        self.labels_for = set()
        self.controls = []
        self.actions = []
        self.aria_references = []
        self.label_stack = []
        self.action_stack = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.add(element_id)
            self.ids.add(element_id)
        if tag == "label":
            self.label_stack.append({"for": values.get("for"), "text": []})
            if values.get("for"):
                self.labels_for.add(values["for"])
        if tag in {"input", "select", "textarea"}:
            if tag != "input" or values.get("type", "text").lower() != "hidden":
                self.controls.append({
                    "id": values.get("id"),
                    "name": values.get("name", ""),
                    "type": values.get("type", tag),
                    "required": "required" in values,
                    "aria_label": values.get("aria-label", "").strip(),
                    "aria_labelledby": values.get("aria-labelledby", "").split(),
                    "inside_label": bool(self.label_stack),
                    "label_text": " ".join(" ".join(label["text"]) for label in self.label_stack).strip(),
                })
        if tag in {"button", "summary"} or (tag == "a" and values.get("href")) or values.get("role") == "button":
            action = {
                "tag": tag,
                "aria_label": values.get("aria-label", "").strip(),
                "aria_labelledby": values.get("aria-labelledby", "").split(),
                "title": values.get("title", "").strip(),
                "text": [],
            }
            self.actions.append(action)
            self.action_stack.append((tag, action))
        for attribute in ("aria-labelledby", "aria-describedby"):
            if values.get(attribute):
                self.aria_references.extend((attribute, reference) for reference in values[attribute].split())

    def handle_data(self, data):
        for label in self.label_stack:
            label["text"].append(data)
        for _tag, action in self.action_stack:
            action["text"].append(data)

    def handle_endtag(self, tag):
        if tag == "label" and self.label_stack:
            self.label_stack.pop()
        if tag in {"a", "button", "summary"}:
            for index in range(len(self.action_stack) - 1, -1, -1):
                if self.action_stack[index][0] == tag:
                    self.action_stack.pop(index)
                    break


def test_main_surfaces_offer_keyboard_skip_link(client, workspace):
    login = client.get("/login")
    assert login.status_code == 200
    assert 'class="skip-link" href="#main-content"' in login.text
    assert '<main class="login-layout" id="main-content" tabindex="-1">' in login.text

    sign_in(client, "admin@red.test")
    dashboard = client.get("/")
    assert dashboard.status_code == 200
    assert 'class="skip-link" href="#main-content"' in dashboard.text
    assert '<main class="main-area" id="main-content" tabindex="-1">' in dashboard.text
    assert "Cerrar todas las sesiones" in dashboard.text

    project = client.get(f"/projects/{workspace['project_ids'][0]}")
    assert project.status_code == 200
    assert 'href="#main-content"' in project.text


def test_dashboard_shows_project_review_queues_only_to_reviewers(client, workspace):
    first_project, second_project = workspace["project_ids"][:2]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        session.add_all([
            FormRecord(project_id=first_project, form_code="D-01", title="D-01 pendiente",
                       status="PENDING_REVIEW", created_by=admin_id, updated_by=admin_id),
            FormRecord(project_id=first_project, form_code="P-12", title="P-12 no revisable",
                       status="PENDING_REVIEW", created_by=admin_id, updated_by=admin_id),
            FormRecord(project_id=second_project, form_code="D-02", title="D-02 de otro conjunto",
                       status="PENDING_REVIEW", created_by=admin_id, updated_by=admin_id),
            PMIRSItem(project_id=first_project, item_type="hallazgo", code="HAL-DASH-01",
                      title="Hallazgo pendiente", data={}, review_status="PENDING_REVIEW",
                      created_by=admin_id, updated_by=admin_id),
        ])
        session.commit()

    sign_in(client, "admin@red.test")
    dashboard = client.get("/")
    assert "Cada copropiedad tiene un expediente separado para alistar su PMIRS." in dashboard.text
    assert "el nombre oficial, la dirección y el alcance" in dashboard.text
    assert "para cotizar los primeros cuatro PMIRS" not in dashboard.text
    first_row = re.search(rf'<article class="project-row" data-project-id="{first_project}">(.*?)</article>', dashboard.text, re.S)
    second_row = re.search(rf'<article class="project-row" data-project-id="{second_project}">(.*?)</article>', dashboard.text, re.S)
    assert first_row and second_row
    assert "Alistamiento · D-01 En revisión · D-02 Sin registro" in first_row.group(1)
    assert "Alistamiento · D-01 Sin registro · D-02 En revisión" in second_row.group(1)
    assert '<strong>1</strong><small>formularios por revisar</small>' in first_row.group(1)
    assert '<strong>1</strong><small>objetos PMIRS por revisar</small>' in first_row.group(1)
    assert '<strong>1</strong><small>formularios por revisar</small>' in second_row.group(1)
    assert '<strong>0</strong><small>objetos PMIRS por revisar</small>' in second_row.group(1)

    sign_in(client, "reviewer@red.test")
    reviewer_dashboard = client.get("/")
    assert '<strong>1</strong><small>formularios por revisar</small>' in reviewer_dashboard.text
    assert '<strong>1</strong><small>objetos PMIRS por revisar</small>' in reviewer_dashboard.text

    for email in ("field@red.test", "consultant@red.test", "reader@red.test"):
        sign_in(client, email)
        role_dashboard = client.get("/")
        assert "formularios por revisar" not in role_dashboard.text
        assert "objetos PMIRS por revisar" not in role_dashboard.text


def test_field_dashboard_lists_only_validated_actions_assigned_in_accessible_projects(client, workspace):
    project_id, outside_project_id = workspace["project_ids"][:2]
    field_id = workspace["user_ids"]["field"]
    with SessionLocal() as session:
        session.add_all([
            PMIRSItem(
                project_id=project_id, item_type="accion", code="A-DASH-HIGH", title="Acción prioritaria de campo",
                data={"priority": "alta", "due_date": "2026-11-02", "progress_pct": 25,
                      "execution_status": "en_proceso", "assignee_user_ids": [field_id]},
                review_status="VALIDATED", created_by=field_id, updated_by=field_id,
            ),
            PMIRSItem(
                project_id=project_id, item_type="accion", code="A-DASH-UNASSIGNED", title="Acción no asignada",
                data={"assignee_user_ids": []}, review_status="VALIDATED", created_by=field_id, updated_by=field_id,
            ),
            PMIRSItem(
                project_id=outside_project_id, item_type="accion", code="A-DASH-OUTSIDE", title="Acción de otro expediente",
                data={"assignee_user_ids": [field_id]}, review_status="VALIDATED", created_by=field_id, updated_by=field_id,
            ),
            PMIRSItem(
                project_id=project_id, item_type="accion", code="A-DASH-PENDING", title="Acción aún no validada",
                data={"assignee_user_ids": [field_id]}, review_status="PENDING_REVIEW", created_by=field_id, updated_by=field_id,
            ),
        ])
        session.commit()

    sign_in(client, "field@red.test")
    dashboard = client.get("/")
    assert "Mis acciones asignadas" in dashboard.text
    assert "Acción prioritaria de campo" in dashboard.text
    assert "Prioridad alta · Fecha objetivo 2026-11-02 · 25% · En Proceso" in dashboard.text
    assert f'href="/projects/{project_id}/pmirs#action-' in dashboard.text
    assert "Acción no asignada" not in dashboard.text
    assert "Acción de otro expediente" not in dashboard.text
    assert "Acción aún no validada" not in dashboard.text


def test_dashboard_shows_baseline_and_visit_gates_per_project_without_crossing_data(client, workspace):
    project_ids = workspace["project_ids"]
    with SessionLocal() as session:
        authorizations = list(session.scalars(select(ProjectVisitAuthorization).where(
            ProjectVisitAuthorization.project_id.in_(project_ids),
        )))
        by_project = {authorization.project_id: authorization for authorization in authorizations}
        by_project[project_ids[1]].status = "revoked"
        by_project[project_ids[1]].revoked_at = now_utc()
        by_project[project_ids[1]].revoked_by = workspace["user_ids"]["admin"]
        session.delete(by_project[project_ids[2]])
        by_project[project_ids[3]].valid_until = date(2000, 1, 1)
        session.commit()

    sign_in(client, "admin@red.test")
    dashboard = client.get("/")
    rows = {
        project_id: re.search(
            rf'<article class="project-row" data-project-id="{project_id}">(.*?)</article>', dashboard.text, re.S,
        )
        for project_id in project_ids
    }
    assert all(rows.values())
    for row in rows.values():
        assert "Línea Base · Pendiente · faltan D-01, D-02, D-06, D-07, D-08, Q-01" in row.group(1)
    assert "Visita · Control RED registrado hasta 2099-12-31" in rows[project_ids[0]].group(1)
    assert "confirma que los soportes externos sigan vigentes" in rows[project_ids[0]].group(1)
    assert "Visita · Revocado" in rows[project_ids[1]].group(1)
    assert "Visita · Sin registro RED" in rows[project_ids[2]].group(1)
    assert "Visita · Vencido" in rows[project_ids[3]].group(1)
    for row in rows.values():
        assert "SYNTHACCESS" not in row.group(1)

    sign_in(client, "consultant@red.test")
    scoped_dashboard = client.get("/")
    assert project_ids[0] in scoped_dashboard.text
    assert all(project_id not in scoped_dashboard.text for project_id in project_ids[1:])
    assert "Línea Base · Pendiente" in scoped_dashboard.text


def test_bello_projects_keep_the_order_supplied_for_the_four_pmirs(client, workspace):
    assert app_cli.seed_bello_projects() == 0
    with SessionLocal() as session:
        seeded_ids = {
            slug: session.scalar(select(Project).where(Project.slug == slug)).id
            for slug, _name in BELLO_PROJECTS
        }
    sign_in(client, "admin@red.test")
    dashboard = client.get("/")
    visible_project_ids = re.findall(r'<article class="project-row" data-project-id="([^"]+)">', dashboard.text)
    assert all(project_id in visible_project_ids for project_id in workspace["project_ids"])
    assert [project_id for project_id in visible_project_ids if project_id in seeded_ids.values()] == [
        seeded_ids[slug] for slug, _name in BELLO_PROJECTS
    ]
    users_page = client.get("/admin/users")
    project_options = re.findall(r'<option value="[^"]+">([^<]+)</option>', users_page.text)
    ordered_names = [name for _slug, name in BELLO_PROJECTS]
    assert [name for name in project_options if name in ordered_names] == ordered_names


def test_dashboard_offers_role_aware_start_and_resume_links_for_setup_forms(client, workspace):
    project_id = workspace["project_ids"][0]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        d01 = FormRecord(
            project_id=project_id, form_code="D-01", title="D-01 borrador",
            status="RAW", created_by=admin_id, updated_by=admin_id,
        )
        d02 = FormRecord(
            project_id=project_id, form_code="D-02", title="D-02 con correcciones",
            status="CORRECTION_REQUESTED", created_by=admin_id, updated_by=admin_id,
        )
        session.add_all([d01, d02])
        session.commit()
        d01_id, d02_id = d01.id, d02.id

    sign_in(client, "admin@red.test")
    dashboard = client.get("/")
    row = re.search(
        rf'<article class="project-row" data-project-id="{project_id}">(.*?)</article>',
        dashboard.text, re.S,
    )
    assert row
    assert f'href="/records/{d01_id}">Continuar D-01</a>' in row.group(1)
    assert f'href="/records/{d02_id}">Corregir D-02</a>' in row.group(1)
    empty_project = workspace["project_ids"][1]
    empty_row = re.search(
        rf'<article class="project-row" data-project-id="{empty_project}">(.*?)</article>',
        dashboard.text, re.S,
    )
    assert empty_row
    assert f'href="/projects/{empty_project}/records/new?form_code=D-01">Iniciar D-01</a>' in empty_row.group(1)
    assert f'href="/projects/{empty_project}/records/new?form_code=D-02">Iniciar D-02</a>' in empty_row.group(1)

    sign_in(client, "field@red.test")
    field_dashboard = client.get("/")
    assert "Iniciar D-01" not in field_dashboard.text
    assert "Iniciar D-02" not in field_dashboard.text

    sign_in(client, "reader@red.test")
    reader_dashboard = client.get("/")
    assert "Iniciar D-01" not in reader_dashboard.text
    assert "Iniciar D-02" not in reader_dashboard.text


def test_new_form_offers_resume_link_for_current_users_unfinished_record(client, workspace):
    project_id = workspace["project_ids"][0]
    field_id = workspace["user_ids"]["field"]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        own_draft = FormRecord(
            project_id=project_id, form_code="D-06", title="D-06 borrador propio",
            status="RAW", created_by=field_id, updated_by=field_id,
        )
        own_review = FormRecord(
            project_id=project_id, form_code="D-07", title="D-07 pendiente propio",
            status="PENDING_REVIEW", created_by=field_id, updated_by=field_id,
        )
        other_draft = FormRecord(
            project_id=project_id, form_code="D-08", title="D-08 borrador de administración",
            status="RAW", created_by=admin_id, updated_by=admin_id,
        )
        session.add_all([own_draft, own_review, other_draft])
        session.commit()
        own_draft_id, own_review_id = own_draft.id, own_review.id
        other_draft_id = other_draft.id

    sign_in(client, "field@red.test")
    draft_page = client.get(f"/projects/{project_id}/records/new?form_code=D-06")
    assert draft_page.status_code == 200
    assert "Ya tienes un borrador de este formulario sin enviar." in draft_page.text
    if settings.operational_writes_enabled:
        assert f'href="/records/{own_draft_id}/edit">Continuar borrador</a>' in draft_page.text
    else:
        assert f'href="/records/{own_draft_id}">Consultar registro</a>' in draft_page.text

    review_page = client.get(f"/projects/{project_id}/records/new?form_code=D-07")
    assert review_page.status_code == 200
    assert "pendiente de revisión" in review_page.text
    assert f'href="/records/{own_review_id}">Consultar registro</a>' in review_page.text

    other_user_page = client.get(f"/projects/{project_id}/records/new?form_code=D-08")
    assert other_user_page.status_code == 200
    assert "resume-record-notice" not in other_user_page.text
    assert f"/records/{other_draft_id}" not in other_user_page.text


def test_privacy_case_log_is_admin_only_and_discloses_its_boundaries(client, workspace):
    sign_in(client, "admin@red.test")
    page = client.get("/admin/privacy")
    assert page.status_code == 200
    assert "Registro mínimo, no canal de atención" in page.text
    assert "RED no clasifica jurídicamente, calcula términos legales" in page.text
    assert "La aprobación del aviso, responsables, canal, política de retención" in page.text
    assert "Registrar recepción" in page.text
    assert 'href="/admin/privacy"' in page.text
    parser = FormAccessibilityParser()
    parser.feed(page.text)
    assert not parser.duplicate_ids
    missing_names = [control for control in parser.controls
        if not control["aria_label"] and not control["aria_labelledby"]
        and not (control["inside_label"] and control["label_text"])
        and control["id"] not in parser.labels_for]
    assert not missing_names

    sign_in(client, "field@red.test")
    assert client.get("/admin/privacy").status_code == 403


def test_privacy_case_queue_paginates_without_truncating_older_cases(client, workspace):
    created_at = now_utc()
    with SessionLocal() as session:
        for index in range(26):
            case_id = f"{index:08x}-0000-0000-0000-000000000000"
            session.add(PrivacyCase(
                id=case_id,
                case_type="consulta",
                project_scope="red_global",
                classification="pendiente",
                identity_status="pendiente",
                status="recibida",
                received_on="2026-10-01",
                external_reference=f"PAGE-2026-{index:03d}",
                owner_user_id=workspace["user_ids"]["admin"],
                created_by=workspace["user_ids"]["admin"],
                updated_by=workspace["user_ids"]["admin"],
                created_at=created_at - timedelta(days=index),
                updated_at=created_at - timedelta(days=index),
            ))
        session.commit()

    sign_in(client, "admin@red.test")
    recent = client.get("/admin/privacy")
    assert recent.status_code == 200
    assert "26 solicitudes" in recent.text and "página 1 de 2" in recent.text
    assert "PAGE-2026-000" in recent.text and "PAGE-2026-024" in recent.text
    assert "PAGE-2026-025" not in recent.text
    assert 'rel="next" href="/admin/privacy?page=2"' in recent.text

    older = client.get("/admin/privacy?page=2")
    assert older.status_code == 200
    assert "PAGE-2026-025" in older.text and "PAGE-2026-000" not in older.text
    assert 'rel="prev" href="/admin/privacy?page=1"' in older.text

    out_of_range = client.get("/admin/privacy?page=999")
    assert out_of_range.status_code == 200
    assert "página 2 de 2" in out_of_range.text
    assert "PAGE-2026-025" in out_of_range.text


def test_privacy_case_log_rejects_identity_data_and_respects_write_gate(client, workspace, monkeypatch):
    sign_in(client, "admin@red.test")
    csrf = csrf_for(client, "/admin/privacy")
    common = {
        "csrf": csrf, "case_type": "consulta", "project_scope": "un_proyecto",
        "project_id": workspace["project_ids"][0], "received_on": "2026-10-10",
        "owner_user_id": workspace["user_ids"]["admin"],
    }
    invalid_reference = client.post("/admin/privacy", data={**common, "external_reference": "persona@example.com"})
    assert invalid_reference.status_code == 422
    with SessionLocal() as session:
        assert session.scalar(select(func.count(PrivacyCase.id))) == 0

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "false")
    blocked = client.post("/admin/privacy", data={**common, "external_reference": "RAD-2026-014"})
    assert blocked.status_code == 503
    with SessionLocal() as session:
        assert session.scalar(select(func.count(PrivacyCase.id))) == 0


def test_privacy_case_lifecycle_requires_human_classification_and_external_response_reference(client, workspace):
    sign_in(client, "admin@red.test")
    csrf = csrf_for(client, "/admin/privacy")
    created = client.post("/admin/privacy", data={
        "csrf": csrf, "case_type": "consulta", "project_scope": "un_proyecto",
        "project_id": workspace["project_ids"][0], "received_on": "2026-10-10",
        "external_reference": "RAD-2026-014", "owner_user_id": workspace["user_ids"]["admin"],
    }, follow_redirects=False)
    assert created.status_code == 303
    with SessionLocal() as session:
        case = session.scalar(select(PrivacyCase))
        case_id = case.id
        assert case.external_reference == "RAD-2026-014"
        events = list(session.scalars(select(AuditEvent).where(AuditEvent.entity_type == "privacy_case")))
        assert len(events) == 1 and "RAD-2026-014" not in str(events[0].detail)

    path = f"/admin/privacy/{case_id}"
    pending_classification = client.post(path, data={
        "csrf": csrf, "classification": "pendiente", "identity_status": "pendiente",
        "status": "analisis", "owner_user_id": workspace["user_ids"]["admin"],
        "target_response_on": "2026-10-20", "target_rule_reference": "RULE-2026-01",
    })
    assert pending_classification.status_code == 422

    analysis = client.post(path, data={
        "csrf": csrf, "classification": "consulta", "identity_status": "verificada",
        "status": "analisis", "owner_user_id": workspace["user_ids"]["admin"],
        "target_response_on": "2026-10-20", "target_rule_reference": "RULE-2026-01",
    }, follow_redirects=False)
    assert analysis.status_code == 303
    repeated_analysis = client.post(path, data={
        "csrf": csrf, "classification": "consulta", "identity_status": "verificada",
        "status": "analisis", "owner_user_id": workspace["user_ids"]["admin"],
        "target_response_on": "2026-10-20", "target_rule_reference": "RULE-2026-01",
    }, follow_redirects=False)
    assert repeated_analysis.status_code == 303
    prepared = client.post(path, data={
        "csrf": csrf, "classification": "consulta", "identity_status": "verificada",
        "status": "respuesta_preparacion", "owner_user_id": workspace["user_ids"]["admin"],
        "target_response_on": "2026-10-20", "target_rule_reference": "RULE-2026-01",
    }, follow_redirects=False)
    assert prepared.status_code == 303
    missing_response_ref = client.post(path, data={
        "csrf": csrf, "classification": "consulta", "identity_status": "verificada",
        "status": "respuesta_enviada", "owner_user_id": workspace["user_ids"]["admin"],
        "response_on": "2026-10-10", "response_reference": "",
    })
    assert missing_response_ref.status_code == 422
    sent = client.post(path, data={
        "csrf": csrf, "classification": "consulta", "identity_status": "verificada",
        "status": "respuesta_enviada", "owner_user_id": workspace["user_ids"]["admin"],
        "target_response_on": "2026-10-20", "target_rule_reference": "RULE-2026-01",
        "response_on": "2026-10-10", "response_reference": "OUT-2026-008",
    }, follow_redirects=False)
    assert sent.status_code == 303
    closed = client.post(path, data={
        "csrf": csrf, "classification": "consulta", "identity_status": "verificada",
        "status": "cerrada", "owner_user_id": workspace["user_ids"]["admin"],
        "target_response_on": "2026-10-20", "target_rule_reference": "RULE-2026-01",
        "response_on": "2026-10-10", "response_reference": "OUT-2026-008",
    }, follow_redirects=False)
    assert closed.status_code == 303
    with SessionLocal() as session:
        saved = session.get(PrivacyCase, case_id)
        assert saved.status == "cerrada" and saved.identity_status == "verificada"
        assert saved.response_reference == "OUT-2026-008"
        history = list(session.scalars(select(AuditEvent).where(
            AuditEvent.entity_type == "privacy_case", AuditEvent.entity_id == case_id,
        ).order_by(AuditEvent.created_at)))
        assert len(history) == 5
        assert "OUT-2026-008" not in str([event.detail for event in history])
        assert "RULE-2026-01" not in str([event.detail for event in history])
        assert history[1].detail["from_status"] == "recibida"
        assert history[-1].detail["from_status"] == "respuesta_enviada"
    history_page = client.get("/admin/privacy")
    assert "Historial de cambios (5)" in history_page.text
    assert "Clasificación humana modificada" in history_page.text
    assert "Verificación modificada" in history_page.text
    assert "En análisis" in history_page.text and "Cerrada por revisión humana" in history_page.text


def test_privacy_case_backup_is_versioned_and_rejects_unexpected_identity_fields(client, workspace):
    with SessionLocal() as session:
        case = PrivacyCase(
            case_type="consulta", project_scope="un_proyecto", project_id=workspace["project_ids"][0],
            classification="consulta", identity_status="verificada", status="respuesta_enviada",
            received_on="2026-10-10", external_reference="RAD-2026-014",
            response_on="2026-10-11", response_reference="OUT-2026-008",
            owner_user_id=workspace["user_ids"]["admin"], created_by=workspace["user_ids"]["admin"],
            updated_by=workspace["user_ids"]["admin"],
        )
        session.add(case)
        session.flush()
        archive_bytes, counts = backups.build_backup_archive(session)
    manifest = backups.verify_backup_archive(archive_bytes)
    assert manifest["schema_version"] == 15 and counts["privacy_cases"] == 1
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        database = json.loads(archive.read("database.json"))
        row = database["privacy_cases"][0]
        assert "email" not in row and "identity_document" not in row and "attachments" not in row
        row["email"] = "persona@example.com"
        tampered_db = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode()
        manifest = json.loads(archive.read("manifest.json"))
        manifest["data_sha256"] = hashlib.sha256(tampered_db).hexdigest()
        tampered = io.BytesIO()
        with zipfile.ZipFile(tampered, "w", compression=zipfile.ZIP_DEFLATED) as target:
            target.writestr("manifest.json", json.dumps(manifest))
            target.writestr("database.json", tampered_db)
    with pytest.raises(ValueError, match="campos inesperados"):
        backups.verify_backup_archive(tampered.getvalue())
    assert validate_opaque_reference("RAD-2026-014", maximum=160)
    assert not validate_opaque_reference("persona@example.com", maximum=160)
    assert not validate_opaque_reference("3001234567", maximum=160)

def test_pmirs_version_exports_disclose_when_snapshot_differs_from_current_project(client, workspace):
    project_id = workspace["project_ids"][0]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.baseline_status = "validada"
        project.baseline_reference = "Línea Base sintética v1"
        project.baseline_note = "Revisión sintética aceptada para la prueba."
        project.baseline_reviewed_at = now_utc()
        captured_item = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="HAL-CUR-01",
            title="Hallazgo en la captura", description="Contenido histórico sintético.",
            data={"topic": "Separación"}, review_status="VALIDATED", version=2,
            created_by=admin_id, updated_by=admin_id, reviewed_by=admin_id,
        )
        session.add(captured_item)
        session.flush()
        snapshot = {
        "project": {
            "id": project.id, "name": project.name, "municipality": project.municipality,
            "department": project.department, "address": project.address,
            "identity_status": project.identity_status, "identity_reference": project.identity_reference,
            "identity_confirmed_by": project.identity_confirmed_by,
            "identity_confirmed_role": project.identity_confirmed_role,
            "identity_confirmed_at": app_main.utc(project.identity_confirmed_at).isoformat() if project.identity_confirmed_at else None,
        },
            "baseline": {
                "reference": project.baseline_reference,
                "review_note": project.baseline_note,
                "reviewed_at": app_main.utc(project.baseline_reviewed_at).isoformat(),
            },
            "items": [pmirs_item_snapshot(captured_item)],
        }
        version = PMIRSVersion(
            project_id=project_id, version_label="v0.1", status="aprobada_interna",
            change_summary="Captura sintética para probar vigencia.", change_reason="inicial",
            snapshot=snapshot, baseline_reference=project.baseline_reference, created_by=admin_id,
        )
        session.add(version)
        session.commit()
        version_id = version.id

        captured_item.title = "Hallazgo actualizado después de la captura"
        captured_item.version += 1
        project.baseline_reference = "Línea Base sintética v2"
        session.add(PMIRSItem(
            project_id=project_id, item_type="programa", code="PR-CUR-01",
            title="Programa agregado después de la captura", description="Adición sintética posterior.",
            data={}, review_status="RAW", created_by=admin_id, updated_by=admin_id,
        ))
        session.commit()

        currentness = pmirs_version_currentness(version, project, [captured_item, *session.scalars(
            select(PMIRSItem).where(PMIRSItem.project_id == project_id, PMIRSItem.id != captured_item.id)
        ).all()])
        assert currentness["changed_items"] == 1
        assert currentness["items_not_in_capture"] == 1
        assert currentness["baseline_changed"] is True
        assert currentness["matches"] is False
        notice = pmirs_version_currentness_notice(currentness)
        assert "Esta captura difiere del expediente actual" in notice
        assert "1 objeto incluido cambió después de la captura" in notice
        assert "1 objeto actual no está incluido en la captura" in notice

    sign_in(client, "admin@red.test")
    studio = client.get(f"/projects/{project_id}/pmirs")
    assert studio.status_code == 200
    assert "Esta captura difiere del expediente actual:" in studio.text
    assert "1 objeto actual no está incluido en la captura" in studio.text
    assert "Si la versión se firmó, la huella comprueba el contenido de esa captura" in studio.text

    html_export = client.get(f"/pmirs/versions/{version_id}/export")
    assert html_export.status_code == 200
    assert "Comparación con el expediente actual" in html_export.text
    assert "Esta captura difiere del expediente actual" in html_export.text
    assert "1 objeto actual no está incluido en la captura" in html_export.text

    pdf_export = client.get(f"/pmirs/versions/{version_id}/export.pdf")
    assert pdf_export.status_code == 200
    pdf_text = " ".join(" ".join(
        page.extract_text() or "" for page in PdfReader(io.BytesIO(pdf_export.content)).pages
    ).split())
    assert "Esta captura difiere del expediente actual" in pdf_text
    assert "1 objeto actual no está incluido en la captura" in pdf_text

    docx_export = client.get(f"/pmirs/versions/{version_id}/export.docx")
    assert docx_export.status_code == 200
    with zipfile.ZipFile(io.BytesIO(docx_export.content)) as archive:
        docx_xml = archive.read("word/document.xml").decode("utf-8")
    assert "Esta captura difiere del expediente actual" in docx_xml
    assert "1 objeto actual no está incluido en la captura" in docx_xml


def test_pmirs_currentness_notice_pluralizes_object_counts():
    notice = pmirs_version_currentness_notice({
        "comparison_available": True,
        "matches": False,
        "changed_items": 2,
        "items_not_in_capture": 3,
        "captured_items_not_current": 2,
        "baseline_changed": False,
        "baseline_not_accepted": False,
        "project_changed": False,
    })

    assert "2 objetos incluidos cambiaron después de la captura" in notice
    assert "3 objetos actuales no están incluidos en la captura" in notice
    assert "2 objetos de la captura ya no aparecen en el estado actual" in notice


def test_logout_invalidates_a_copied_session_cookie(client, workspace):
    sign_in(client, "admin@red.test")
    cookie_name = settings.session_cookie_name
    copied_cookie = client.cookies.get(cookie_name)
    assert copied_cookie
    csrf = client.get("/api/me").json()["csrf_token"]

    response = client.post("/logout", data={"csrf": csrf}, follow_redirects=False)
    assert response.status_code == 303
    assert response.headers["location"] == "/login"
    with SessionLocal() as session:
        logout_event = session.scalar(select(AuditEvent).where(AuditEvent.action == "logout"))
        assert logout_event and logout_event.detail == {"all_sessions_invalidated": True}

    client.cookies.set(cookie_name, copied_cookie)
    replay = client.get("/api/me", follow_redirects=False)
    assert replay.status_code == 303
    assert replay.headers["location"] == "/login"

    sign_in(client, "admin@red.test")
    assert client.get("/api/me").status_code == 200


def test_editable_record_form_warns_before_navigating_with_unsaved_changes(client, workspace):
    sign_in(client, "consultant@red.test")
    project_id = workspace["project_ids"][0]
    response = client.get(f"/projects/{project_id}/records/new?form_code=D-06")

    assert response.status_code == 200
    assert 'data-unsaved-notice role="status" aria-live="polite" aria-atomic="true" hidden' in response.text
    assert "si sales o recargas, perderás lo que has escrito y los archivos seleccionados" in response.text
    assert "/static/record-submit.js?v=20261012-adaptive-submit-timeout1" in response.text
    assert "/static/unsaved-changes.js?v=20261012-pending-submit-guard1" in response.text


def test_form_recovers_after_session_expiry_with_rotated_csrf_token(client, workspace):
    project_id = workspace["project_ids"][0]
    user_id = workspace["user_ids"]["consultant"]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-06"
    form_page = client.get(path)
    csrf = re.search(r'name="csrf" value="([^"]+)"', form_page.text).group(1)
    submission_key = re.search(r'name="submission_key" value="([^"]+)"', form_page.text).group(1)

    with SessionLocal() as session:
        account = session.get(User, user_id)
        account.session_version += 1
        session.commit()

    post_data = {
        "csrf": csrf, "submission_key": submission_key, "form_code": "D-06",
        "record_title": "Jornada sintética recuperable", "source_note": "Fuente sintética del ensayo de recuperación.",
        "action": "draft",
    }
    expired = client.post(f"/projects/{project_id}/records/new", data=post_data, follow_redirects=False)
    assert expired.status_code == 303
    assert expired.headers["location"] == "/login"
    with SessionLocal() as session:
        assert session.scalar(select(FormRecord).where(FormRecord.submission_key == submission_key)) is None

    sign_in(client, "consultant@red.test")
    recovered_session = client.get("/api/me")
    assert recovered_session.status_code == 200
    assert recovered_session.headers["cache-control"] == "no-store"
    fresh_csrf = recovered_session.json()["csrf_token"]
    assert fresh_csrf and fresh_csrf != csrf

    post_data["csrf"] = fresh_csrf
    saved = client.post(f"/projects/{project_id}/records/new", data=post_data, follow_redirects=False)
    assert saved.status_code == 303
    assert saved.headers["location"].startswith("/records/")
    with SessionLocal() as session:
        assert session.scalar(select(FormRecord).where(FormRecord.submission_key == submission_key)) is not None


def test_csrf_rejection_is_distinguishable_from_project_permission_denial(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    response = client.post(
        f"/projects/{project_id}/records/new",
        data={"csrf": "stale-synthetic-token", "form_code": "D-06", "action": "draft"},
        follow_redirects=False,
    )
    assert response.status_code == 403
    assert response.headers["x-red-error-code"] == "csrf-expired"
    assert response.json()["detail"].startswith("La sesión del formulario venció.")


def test_record_form_server_validation_error_can_receive_focus(client, workspace):
    sign_in(client, "consultant@red.test")
    project_id = workspace["project_ids"][0]
    path = f"/projects/{project_id}/records/new?form_code=D-07"
    response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, path), "form_code": "D-07", "record_title": "Pesaje sintético",
            "source_note": "Fuente sintética para la prueba de validación.", "action": "submit",
        },
        follow_redirects=False,
    )
    assert response.status_code == 422
    assert 'role="alert" tabindex="-1"' in response.text
    assert 'data-validation-errors' in response.text
    assert 'href="#D07-001" data-validation-error-link' in response.text
    assert 'Campo requerido: Jornada' in response.text


def test_p15_invalid_period_error_targets_the_date_group(client, workspace):
    sign_in(client, "consultant@red.test")
    project_id = workspace["project_ids"][0]
    path = f"/projects/{project_id}/records/new?form_code=P-15"
    response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, path), "form_code": "P-15", "record_title": "Revisión sintética",
            "source_note": "Fuente sintética para comprobar el destino del error de periodo.",
            "P15-002__start": "2026-10-10", "P15-002__end": "2026-10-01", "action": "submit",
        },
        follow_redirects=False,
    )
    assert response.status_code == 422
    assert 'href="#P15-002-group" data-validation-error-link' in response.text
    assert "la fecha final debe ser igual o posterior" in response.text
    assert 'id="P15-002-group" class="date-range-pair" tabindex="-1"' in response.text


def test_every_red_form_has_named_controls_and_resolved_aria_references(client, workspace):
    sign_in(client, "admin@red.test")
    project_id = workspace["project_ids"][0]
    for form in FORM_CATALOG["forms"]:
        form_code = form["code"]
        response = client.get(f"/projects/{project_id}/records/new?form_code={form_code}")
        assert response.status_code == 200, form_code
        parser = FormAccessibilityParser()
        parser.feed(response.text)
        assert not parser.duplicate_ids, (form_code, parser.duplicate_ids)
        missing = [
            control for control in parser.controls
            if not control["aria_label"] and not control["aria_labelledby"]
            and not (control["inside_label"] and control["label_text"])
            and control["id"] not in parser.labels_for
        ]
        assert not missing, (form_code, missing)
        unnamed_actions = [
            action for action in parser.actions
            if not action["aria_label"] and not action["aria_labelledby"]
            and not action["title"] and not " ".join(action["text"]).strip()
        ]
        assert not unnamed_actions, (form_code, unnamed_actions)
        if form_code == "P-12":
            assert "<h1>PMIRS Studio</h1>" in response.text
            assert "Aún no hay versiones" in response.text
            continue  # PMIRS Studio renders P-12 as an immutable version summary, not an editable capture form.
        source_rules = re.search(r'<details class="form-source-rules">(.*?)</details>', response.text, re.S)
        assert source_rules, form_code
        assert "<summary>Consultar exigencia de la fuente y estado técnico</summary>" in source_rules.group(1)
        assert not re.search(r'<details[^>]*\bopen\b', source_rules.group(0)), form_code
        visible_capture = response.text.replace(source_rules.group(0), "")
        assert "Exigencia de la fuente:" not in visible_capture, form_code
        assert "Estado técnico previsto:" not in visible_capture, form_code
        for field in form.get("fields", []):
            assert f'href="#{field["id"]}"' in source_rules.group(1), (form_code, field["id"])
            assert f'id="{field["id"]}-source-help"' in source_rules.group(1), (form_code, field["id"])
            assert f'id="{field["id"]}-state-help"' in source_rules.group(1), (form_code, field["id"])
        named_errors = [f"Campo requerido: {field['label']}" for field in form["fields"]]
        targets = record_form_error_targets(form, named_errors)
        unresolved_error_targets = [target for target in targets if target and target not in parser.ids]
        assert not unresolved_error_targets, (form_code, unresolved_error_targets)
        missing_required = []
        for field in form["fields"]:
            if not field.get("required") or field.get("server_managed"):
                continue
            matching = [
                control for control in parser.controls
                if control["name"] == field["id"]
                or control["name"].startswith(f'{field["id"]}__')
                or control["name"] == f'evidence__{field["id"]}'
            ]
            if field.get("control", "").lower() == "subtabla" or field.get("repeatable"):
                exposed_required = bool(re.search(
                    rf'id="{re.escape(field["id"])}-label".*?Obligatorio', response.text, re.S,
                ))
            elif field.get("file_or_record"):
                exposed_required = bool(re.search(
                    rf'<label class="field-label" for="{re.escape(field["id"])}".*?Se requiere un archivo o una referencia al enviar a revisión', response.text, re.S | re.I,
                ))
            else:
                exposed_required = any(control["required"] for control in matching)
            if not exposed_required:
                missing_required.append((field["id"], field.get("control"), matching))
        assert not missing_required, (form_code, missing_required)
        unresolved = [reference for _attribute, reference in parser.aria_references if reference not in parser.ids]
        assert not unresolved, (form_code, unresolved)


def test_primary_workspace_views_have_named_interactive_controls(client, workspace):
    sign_in(client, "admin@red.test")
    project_id = workspace["project_ids"][0]
    routes = [
        "/",
        "/admin/users",
        "/admin/privacy",
        "/admin/projects/new",
        "/drive",
        f"/projects/{project_id}",
        f"/projects/{project_id}/activity",
        f"/projects/{project_id}/operational-references",
        f"/projects/{project_id}/pmirs",
        f"/projects/{project_id}/pmirs/new?item_type=hallazgo",
    ]
    for path in routes:
        response = client.get(path)
        assert response.status_code == 200, path
        parser = FormAccessibilityParser()
        parser.feed(response.text)
        assert not parser.duplicate_ids, (path, parser.duplicate_ids)
        unresolved = [reference for _attribute, reference in parser.aria_references if reference not in parser.ids]
        assert not unresolved, (path, unresolved)
        unnamed_actions = [
            action for action in parser.actions
            if not action["aria_label"] and not action["aria_labelledby"]
            and not action["title"] and not " ".join(action["text"]).strip()
        ]
        assert not unnamed_actions, (path, unnamed_actions)


def test_migration_leaves_projects_empty_until_explicit_initialization(tmp_path):
    database = tmp_path / "migration.sqlite3"
    storage = tmp_path / "private"
    env = {
        **__import__("os").environ,
        "APP_ENV": "local",
        "DATABASE_URL": f"sqlite:///{database}",
        "RED_STORAGE_ROOT": str(storage),
        "SESSION_SECRET": "synthetic-migration-secret-with-more-than-32-characters",
        "TRUSTED_HOSTS": "testserver",
        "PUBLIC_BASE_URL": "http://testserver",
    }
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=PROJECT_DIR,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr

    import sqlite3

    with sqlite3.connect(database) as connection:
        projects_before_seed = connection.execute("SELECT count(*) FROM red_projects").fetchone()[0]
        records = connection.execute("SELECT count(*) FROM red_form_records").fetchone()[0]
        version_columns = {row[1] for row in connection.execute("PRAGMA table_info(red_pmirs_versions)")}
    assert projects_before_seed == 0
    assert records == 0
    assert "previous_version_id" in version_columns

    seed = subprocess.run(
        [
            sys.executable, "-c",
            "from app.cli import seed_bello_projects; raise SystemExit(seed_bello_projects())",
        ],
        cwd=PROJECT_DIR, env=env, capture_output=True, text=True, check=False,
    )
    assert seed.returncode == 0, seed.stdout + seed.stderr
    with sqlite3.connect(database) as connection:
        projects = connection.execute(
            "SELECT slug, name, municipality, department FROM red_projects ORDER BY rowid"
        ).fetchall()
    assert [(slug, name) for slug, name, _municipality, _department in projects] == list(BELLO_PROJECTS)
    assert all(row[2:] == ("Bello", "Antioquia") for row in projects)


def test_operational_writes_default_closed_until_explicit_opt_in(monkeypatch):
    from dataclasses import replace
    from app.config import Settings

    monkeypatch.delenv("RED_OPERATIONAL_WRITES_ENABLED", raising=False)
    monkeypatch.delenv("RED_PRIVACY_APPROVED", raising=False)
    monkeypatch.delenv("RED_SUPERVISED_PILOT_APPROVED", raising=False)
    monkeypatch.delenv("RED_PRIVACY_APPROVAL_REFERENCE", raising=False)
    monkeypatch.delenv("RED_SUPERVISED_PILOT_APPROVAL_REFERENCE", raising=False)
    monkeypatch.delenv("RED_DATABASE_ISOLATION_REFERENCE", raising=False)
    assert Settings(app_env="local").operational_writes_enabled is False
    assert Settings(app_env="staging").operational_writes_enabled is False
    assert Settings(app_env="production").operational_writes_enabled is False
    closed_production_issues = Settings(app_env="production").production_issues()
    assert any("RED_OPERATIONAL_WRITES_ENABLED" in issue for issue in closed_production_issues)
    assert any("RED_PRIVACY_APPROVED" in issue for issue in closed_production_issues)
    assert any("RED_SUPERVISED_PILOT_APPROVED" in issue for issue in closed_production_issues)
    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "true")
    assert Settings(app_env="local").operational_writes_enabled is True
    assert Settings(app_env="local").drive_external_actions_enabled is False
    incomplete_staging = Settings(app_env="staging")
    assert incomplete_staging.operational_writes_enabled is False
    assert any("PostgreSQL" in issue for issue in incomplete_staging.operational_write_issues())
    assert any("TRUSTED_CLIENT_IP_HEADER" in issue for issue in incomplete_staging.operational_write_issues())

    monkeypatch.setenv("SESSION_SECRET", "synthetic-staging-session-secret-with-more-than-32-characters")
    monkeypatch.setenv("TRUSTED_HOSTS", "red.staging.example")
    infrastructure_ready_staging = Settings(
        app_env="staging",
        database_url="postgresql+psycopg://red_user:red_password@postgres.internal:5432/greenatics_red",
        session_https_only=True,
        trusted_hosts=("red.staging.example",),
        public_base_url="https://red.staging.example",
        trusted_client_ip_header="CF-Connecting-IP",
        storage_backend="s3",
        s3_bucket="greenatics-red-staging-private",
        google_client_id="synthetic-client-id",
        google_client_secret="synthetic-client-secret",
        google_redirect_uri="https://red.staging.example/drive/callback",
        token_encryption_key="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        database_isolation_reference="DB-ISOLATION-2026-01",
    )
    assert infrastructure_ready_staging.operational_writes_enabled is False
    assert any("RED_PRIVACY_APPROVED" in issue for issue in infrastructure_ready_staging.operational_write_issues())
    assert any("RED_SUPERVISED_PILOT_APPROVED" in issue for issue in infrastructure_ready_staging.operational_write_issues())
    approved_without_references = replace(
        infrastructure_ready_staging,
        red_privacy_approved=True,
        red_supervised_pilot_approved=True,
    )
    assert approved_without_references.operational_writes_enabled is False
    assert any("RED_PRIVACY_APPROVAL_REFERENCE" in issue for issue in approved_without_references.operational_write_issues())
    assert any("RED_SUPERVISED_PILOT_APPROVAL_REFERENCE" in issue for issue in approved_without_references.operational_write_issues())
    ready_staging = replace(
        infrastructure_ready_staging,
        red_privacy_approved=True,
        red_supervised_pilot_approved=True,
        red_privacy_approval_reference="PRIV-APPROVAL-2026-01",
        red_supervised_pilot_approval_reference="PILOT-APPROVAL-2026-01",
    )
    assert ready_staging.operational_writes_enabled is True
    assert ready_staging.drive_external_actions_enabled is True
    assert not ready_staging.operational_write_issues()
    assert any("RED_PUBLIC_ACCESS_ENABLED" in issue for issue in ready_staging.production_issues())
    public_staging = replace(
        ready_staging,
        red_public_access_enabled=True,
        public_site_origins=("https://greenatics.example",),
    )
    assert not public_staging.production_issues()
    assert Settings._valid_approval_reference("PRIV-APPROVAL-2026-01")
    assert Settings._valid_approval_reference("PRIV:2026.10-01")
    assert not Settings._valid_approval_reference("https://drive.google.com/file?id=approval-123")
    assert not Settings._valid_approval_reference("approval con nombre")
    assert public_staging.allows_public_site_origin("https://GREENATICS.example:443")
    assert not public_staging.allows_public_site_origin("https://attacker.example")
    assert not public_staging.allows_public_site_origin("http://greenatics.example")
    assert any(
        "RED_PUBLIC_SITE_ORIGINS" in issue
        for issue in replace(public_staging, public_site_origins=("https://greenatics.example/path",)).production_issues()
    )
    wrong_oauth_origin = replace(ready_staging, google_redirect_uri="http://other.example/drive/callback")
    assert wrong_oauth_origin.operational_writes_enabled is False
    assert any("GOOGLE_REDIRECT_URI" in issue for issue in wrong_oauth_origin.operational_write_issues())
    wrong_oauth_path = replace(ready_staging, google_redirect_uri="https://red.staging.example/wrong-path")
    assert wrong_oauth_path.operational_writes_enabled is False


@pytest.mark.parametrize(
    ("app_env", "endpoint_url", "should_reject"),
    [
        ("production", "http://objects.example.invalid", True),
        ("staging", "http://objects.example.invalid", True),
        ("production", "https://objects.example.invalid", False),
        ("staging", "https://objects.example.invalid", False),
        ("local", "http://localhost:9000", False),
        ("local", "http://objects.example.invalid", True),
        ("local", "ftp://objects.example.invalid", True),
        ("local", "", False),
    ],
)
def test_s3_endpoint_transport_is_safe_for_each_environment(app_env, endpoint_url, should_reject):
    from app.config import Settings

    settings = Settings(
        app_env=app_env,
        storage_backend="s3",
        s3_bucket="greenatics-red-private",
        s3_access_key="synthetic-access-key",
        s3_secret_key="synthetic-secret-key",
        s3_endpoint_url=endpoint_url,
    )
    transport_issues = [
        issue for issue in settings._deployment_configuration_issues()
        if "S3_ENDPOINT_URL" in issue
    ]
    if should_reject:
        assert len(transport_issues) == 1
        assert "HTTPS" in transport_issues[0]
    else:
        assert transport_issues == []


@pytest.mark.parametrize(
    ("app_env", "endpoint_url"),
    [
        ("production", "http://objects.example.invalid"),
        ("staging", "http://objects.example.invalid"),
        ("local", "http://objects.example.invalid"),
        ("local", "ftp://objects.example.invalid"),
    ],
)
def test_storage_service_rejects_unsafe_s3_endpoint_before_client_creation(
    monkeypatch, app_env, endpoint_url
):
    import boto3
    import app.storage as storage_module
    from app.config import Settings
    from app.storage import StorageError

    configured = Settings(
        app_env=app_env,
        storage_backend="s3",
        s3_bucket="greenatics-red-private",
        s3_access_key="synthetic-access-key",
        s3_secret_key="synthetic-secret-key",
        s3_endpoint_url=endpoint_url,
    )
    monkeypatch.setattr(storage_module, "settings", configured)
    monkeypatch.setattr(
        boto3, "client",
        lambda *args, **kwargs: pytest.fail("No debe crearse un cliente con transporte inseguro."),
    )
    with pytest.raises(StorageError, match="S3_ENDPOINT_URL"):
        StorageService()


@pytest.mark.parametrize(
    ("app_env", "endpoint_url"),
    [
        ("production", "https://objects.example.invalid"),
        ("staging", "https://objects.example.invalid"),
        ("local", "http://localhost:9000"),
        ("local", ""),
    ],
)
def test_storage_service_allows_safe_s3_endpoint(monkeypatch, app_env, endpoint_url):
    import boto3
    import app.storage as storage_module
    from app.config import Settings

    configured = Settings(
        app_env=app_env,
        storage_backend="s3",
        s3_bucket="greenatics-red-private",
        s3_access_key="synthetic-access-key",
        s3_secret_key="synthetic-secret-key",
        s3_endpoint_url=endpoint_url,
    )
    captured = {}
    monkeypatch.setattr(storage_module, "settings", configured)
    monkeypatch.setattr(
        boto3, "client",
        lambda service, **kwargs: captured.update(service=service, **kwargs) or object(),
    )
    StorageService()
    assert captured["service"] == "s3"
    assert captured["endpoint_url"] == (endpoint_url or None)


def test_hosted_runtime_requires_a_dedicated_database_not_a_shared_schema(monkeypatch):
    from dataclasses import replace
    from app.config import Settings

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "true")
    monkeypatch.setenv("SESSION_SECRET", "synthetic-staging-session-secret-with-more-than-32-characters")
    monkeypatch.setenv("TRUSTED_HOSTS", "red.staging.example")
    dedicated = Settings(
        app_env="staging",
        database_url="postgresql+psycopg://red_user:red_password@postgres.internal:5432/greenatics_red",
        database_isolation_reference="DB-ISOLATION-2026-01",
        session_secret="synthetic-staging-session-secret-with-more-than-32-characters",
        session_https_only=True,
        trusted_hosts=("red.staging.example",),
        public_base_url="https://red.staging.example",
        trusted_client_ip_header="CF-Connecting-IP",
        storage_backend="s3",
        s3_bucket="greenatics-red-staging-private",
        google_client_id="synthetic-client-id",
        google_client_secret="synthetic-client-secret",
        google_redirect_uri="https://red.staging.example/drive/callback",
        token_encryption_key="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        red_privacy_approved=True,
        red_supervised_pilot_approved=True,
        red_privacy_approval_reference="PRIV-APPROVAL-2026-01",
        red_supervised_pilot_approval_reference="PILOT-APPROVAL-2026-01",
    )
    assert dedicated.operational_writes_enabled is True

    missing_database_review = replace(dedicated, database_isolation_reference="")
    assert missing_database_review.operational_writes_enabled is False
    assert any("RED_DATABASE_ISOLATION_REFERENCE" in issue for issue in missing_database_review.operational_write_issues())

    import pytest

    with pytest.raises(ValueError, match="base PostgreSQL exclusiva.*DATABASE_SCHEMA"):
        replace(dedicated, database_schema="greenatics_red")

    # Schema isolation remains useful for local migration tests, while hosted
    # staging/production must use RED's own PostgreSQL database.
    local_test_schema = Settings(
        app_env="local",
        database_url="postgresql+psycopg://red_user:red_password@localhost:5432/greenatics_red_test",
        database_schema="greenatics_red",
    )
    assert not local_test_schema.operational_write_issues()
    assert local_test_schema.operational_writes_enabled is True


def test_app_env_rejects_unknown_values_instead_of_using_local_gates():
    with pytest.raises(ValueError, match="APP_ENV debe ser exactamente local, staging o production"):
        Settings(app_env="preproduction")


def test_render_runtime_cannot_select_local_gates(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    with pytest.raises(ValueError, match="APP_ENV=local no está permitido en Render"):
        Settings(app_env="local")


def test_hosted_approval_flags_require_opaque_archived_references(monkeypatch):
    from app.config import Settings

    monkeypatch.setenv("RED_PRIVACY_APPROVED", "true")
    monkeypatch.setenv("RED_SUPERVISED_PILOT_APPROVED", "true")
    monkeypatch.delenv("RED_PRIVACY_APPROVAL_REFERENCE", raising=False)
    monkeypatch.delenv("RED_SUPERVISED_PILOT_APPROVAL_REFERENCE", raising=False)
    missing = Settings(app_env="staging").operational_approval_issues()
    assert any("RED_PRIVACY_APPROVAL_REFERENCE" in issue for issue in missing)
    assert any("RED_SUPERVISED_PILOT_APPROVAL_REFERENCE" in issue for issue in missing)

    monkeypatch.setenv("RED_PRIVACY_APPROVAL_REFERENCE", "PRIV-APPROVAL-2026-01")
    monkeypatch.setenv("RED_SUPERVISED_PILOT_APPROVAL_REFERENCE", "PILOT-APPROVAL-2026-01")
    assert Settings(app_env="staging").operational_approval_issues() == []

    monkeypatch.delenv("RED_DATABASE_ISOLATION_REFERENCE", raising=False)
    assert Settings(app_env="staging").database_migration_issues()
    monkeypatch.setenv("RED_DATABASE_ISOLATION_REFERENCE", "DB-ISOLATION-2026-01")
    assert Settings(app_env="staging").database_migration_issues() == []

    monkeypatch.setenv("RED_PRIVACY_APPROVAL_REFERENCE", "https://drive.google.com/approval")
    assert any("RED_PRIVACY_APPROVAL_REFERENCE" in issue for issue in Settings(app_env="staging").operational_approval_issues())
    assert Settings(app_env="local").operational_approval_issues() == []


def test_render_blueprint_declares_production_runtime_contract_and_keeps_gates_closed():
    from pathlib import Path

    render = (Path(__file__).resolve().parents[1] / "render.yaml").read_text()
    declared = set(re.findall(r"^\s+- key: ([A-Z0-9_]+)\s*$", render, re.MULTILINE))
    required = {
        "APP_ENV", "DATABASE_URL", "SESSION_SECRET", "SESSION_HTTPS_ONLY", "TRUSTED_HOSTS",
        "TRUSTED_CLIENT_IP_HEADER",
        "PUBLIC_BASE_URL", "STORAGE_BACKEND", "S3_BUCKET", "S3_ENDPOINT_URL", "S3_REGION",
        "S3_ACCESS_KEY", "S3_SECRET_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REDIRECT_URI", "TOKEN_ENCRYPTION_KEY", "RED_PUBLIC_ACCESS_ENABLED",
        "RED_PUBLIC_SITE_ORIGINS", "RED_PRIVACY_APPROVED", "RED_SUPERVISED_PILOT_APPROVED",
        "RED_OPERATIONAL_WRITES_ENABLED", "RED_DATABASE_ISOLATION_REFERENCE",
    }
    assert required <= declared
    assert re.search(r"^    plan: free$", render, re.MULTILINE)
    assert not re.search(r"^databases:", render, re.MULTILINE)
    for key in (
        "RED_PUBLIC_ACCESS_ENABLED", "RED_PRIVACY_APPROVED",
        "RED_SUPERVISED_PILOT_APPROVED", "RED_OPERATIONAL_WRITES_ENABLED",
    ):
        assert re.search(rf'^      - key: {re.escape(key)}\n        value: "false"$', render, re.MULTILINE)
    assert re.search(
        r"^      - key: RED_PUBLIC_SITE_ORIGINS\n        sync: false$", render, re.MULTILINE
    )
    assert re.search(r'^      - key: APP_ENV\n        value: production$', render, re.MULTILINE)
    assert re.search(r'^      - key: STORAGE_BACKEND\n        value: s3$', render, re.MULTILINE)
    assert re.search(r'^      - key: SESSION_HTTPS_ONLY\n        value: "true"$', render, re.MULTILINE)
    assert re.search(r'^      - key: TRUSTED_CLIENT_IP_HEADER\n        value: CF-Connecting-IP$', render, re.MULTILINE)


def test_hosted_startup_ignores_untrusted_forwarded_headers():
    startup = (Path(__file__).resolve().parents[1] / "start.sh").read_text()
    uvicorn_command = next(line for line in startup.splitlines() if line.startswith("exec uvicorn "))
    assert "Uvicorn must not trust generic forwarded headers" in startup
    assert "CF-Connecting-IP" in startup and "TRUSTED_CLIENT_IP_HEADER" in startup
    assert "verify in staging" in startup
    assert "--no-proxy-headers" in uvicorn_command
    assert "--forwarded-allow-ips" not in uvicorn_command
    assert "--proxy-headers" not in uvicorn_command


def test_deployed_login_throttle_uses_verified_client_ip_without_global_account_lockout(
    client, workspace, monkeypatch,
):
    from dataclasses import replace
    from fastapi.testclient import TestClient
    from app.main import app

    monkeypatch.setattr(app_main, "settings", replace(
        settings,
        app_env="staging",
        session_secret="synthetic-staging-login-throttle-secret-2026",
        trusted_client_ip_header="CF-Connecting-IP",
    ))
    missing_ip = client.post(
        "/login",
        data={"email": "admin@red.test", "password": PASSWORD, "csrf": csrf_for(client)},
        follow_redirects=False,
    )
    assert missing_ip.status_code == 503
    assert "No se puede verificar el origen" in missing_ip.text

    ip_a = "198.51.100.41"
    for attempt in range(6):
        failed = client.post(
            "/login",
            data={
                "email": "admin@red.test",
                "password": f"incorrect-{attempt}",
                "csrf": csrf_for(client),
            },
            headers={
                "CF-Connecting-IP": ip_a,
                "X-Forwarded-For": "203.0.113.250",
            },
            follow_redirects=False,
        )
        assert failed.status_code == 401

    with TestClient(app) as blocked_client:
        blocked = blocked_client.post(
            "/login",
            data={"email": "admin@red.test", "password": PASSWORD, "csrf": csrf_for(blocked_client)},
            headers={"CF-Connecting-IP": ip_a},
            follow_redirects=False,
        )
        assert blocked.status_code == 429

    ip_b = "198.51.100.42"
    with TestClient(app) as other_ip_client:
        accepted = other_ip_client.post(
            "/login",
            data={"email": "admin@red.test", "password": PASSWORD, "csrf": csrf_for(other_ip_client)},
            headers={"CF-Connecting-IP": ip_b},
            follow_redirects=False,
        )
        assert accepted.status_code == 303
        assert other_ip_client.get("/").status_code == 200

    with TestClient(app) as distributed_attempts:
        for attempt in range(24):
            failed = distributed_attempts.post(
                "/login",
                data={
                    "email": f"unknown-{attempt}@red.test",
                    "password": "incorrect",
                    "csrf": csrf_for(distributed_attempts),
                },
                headers={"CF-Connecting-IP": ip_a},
                follow_redirects=False,
            )
            assert failed.status_code == 401
        aggregate_lock = distributed_attempts.post(
            "/login",
            data={"email": "reader@red.test", "password": PASSWORD, "csrf": csrf_for(distributed_attempts)},
            headers={"CF-Connecting-IP": ip_a},
            follow_redirects=False,
        )
        assert aggregate_lock.status_code == 429

    ip_c = "198.51.100.43"
    with TestClient(app) as recovery_client:
        recovered = recovery_client.post(
            "/login",
            data={"email": "reader@red.test", "password": PASSWORD, "csrf": csrf_for(recovery_client)},
            headers={"CF-Connecting-IP": ip_c},
            follow_redirects=False,
        )
        assert recovered.status_code == 303

    with SessionLocal() as session:
        keys = set(session.scalars(select(LoginThrottle.key)))
        assert app_main.login_throttle_key("client-ip", ip_a) in keys
        assert app_main.login_throttle_key("client-ip", "203.0.113.250") not in keys
        assert ip_a not in " ".join(keys)


def test_existing_account_invitation_throttle_fails_closed_without_one_trusted_proxy_ip(
    client, workspace, monkeypatch,
):
    from dataclasses import replace
    from fastapi.testclient import TestClient
    from app.config import Settings
    from app.main import app

    project_id = workspace["project_ids"][1]
    sign_in(client, "admin@red.test")
    created = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"),
            "email": "field@red.test",
            "full_name": "Operario existente",
            "project_id": project_id,
            "role": "campo",
        },
    )
    assert created.status_code == 200
    match = re.search(r'id="invite-link" readonly value="([^"]+)"', created.text)
    assert match
    invitation_url = match.group(1)
    token = invitation_url.rsplit("/", 1)[-1]

    monkeypatch.setenv("SESSION_SECRET", "synthetic-staging-invitation-throttle-secret")
    monkeypatch.setenv("TRUSTED_HOSTS", "red.staging.example")
    hosted = Settings(
        app_env="staging",
        database_url="postgresql+psycopg://red_user:synthetic@postgres.internal:5432/greenatics_red",
        database_isolation_reference="DB-ISOLATION-SYNTHETIC-01",
        session_secret="synthetic-staging-invitation-throttle-secret",
        session_https_only=True,
        trusted_hosts=("red.staging.example",),
        public_base_url="https://red.staging.example",
        trusted_client_ip_header="CF-Connecting-IP",
        storage_backend="s3",
        s3_bucket="greenatics-red-staging-private",
        google_client_id="synthetic-client-id",
        google_client_secret="synthetic-client-secret",
        google_redirect_uri="https://red.staging.example/drive/callback",
        token_encryption_key="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        red_privacy_approved=True,
        red_privacy_approval_reference="PRIV-APPROVAL-SYNTHETIC-01",
        red_supervised_pilot_approved=True,
        red_supervised_pilot_approval_reference="PILOT-APPROVAL-SYNTHETIC-01",
    )
    assert hosted.operational_writes_enabled
    monkeypatch.setattr(app_main, "settings", hosted)
    untrusted_headers = (
        {},
        {"X-Forwarded-For": "203.0.113.250"},
        {"CF-Connecting-IP": "198.51.100.81, 198.51.100.82"},
        {"CF-Connecting-IP": "not-an-ip"},
    )
    with TestClient(app) as invitee:
        form = invitee.get(invitation_url)
        assert form.status_code == 200
        csrf_match = re.search(r'name="csrf" value="([^"]+)"', form.text)
        assert csrf_match
        csrf = csrf_match.group(1)
        for headers in untrusted_headers:
            rejected = invitee.post(
                f"/invitations/accept/{token}",
                data={"csrf": csrf, "existing_password": PASSWORD},
                headers=headers,
                follow_redirects=False,
            )
            assert rejected.status_code == 503
            assert "No se puede verificar el origen" in rejected.text
            csrf_match = re.search(r'name="csrf" value="([^"]+)"', rejected.text)
            assert csrf_match
            csrf = csrf_match.group(1)

        trusted = invitee.post(
            f"/invitations/accept/{token}",
            data={"csrf": csrf, "existing_password": "contraseña sintética incorrecta"},
            headers={"CF-Connecting-IP": "198.51.100.83"},
            follow_redirects=False,
        )
        assert trusted.status_code == 401

    with SessionLocal() as session:
        assert session.scalar(select(Invitation).where(
            Invitation.email == "field@red.test", Invitation.accepted_at.is_not(None),
        )) is None
        assert session.scalar(select(LoginThrottle.key).where(
            LoginThrottle.key == app_main.login_throttle_key("invitation-client-ip", "198.51.100.83"),
        )) is not None


def test_session_cookie_name_is_isolated_and_restricted():
    from app.config import Settings

    assert Settings(session_cookie_name="greenatics_red_sandbox").session_cookie_name == "greenatics_red_sandbox"
    with pytest.raises(ValueError, match="SESSION_COOKIE_NAME"):
        Settings(session_cookie_name="red demo; Domain=.localhost")
    with pytest.raises(ValueError, match="TRUSTED_CLIENT_IP_HEADER"):
        Settings(trusted_client_ip_header="X-Forwarded-For")


def test_login_throttle_blocks_repeated_wrong_password_attempts_and_recovers_after_window(client, workspace):
    email = "admin@red.test"
    for attempt in range(6):
        response = client.post(
            "/login",
            data={"email": email, "password": f"incorrect-{attempt}", "csrf": csrf_for(client)},
            follow_redirects=False,
        )
        assert response.status_code == 401
        assert "Correo o contraseña no válidos." in response.text

    blocked = client.post(
        "/login",
        data={"email": email, "password": PASSWORD, "csrf": csrf_for(client)},
        follow_redirects=False,
    )
    assert blocked.status_code == 429
    assert "Espera unos minutos" in blocked.text

    throttle_key = hashlib.sha256(email.encode("utf-8")).hexdigest()
    with SessionLocal() as session:
        throttle = session.get(LoginThrottle, throttle_key)
        assert throttle is not None and throttle.attempts == 6
        throttle.window_start = now_utc() - timedelta(minutes=11)
        throttle.blocked_until = now_utc() - timedelta(seconds=1)
        session.commit()

    recovered = client.post(
        "/login",
        data={"email": email, "password": PASSWORD, "csrf": csrf_for(client)},
        follow_redirects=False,
    )
    assert recovered.status_code == 303
    assert client.get("/").status_code == 200
    with SessionLocal() as session:
        assert session.get(LoginThrottle, throttle_key) is None


def test_login_uses_dummy_pbkdf2_for_missing_and_inactive_accounts(client, workspace, monkeypatch):
    from app.security import LOGIN_DUMMY_PASSWORD_HASH

    with SessionLocal() as session:
        session.execute(update(User).where(User.email == "field@red.test").values(active=False))
        session.commit()

    checked_hashes: list[str] = []
    original_verify_password = app_main.verify_password

    def record_verification(password: str, encoded: str) -> bool:
        checked_hashes.append(encoded)
        return original_verify_password(password, encoded)

    monkeypatch.setattr(app_main, "verify_password", record_verification)
    for email in ("missing@red.test", "field@red.test", "admin@red.test"):
        response = client.post(
            "/login",
            data={"email": email, "password": "incorrect-synthetic-password", "csrf": csrf_for(client)},
            follow_redirects=False,
        )
        assert response.status_code == 401
        assert "Correo o contraseña no válidos." in response.text

    with SessionLocal() as session:
        active_hash = session.scalar(select(User.password_hash).where(User.email == "admin@red.test"))
    assert checked_hashes == [LOGIN_DUMMY_PASSWORD_HASH, LOGIN_DUMMY_PASSWORD_HASH, active_hash]


def test_password_verifier_rejects_over_limit_before_pbkdf2(monkeypatch):
    import app.security as security

    password_hash = hash_password("Synthetic-Valid-Password-2026")
    original_pbkdf2 = security.hashlib.pbkdf2_hmac
    calls = []

    def track_pbkdf2(*args, **kwargs):
        calls.append(True)
        return original_pbkdf2(*args, **kwargs)

    monkeypatch.setattr(security.hashlib, "pbkdf2_hmac", track_pbkdf2)
    assert verify_password("x" * (MAX_PASSWORD_CHARACTERS + 1), password_hash) is False
    assert calls == []
    assert verify_password("Synthetic-Valid-Password-2026", password_hash) is True
    assert len(calls) == 1
    with pytest.raises(ValueError, match="no puede superar"):
        hash_password("x" * (MAX_PASSWORD_CHARACTERS + 1))


def test_login_throttle_cleanup_cli_removes_only_rows_older_than_24_hours(workspace, monkeypatch, capsys):
    expired_key = "expired-throttle-key-for-synthetic-test"
    recent_key = "recent-throttle-key-for-synthetic-test"
    with SessionLocal() as session:
        session.add(LoginThrottle(
            key=expired_key,
            attempts=2,
            window_start=now_utc() - timedelta(hours=25),
        ))
        session.add(LoginThrottle(
            key=recent_key,
            attempts=2,
            window_start=now_utc() - timedelta(hours=23),
        ))
        session.commit()

    monkeypatch.setattr(sys, "argv", ["greenatics-red", "cleanup-login-throttles"])
    assert app_cli.main() == 0
    assert "eliminados: 1" in capsys.readouterr().out
    with SessionLocal() as session:
        assert session.get(LoginThrottle, expired_key) is None
        assert session.get(LoginThrottle, recent_key) is not None


def test_login_throttle_atomic_upsert_preserves_concurrent_attempts(workspace):
    from app.main import increment_login_throttle

    throttle_key = "concurrent-synthetic-throttle-key"
    attempts = 24
    now = now_utc()

    def record_attempt(_index: int) -> None:
        with SessionLocal() as session:
            increment_login_throttle(session, throttle_key, limit=attempts + 1, now=now)
            session.commit()

    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(record_attempt, range(attempts)))

    with SessionLocal() as session:
        throttle = session.get(LoginThrottle, throttle_key)
        assert throttle is not None
        assert throttle.attempts == attempts
        assert throttle.blocked_until is None


def test_login_throttle_upsert_compiles_for_sqlite_and_postgresql():
    from sqlalchemy.dialects import postgresql, sqlite

    from app.main import login_throttle_upsert_statement

    statement = login_throttle_upsert_statement(
        "sqlite", key="compile-synthetic-key", limit=6, now=now_utc(),
    )
    sqlite_sql = str(statement.compile(dialect=sqlite.dialect()))
    assert "ON CONFLICT" in sqlite_sql and "DO UPDATE" in sqlite_sql
    assert "red_login_throttles.attempts +" in sqlite_sql

    statement = login_throttle_upsert_statement(
        "postgresql", key="compile-synthetic-key", limit=6, now=now_utc(),
    )
    postgres_sql = str(statement.compile(dialect=postgresql.dialect()))
    assert "ON CONFLICT" in postgres_sql and "DO UPDATE" in postgres_sql
    assert "red_login_throttles.attempts +" in postgres_sql


def test_deployed_runtime_misconfiguration_keeps_http_writes_blocked(client, workspace, monkeypatch):
    from app.config import Settings

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "true")
    monkeypatch.setattr(app_main, "settings", Settings(
        app_env="production",
        database_url="sqlite:////private/tmp/greenatics-red-invalid-production.sqlite3",
        storage_backend="local",
        trusted_client_ip_header="CF-Connecting-IP",
    ))
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test", headers={"CF-Connecting-IP": "203.0.113.9"})

    response = client.post(
        f"/projects/{project_id}/records/new",
        data={"form_code": "D-01", "record_title": "No debe guardarse"},
        follow_redirects=False,
    )
    assert response.status_code == 503
    assert "Producción requiere PostgreSQL" in response.json()["detail"]

    project_page = client.get(f"/projects/{project_id}")
    assert project_page.status_code == 200
    assert "no se guardarán datos hasta completar la configuración y las aprobaciones del entorno" in project_page.text
    assert "RED_PRIVACY_APPROVED" in project_page.text
    assert "RED_SUPERVISED_PILOT_APPROVED" in project_page.text


def test_deployed_runtime_requires_privacy_and_pilot_approvals_before_writes(client, workspace, monkeypatch):
    from app.config import Settings

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "true")
    monkeypatch.delenv("RED_PRIVACY_APPROVED", raising=False)
    monkeypatch.delenv("RED_SUPERVISED_PILOT_APPROVED", raising=False)
    monkeypatch.setenv("SESSION_SECRET", "synthetic-staging-session-secret-with-more-than-32-characters")
    monkeypatch.setenv("TRUSTED_HOSTS", "red.staging.example")
    deployed = Settings(
        app_env="staging",
        database_url="postgresql+psycopg://red_user:red_password@postgres.internal:5432/greenatics_red",
        database_isolation_reference="DB-ISOLATION-2026-01",
        session_secret="synthetic-staging-session-secret-with-more-than-32-characters",
        session_https_only=True,
        trusted_hosts=("red.staging.example",),
        trusted_client_ip_header="CF-Connecting-IP",
        public_base_url="https://red.staging.example",
        storage_backend="s3",
        s3_bucket="greenatics-red-staging-private",
        google_client_id="synthetic-client-id",
        google_client_secret="synthetic-client-secret",
        google_redirect_uri="https://red.staging.example/drive/callback",
        token_encryption_key="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    )
    assert deployed._deployment_configuration_issues() == []
    assert deployed.operational_writes_enabled is False
    monkeypatch.setattr(app_main, "settings", deployed)

    sign_in_response = client.post(
        "/login",
        data={
            "email": "consultant@red.test",
            "password": PASSWORD,
            "csrf": csrf_for(client),
        },
        headers={"CF-Connecting-IP": "198.51.100.44"},
        follow_redirects=False,
    )
    assert sign_in_response.status_code == 303
    response = client.post(
        f"/projects/{workspace['project_ids'][0]}/records/new",
        data={"form_code": "D-01", "record_title": "No debe guardarse sin gates"},
        follow_redirects=False,
    )
    assert response.status_code == 503
    assert "RED_PRIVACY_APPROVED" in response.json()["detail"]
    assert "RED_SUPERVISED_PILOT_APPROVED" in response.json()["detail"]

    project_page = client.get(f"/projects/{workspace['project_ids'][0]}")
    assert project_page.status_code == 200
    assert "RED_PRIVACY_APPROVED" in project_page.text
    assert "RED_SUPERVISED_PILOT_APPROVED" in project_page.text


def test_version_chain_migration_backfills_previous_links(tmp_path):
    database = tmp_path / "version-chain.sqlite3"
    storage = tmp_path / "private"
    env = {
        **__import__("os").environ,
        "APP_ENV": "local",
        "DATABASE_URL": f"sqlite:///{database}",
        "RED_STORAGE_ROOT": str(storage),
        "SESSION_SECRET": "synthetic-version-chain-secret-with-more-than-32-characters",
        "TRUSTED_HOSTS": "testserver",
        "PUBLIC_BASE_URL": "http://testserver",
    }
    command = [sys.executable, "-m", "alembic", "upgrade"]
    before_migration = subprocess.run(
        [*command, "0004_field_scoped_evidence"], cwd=PROJECT_DIR, env=env,
        capture_output=True, text=True, check=False,
    )
    assert before_migration.returncode == 0, before_migration.stdout + before_migration.stderr

    import sqlite3

    with sqlite3.connect(database) as connection:
        connection.execute(
            "INSERT INTO red_projects "
            "(id, slug, name, municipality, department, status, baseline_status, baseline_reference, "
            "baseline_note, origin, origin_note, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ("migration-project", "qa-synthetic-migration", "Conjunto QA sintético de migración",
             "Bello", "Antioquia", "activo", "no_iniciada", "", "",
             "instruccion_usuario", "Expediente de prueba sintética para migración.", "2026-10-07 12:00:00"),
        )
        connection.commit()
        project_id = connection.execute("SELECT id FROM red_projects LIMIT 1").fetchone()[0]
        connection.execute(
            "INSERT INTO red_users (id,email,full_name,password_hash,is_platform_admin,active,created_at,last_login_at,session_version) "
            "VALUES (?,?,?,?,?,?,?,?,?)",
            ("migration-user", "migration@red.test", "Migración", "hash", 0, 1, "2026-10-07 12:00:00", None, 1),
        )
        common = (project_id, "borrador", "Resumen de migración", "inicial", "{}", "LB de prueba", "migration-user")
        columns = "id,project_id,version_label,status,change_summary,change_reason,snapshot,baseline_reference,created_by,created_at,status_changed_by,status_changed_at,status_note"
        connection.execute(
            f"INSERT INTO red_pmirs_versions ({columns}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            ("version-2", common[0], "v0.2", *common[1:], "2026-10-07 12:00:02", None, None, ""),
        )
        connection.execute(
            f"INSERT INTO red_pmirs_versions ({columns}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            ("version-1", common[0], "v0.1", *common[1:], "2026-10-07 12:00:01", None, None, ""),
        )
        connection.commit()

    upgraded = subprocess.run(
        [*command, "head"], cwd=PROJECT_DIR, env=env,
        capture_output=True, text=True, check=False,
    )
    assert upgraded.returncode == 0, upgraded.stdout + upgraded.stderr
    with sqlite3.connect(database) as connection:
        links = dict(connection.execute("SELECT id, previous_version_id FROM red_pmirs_versions"))
    assert links == {"version-1": None, "version-2": "version-1"}


def test_public_health_and_form_catalog_are_honest(client, workspace):
    health = client.get("/api/health")
    readiness = client.get("/api/ready")
    forms = client.get("/api/forms")
    assert health.status_code == 200
    assert health.json()["application"] == "GREENATICS RED"
    assert health.headers["cache-control"] == "private, no-store"
    assert readiness.status_code == 503
    assert readiness.headers["cache-control"] == "private, no-store"
    assert readiness.json() == {"detail": "GREENATICS RED no está habilitado para acceso público."}
    assert forms.status_code == 200
    catalog = forms.json()["forms"]
    assert len(catalog) == 30
    assert sum(len(form["fields"]) for form in catalog) == 342
    assert len({form["code"] for form in catalog}) == 30
    assert all("drive.google.com" not in (form.get("source_url") or "") for form in catalog)


def test_private_drive_form_links_are_not_rendered_in_project_or_record_pages(client, workspace):
    project_id = workspace["project_ids"][0]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-01", title="Identidad sintética",
            status="RAW", source_note="Dato sintético de prueba.",
            created_by=admin_id, updated_by=admin_id,
        )
        session.add(record)
        session.commit()
        record_id = record.id

    sign_in(client, "admin@red.test")
    project = client.get(f"/projects/{project_id}")
    detail = client.get(f"/records/{record_id}")
    assert project.status_code == detail.status_code == 200
    assert "drive.google.com/drive/folders/" not in project.text
    assert "drive.google.com/file/d/" not in detail.text
    assert "Abrir ficha maestra" not in detail.text


def test_gps_capture_is_explicit_optional_validated_and_rendered_readably(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")

    for form_code, field_id in (("D-03", "D03-006"), ("D-11", "D11-006")):
        page = client.get(f"/projects/{project_id}/records/new?form_code={form_code}")
        assert page.status_code == 200
        assert f'data-gps-capture="{field_id}"' in page.text
        assert "RED no hace seguimiento continuo" in page.text
        assert "no prueba por sí sola que la visita ocurrió allí" in page.text
        assert "Si guardas la coordenada, quedará asociada a este registro" in page.text
        assert "estará disponible para personas autorizadas según su rol" in page.text
        assert "se incluirá en exportaciones y respaldos RED" in page.text
        assert "las copias de Drive no se comparten automáticamente" in page.text
        assert "Úsala solo si es necesaria y está permitida para la visita" in page.text
        assert "gps-capture.js" in page.text
        assert 'data-network-status' in page.text
        assert 'data-network-message role="status" aria-live="polite" aria-atomic="true"' in page.text
        assert 'data-session-actions hidden' in page.text
        assert 'data-unsaved-notice role="status" aria-live="polite" aria-atomic="true" hidden' in page.text
        assert "RED no conserva borradores en el dispositivo" in page.text
        assert "network-status.js" in page.text
        assert page.headers["permissions-policy"] == "camera=(), microphone=(), geolocation=(self)"

    photo_form = client.get(f"/projects/{project_id}/records/new?form_code=D-04")
    assert photo_form.status_code == 200
    assert "Archivo privado asociado a este campo" in photo_form.text
    assert "evita rostros, placas, números de apartamento, firmas y documentos" in photo_form.text
    assert "no cargues la imagen hasta contar con el procedimiento aprobado" in photo_form.text
    assert "metadatos de fecha, dispositivo o ubicación (EXIF)" in photo_form.text
    assert "RED conserva el archivo original y no elimina esos metadatos" in photo_form.text
    assert "upload-metadata-help" in photo_form.text
    metadata_help = re.search(r'<small id="([^"]+-upload-metadata-help)">', photo_form.text)
    assert metadata_help
    upload_field_id = metadata_help.group(1).removesuffix("-upload-metadata-help")
    file_input = re.search(rf'<input id="{re.escape(upload_field_id)}"[^>]*>', photo_form.text)
    assert file_input and metadata_help.group(1) in file_input.group(0)

    d03 = next(form for form in FORM_CATALOG["forms"] if form["code"] == "D-03")
    valid = json.dumps({
        "method": "browser_geolocation", "latitude": 6.25, "longitude": -75.56,
        "accuracy_m": 12.4, "captured_at": "2026-10-08T15:30:00.000Z",
    })
    assert gps_capture_errors(valid) == []
    assert "Latitud 6.25, longitud -75.56" in gps_capture_display(valid)
    assert "±12.4 m" in gps_capture_display(valid)
    assert any("latitud GPS" in error for error in gps_capture_errors(json.dumps({
        "method": "browser_geolocation", "latitude": 91, "longitude": -75,
        "accuracy_m": 12.4, "captured_at": "2026-10-08T15:30:00Z",
    })))
    assert any("latitud GPS" in error for error in gps_capture_errors(json.dumps({
        "method": "browser_geolocation", "latitude": 10 ** 1000, "longitude": -75,
        "accuracy_m": 12.4, "captured_at": "2026-10-08T15:30:00Z",
    })))
    assert not gps_capture_errors("6.25, -75.56")  # Earlier/manual RAW values remain intact.
    assert any("formato de captura RED" in error for error in gps_capture_errors('{"method":"other"}'))
    complete = {
        "D03-001": "BEL-001", "D03-002": "Diagnóstico", "D03-004": "Brigadista 1",
        "D03-005": "Administración", "D03-008": "Sí", "D03-006": "{malformed-json",
    }
    assert any("formato inválido" in error for error in submission_errors(d03, complete, "Visita sintética"))

    page = client.get(f"/projects/{project_id}/records/new?form_code=D-03")
    csrf = re.search(r'name="csrf" value="([^"]+)"', page.text).group(1)
    saved = client.post(f"/projects/{project_id}/records/new", data={
        "csrf": csrf, "form_code": "D-03", "record_title": "Visita sintética GPS",
        "record_date": "2026-10-08", "source_kind": "observado", "source_note": "Captura sintética desde dispositivo",
        "D03-006": valid, "action": "draft",
    }, follow_redirects=False)
    assert saved.status_code == 303
    detail = client.get(saved.headers["location"])
    assert detail.status_code == 200
    assert "Latitud 6.25, longitud -75.56" in detail.text
    assert "hora del dispositivo 2026-10-08 15:30:00.000 UTC" in detail.text
    export = client.get(f"/projects/{project_id}/records/export.csv")
    assert export.status_code == 200
    assert "Latitud 6.25, longitud -75.56" in export.text
    assert '"method":"browser_geolocation"' not in export.text


def test_public_readiness_requires_production_gate_and_verified_drive_backup(client, workspace, monkeypatch):
    from types import SimpleNamespace

    assert app_cli.seed_bello_projects() == 0
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=admin_id, google_email="private-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="private-folder-id",
        ))
        backup = Backup(
            status="completado", drive_file_id="private-file-id", drive_file_name="backup.zip",
            drive_folder_id="private-folder-id", sha256="a" * 64, bytes_total=128,
            summary={}, created_by=admin_id,
            completed_at=now_utc(),
        )
        session.add(backup)
        session.commit()
        backup_id = backup.id

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        is_production=True,
        red_public_access_enabled=True,
        session_https_only=False,
        production_issues=lambda: [],
        allows_public_site_origin=lambda origin: origin == "https://greenatics.test",
    ))
    monkeypatch.setattr(app_main.storage, "health_check", lambda: None)
    monkeypatch.setattr(app_main.drive, "decrypt_refresh_token", lambda _token: "synthetic-refresh-token")

    ready = client.get("/api/ready", headers={"Origin": "https://greenatics.test"})
    assert ready.status_code == 200
    assert ready.headers["access-control-allow-origin"] == "https://greenatics.test"
    assert ready.headers["vary"] == "Origin"
    assert ready.headers["cache-control"] == "no-store"
    assert ready.json() == {
        "status": "ready", "application": "GREENATICS RED", "version": backups.APP_VERSION,
        "project_workspaces": 4, "drive_backup_verified": True,
    }
    assert "private-drive@red.test" not in ready.text
    assert "private-folder-id" not in ready.text
    assert "private-file-id" not in ready.text
    untrusted_origin = client.get("/api/ready", headers={"Origin": "https://attacker.test"})
    assert untrusted_origin.status_code == 200
    assert "access-control-allow-origin" not in untrusted_origin.headers

    with SessionLocal() as session:
        project_id = session.scalar(select(Project.id).where(Project.slug == "bello-parque-alto"))
    for field, incorrect_value in (("name", "Conjunto distinto"), ("municipality", "Medellín"), ("department", "Cundinamarca")):
        with SessionLocal() as session:
            project = session.get(Project, project_id)
            original_value = getattr(project, field)
            setattr(project, field, incorrect_value)
            session.commit()
        mismatched_project = client.get("/api/ready")
        assert mismatched_project.status_code == 503
        with SessionLocal() as session:
            project = session.get(Project, project_id)
            setattr(project, field, original_value)
            session.commit()

    with SessionLocal() as session:
        connection = session.scalar(select(DriveConnection))
        connection.backup_folder_id = "replacement-folder-id"
        session.commit()
    wrong_drive = client.get("/api/ready")
    assert wrong_drive.status_code == 503

    with SessionLocal() as session:
        connection = session.scalar(select(DriveConnection))
        connection.backup_folder_id = "private-folder-id"
        completed_backup = session.get(Backup, backup_id)
        completed_backup.completed_at = now_utc() + timedelta(minutes=1)
        session.commit()
    future = client.get("/api/ready")
    assert future.status_code == 503

    with SessionLocal() as session:
        completed_backup = session.get(Backup, backup_id)
        completed_backup.completed_at = now_utc() - app_main.PUBLIC_BACKUP_MAX_AGE - timedelta(seconds=1)
        session.commit()
    stale = client.get("/api/ready")
    assert stale.status_code == 503
    assert stale.json() == {"detail": "GREENATICS RED no está habilitado para acceso público."}

    with SessionLocal() as session:
        session.delete(session.get(Backup, backup_id))
        session.commit()
    unavailable = client.get("/api/ready")
    assert unavailable.status_code == 503
    assert unavailable.json() == {"detail": "GREENATICS RED no está habilitado para acceso público."}


def test_drive_backup_records_its_destination_for_readiness(workspace, monkeypatch):
    from types import SimpleNamespace

    monkeypatch.setattr(backups, "settings", SimpleNamespace(drive_external_actions_enabled=True))
    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=workspace["user_ids"]["admin"], google_email="private-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="current-folder-id",
        ))
        session.commit()

        monkeypatch.setattr(backups, "build_backup_archive_spooled", lambda _session: (io.BytesIO(b"synthetic-zip"), {"projects": 4}))
        monkeypatch.setattr(backups, "_verify_backup_archive_source", lambda _source: {"schema_version": 4})
        monkeypatch.setattr(
            app_main.drive,
            "upload_backup",
            lambda _connection, _filename, _archive: {"id": "synthetic-drive-file"},
        )
        backup = backups.create_drive_backup(session, workspace["user_ids"]["admin"])

        assert backup.status == "completado"
        assert backup.drive_folder_id == "current-folder-id"
        assert backup.drive_file_id == "synthetic-drive-file"


def test_local_configuration_cannot_upload_drive_even_with_operational_writes(workspace, monkeypatch):
    from app.drive import DriveSetupError

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "true")
    local_settings = Settings(app_env="local")
    assert local_settings.operational_writes_enabled is True
    assert local_settings.drive_external_actions_enabled is False
    monkeypatch.setattr(backups, "settings", local_settings)
    uploads = []
    monkeypatch.setattr(app_main.drive, "upload_backup", lambda *args: uploads.append(args))

    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=workspace["user_ids"]["admin"], google_email="synthetic@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="synthetic-folder-id",
        ))
        session.commit()

        with pytest.raises(DriveSetupError, match="staging/producción persistentes"):
            backups.create_drive_backup(session, workspace["user_ids"]["admin"])

        assert session.scalar(select(func.count(Backup.id))) == 0
        assert uploads == []


def test_drive_page_streams_a_verified_private_backup_for_platform_admin(client, workspace, monkeypatch, tmp_path):
    from types import SimpleNamespace

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=False, max_upload_mb=20, google_oauth_ready=True,
        is_production=False, session_https_only=False, trusted_hosts=("testserver",),
        drive_external_actions_enabled=False,
    ))
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=admin_id, google_email="private-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="current-private-folder",
        ))
        current = Backup(
            status="completado", drive_file_id="current-drive-file", drive_file_name="current-backup.zip",
            drive_folder_id="current-private-folder", sha256="a" * 64, bytes_total=128,
            summary={}, created_by=admin_id, completed_at=now_utc(),
        )
        moved = Backup(
            status="completado", drive_file_id="moved-drive-file", drive_file_name="moved-backup.zip",
            drive_folder_id="old-private-folder", sha256="b" * 64, bytes_total=128,
            summary={}, created_by=admin_id, completed_at=now_utc(),
        )
        session.add_all([current, moved])
        session.commit()
        current_id = current.id
        moved_id = moved.id

    sign_in(client, "admin@red.test")
    page = client.get("/drive")
    assert page.status_code == 200
    assert 'id="backup-gate-help"' in page.text
    assert "La carga a Drive requiere staging/producción persistentes y gates aprobados." in page.text
    assert "Modo de recuperación y consulta" in page.text
    assert "vuelve a autorizar esta cuenta y prueba de nuevo" not in page.text
    assert re.search(r'<button class="button primary" type="submit" disabled aria-describedby="backup-gate-help">Crear respaldo ahora</button>', page.text)
    assert page.text.count('action="/drive/backups/') == 1
    assert f'action="/drive/backups/{current_id}/download"' in page.text
    assert f'action="/drive/backups/{moved_id}/download"' not in page.text

    captured = []

    def fake_verified_download(session, backup, actor_id, destination):
        path = Path(destination)
        path.write_bytes(b"synthetic verified backup bytes")
        captured.append(path)
        session.add(AuditEvent(
            project_id=None, actor_id=actor_id, action="backup_downloaded", entity_type="backup",
            entity_id=backup.id, detail={"drive_file_id": backup.drive_file_id},
        ))
        session.commit()

    monkeypatch.setattr(backups, "download_drive_backup", fake_verified_download)
    csrf = csrf_for(client, "/drive")
    rejected = client.post(
        f"/drive/backups/{current_id}/download", data={"csrf": "wrong-synthetic-token"},
    )
    assert rejected.status_code == 403
    assert captured == []

    response = client.post(
        f"/drive/backups/{current_id}/download", data={"csrf": csrf}, follow_redirects=False,
    )
    assert response.status_code == 200
    assert response.content == b"synthetic verified backup bytes"
    assert response.headers["content-type"] == "application/zip"
    assert "attachment; filename=\"current-backup.zip\"" in response.headers["content-disposition"]
    assert response.headers["cache-control"] == "no-store, max-age=0"
    assert len(captured) == 1
    assert not captured[0].exists()
    assert not captured[0].parent.exists()
    with SessionLocal() as session:
        event = session.scalar(select(AuditEvent).where(AuditEvent.action == "backup_downloaded"))
        assert event is not None and event.entity_id == current_id


def test_drive_backup_verification_checks_remote_hash_size_mime_and_folder(monkeypatch):
    from app import drive

    payload = b"synthetic RED backup bytes"
    file_metadata = {
        "id": "synthetic-drive-file",
        "size": str(len(payload)),
        "sha256Checksum": hashlib.sha256(payload).hexdigest(),
        "mimeType": "application/zip",
        "parents": ["red-private-folder"],
    }
    verified = drive.verify_uploaded_backup_metadata(
        "synthetic-access-token", file_metadata,
        expected_size=len(payload), expected_sha256=hashlib.sha256(payload).hexdigest(),
        expected_parent_id="red-private-folder",
    )
    assert verified == file_metadata

    for key, value in (
        ("size", str(len(payload) + 1)),
        ("sha256Checksum", "0" * 64),
        ("mimeType", "text/plain"),
        ("parents", ["another-folder"]),
    ):
        invalid = {**file_metadata, key: value}
        with pytest.raises(drive.DriveBackupVerificationError) as exc_info:
            drive.verify_uploaded_backup_metadata(
                "synthetic-access-token", invalid,
                expected_size=len(payload), expected_sha256=hashlib.sha256(payload).hexdigest(),
                expected_parent_id="red-private-folder",
            )
        assert exc_info.value.uploaded_file_id == "synthetic-drive-file"


def test_drive_backup_fetches_missing_uploaded_metadata(monkeypatch):
    from app import drive

    payload = b"synthetic RED backup bytes"
    expected_hash = hashlib.sha256(payload).hexdigest()
    metadata = {
        "id": "synthetic-drive-file", "size": str(len(payload)), "sha256Checksum": expected_hash,
        "mimeType": "application/zip", "parents": ["red-private-folder"],
    }
    requests = []

    def request_json(url, *, headers):
        requests.append((url, headers))
        return metadata

    monkeypatch.setattr(drive, "_request_json", request_json)
    result = drive.verify_uploaded_backup_metadata(
        "synthetic-access-token", {"id": "synthetic-drive-file"},
        expected_size=len(payload), expected_sha256=expected_hash,
        expected_parent_id="red-private-folder",
    )
    assert result == metadata
    assert requests == [(
        "https://www.googleapis.com/drive/v3/files/synthetic-drive-file?fields=id,size,sha256Checksum,parents,mimeType",
        {"Authorization": "Bearer synthetic-access-token"},
    )]


def test_drive_backup_upload_reads_file_blocks_and_resumes_from_confirmed_offset(monkeypatch):
    import io
    from app import drive

    payload = b"A" * (5 * 1024 * 1024) + b"final-block"
    remote = bytearray()
    put_ranges = []

    class Response:
        def __init__(self, body=b"", *, status=200, headers=None):
            self.body = body
            self.status = status
            self.headers = headers or {}

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self, _size=-1):
            body, self.body = self.body, b""
            return body

    def fake_urlopen(request, timeout=0):
        if request.get_method() == "POST":
            assert request.headers["X-upload-content-length"] == str(len(payload))
            return Response(headers={
                "Location": "https://www.googleapis.com/upload/drive/v3/files?upload_id=spooled-red",
            })
        if request.get_method() == "PUT":
            put_ranges.append(request.get_header("Content-range"))
            remote.extend(request.data)
            if len(put_ranges) == 1:
                return Response(status=308, headers={"Range": f"bytes=0-{len(remote) - 1}"})
            digest = hashlib.sha256(remote).hexdigest()
            metadata = {
                "id": "spooled-backup", "size": str(len(remote)), "sha256Checksum": digest,
                "parents": ["private-red-folder"], "mimeType": "application/zip",
            }
            return Response(json.dumps(metadata).encode(), status=201)
        raise AssertionError(f"Solicitud inesperada: {request.get_method()}")

    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-token")
    monkeypatch.setattr(drive.urllib.request, "urlopen", fake_urlopen)
    with io.BytesIO(payload) as source:
        result = drive.upload_backup(
            DriveConnection(backup_folder_id="private-red-folder"), "red-backup.zip", source,
        )

    assert result["id"] == "spooled-backup"
    assert bytes(remote) == payload
    assert put_ranges == [
        f"bytes 0-{5 * 1024 * 1024 - 1}/{len(payload)}",
        f"bytes {5 * 1024 * 1024}-{len(payload) - 1}/{len(payload)}",
    ]


def test_unverified_drive_backup_remains_failed_and_inspectable(workspace, monkeypatch):
    from app import drive
    from types import SimpleNamespace

    monkeypatch.setattr(backups, "settings", SimpleNamespace(drive_external_actions_enabled=True))
    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=workspace["user_ids"]["admin"], google_email="private-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="current-folder-id",
        ))
        session.commit()
        monkeypatch.setattr(backups, "build_backup_archive_spooled", lambda _session: (io.BytesIO(b"synthetic-zip"), {"projects": 4}))
        monkeypatch.setattr(backups, "_verify_backup_archive_source", lambda _source: {"schema_version": 5})

        def reject_upload(_connection, _filename, _archive):
            raise drive.DriveBackupVerificationError("SHA-256 remoto no coincide", "unverified-file-id")

        monkeypatch.setattr(app_main.drive, "upload_backup", reject_upload)
        with pytest.raises(drive.DriveBackupVerificationError):
            backups.create_drive_backup(session, workspace["user_ids"]["admin"])

        failed = session.scalar(select(Backup).order_by(Backup.created_at.desc()))
        assert failed.status == "fallido"
        assert failed.drive_file_id == "unverified-file-id"
        assert failed.drive_folder_id == "current-folder-id"
        assert failed.sha256 == hashlib.sha256(b"synthetic-zip").hexdigest()
        assert failed.bytes_total == len(b"synthetic-zip")


def test_drive_backup_download_and_isolated_restore_round_trip_with_synthetic_transport(
    workspace, monkeypatch, tmp_path,
):
    """Exercise the real RED ZIP, resumable transport, verified download, and isolated restore together."""
    from types import SimpleNamespace
    from app import drive

    remote: dict[str, object] = {}

    class Response:
        def __init__(self, body=b"", *, status=200, headers=None):
            self.body = body
            self.status = status
            self.headers = headers or {}

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self, size=-1):
            if size < 0:
                body, self.body = self.body, b""
                return body
            body, self.body = self.body[:size], self.body[size:]
            return body

    def fake_urlopen(request, timeout=0):
        if request.get_method() == "POST":
            return Response(headers={
                "Location": "https://www.googleapis.com/upload/drive/v3/files?upload_id=synthetic-roundtrip",
            })
        if request.get_method() == "PUT":
            remote["payload"] = request.data
            # Drive returns authoritative metadata for the exact uploaded bytes.
            payload = remote["payload"]
            remote["metadata"] = {
                "id": "synthetic-roundtrip-file", "name": "GREENATICS_RED_synthetic.zip",
                "size": str(len(payload)), "sha256Checksum": hashlib.sha256(payload).hexdigest(),
                "parents": ["synthetic-private-folder"], "mimeType": "application/zip",
            }
            return Response(json.dumps(remote["metadata"]).encode(), status=201)
        if request.get_method() == "GET" and "alt=media" in request.full_url:
            return Response(remote["payload"])
        if request.get_method() == "GET":
            return Response(json.dumps(remote["metadata"]).encode())
        raise AssertionError(f"Solicitud de transporte inesperada: {request.get_method()} {request.full_url}")

    monkeypatch.setattr(backups, "settings", SimpleNamespace(
        drive_external_actions_enabled=True, max_evidence_total_mb=1024, max_evidence_project_mb=256,
    ))
    monkeypatch.setattr(drive, "refresh_access_token", lambda _connection: "synthetic-access-token")
    monkeypatch.setattr(drive.urllib.request, "urlopen", fake_urlopen)

    evidence_bytes = b"RED synthetic evidence for a full backup round trip"
    evidence_name = "roundtrip-proof.txt"
    (settings.storage_root / "evidence").mkdir(parents=True, exist_ok=True)
    (settings.storage_root / "evidence" / evidence_name).write_bytes(evidence_bytes)
    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=workspace["user_ids"]["admin"], google_email="personal-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="synthetic-private-folder",
        ))
        session.add(EvidenceFile(
            project_id=workspace["project_ids"][0], original_name=evidence_name,
            storage_name=evidence_name, media_type="text/plain", size_bytes=len(evidence_bytes),
            sha256=hashlib.sha256(evidence_bytes).hexdigest(), created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()

        created = backups.create_drive_backup(session, workspace["user_ids"]["admin"])
        assert created.status == "completado"
        assert created.drive_file_id == "synthetic-roundtrip-file"
        assert created.drive_folder_id == "synthetic-private-folder"
        assert created.sha256 == hashlib.sha256(remote["payload"]).hexdigest()

        downloaded_path = tmp_path / "drive-roundtrip.zip"
        download = backups.download_drive_backup(
            session, created, workspace["user_ids"]["admin"], downloaded_path,
        )
        assert download["sha256"] == created.sha256
        assert download["bytes_total"] == created.bytes_total
        assert download["manifest"]["counts"]["evidence_files"] == 1

    target_engine = create_engine(f"sqlite:///{tmp_path / 'restored-red.sqlite3'}")
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    restored_storage = tmp_path / "restored-evidence"
    restored = backups.restore_backup_archive(
        downloaded_path, admin_email="recovery@red.test", admin_name="Admin recuperación",
        admin_password="Synthetic-Recovery-Password-2026", session_factory=target_sessions,
        target_engine=target_engine, storage_root=restored_storage,
    )
    assert restored["admin_email"] == "recovery@red.test"
    assert (restored_storage / "evidence" / evidence_name).read_bytes() == evidence_bytes
    with target_sessions() as session:
        assert session.scalar(select(func.count(Project.id))) == 4
        assert session.scalar(select(func.count(EvidenceFile.id))) == 1
        recovery_admin = session.scalar(select(User).where(User.email == "recovery@red.test"))
        assert recovery_admin and recovery_admin.active and recovery_admin.is_platform_admin
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == "backup_restored")) is not None
    target_engine.dispose()


def test_source_field_coverage_and_conditional_submission_requirements():
    forms = {form["code"]: form for form in FORM_CATALOG["forms"]}
    source_fields = [field for form in forms.values() for field in form["fields"] if field.get("source_field")]
    assert len(source_fields) == 330
    assert sum(len(form["fields"]) for form in forms.values()) == 342
    system_fields = [
        (form["code"], field)
        for form in forms.values()
        for field in form["fields"]
        if field.get("source_system")
    ]
    unmanaged_system_fields = [
        (form_code, field["id"])
        for form_code, field in system_fields
        if not field.get("server_managed") and not field.get("calculated")
    ]
    # P-12 is deliberately read-only and sourced from PMIRS Studio, not record-form calculations.
    assert unmanaged_system_fields == [("P-12", "P12-001")]
    assert next(field for field in forms["P-12"]["fields"] if field["id"] == "P12-001")["control"] == "Sistema/formato"
    visit_link = next(field for field in forms["D-06"]["fields"] if field["id"] == "D06-009")
    assert not visit_link["source_field"]
    assert "No forma parte del maestro RED Bello v7-2" in visit_link["extension_note"]
    point_visit_link = next(field for field in forms["D-04"]["fields"] if field["id"] == "D04-020")
    assert not point_visit_link["source_field"] and not point_visit_link["required"]
    assert "mismo expediente" in point_visit_link["validation"]
    assert "No forma parte del maestro RED Bello v7-2" in point_visit_link["extension_note"]
    scale_state = next(field for field in forms["D-13"]["fields"] if field["id"] == "D13-006")
    assert scale_state["options"] == ["Operativo", "Observación", "No usar"]
    organic_status = next(field for field in forms["D-02"]["fields"] if field["id"] == "D02-018")
    assert not organic_status["required"] and not organic_status["source_field"]
    assert "servicio público de aseo" in organic_status["label"]
    assert "No incluye por sí sola" in organic_status["help"]
    assert "La administración reporta servicio con soporte adjunto" in organic_status["options"]
    organic_details = next(field for field in forms["D-02"]["fields"] if field["id"] == "D02-019")
    assert not organic_details["required"] and not organic_details["source_field"]
    assert "servicio público de aseo" in organic_details["label"]
    assert "SSPD/RUPS" in organic_details["validation"] and "SUI" in organic_details["validation"]
    assert "La excepción del art. 11 corresponde al art. 2.3.2.6.1.6" in organic_details["help"]
    assert "no demuestra que este conjunto tenga una ruta o servicio" in organic_details["help"]
    assert "El manejo interno del conjunto va en D02-008" in organic_details["help"]
    assert "17 de enero de 2027" in organic_details["help"]
    assert "sin inferirla de la norma" in organic_details["help"]
    pgirs_transition = next(field for field in forms["D-02"]["fields"] if field["id"] == "D02-020")
    assert not pgirs_transition["required"] and not pgirs_transition["source_field"]
    assert len(pgirs_transition["options"]) == 7
    assert all("Bello confirma" in option for option in pgirs_transition["options"][2:5])
    assert "fuente oficial municipal" in pgirs_transition["validation"]
    assert "no selecciones un supuesto" in pgirs_transition["application_help"].lower()
    assert "metas, no resultados ni acto vigente" in pgirs_transition["application_help"].lower()
    assert "meta anual 0" in pgirs_transition["application_help"]
    assert "1 a implementarlo" in pgirs_transition["application_help"]
    assert any("Plan de Acción Programado 2026 de Bello" in item["label"] for item in pgirs_transition["application_references"])
    invalid_transition = submission_errors(
        forms["D-02"], {"D02-020": "Metodología confirmada por consulta informal"},
        "Soporte sintético para validación de catálogo.",
    )
    assert "Selecciona una opción disponible para «Estado de consulta municipal sobre la transición de metodología PGIRS (Resolución 0555 de 2026, art. 22)»." in invalid_transition
    confirmed_transition = pgirs_transition["options"][3]
    unsupported_confirmation = submission_errors(
        forms["D-02"], {"D02-020": confirmed_transition}, "Respuesta municipal sintética documentada.",
    )
    assert any("D-02-016" in error for error in unsupported_confirmation)
    assert any("D-02-013" in error for error in unsupported_confirmation)
    supported_confirmation = submission_errors(
        forms["D-02"],
        {"D02-020": confirmed_transition, "D02-016": "Decreto oficial PGIRS, versión 2026–2027"},
        "Respuesta municipal sintética documentada.",
        {"D02-013"},
    )
    assert not any("D-02-016" in error or "D-02-013" in error for error in supported_confirmation)
    internal_organics = next(field for field in forms["D-02"]["fields"] if field["id"] == "D02-008")
    assert "orgánicos" in internal_organics["label"].casefold()
    assert next(field for field in forms["D-01"]["fields"] if field["id"] == "D01-002")["required"]
    assert not next(field for field in forms["D-01"]["fields"] if field["id"] == "D01-006")["required"]

    visit = forms["D-03"]
    complete = {
        "D03-001": "BEL-001", "D03-002": "Diagnóstico", "D03-004": "Brigadista 1",
        "D03-005": "Administración", "D03-008": "Sí",
    }
    assert not submission_errors(visit, complete, "Registro sintético de visita.")
    incomplete_no_visit = {**complete, "D03-008": "No"}
    errors = submission_errors(visit, incomplete_no_visit, "Registro sintético de visita.")
    assert any("Motivo de no ejecución" in error for error in errors)

    status_form = forms["P-06"]
    status = next(field for field in status_form["fields"] if field["id"] == "P06-011")
    assert status["options"] == ["Sí", "No", "Parcial"]


def test_project_code_and_sequence_fields_are_generated_on_the_server(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")

    d01_path = f"/projects/{project_id}/records/new?form_code=D-01"
    d01 = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d01_path), "form_code": "D-01", "record_title": "Ficha sintética",
            "source_note": "Ficha sintética para validar el identificador de proyecto.",
            "D01-001": "BEL-999", "action": "draft",
        },
        follow_redirects=False,
    )
    assert d01.status_code == 303

    d06_path = f"/projects/{project_id}/records/new?form_code=D-06"
    for index in range(2):
        response = client.post(
            f"/projects/{project_id}/records/new",
            data={
                "csrf": csrf_for(client, d06_path), "form_code": "D-06", "record_title": f"Jornada sintética {index + 1}",
                "source_note": "Jornada sintética para validar secuencia automática.",
                "D06-001": "Proyecto alterado", "D06-002": "500", "action": "draft",
            },
            follow_redirects=False,
        )
        assert response.status_code == 303

    d07_path = f"/projects/{project_id}/records/new?form_code=D-07"
    d07 = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d07_path), "form_code": "D-07", "record_title": "Lote sintético",
            "source_note": "Lote sintético para validar secuencia automática.",
            "D07-002": "900", "D07-009": "23:59", "action": "draft",
        },
        follow_redirects=False,
    )
    assert d07.status_code == 303

    with SessionLocal() as session:
        records = list(session.scalars(select(FormRecord).where(FormRecord.project_id == project_id)))
        by_title = {row.title: row for row in records}
        generated_project_code = by_title["Ficha sintética"].payload["D01-001"]
        assert re.fullmatch(r"BEL-\d{3}", generated_project_code)
        assert by_title["Jornada sintética 1"].payload["D06-001"] == generated_project_code
        assert by_title["Jornada sintética 1"].payload["D06-002"] == "1"
        assert by_title["Jornada sintética 2"].payload["D06-002"] == "2"
        assert by_title["Lote sintético"].payload["D07-002"] == "1"
        assert by_title["Lote sintético"].payload["D07-009"] != "23:59"


def test_d14_calculated_summaries_are_read_only_and_ignore_browser_values(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-14"
    page = client.get(path)
    assert page.status_code == 200
    assert 'id="D14-002" name="D14-002"' in page.text
    assert 'id="D14-002" name="D14-002" rows="6" data-derived-field="D14-002" readonly' in page.text
    assert 'id="D14-003" name="D14-003" rows="3" data-derived-field="D14-003" readonly' in page.text
    assert 'id="D14-004" name="D14-004" rows="3" data-derived-field="D14-004" readonly' in page.text
    response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, path), "form_code": "D-14", "record_title": "Cierre sintético",
            "source_note": "Cierre sintético para verificar el campo de sistema.",
            "D14-002": "Checklist inventado", "action": "draft",
        },
        follow_redirects=False,
    )
    assert response.status_code == 303
    with SessionLocal() as session:
        record = session.scalar(select(FormRecord).where(FormRecord.project_id == project_id, FormRecord.form_code == "D-14"))
        record_id = record.id
        assert record.payload["D14-002"] == "Pendiente: selecciona una visita D-03."
        assert record.payload["D14-007"] == "Pendiente: selecciona una visita D-03."
        original_stamp = record.payload["D14-008"]
        assert "Consultor · consultant@red.test · Consultoría GREENATICS · " in original_stamp
        assert original_stamp.endswith(" UTC")

    edit_path = f"/records/{record_id}/edit"
    edited = client.post(
        f"/records/{record_id}/edit",
        data={
            "csrf": csrf_for(client, edit_path), "form_code": "D-14", "record_title": "Cierre sintético",
            "source_note": "Edición sintética para comprobar que la auditoría no cambia.",
            "D14-002": "Otro valor inventado", "D14-008": "Firma falsa enviada por navegador", "action": "draft",
        },
        follow_redirects=False,
    )
    assert edited.status_code == 303
    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        assert record.payload["D14-002"] == "Pendiente: selecciona una visita D-03."
        assert record.payload["D14-008"] == original_stamp


def test_d03_brigadistas_are_project_scoped_users_and_render_as_names(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    with SessionLocal() as session:
        other_field = User(
            email="otherfield@red.test", full_name="Operario de otra unidad",
            password_hash=hash_password(PASSWORD),
        )
        session.add(other_field)
        session.flush()
        session.add(ProjectMembership(project_id=other_project_id, user_id=other_field.id, role="campo"))
        session.commit()
        other_field_id = other_field.id

    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-03"
    page = client.get(path)
    assert page.status_code == 200
    assert f'<option value="{workspace["user_ids"]["field"]}"' in page.text
    assert "Operario · field@red.test · Operario/a de campo" in page.text
    assert other_field_id not in page.text

    def save_brigadistas(selected):
        data = {
            "csrf": csrf_for(client, path), "form_code": "D-03",
            "record_title": "Visita de campo sintética",
            "source_note": "Asignación sintética de brigadistas.", "action": "draft",
            "D03-004": selected,
        }
        return client.post(f"/projects/{project_id}/records/new", data=data, follow_redirects=False)

    rejected = save_brigadistas([workspace["user_ids"]["field"], other_field_id])
    assert rejected.status_code == 422
    assert "debe existir en este expediente" in rejected.text

    accepted = save_brigadistas([workspace["user_ids"]["field"]])
    assert accepted.status_code == 303
    record_url = accepted.headers["location"].split("?", 1)[0]
    detail = client.get(record_url)
    assert detail.status_code == 200
    assert "Operario · field@red.test" in detail.text
    assert workspace["user_ids"]["field"] not in detail.text


def test_p01_source_checklist_reports_reviewed_source_availability(workspace):
    project_id = workspace["project_ids"][0]
    actor_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        pending = p01_source_checklist(session, project_id, "")
        assert "Pendiente" in pending["P01-008"]
        assert "Pendiente" in pending["P01-009"]

        records = {}
        for code in ("D-01", "D-02", "D-04", "Q-01"):
            record = FormRecord(
                project_id=project_id, form_code=code, title=f"{code} fuente sintética",
                status="VALIDATED", source_note="Fuente de prueba revisada como válida.",
                payload={}, created_by=actor_id, updated_by=actor_id,
            )
            session.add(record)
            records[code] = record
        session.flush()
        session.add(EvidenceFile(
            project_id=project_id, record_id=records["D-04"].id, field_id="D04-001",
            original_name="evidencia-sintetica.pdf", storage_name="synthetic-evidence.pdf",
            media_type="application/pdf", size_bytes=128, sha256="a" * 64, created_by=actor_id,
        ))
        session.commit()

        checklist = p01_source_checklist(session, project_id, records["Q-01"].id)
        assert "Completa" in checklist["P01-008"]
        assert "D-01 y D-02" in checklist["P01-008"]
        assert "Completa" in checklist["P01-009"]
        assert "Q-01" in checklist["P01-009"]
        assert "1 registro(s) D-04" in checklist["P01-010"]
        assert "1 evidencia(s)" in checklist["P01-011"]


def test_local_regulatory_extensions_are_identified_and_rendered(client, workspace):
    project_id = workspace["project_ids"][0]
    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-02")
    multiuser_field = next(field for field in form_spec["fields"] if field["id"] == "D02-015")
    assert multiuser_field["options"] == [
        "Pendiente de consultar",
        "La administración no sabe",
        "La administración no reporta opción multiusuario",
        "La administración reporta opción multiusuario sin soporte",
        "La administración reporta opción multiusuario con factura o aforo adjunto",
    ]

    sign_in(client, "consultant@red.test")
    response = client.get(f"/projects/{project_id}/records/new?form_code=D-02")
    assert response.status_code == 200
    assert re.findall(r'<h3 class="field-section-heading wide-field">([^<]+)</h3>', response.text) == [
        "Datos generales del conjunto",
        "Recolección y manejo actual",
        "Dificultades y documentos disponibles",
        "Servicio de aseo y referencias municipales",
        "Datos pendientes y seguimiento",
    ]
    assert re.search(r'<link rel="stylesheet" href="/static/red\.css\?v=[^"]+">', response.text)
    for heading, first_field in (
        ("Datos generales del conjunto", "D02-001"),
        ("Recolección y manejo actual", "D02-003"),
        ("Dificultades y documentos disponibles", "D02-011"),
        ("Servicio de aseo y referencias municipales", "D02-015"),
    ):
        assert response.text.index(f">{heading}</h3>") < response.text.index(f'id="{first_field}"')
    assert '<select id="D02-015" name="D02-015"' in response.text
    assert "Es un dato declarado, no una clasificación jurídica de RED." in response.text
    assert "El Plan de Acción Programado 2026 asigna meta anual 0 a actualizar el PGIRS y 1 a implementarlo" in response.text
    assert "Decreto 201904000516 del 12-12-2019" in response.text
    assert 'href="https://belloantioquia.micolombiadigital.gov.co/sites/belloantioquia/content/files/000389/19446_plan-de-desarrollo--bello-2024-1.pdf"' in response.text
    assert "son metas, no resultados ni acto vigente" in response.text.lower()
    assert "El Plan de Desarrollo Municipal de Bello 2024–2027 refiere que el PGIRS fue actualizado" in response.text
    assert "El documento discrepa entre 54,7 % y 54,8 %" in response.text
    assert "La auditoría municipal AIC-05-2025, numeral 14.43" in response.text
    assert "no identifica el número del acto ni la versión del plan" in response.text
    assert "No selecciones un supuesto del art. 22 de la Resolución 0555 solo por estas pistas" in response.text
    assert "Esto tampoco determina una obligación de PMIRS para la copropiedad." in response.text
    assert 'id="D02-020-application-references"' in response.text
    assert 'href="https://normas.cra.gov.co/Gestor/docs/resolucion_minviviendact_0555_2026.htm"' in response.text
    assert 'href="https://minvivienda.gov.co/normativa/resolucion-0555-2026-0"' in response.text
    assert 'href="https://www.bello.gov.co/Transparencia/48%20Informes%20de%20gestin%20evaluacin%20y%20auditora/informe-programacion-plan-de-accion-2026.pdf"' in response.text
    assert 'href="https://bello.gov.co/Transparencia/Cumplimiento%20Control%20Interno/Auditoria%20N%C2%B0AIC-05-2025%20Rendicion%20de%20Cuentas%20Contraloria%20Municipal%20de%20Bello%20aplicativo%20Gestion%20Trans.pdf"' in response.text
    transition_control = re.search(r'<select id="D02-020"[^>]*>', response.text)
    assert transition_control and "D02-020-application-references" in transition_control.group(0)
    assert "No forma parte del maestro RED Bello v7-2." in response.text
    assert 'id="D02-006-application-help"' in response.text
    assert "no demuestra el estado actual de este conjunto" in response.text
    assert 'id="D02-007-application-help"' in response.text
    assert "Ruta Reciclo municipal" in response.text
    assert "No la confundas con la recolección selectiva de orgánicos" in response.text


def test_d02_missing_admin_data_is_explicit_and_reviewable(client, workspace):
    from app.main import repeatable_field_display

    project_id = workspace["project_ids"][0]
    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-02")
    pending_field = next(field for field in form_spec["fields"] if field["id"] == "D02-021")
    assert not pending_field["source_field"]
    assert all(not next(field for field in form_spec["fields"] if field["id"] == field_id)["required"] for field_id in (
        "D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012",
    ))
    errors = submission_errors(form_spec, {}, "Fuente de alistamiento sintética.")
    assert all(f"Completa {field_id}" in " ".join(errors) for field_id in (
        "D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012",
    ))
    pending_rows = [{
        "field_id": field_id,
        "status": "Pendiente de solicitar",
        "detail": "Solicitar a administración antes de la visita.",
    } for field_id in ("D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012")]
    payload = {"D02-021": json.dumps(pending_rows, ensure_ascii=False)}
    assert not [error for error in submission_errors(form_spec, payload, "Ficha de alistamiento sintética.")
                if error.startswith(("Completa D02-", "D-02-021", "Selecciona un dato"))]
    assert "Responsable, fuente o siguiente paso / justificación: Solicitar a administración antes de la visita." in repeatable_field_display(payload["D02-021"], "D02-021")
    for malformed in (
        [pending_rows[0], pending_rows[0]],
        [{**pending_rows[0], "field_id": "D02-999"}],
        [{**pending_rows[0], "status": "Confirmado"}],
        [{**pending_rows[0], "detail": "no"}],
        [{**pending_rows[0], "status": "No aplica; justificar", "detail": "No aplica"}],
    ):
        malformed_errors = submission_errors(form_spec, {"D02-021": json.dumps(malformed)}, "Ficha de alistamiento sintética.")
        assert any("D-02-021" in error or "dato requerido disponible" in error or "estado de consulta" in error or "Justifica" in error for error in malformed_errors)
    contradicted = {**payload, "D02-001": "0"}
    assert any("tiene un valor y no debe figurar también como pendiente" in error for error in submission_errors(
        form_spec, contradicted, "Ficha de alistamiento sintética.",
    ))

    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-02"
    page = client.get(path)
    assert page.status_code == 200
    assert 'data-repeatable-table="D02-021"' in page.text
    assert 'name="D02-021__field_id"' in page.text and '<option value="D02-012">D02-012</option>' in page.text
    assert 'name="D02-021__status"' in page.text and "La administración no sabe" in page.text
    assert "no uses 0 ni una respuesta supuesta" in page.text
    submission_key = re.search(r'name="submission_key" value="([^"]+)"', page.text)
    assert submission_key
    posted = client.post(f"/projects/{project_id}/records/new", data={
        "csrf": csrf_for(client, path), "submission_key": submission_key.group(1), "form_code": "D-02",
        "record_title": "Alistamiento sintético con faltantes", "source_kind": "declarado",
        "source_note": "Ficha sintética; seis datos deben consultarse.", "action": "submit",
        "D02-014": "Sí — Administración PH sintética",
        **{f"D02-021__{key}": [row[key] for row in pending_rows] for key in ("field_id", "status", "detail")},
    }, follow_redirects=False)
    assert posted.status_code == 303
    record_id = posted.headers["location"].split("?", 1)[0].rsplit("/", 1)[-1]
    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        assert record and record.status == "PENDING_REVIEW"
        assert all(not record.payload.get(field_id) for field_id in ("D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012"))
        assert len(json.loads(record.payload["D02-021"])) == 6
        # A QA-reviewed administrative intake can still be insufficient for
        # accepting a factual Línea Base while its required facts remain open.
        record.status = "VALIDATED"
        for form_code in ("D-01", "D-06", "D-07", "D-08", "Q-01"):
            session.add(FormRecord(
                project_id=project_id, form_code=form_code, title=f"{form_code} sintético de soporte",
                status="VALIDATED", source_note="Fuente sintética revisada para probar el gate.",
                payload={"synthetic": "dato ficticio"}, created_by=workspace["user_ids"]["consultant"],
                updated_by=workspace["user_ids"]["consultant"], reviewed_by=workspace["user_ids"]["reviewer"],
            ))
        bind_synthetic_fraction_source(session, project_id)
        session.commit()
        assert baseline_missing_forms(session, project_id) == ["D-02"]
    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    baseline_path = f"/projects/{project_id}"
    blocked_baseline = client.post(f"/projects/{project_id}/baseline", data={
        "csrf": csrf_for(client, baseline_path), "decision": "validada",
        "reference": "LB-SINTETICA-PENDIENTE", "reason": "D-02 conserva seis hechos por confirmar.",
    }, follow_redirects=False)
    assert blocked_baseline.status_code == 422
    assert "Falta revisar como válido: D-02" in blocked_baseline.text
    assert "D02-021 documenta el seguimiento, pero no reemplaza esos datos" in blocked_baseline.text
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    detail = client.get(f"/records/{record_id}")
    assert detail.status_code == 200
    assert "Datos de administración por confirmar" in detail.text
    assert "Pendiente de solicitar" in detail.text
    edit = client.get(f"/records/{record_id}/edit")
    assert edit.status_code == 200
    assert re.search(r'<option value="D02-001"[^>]*selected', edit.text)
    exported = client.get(f"/projects/{project_id}/records/export.csv")
    assert exported.status_code == 200
    assert "Solicitar a administración antes de la visita." in exported.text

    infrastructure = client.get(f"/projects/{project_id}/records/new?form_code=D-04")
    assert infrastructure.status_code == 200
    assert 'id="D04-018"' in infrastructure.text
    assert 'id="D04-019"' in infrastructure.text
    assert "Crea un registro por cuarto/punto" in infrastructure.text
    assert "D04-020" in infrastructure.text

    shift = client.get(f"/projects/{project_id}/records/new?form_code=D-06")
    assert shift.status_code == 200
    assert 'id="D06-009" name="D06-009"' in shift.text
    assert "relación operativa visita–jornada" in shift.text


def test_d02_special_stream_field_explains_respel_boundary(client, workspace):
    sign_in(client, "consultant@red.test")
    project_id = workspace["project_ids"][0]
    response = client.get(f"/projects/{project_id}/records/new?form_code=D-02")

    assert response.status_code == 200
    assert 'id="D02-009-application-help"' in response.text
    assert "No clasifiques una corriente como RESPEL" in response.text
    assert "Decreto 0766 de 2026" in response.text
    assert "Adjunta soportes autorizados en D02-013" in response.text


def test_d02_saved_record_keeps_capture_sections_for_review(client, workspace):
    project_id = workspace["project_ids"][0]
    author = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-02", title="D-02 sintético por secciones",
            status="RAW", source_note="Fuente sintética para revisar la presentación agrupada.",
            payload={"D02-001": "100", "D02-003": "8:00–16:00", "D02-015": "Pendiente de consultar"},
            created_by=author, updated_by=author,
        )
        session.add(record)
        session.commit()
        record_id = record.id

    sign_in(client, "consultant@red.test")
    response = client.get(f"/records/{record_id}")
    assert response.status_code == 200
    section_titles = [
        "Datos generales del conjunto",
        "Recolección y manejo actual",
        "Dificultades y documentos disponibles",
        "Servicio de aseo y referencias municipales",
        "Datos pendientes y seguimiento",
    ]
    assert re.findall(r'<h3 class="answer-section-heading">([^<]+)</h3>', response.text) == section_titles
    assert response.text.count('<dl class="answer-list">') == 5
    for title, field_id in zip(section_titles, ("D02-001", "D02-003", "D02-011", "D02-015", "D02-021")):
        assert response.text.index(f">{title}</h3>") < response.text.index(f"{field_id} · RAW")
    assert "100" in response.text and "Pendiente de consultar" in response.text
    assert re.search(r'/static/red\.css\?v=[^"\']+', response.text)


def test_d04_receptacle_subtable_serializes_validates_and_exports():
    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-04")
    payload = _record_payload(FormData([
        ("D04-004__type", "Caneca azul"), ("D04-004__type", "Contenedor metálico"),
        ("D04-004__quantity", "2"), ("D04-004__quantity", "1"),
        ("D04-004__capacity", "120 L"), ("D04-004__capacity", ""),
    ]), form_spec)
    rows = d04_container_rows(payload["D04-004"], include_legacy=False)
    assert rows == [
        {"container_type": "Caneca azul", "quantity": "2", "capacity": "120 L"},
        {"container_type": "Contenedor metálico", "quantity": "1", "capacity": ""},
    ]
    assert d04_container_display(payload["D04-004"]) == "2 × Caneca azul · capacidad: 120 L\n1 × Contenedor metálico"

    required_values = {}
    for field in form_spec["fields"]:
        if not field.get("required") or field.get("server_managed") or field["id"] == "D04-004":
            continue
        if field.get("multi_select"):
            required_values[field["id"]] = "\n".join(field.get("options", [])[:1]) or "dato observado"
        elif field.get("options"):
            required_values[field["id"]] = field["options"][0]
        else:
            required_values[field["id"]] = "dato observado"
    complete = {**required_values, "D04-004": payload["D04-004"]}
    uploaded = {field["id"] for field in form_spec["fields"] if field.get("file_upload")}
    assert not submission_errors(form_spec, complete, "Observación sintética de infraestructura.", uploaded)

    empty = submission_errors(form_spec, {**required_values, "D04-004": "[]"}, "Observación sintética de infraestructura.", uploaded)
    assert any("al menos un recipiente" in error for error in empty)
    incomplete_row = json.dumps([{"container_type": "Caneca", "quantity": "1.5", "capacity": ""}])
    invalid = submission_errors(form_spec, {**required_values, "D04-004": incomplete_row}, "Observación sintética de infraestructura.", uploaded)
    assert any("entero mayor que cero" in error for error in invalid)

    legacy = "Tres canecas de color verde según relato anterior"
    assert d04_container_is_legacy(legacy)
    assert d04_container_rows(legacy)[0]["container_type"] == legacy
    assert d04_container_display(legacy) == f"Valor anterior (texto libre): {legacy}"
    legacy_long = ("Texto anterior sin estructura " + ("que se conserva " * 20)).strip()
    legacy_payload = _record_payload(FormData([("D04-004", legacy_long)]), form_spec)
    assert d04_container_rows(legacy_payload["D04-004"])[0]["container_type"] == legacy_long
    too_many = json.dumps([{"container_type": f"Tipo {index}", "quantity": "1", "capacity": ""} for index in range(51)])
    assert "hasta 50 filas" in app_main.d04_container_limit_error(too_many)


def test_p02_repeatable_subrecords_keep_structured_rows_and_legacy_text(client, workspace):
    sign_in(client, "admin@red.test")
    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "P-02")
    p02_page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code=P-02")
    assert p02_page.status_code == 200
    for field_id in ("P02-003", "P02-005", "P02-009"):
        assert f'data-repeatable-table="{field_id}"' in p02_page.text
    assert 'name="P02-005__stream"' in p02_page.text
    assert 'name="P02-009__audience"' in p02_page.text
    submission_key = re.search(r'name="submission_key" value="([^"]+)"', p02_page.text)
    assert submission_key
    created = client.post(
        f"/projects/{workspace['project_ids'][0]}/records/new",
        data={
            "csrf": csrf_for(client, f"/projects/{workspace['project_ids'][0]}/records/new?form_code=P-02"),
            "submission_key": submission_key.group(1), "form_code": "P-02",
            "record_title": "Antecedentes administrativos sintéticos", "source_kind": "declarado",
            "source_note": "Ejemplo sintético para verificar filas repetibles.", "action": "draft",
            "P02-005__name": "Gestor de prueba", "P02-005__service": "Recolección reportada",
            "P02-005__stream": "Cartón", "P02-005__contact": "Pendiente de confirmar",
        },
        follow_redirects=False,
    )
    assert created.status_code == 303
    detail = client.get(created.headers["location"])
    assert "Nombre: Gestor de prueba" in detail.text
    assert "Servicio reportado: Recolección reportada" in detail.text

    payload = _record_payload(FormData([
        ("P02-003__name", "Comité ambiental"), ("P02-003__role", "Apoyo a separación"),
        ("P02-003__contact", "correo institucional"),
        ("P02-005__name", "Reciclador reportado"), ("P02-005__service", "Recolección"),
        ("P02-005__stream", "Papel"), ("P02-005__contact", "Pendiente de confirmar"),
        ("P02-009__date", "2024-11-03"), ("P02-009__topic", "Separación en la fuente"),
        ("P02-009__audience", "Personal de servicios generales"),
        ("P02-009__evidence", "Acta informada, aún no recibida"),
    ]), form_spec)
    rows = repeatable_field_rows(payload["P02-005"], "P02-005")
    assert rows[0]["name"] == "Reciclador reportado"
    assert rows[0]["stream"] == "Papel"
    assert "Servicio reportado: Recolección" in repeatable_field_display(payload["P02-005"], "P02-005")
    assert repeatable_field_rows_by_form(payload, form_spec)["P02-009"][0]["date"] == "2024-11-03"

    legacy_payload = _record_payload(FormData([("P02-005", "Asociación reportada · aprovechamiento · cartón · contacto por confirmar")]), form_spec)
    assert repeatable_field_rows(legacy_payload["P02-005"], "P02-005")[0]["legacy_text"] == "Asociación reportada · aprovechamiento · cartón · contacto por confirmar"
    assert "Dato anterior sin desglose (revisar)" in repeatable_field_display(legacy_payload["P02-005"], "P02-005")
    too_many = json.dumps([{"name": f"Gestor {index}"} for index in range(51)])
    assert "hasta 50 filas" in repeatable_field_limit_error(too_many, "P02-005")


def test_multi_select_text_fields_keep_options_and_details_through_capture(client, workspace):
    sign_in(client, "admin@red.test")
    by_id = {
        field["id"]: (form, field)
        for form in FORM_CATALOG["forms"]
        for field in form["fields"]
    }
    for field_id, form_code in (("D02-011", "D-02"), ("D05-009", "D-05"), ("D10-003", "D-10")):
        form_spec, field = by_id[field_id]
        assert form_spec["code"] == form_code
        assert field["multi_select_text"] is True
        assert field["options"]
        page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code={form_code}")
        assert page.status_code == 200
        assert f'name="{field_id}" multiple' in page.text
        assert f'name="{field_id}__detail"' in page.text

    form_spec, field = by_id["D02-011"]
    chosen = field["options"][:2]
    detail_text = "Observación concreta reportada por la administración."
    payload = _record_payload(FormData([
        ("D02-011", chosen[0]), ("D02-011", chosen[1]), ("D02-011__detail", detail_text),
    ]), form_spec)
    stored = payload["D02-011"]
    assert multi_select_selected_values(stored) == chosen
    assert multi_select_text_detail(stored) == detail_text
    assert multi_select_display(stored) == " · ".join(chosen + ["Detalle: " + detail_text])
    rendered_context = multi_select_context_by_form(payload, form_spec)
    assert rendered_context["multi_select_selected_by_field"]["D02-011"] == chosen
    assert rendered_context["multi_select_detail_by_field"]["D02-011"] == detail_text

    project_id = workspace["project_ids"][0]
    form_page = client.get(f"/projects/{project_id}/records/new?form_code=D-02")
    submission_key = re.search(r'name="submission_key" value="([^"]+)"', form_page.text)
    assert submission_key
    created = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, f"/projects/{project_id}/records/new?form_code=D-02"),
            "submission_key": submission_key.group(1), "form_code": "D-02",
            "record_title": "Dificultades sintéticas", "source_kind": "declarado",
            "source_note": "Declaración sintética para probar selección y detalle.", "action": "draft",
            "D02-011": chosen, "D02-011__detail": detail_text,
        },
        follow_redirects=False,
    )
    assert created.status_code == 303
    detail_page = client.get(created.headers["location"])
    assert detail_text in detail_page.text
    assert all(option in detail_page.text for option in chosen)
    record_id = created.headers["location"].split("?", 1)[0].rsplit("/", 1)[-1]
    with SessionLocal() as session:
        created_record = session.get(FormRecord, record_id)
        assert created_record
        assert multi_select_selected_values(created_record.payload["D02-011"]) == chosen
        assert multi_select_text_detail(created_record.payload["D02-011"]) == detail_text
    edit_page = client.get(f"/records/{record_id}/edit")
    assert edit_page.status_code == 200
    for option in chosen:
        assert re.search(r'<option value="' + re.escape(option) + r'"[^>]*selected', edit_page.text), edit_page.text[edit_page.text.find('id="D02-011"'):edit_page.text.find('id="D02-011"') + 700]
    assert f'>{detail_text}</textarea>' in edit_page.text
    export = client.get(f"/projects/{project_id}/records/export.csv")
    assert export.status_code == 200
    assert detail_text in export.text

    without_choice = {"D10-003": encode_multi_select_text([], "Detalle sin opción")}
    errors = submission_errors(by_id["D10-003"][0], without_choice, "Observación sintética suficiente.")
    assert "Campo requerido: Restricciones de acceso" in errors
    with_choice = {"D10-003": encode_multi_select_text([by_id["D10-003"][1]["options"][0]], "Acceso observado")}
    errors = submission_errors(by_id["D10-003"][0], with_choice, "Observación sintética suficiente.")
    assert "Campo requerido: Restricciones de acceso" not in errors
    invalid_choice = {"D02-011": encode_multi_select_text(["Opción ajena al catálogo"], "Detalle")}
    assert any("Selecciona solo opciones disponibles" in error for error in submission_errors(
        form_spec, invalid_choice, "Observación sintética suficiente.",
    ))


def test_p11_implementation_evidence_accepts_private_file_or_traceable_record(client, workspace):
    sign_in(client, "admin@red.test")
    form_spec = next(form for form in FORM_CATALOG["forms"] if form["code"] == "P-11")
    field = next(item for item in form_spec["fields"] if item["id"] == "P11-004")
    uploader_field = next(item for item in form_spec["fields"] if item["id"] == "P11-007")
    assert field["file_upload"] is True
    assert field["file_or_record"] is True
    assert uploader_field["server_managed"] is True
    assert uploader_field["source_system"] is True
    assert "no se puede sustituir al editar" in uploader_field["help"]

    form_page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code=P-11")
    assert form_page.status_code == 200
    assert 'name="evidence__P11-004"' in form_page.text
    assert 'name="P11-004"' in form_page.text
    assert 'id="P11-007" name="P11-007" type="text"' in form_page.text
    assert 'readonly aria-readonly="true"' in form_page.text[form_page.text.find('id="P11-007"') : form_page.text.find('id="P11-007"') + 300]
    assert "RED conserva la cuenta que creó este registro" in form_page.text
    assert "Al enviar a revisión, se requiere un archivo o completar este campo." in form_page.text

    missing = submission_errors(form_spec, {}, "Descripción sintética suficiente.")
    assert "Campo requerido: Archivo/registro" in missing
    text_reference = "Acta sintética de visita PH, carpeta documental acordada, folio 2."
    with_record = _record_payload(FormData([("P11-004", text_reference)]), form_spec)
    assert with_record["P11-004"] == text_reference
    assert "Campo requerido: Archivo/registro" not in submission_errors(
        form_spec, with_record, "Descripción sintética suficiente.",
    )
    file_only_errors = submission_errors(
        form_spec, {}, "Descripción sintética suficiente.", uploaded_field_ids={"P11-004"},
    )
    assert "Campo requerido: Archivo/registro" not in file_only_errors

    project_id = workspace["project_ids"][0]
    key = re.search(r'name="submission_key" value="([^"]+)"', form_page.text)
    assert key
    created = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, f"/projects/{project_id}/records/new?form_code=P-11"),
            "submission_key": key.group(1), "form_code": "P-11",
            "record_title": "Evidencia sintética sin archivo", "source_kind": "documental",
            "source_note": "Referencia documental sintética para revisar soporte alternativo.",
            "action": "draft", "P11-004": text_reference, "P11-007": "Cuenta suplantada",
        },
        follow_redirects=False,
    )
    assert created.status_code == 303
    detail_page = client.get(created.headers["location"])
    assert text_reference in detail_page.text
    record_id = created.headers["location"].split("?", 1)[0].rsplit("/", 1)[-1]
    with SessionLocal() as session:
        stored_record = session.get(FormRecord, record_id)
        assert stored_record
        assert stored_record.created_by == workspace["user_ids"]["admin"]
        assert stored_record.payload["P11-007"] == "Admin RED · Administración RED"

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    edit_page = client.get(f"/records/{record_id}/edit")
    assert edit_page.status_code == 200
    assert f">{text_reference}</textarea>" in edit_page.text
    edit_key = re.search(r'name="submission_key" value="([^"]+)"', edit_page.text)
    assert edit_key
    edited = client.post(
        f"/records/{record_id}/edit",
        data={
            "csrf": csrf_for(client, f"/records/{record_id}/edit"),
            "submission_key": edit_key.group(1), "record_title": "Evidencia sintética revisada",
            "record_date": "", "source_kind": "documental", "source_note": "Edición sintética.",
            "action": "draft", "P11-004": text_reference, "P11-007": "Otra cuenta suplantada",
        },
        follow_redirects=False,
    )
    assert edited.status_code == 303
    with SessionLocal() as session:
        stored_record = session.get(FormRecord, record_id)
        assert stored_record
        assert stored_record.payload["P11-007"] == "Admin RED · Administración RED"
        assert stored_record.created_by == workspace["user_ids"]["admin"]
        assert stored_record.updated_by == workspace["user_ids"]["consultant"]
    export = client.get(f"/projects/{project_id}/records/export.csv")
    assert export.status_code == 200
    assert text_reference in export.text
    assert "Admin RED · Administración RED" in export.text


def test_p10_attendance_and_evidence_are_required_only_after_session_execution(client, workspace):
    form_spec = next(form for form in FORM_CATALOG["forms"] if form["code"] == "P-10")
    by_id = {field["id"]: field for field in form_spec["fields"]}
    for field_id in ("P10-009", "P10-010"):
        assert by_id[field_id]["required"] is False
        assert by_id[field_id]["required_when"] == {"field_id": "P10-013", "equals_any": ["Ejecutada"]}

    planned_errors = submission_errors(form_spec, {"P10-013": "Programada"}, "Agenda sintética de capacitación.")
    assert "Campo requerido: Asistentes" not in planned_errors
    assert "Campo requerido: Evidencia de sesión" not in planned_errors
    executed_errors = submission_errors(form_spec, {"P10-013": "Ejecutada"}, "Acta sintética de ejecución de sesión.")
    assert "Campo requerido: Asistentes" in executed_errors
    assert "Campo requerido: Evidencia de sesión" in executed_errors
    zero_errors = submission_errors(
        form_spec, {"P10-013": "Ejecutada", "P10-009": "0"}, "Acta sintética de ejecución de sesión.",
    )
    assert "El número de asistentes de una sesión ejecutada debe ser un entero mayor que cero." in zero_errors
    fractional_errors = submission_errors(
        form_spec, {"P10-013": "Ejecutada", "P10-009": "1.5"}, "Acta sintética de ejecución de sesión.",
    )
    assert "El número de asistentes de una sesión ejecutada debe ser un entero mayor que cero." in fractional_errors
    positive_integer_errors = submission_errors(
        form_spec, {"P10-013": "Ejecutada", "P10-009": "2"}, "Acta sintética de ejecución de sesión.",
    )
    assert "El número de asistentes de una sesión ejecutada debe ser un entero mayor que cero." not in positive_integer_errors

    sign_in(client, "admin@red.test")
    page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code=P-10")
    assert page.status_code == 200
    for field_id in ("P10-009", "P10-010"):
        assert f'data-required-when-field="P10-013" data-required-when-values="Ejecutada"' in page.text
    assert 'id="P10-009" name="P10-009" type="number" step="1" min="1"' in page.text
    for form_code, source_id in (("D-02", "D02-012"), ("D-03", "D03-008")):
        conditional_page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code={form_code}")
        assert conditional_page.status_code == 200
        assert f'data-required-when-field="{source_id}"' in conditional_page.text


def test_existing_conditional_fields_apply_server_and_form_requirements(client, workspace):
    forms = {form["code"]: form for form in FORM_CATALOG["forms"]}
    d02 = forms["D-02"]
    yes_errors = submission_errors(
        d02, {"D02-012": "Sí"}, "Declaración sintética de existencia documental.",
    )
    no_errors = submission_errors(
        d02, {"D02-012": "No"}, "Declaración sintética de inexistencia documental.",
    )
    file_errors = submission_errors(
        d02, {"D02-012": "Sí"}, "Declaración sintética de existencia documental.",
        uploaded_field_ids={"D02-013"},
    )
    assert "Campo requerido: Documentos adjuntos" in yes_errors
    assert "Campo requerido: Documentos adjuntos" not in no_errors
    assert "Campo requerido: Documentos adjuntos" not in file_errors

    d03 = forms["D-03"]
    cannot_visit_errors = submission_errors(
        d03, {"D03-008": "No"}, "Visita pospuesta por condición sintética.",
    )
    can_visit_errors = submission_errors(
        d03, {"D03-008": "Sí"}, "Visita programada para prueba sintética.",
    )
    assert "Campo requerido: Motivo de no ejecución" in cannot_visit_errors
    assert "Campo requerido: Motivo de no ejecución" not in can_visit_errors

    sign_in(client, "admin@red.test")
    d02_page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code=D-02")
    d03_page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code=D-03")
    assert 'data-required-when-field="D02-012"' in d02_page.text
    assert 'data-required-when-field="D03-008"' in d03_page.text


def test_d13_explicit_equipment_states_are_selectable_and_server_validated(client, workspace):
    form_spec = next(form for form in FORM_CATALOG["forms"] if form["code"] == "D-13")
    status_field = next(field for field in form_spec["fields"] if field["id"] == "D13-006")
    assert status_field["options"] == ["Operativo", "Observación", "No usar"]
    errors = submission_errors(form_spec, {"D13-006": "Operativa"}, "Inspección sintética del equipo.")
    assert "Selecciona una opción disponible para «Estado antes de uso»." in errors
    canonical_errors = submission_errors(form_spec, {"D13-006": "Operativo"}, "Inspección sintética del equipo.")
    assert "Selecciona una opción disponible para «Estado antes de uso»." not in canonical_errors

    sign_in(client, "consultant@red.test")
    page = client.get(f"/projects/{workspace['project_ids'][0]}/records/new?form_code=D-13")
    assert page.status_code == 200
    assert '<select id="D13-006" name="D13-006"' in page.text
    assert "Operativo" in page.text and "Observación" in page.text and "No usar" in page.text


def test_review_controls_only_appear_for_records_awaiting_review(client, workspace):
    project_id = workspace["project_ids"][0]
    reviewer_id = workspace["user_ids"]["reviewer"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-06", title="Jornada sintética para revisión",
            status="PENDING_REVIEW", payload={}, source_note="Datos ficticios de prueba.",
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        )
        session.add(record)
        session.commit()
        record_id = record.id

    sign_in(client, "reviewer@red.test")
    pending_page = client.get(f"/records/{record_id}")
    assert pending_page.status_code == 200
    assert 'class="panel review-panel"' in pending_page.text
    assert 'name="decision"' in pending_page.text

    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        record.status = "VALIDATED"
        record.review_note = "Revisión sintética completada."
        record.reviewed_by = reviewer_id
        record.reviewed_at = now_utc()
        session.commit()

    validated_page = client.get(f"/records/{record_id}")
    assert validated_page.status_code == 200
    assert "Revisión sintética completada." in validated_page.text
    assert 'class="panel review-panel"' not in validated_page.text
    assert 'name="decision"' not in validated_page.text


def test_d04_point_id_is_server_assigned_and_visit_link_is_project_scoped(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    actor_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        visit = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita sintética punto D-04", status="RAW",
            payload={}, source_note="Visita sintética para la relación punto-visita.", created_by=actor_id, updated_by=actor_id,
        )
        foreign_visit = FormRecord(
            project_id=other_project_id, form_code="D-03", title="Visita ajena sintética", status="RAW",
            payload={}, source_note="Visita de otro expediente para probar aislamiento.", created_by=actor_id, updated_by=actor_id,
        )
        session.add_all([visit, foreign_visit])
        session.commit()
        visit_id, foreign_visit_id = visit.id, foreign_visit.id

    sign_in(client, "consultant@red.test")
    form_path = f"/projects/{project_id}/records/new?form_code=D-04"
    page = client.get(form_path)
    assert page.status_code == 200
    assert '<input id="D04-001" name="D04-001"' in page.text
    assert "RED asigna un identificador estable a cada registro D-04" in page.text
    assert f'<option value="{visit_id}"' in page.text
    assert foreign_visit_id not in page.text

    post_path = f"/projects/{project_id}/records/new"
    saved = client.post(
        post_path,
        data={
            "csrf": csrf_for(client, form_path), "form_code": "D-04", "record_title": "Punto de almacenamiento sintético",
            "source_note": "Punto sintético asociado a una visita del mismo expediente.", "action": "draft",
            "D04-001": "PUN-FAKE-999", "D04-020": visit_id,
        },
        follow_redirects=False,
    )
    assert saved.status_code == 303
    record_id = saved.headers["location"].split("/records/")[-1].split("?")[0]
    with SessionLocal() as session:
        point = session.get(FormRecord, record_id)
        assert re.fullmatch(r"PUN-BEL-\d{3}-[A-F0-9]+", point.payload["D04-001"])
        assert point.payload["D04-001"] != "PUN-FAKE-999"
        assert point.payload["D04-020"] == visit_id
        stable_point_id = point.payload["D04-001"]

    edit_path = f"/records/{record_id}/edit"
    updated = client.post(
        edit_path,
        data={
            "csrf": csrf_for(client, edit_path), "form_code": "D-04", "record_title": "Punto de almacenamiento sintético actualizado",
            "source_note": "Actualización sintética que conserva identidad del punto.", "action": "draft",
            "D04-001": "PUN-FAKE-EDIT-001", "D04-020": visit_id,
        },
        follow_redirects=False,
    )
    assert updated.status_code == 303
    with SessionLocal() as session:
        point = session.get(FormRecord, record_id)
        assert point.payload["D04-001"] == stable_point_id

    rejected = client.post(
        post_path,
        data={
            "csrf": csrf_for(client, form_path), "form_code": "D-04", "record_title": "Punto con visita ajena sintética",
            "source_note": "Ensayo sintético de rechazo entre expedientes.", "action": "draft", "D04-020": foreign_visit_id,
        },
        follow_redirects=False,
    )
    assert rejected.status_code == 422
    assert "debe existir en este expediente" in rejected.text


def test_d04_receptacle_subtable_renders_and_round_trips_in_project(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-04"
    form = client.get(path)
    assert form.status_code == 200
    assert 'data-repeatable-table="D04-004"' in form.text
    assert 'name="D04-004__type"' in form.text
    assert 'name="D04-004__quantity"' in form.text
    assert "Capacidad, si se conoce" in form.text

    saved = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, path), "form_code": "D-04", "record_title": "Recipientes sintéticos",
            "record_date": "2026-10-08", "source_kind": "observado", "source_note": "Observación sintética en campo.",
            "D04-004__type": ["Tapa verde", "Caneca azul"],
            "D04-004__quantity": ["3", "1"], "D04-004__capacity": ["", "120 L"], "action": "draft",
        },
        follow_redirects=False,
    )
    assert saved.status_code == 303
    detail_url = saved.headers["location"].split("?", 1)[0]
    detail = client.get(detail_url)
    assert detail.status_code == 200
    assert "Cantidad: 3" in detail.text and "Tipo observado: Tapa verde" in detail.text
    assert "Capacidad observada: 120 L" in detail.text
    edit = client.get(detail_url + "/edit")
    assert edit.status_code == 200
    assert 'value="Tapa verde"' in edit.text and 'value="120 L"' in edit.text

    with SessionLocal() as session:
        project = session.get(Project, project_id)
        rows, _record_count = project_record_export_rows(session, project)
    exported = next(row for row in rows if row[14] == "D04-004")
    assert "3 × Tapa verde" in exported[17]
    assert "1 × Caneca azul · capacidad: 120 L" in exported[17]


def test_p09_blocker_uses_description_and_project_scoped_issue_link(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    actor_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        incident = FormRecord(
            project_id=project_id, form_code="D-12", title="Incidencia de acceso sintética",
            status="RAW", payload={}, created_by=actor_id, updated_by=actor_id,
        )
        novelty = FormRecord(
            project_id=project_id, form_code="P-14", title="Novedad de campo sintética",
            status="RAW", payload={}, created_by=actor_id, updated_by=actor_id,
        )
        unrelated = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita no válida como bloqueo",
            status="RAW", payload={}, created_by=actor_id, updated_by=actor_id,
        )
        foreign_incident = FormRecord(
            project_id=other_project_id, form_code="D-12", title="Incidencia de otro expediente",
            status="RAW", payload={}, created_by=actor_id, updated_by=actor_id,
        )
        session.add_all([incident, novelty, unrelated, foreign_incident])
        session.commit()
        incident_id, novelty_id = incident.id, novelty.id
        unrelated_id, foreign_incident_id = unrelated.id, foreign_incident.id

        options = relation_options_by_field(session, project_id, "P-09")["P09-009"]
        option_ids = {option["id"] for option in options}
        assert option_ids == {incident_id, novelty_id}

        form_spec = app_main.FORM_BY_CODE["P-09"]
        blocked = {
            "P09-001": "0-30", "P09-003": "Resultado esperado sintético",
            "P09-005": "2026-10-20", "P09-007": "Bloqueado",
        }
        missing = submission_errors(form_spec, blocked, "Plan sintético con fuente documentada.")
        assert any("Bloqueo actual" in error for error in missing)
        assert any("Incidencia o novedad vinculada" in error for error in missing)
        described = {**blocked, "P09-008": "Acceso al cuarto de almacenamiento pendiente."}
        missing_link = submission_errors(form_spec, described, "Plan sintético con fuente documentada.")
        assert not any("Bloqueo actual" in error for error in missing_link)
        assert any("Incidencia o novedad vinculada" in error for error in missing_link)
        linked = {**described, "P09-009": incident_id}
        assert not submission_errors(form_spec, linked, "Plan sintético con fuente documentada.")
        assert relation_selection_errors(session, project_id, form_spec, linked) == []
        for invalid_id in (unrelated_id, foreign_incident_id):
            invalid = {**linked, "P09-009": invalid_id}
            assert relation_selection_errors(session, project_id, form_spec, invalid)

    sign_in(client, "consultant@red.test")
    page = client.get(f"/projects/{project_id}/records/new?form_code=P-09")
    assert page.status_code == 200
    assert '<textarea id="P09-008" name="P09-008"' in page.text
    assert f'<option value="{incident_id}"' in page.text
    assert f'<option value="{novelty_id}"' in page.text
    assert f'value="{unrelated_id}"' not in page.text
    assert f'value="{foreign_incident_id}"' not in page.text


def test_authentication_and_project_boundary(client, workspace):
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 303
    assert response.headers["location"] == "/login"

    sign_in(client, "field@red.test")
    own_project, other_project = workspace["project_ids"][:2]
    assert client.get(f"/projects/{own_project}").status_code == 200
    assert client.get(f"/projects/{other_project}").status_code == 404


def test_project_write_gate_keeps_hosted_workspaces_read_only_until_enabled(client, workspace, monkeypatch, capsys):
    from types import SimpleNamespace

    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=False, production_issues=lambda: [], max_upload_mb=20,
        is_production=False, session_https_only=False,
    ))

    # Read access remains available for a controlled inspection; form pages expose no write controls.
    read_page = client.get(f"/projects/{project_id}")
    assert read_page.status_code == 200
    assert 'class="notice warning operational-read-only" role="status"' in read_page.text
    assert "Formularios, cambios, cargas y creación de respaldos no se guardan" in read_page.text
    assert "puedes descargar copias existentes para recuperación" in read_page.text
    assert 'href="/projects/' + project_id + '/records/new?form_code=D-03">Ver formulario</a>' in read_page.text
    inspect_form = client.get(f"/projects/{project_id}/records/new?form_code=D-03")
    assert inspect_form.status_code == 200
    assert "Vista de consulta" in inspect_form.text
    assert '<fieldset class="form-section" disabled>' in inspect_form.text
    assert "Enviar a revisión" not in inspect_form.text
    assert "Guardar borrador" not in inspect_form.text
    client.cookies.clear()
    sign_in(client, "field@red.test")
    field_project_page = client.get(f"/projects/{project_id}")
    assert f'href="/projects/{project_id}/records/new?form_code=D-06">Ver formulario</a>' in field_project_page.text
    assert "D-02" in field_project_page.text and "No disponible en tu perfil" in field_project_page.text
    assert f'href="/projects/{project_id}/records/new?form_code=D-02"' not in field_project_page.text
    field_form = client.get(f"/projects/{project_id}/records/new?form_code=D-06")
    assert field_form.status_code == 200
    assert "Vista de consulta" in field_form.text
    assert client.get(f"/projects/{project_id}/records/new?form_code=D-02").status_code == 403
    write_attempt = client.post(
        f"/projects/{project_id}/records/new",
        data={"form_code": "D-03", "record_title": "No debe persistir"},
        follow_redirects=False,
    )
    assert write_attempt.status_code == 503
    oauth_callback = client.get("/drive/callback?state=synthetic&code=synthetic")
    assert oauth_callback.status_code == 503

    monkeypatch.setattr(app_cli, "settings", SimpleNamespace(operational_writes_enabled=False))
    assert app_cli.create_backup("admin@red.test") == 2
    assert "No se creó el respaldo" in capsys.readouterr().err

    # Account recovery remains available while operational project writes are frozen.
    recovery_csrf = csrf_for(client)
    recovery = client.post(
        "/password-reset/token-sintetico-invalido",
        data={"csrf": recovery_csrf, "password": "unused-password-123", "confirmation": "unused-password-123"},
    )
    assert recovery.status_code == 410

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=True, production_issues=lambda: [], max_upload_mb=20,
        is_production=False, session_https_only=False,
    ))
    enabled = client.get(f"/projects/{project_id}/records/new?form_code=D-03")
    assert enabled.status_code == 200


def test_read_only_mode_disables_admin_mutation_controls(client, workspace, monkeypatch):
    from types import SimpleNamespace

    project_id = workspace["project_ids"][0]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        finding = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="HAL-TEST-01",
            title="Hallazgo sintético", description="Solo para comprobar el modo consulta.",
            data={}, review_status="PENDING_REVIEW", created_by=admin_id, updated_by=admin_id,
        )
        version = PMIRSVersion(
            project_id=project_id, version_label="v1.0", status="aprobada_interna",
            change_summary="Versión sintética para validar controles en consulta.",
            change_reason="primera_version", snapshot={"items": []}, created_by=admin_id,
        )
        record = FormRecord(
            project_id=project_id, form_code="D-01", title="Ficha sintética pendiente",
            status="PENDING_REVIEW", created_by=admin_id, updated_by=admin_id,
        )
        pending_invitation = Invitation(
            email="pending.field@red.test", full_name="Operario pendiente", project_id=project_id,
            role="campo", token_hash=hash_token("read-only-invitation-token"), created_by=admin_id,
            expires_at=now_utc() + timedelta(days=7),
        )
        session.add_all([finding, version, record, pending_invitation])
        session.commit()
        finding_id, version_id, record_id, invitation_id = finding.id, version.id, record.id, pending_invitation.id

    sign_in(client, "admin@red.test")
    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=False,
        production_issues=lambda: [],
        max_upload_mb=20,
        max_evidence_total_mb=1024,
        max_evidence_project_mb=256,
        is_production=False,
        session_https_only=False,
        google_oauth_ready=True,
    ))

    users_page = client.get("/admin/users")
    assert users_page.status_code == 200
    assert "invitaciones y los cambios de membresía se habilitan" in users_page.text
    assert 'fieldset class="write-gate-fields" disabled aria-describedby="invite-write-help"' in users_page.text
    assert 'type="submit">Generar invitación</button>' in users_page.text
    assert f'action="/admin/invitations/{invitation_id}/revoke"' in users_page.text
    assert 'disabled aria-describedby="invite-write-help">Revocar invitación</button>' in users_page.text
    assert client.post("/admin/invitations", data={}).status_code == 503
    assert client.post(f"/admin/invitations/{invitation_id}/revoke", data={}).status_code == 503

    dashboard = client.get("/")
    assert 'href="/admin/projects/new"' not in dashboard.text
    assert "Crear proyectos está deshabilitado en modo consulta." in dashboard.text

    new_project = client.get("/admin/projects/new")
    assert new_project.status_code == 200
    assert 'fieldset class="write-gate-fields" disabled aria-describedby="project-write-help"' in new_project.text

    project_page = client.get(f"/projects/{project_id}")
    assert 'fieldset class="write-gate-fields" disabled aria-describedby="baseline-write-help"' in project_page.text

    pmirs_page = client.get(f"/projects/{project_id}/pmirs")
    assert pmirs_page.status_code == 200
    assert 'href="/projects/' + project_id + '/pmirs/new?item_type=hallazgo"' not in pmirs_page.text
    assert f'href="/pmirs/items/{finding_id}/edit"' not in pmirs_page.text
    assert f'action="/pmirs/items/{finding_id}/evidence"' not in pmirs_page.text
    assert f'action="/pmirs/items/{finding_id}/review"' not in pmirs_page.text
    assert f'action="/pmirs/versions/{version_id}/sign"' not in pmirs_page.text
    assert f'action="/pmirs/versions/{version_id}/status"' not in pmirs_page.text
    assert f'action="/projects/{project_id}/pmirs/versions"' not in pmirs_page.text

    record_page = client.get(f"/records/{record_id}")
    assert record_page.status_code == 200
    assert f'href="/records/{record_id}/edit"' not in record_page.text
    assert f'action="/records/{record_id}/evidence"' not in record_page.text
    assert f'action="/records/{record_id}/review"' not in record_page.text

    drive_page = client.get("/drive")
    assert 'disabled aria-describedby="drive-connect-help">Conectar con Google Drive</button>' in drive_page.text


def test_writable_local_sandbox_warns_before_login_and_inside_workspace(client, workspace, monkeypatch):
    from types import SimpleNamespace

    sign_in(client, "admin@red.test")
    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        app_env="local", operational_writes_enabled=True, production_issues=lambda: [],
        is_production=False, session_https_only=False, max_upload_mb=20,
    ))

    login_page = client.get("http://127.0.0.1/login")
    assert "Sandbox local de capacitación" in login_page.text
    assert "No ingreses datos de clientes ni de personas reales." in login_page.text

    dashboard = client.get("http://127.0.0.1/")
    assert "Sandbox local de capacitación" in dashboard.text
    assert 'class="notice warning local-practice-warning" role="status"' in dashboard.text

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        app_env="staging", operational_writes_enabled=False, operational_writes_requested=True,
        operational_write_issues=lambda: ["Falta aprobación supervisada."],
        production_issues=lambda: ["Falta aprobación supervisada."],
        is_production=False, session_https_only=False,
    ))
    staged_login_page = client.get("http://127.0.0.1/login")
    assert "Sandbox local de capacitación" not in staged_login_page.text


def test_drive_connection_stays_disabled_until_oauth_is_configured(client, workspace, monkeypatch):
    from types import SimpleNamespace

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=True, google_oauth_ready=False, max_upload_mb=20,
        is_production=False, session_https_only=False, drive_external_actions_enabled=True,
    ))
    sign_in(client, "admin@red.test")

    page = client.get("/drive")
    assert page.status_code == 200
    assert 'disabled aria-describedby="drive-oauth-help">Conectar con Google Drive</button>' in page.text
    assert "sin heredar permisos OAuth anteriores" in page.text
    assert "RED rechaza los tokens si los permisos concedidos faltan o son más amplios" in page.text
    assert "ni pedir acceso completo a tu Drive" in page.text
    assert "no se comparte automáticamente" in page.text
    assert "Faltan credenciales de aplicación" in page.text

    response = client.post("/drive/connect", data={
        "csrf": csrf_for(client, "/drive"),
    }, follow_redirects=False)
    assert response.status_code == 303
    assert response.headers["location"].startswith("/drive?notice=Faltan%20credenciales%20OAuth")
    with SessionLocal() as session:
        assert session.scalar(select(DriveConnection).limit(1)) is None


def test_local_preview_keeps_drive_oauth_and_upload_closed(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "admin@red.test")

    project_page = client.get(f"/projects/{project_id}")
    assert "Revisa perfiles y requisitos del entorno" in project_page.text
    assert "Esta instancia no inicia OAuth ni carga respaldos a Drive" in project_page.text
    assert "Conectar Drive y crear el primer respaldo" not in project_page.text

    drive_page = client.get("/drive")
    assert drive_page.status_code == 200
    assert "Esta instancia no inicia conexiones externas" in drive_page.text
    assert 'disabled aria-describedby="drive-connect-help">Conectar con Google Drive</button>' in drive_page.text

    connect = client.post("/drive/connect", data={"csrf": csrf_for(client, "/drive")}, follow_redirects=False)
    backup = client.post("/backups/create", data={"csrf": csrf_for(client, "/drive")}, follow_redirects=False)
    callback = client.get("/drive/callback?state=synthetic&code=synthetic")
    assert connect.status_code == backup.status_code == callback.status_code == 503
    assert "staging/producción" in connect.json()["detail"]
    assert callback.headers["referrer-policy"] == "no-referrer"
    assert callback.headers["cache-control"] == "private, no-store"
    with SessionLocal() as session:
        assert session.scalar(select(DriveConnection).limit(1)) is None
        assert session.scalar(select(func.count(Backup.id))) == 0


def test_empty_project_state_distinguishes_read_only_from_enabled_capture(client, workspace, monkeypatch):
    project_id = workspace["project_ids"][0]
    sign_in(client, "admin@red.test")

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "false")
    read_only_page = client.get(f"/projects/{project_id}")
    assert read_only_page.status_code == 200
    assert "Expediente en preparación" in read_only_page.text
    assert "la captura se habilita cuando se apruebe el gate operativo" in read_only_page.text
    assert "El expediente está listo para iniciar" not in read_only_page.text

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "true")
    writable_page = client.get(f"/projects/{project_id}")
    assert writable_page.status_code == 200
    assert "Aún no hay registros" in writable_page.text
    assert "registra primero la ficha maestra D-01" in writable_page.text


def test_drive_page_describes_saved_authorization_as_unverified_and_offers_gated_reauthorization(
    client, workspace, monkeypatch,
):
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=admin_id, google_email="private-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="private-folder-id",
        ))
        session.commit()

    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "false")
    sign_in(client, "admin@red.test")
    page = client.get("/drive")

    assert page.status_code == 200
    assert "Pendiente de comprobar" in page.text
    assert "RED valida que Google conceda solo el acceso de identidad" in page.text
    assert "No permite leer todos los archivos de tu Drive" in page.text
    assert "ni comparte nada automáticamente" in page.text
    assert "La autorización puede vencer o revocarse" in page.text
    assert 'action="/drive/connect"' in page.text
    assert 'disabled aria-describedby="drive-reconnect-help">Volver a autorizar Drive' in page.text

    blocked = client.post("/drive/connect", data={"csrf": "synthetic-csrf"})
    assert blocked.status_code == 503
    assert "solo lectura" in blocked.json()["detail"]


def test_failed_drive_backup_returns_admin_to_history_without_exposing_provider_error(
    client, workspace, monkeypatch,
):
    from types import SimpleNamespace

    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        session.add(DriveConnection(
            connected_by=admin_id, google_email="private-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="private-folder-id",
        ))
        session.commit()

    def fail_backup(session, actor_id):
        session.add(Backup(
            status="fallido", summary={"error": "synthetic provider diagnostic"}, created_by=actor_id,
        ))
        session.commit()
        raise RuntimeError("synthetic provider diagnostic")

    monkeypatch.setattr(app_main.backups, "create_drive_backup", fail_backup)
    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "true")
    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        app_env="staging", operational_writes_enabled=True, operational_writes_requested=True,
        operational_write_issues=lambda: [], production_issues=lambda: [],
        drive_external_actions_enabled=True, google_oauth_ready=True, max_upload_mb=20,
        is_production=False, session_https_only=False, trusted_hosts=("testserver",),
        trusted_client_ip_header="CF-Connecting-IP", session_secret="synthetic-throttle-key",
    ))
    sign_in(client, "admin@red.test", headers={"CF-Connecting-IP": "203.0.113.9"})
    response = client.post("/backups/create", data={
        "csrf": csrf_for(client, "/drive"),
    }, follow_redirects=False)

    assert response.status_code == 303
    assert response.headers["location"].startswith("/drive?notice=")
    page = client.get(response.headers["location"])
    assert page.status_code == 200
    assert "El respaldo no se completó. Revisa el historial" in page.text
    assert "Fallido" in page.text
    assert "Volver a autorizar Drive" in page.text
    assert "synthetic provider diagnostic" not in page.text


def test_drive_oauth_failure_returns_to_admin_panel_without_provider_details(client, workspace, monkeypatch):
    from types import SimpleNamespace
    from urllib.parse import parse_qs, urlsplit

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=True,
        drive_external_actions_enabled=True,
        google_oauth_ready=True,
        is_production=False,
        session_https_only=False,
        max_upload_mb=20,
    ))
    monkeypatch.setattr(app_main.drive, "authorization_url", lambda state: f"https://accounts.google.test/auth?state={state}")
    monkeypatch.setattr(app_main.drive, "exchange_code", lambda _code: (_ for _ in ()).throw(
        app_main.drive.DriveSetupError("synthetic provider diagnostic")
    ))
    sign_in(client, "admin@red.test")
    start = client.post("/drive/connect", data={
        "csrf": csrf_for(client, "/drive"),
    }, follow_redirects=False)
    assert start.status_code == 303
    state = parse_qs(urlsplit(start.headers["location"]).query)["state"][0]
    mismatch = client.get(
        f"/drive/callback?state=incorrect-synthetic-state&code=synthetic-code", follow_redirects=False,
    )
    assert mismatch.status_code == 400
    assert mismatch.headers["referrer-policy"] == "no-referrer"
    assert mismatch.headers["cache-control"] == "private, no-store"
    response = client.get(f"/drive/callback?state={state}&code=synthetic-code", follow_redirects=False)

    assert response.status_code == 303
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["cache-control"] == "private, no-store"
    assert response.headers["location"].startswith("/drive?notice=")
    page = client.get(response.headers["location"])
    assert page.status_code == 200
    assert "No se completó la autorización" in page.text
    assert "Conectar con Google Drive" in page.text
    assert "synthetic provider diagnostic" not in page.text
    replay = client.get(f"/drive/callback?state={state}&code=synthetic-code", follow_redirects=False)
    assert replay.status_code == 400

    retry = client.post("/drive/connect", data={
        "csrf": csrf_for(client, "/drive"),
    }, follow_redirects=False)
    retry_state = parse_qs(urlsplit(retry.headers["location"]).query)["state"][0]
    cancelled = client.get(
        f"/drive/callback?state={retry_state}&error=access_denied", follow_redirects=False,
    )
    assert cancelled.status_code == 303
    cancelled_page = client.get(cancelled.headers["location"])
    assert "Autorización de Drive cancelada" in cancelled_page.text
    assert "Conectar con Google Drive" in cancelled_page.text


def test_uvicorn_access_logs_redact_query_and_path_tokens():
    import logging

    from app.log_safety import UvicornAccessQueryRedactionFilter

    access_logger = logging.getLogger("uvicorn.access")
    assert any(isinstance(item, UvicornAccessQueryRedactionFilter) for item in access_logger.filters)
    def access_message(request_target):
        record = logging.LogRecord(
            "uvicorn.access", logging.INFO, __file__, 1, '%s - "%s %s HTTP/%s" %d',
            ("127.0.0.1:50000", "GET", request_target, "1.1", 303),
            None,
        )
        assert access_logger.filter(record)
        return record.getMessage()

    oauth_message = access_message("/drive/callback?code=secret-code&state=secret-state")
    assert "/drive/callback " in oauth_message
    assert "secret-code" not in oauth_message
    assert "secret-state" not in oauth_message

    reset_message = access_message("/password-reset/reset-secret-token")
    assert "/password-reset/[redacted] " in reset_message
    assert "reset-secret-token" not in reset_message

    invitation_message = access_message("/invitations/accept/invitation-secret-token")
    assert "/invitations/accept/[redacted] " in invitation_message
    assert "invitation-secret-token" not in invitation_message

    encoded_message = access_message("/password-reset/%72eset-secret-token")
    assert "/password-reset/[redacted] " in encoded_message
    assert "reset-secret-token" not in encoded_message

    ordinary_message = access_message("/projects/ordinary-project")
    assert "/projects/ordinary-project " in ordinary_message


def test_drive_reauthorization_rejects_a_broader_existing_refresh_grant(client, workspace, monkeypatch):
    from types import SimpleNamespace
    from urllib.parse import parse_qs, urlsplit

    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        old_connection = DriveConnection(
            connected_by=admin_id, google_email="private-drive@red.test",
            encrypted_refresh_token="synthetic-ciphertext", backup_folder_id="old-private-folder",
        )
        session.add(old_connection)
        session.commit()
        old_connection_id = old_connection.id

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=True,
        drive_external_actions_enabled=True,
        google_oauth_ready=True,
        is_production=False,
        session_https_only=False,
        max_upload_mb=20,
    ))
    monkeypatch.setattr(app_main.drive, "authorization_url", lambda state: f"https://accounts.google.test/auth?state={state}")
    monkeypatch.setattr(app_main.drive, "exchange_code", lambda _code: {
        "access_token": "synthetic-access-token", "scope": "openid email https://www.googleapis.com/auth/drive.file",
    })
    monkeypatch.setattr(app_main.drive, "current_account_email", lambda _token: "private-drive@red.test")
    monkeypatch.setattr(app_main.drive, "refresh_access_token", lambda _connection: (_ for _ in ()).throw(
        app_main.drive.DriveSetupError("synthetic broad prior scope")
    ))
    monkeypatch.setattr(app_main.drive, "create_backup_folder", lambda _token: (_ for _ in ()).throw(
        AssertionError("No se debe crear una carpeta antes de comprobar el token anterior.")
    ))

    sign_in(client, "admin@red.test")
    start = client.post("/drive/connect", data={"csrf": csrf_for(client, "/drive")}, follow_redirects=False)
    state = parse_qs(urlsplit(start.headers["location"]).query)["state"][0]
    response = client.get(f"/drive/callback?state={state}&code=synthetic-code", follow_redirects=False)

    assert response.status_code == 303
    assert response.headers["location"].startswith("/drive?notice=")
    with SessionLocal() as session:
        current = session.get(DriveConnection, old_connection_id)
        assert current.google_email == "private-drive@red.test"
        assert current.encrypted_refresh_token == "synthetic-ciphertext"
        assert current.backup_folder_id == "old-private-folder"


def test_drive_callback_rejects_additional_scopes_before_lookup_or_folder_creation(client, workspace, monkeypatch):
    from types import SimpleNamespace
    from urllib.parse import parse_qs, urlsplit

    monkeypatch.setattr(app_main, "settings", SimpleNamespace(
        operational_writes_enabled=True,
        drive_external_actions_enabled=True,
        google_oauth_ready=True,
        is_production=False,
        session_https_only=False,
        max_upload_mb=20,
    ))
    monkeypatch.setattr(app_main.drive, "authorization_url", lambda state: f"https://accounts.google.test/auth?state={state}")
    monkeypatch.setattr(app_main.drive, "exchange_code", lambda _code: {
        "access_token": "synthetic-access-token", "refresh_token": "synthetic-refresh-token",
        "scope": "openid email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
    })
    monkeypatch.setattr(app_main.drive, "current_account_email", lambda _token: (_ for _ in ()).throw(
        AssertionError("No se debe consultar el perfil con un grant más amplio.")
    ))
    monkeypatch.setattr(app_main.drive, "create_backup_folder", lambda _token: (_ for _ in ()).throw(
        AssertionError("No se debe crear una carpeta con un grant más amplio.")
    ))

    sign_in(client, "admin@red.test")
    start = client.post("/drive/connect", data={"csrf": csrf_for(client, "/drive")}, follow_redirects=False)
    state = parse_qs(urlsplit(start.headers["location"]).query)["state"][0]
    response = client.get(f"/drive/callback?state={state}&code=synthetic-code", follow_redirects=False)

    assert response.status_code == 303
    assert response.headers["location"].startswith("/drive?notice=")
    with SessionLocal() as session:
        assert session.scalar(select(DriveConnection).limit(1)) is None


def test_project_page_shows_role_specific_work_routes(client, workspace):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        pending = FormRecord(
            project_id=project_id, form_code="D-06", title="Aforo sintético pendiente",
            status="PENDING_REVIEW", created_by=workspace["user_ids"]["field"],
            updated_by=workspace["user_ids"]["field"],
        )
        session.add(pending)
        session.commit()
        pending_id = pending.id

    sign_in(client, "field@red.test")
    field_page = client.get(f"/projects/{project_id}")
    startup_route = re.search(
        r'<section class="panel role-route startup-route" aria-labelledby="startup-route-heading">(.*?)</section>',
        field_page.text, re.DOTALL,
    )
    assert startup_route
    assert "Alistamiento de esta copropiedad" in startup_route.group(1)
    assert "D-01 · Confirma la identidad del expediente" in startup_route.group(1)
    assert "D-02 · Recopila la información previa de administración" in startup_route.group(1)
    assert startup_route.group(1).count("Sin registro") == 2
    assert "Vigente hasta" in startup_route.group(1)
    assert f"/projects/{project_id}/records/new?form_code=D-01" not in startup_route.group(1)
    assert "Captura la visita con evidencia" in field_page.text
    assert "Actor del formato fuente: Brigadista ECO ABURRÁ" in field_page.text
    assert "Los permisos reales los define el perfil RED asignado a cada persona" in field_page.text
    assert "RED no guarda formularios en el dispositivo." in field_page.text
    field_route = re.search(
        r'<section class="panel role-route" aria-labelledby="role-route-heading">(.*?)</section>',
        field_page.text, re.DOTALL,
    )
    assert field_route
    ordered_codes = ["D-03", "D-04", "D-05", "D-10", "D-06", "D-13", "D-07", "D-08", "D-09", "D-11", "D-12", "D-14", "P-14"]
    ordered_positions = [field_route.group(1).index(f"{code} ·") for code in ordered_codes]
    assert ordered_positions == sorted(ordered_positions)
    assert f'href="/records/{pending_id}">Ver registro en revisión</a>' in field_route.group(1)
    for code in ordered_codes:
        path = f"/projects/{project_id}/records/new?form_code={code}"
        form_page = client.get(path)
        assert form_page.status_code == 200, f"El perfil de campo no puede abrir {code}."
    assert "Espera que QA/QC lo valide antes de enviar pesajes" in field_route.group(1)
    assert "La clasificación puede quedar pendiente hasta que exista protocolo aprobado" in field_route.group(1)

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    reviewer_page = client.get(f"/projects/{project_id}")
    assert "Revisa respuestas y evidencia" in reviewer_page.text
    assert "Aforo sintético pendiente" in reviewer_page.text
    assert f"/records/{pending_id}" in reviewer_page.text

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    consultant_page = client.get(f"/projects/{project_id}")
    assert "Construye la Línea Base con fuentes" in consultant_page.text
    assert f"/projects/{project_id}/records/new?form_code=D-01" in consultant_page.text
    consultant_startup = re.search(
        r'<section class="panel role-route startup-route" aria-labelledby="startup-route-heading">(.*?)</section>',
        consultant_page.text, re.DOTALL,
    )
    assert consultant_startup
    assert f"/projects/{project_id}/records/new?form_code=D-01" in consultant_startup.group(1)
    assert f"/projects/{project_id}/records/new?form_code=D-02" in consultant_startup.group(1)
    assert "La vigencia del permiso y el cumplimiento" in consultant_startup.group(1)
    training_form = client.get(f"/projects/{project_id}/records/new?form_code=P-10")
    assert training_form.status_code == 200
    assert "incluye el código nacional de colores" in training_form.text
    assert "Distingue la recolección selectiva de orgánicos del servicio público" in training_form.text
    assert f'href="/projects/{project_id}/activity">Trazabilidad</a>' in consultant_page.text
    authorized_route = re.search(
        r'<section class="panel role-route" aria-labelledby="role-route-heading">(.*?)</section>',
        consultant_page.text, re.DOTALL,
    )
    assert authorized_route
    assert f"/projects/{project_id}/records/new?form_code=D-06" in authorized_route.group(1)

    with SessionLocal() as session:
        session.query(ProjectVisitAuthorization).filter_by(project_id=project_id).delete()
        session.commit()
    consultant_page = client.get(f"/projects/{project_id}")
    consultant_route = re.search(
        r'<section class="panel role-route" aria-labelledby="role-route-heading">(.*?)</section>',
        consultant_page.text, re.DOTALL,
    )
    assert consultant_route
    assert f"/projects/{project_id}/records/new?form_code=D-01" in consultant_route.group(1)
    assert f"/projects/{project_id}/records/new?form_code=D-02" in consultant_route.group(1)
    for code in ("D-06", "D-07", "D-08"):
        assert f"/projects/{project_id}/records/new?form_code={code}" not in consultant_route.group(1)
    assert "En espera · autorización para formularios de campo" in consultant_route.group(1)
    assert 'href="#visit-authorization"' in consultant_route.group(1)
    assert "acceso, privacidad, método técnico y SST" in consultant_route.group(1)

    client.cookies.clear()
    sign_in(client, "reader@red.test")
    reader_page = client.get(f"/projects/{project_id}")
    assert "consulta los registros existentes, sus evidencias y versiones" in reader_page.text
    assert "no dispone de formularios de captura en blanco" in reader_page.text
    assert f"/projects/{project_id}/records/new?form_code=D-06" not in reader_page.text
    assert f"/records/{pending_id}" in reader_page.text


def test_project_work_route_resumes_only_the_current_users_editable_records(client, workspace):
    project_id = workspace["project_ids"][0]
    field_id = workspace["user_ids"]["field"]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        own_draft = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita propia en borrador",
            status="RAW", created_by=field_id, updated_by=field_id,
        )
        own_correction = FormRecord(
            project_id=project_id, form_code="D-05", title="Flujo propio devuelto",
            status="CORRECTION_REQUESTED", created_by=field_id, updated_by=field_id,
        )
        own_review = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje propio en revisión",
            status="PENDING_REVIEW", created_by=field_id, updated_by=field_id,
        )
        other_draft = FormRecord(
            project_id=project_id, form_code="D-04", title="Inspección de otra persona",
            status="RAW", created_by=admin_id, updated_by=admin_id,
        )
        session.add_all([own_draft, own_correction, own_review, other_draft])
        session.commit()
        own_draft_id, own_correction_id, own_review_id, other_draft_id = (
            own_draft.id, own_correction.id, own_review.id, other_draft.id,
        )

    sign_in(client, "field@red.test")
    page = client.get(f"/projects/{project_id}")
    assert page.status_code == 200
    route = re.search(
        r'<section class="panel role-route" aria-labelledby="role-route-heading">(.*?)</section>',
        page.text, re.DOTALL,
    )
    assert route
    if settings.operational_writes_enabled:
        assert f'href="/records/{own_draft_id}/edit">Continuar borrador</a>' in route.group(1)
        assert f'href="/records/{own_correction_id}/edit">Corregir registro</a>' in route.group(1)
    else:
        assert f'/records/{own_draft_id}/edit' not in route.group(1)
        assert f'/records/{own_draft_id}">Consultar borrador</a>' in route.group(1)
        assert f'/records/{own_correction_id}/edit' not in route.group(1)
        assert f'/records/{own_correction_id}">Consultar borrador</a>' in route.group(1)
    assert f'/records/{own_review_id}">Ver registro en revisión</a>' in route.group(1)
    assert f"/records/{other_draft_id}" not in route.group(1)
    assert f"/projects/{project_id}/records/new?form_code=D-04" in route.group(1)


def test_project_startup_checklist_tracks_latest_identity_and_admin_review(client, workspace):
    project_id = workspace["project_ids"][0]
    author = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        session.query(ProjectVisitAuthorization).filter_by(project_id=project_id).delete()
        previous_identity = FormRecord(
            project_id=project_id, form_code="D-01", title="Identidad previa", status="RAW",
            source_note="Versión anterior sintética.", created_by=author, updated_by=author,
        )
        current_identity = FormRecord(
            project_id=project_id, form_code="D-01", title="Identidad revisada", status="VALIDATED",
            source_note="Nombre y dirección confirmados en ejercicio sintético.", created_by=author, updated_by=author,
        )
        admin_info = FormRecord(
            project_id=project_id, form_code="D-02", title="Información administrativa", status="PENDING_REVIEW",
            source_note="Fuentes pendientes de QA sintético.", created_by=author, updated_by=author,
        )
        session.add_all([previous_identity, current_identity, admin_info])
        session.commit()
        current_identity_id = current_identity.id
        admin_info_id = admin_info.id

    sign_in(client, "consultant@red.test")
    page = client.get(f"/projects/{project_id}")
    startup = re.search(
        r'<section class="panel role-route startup-route" aria-labelledby="startup-route-heading">(.*?)</section>',
        page.text, re.DOTALL,
    )
    assert startup
    assert "Validado por QA/QC" in startup.group(1)
    assert "En revisión QA/QC" in startup.group(1)
    assert startup.group(1).count("Sin registro") == 0
    assert "Pendiente de aprobación" in startup.group(1)
    assert "La versión más reciente está validada por QA/QC" in startup.group(1)
    assert "no crees otro registro para reemplazarlo" in startup.group(1)
    assert f'href="/records/{current_identity_id}">Consultar D-01</a>' in startup.group(1)
    assert f'href="/records/{admin_info_id}">Consultar D-02</a>' in startup.group(1)
    assert f"/projects/{project_id}/records/new?form_code=D-01" not in startup.group(1)
    assert f"/projects/{project_id}/records/new?form_code=D-02" not in startup.group(1)


def test_project_identity_confirmation_is_scoped_audited_and_resettable(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "admin@red.test")
    profile = client.get(f"/projects/{project_id}")
    assert profile.status_code == 200
    assert "Pendiente de confirmación" in profile.text
    csrf = csrf_for(client, f"/projects/{project_id}")
    payload = {
        "csrf": csrf, "action": "confirm", "name": "Unidad Piloto Confirmada",
        "address": "Carrera 50 # 45-20", "municipality": "Bello", "department": "Antioquia",
        "identity_reference": "ACTAADMIN20261012", "confirmation_checked": "yes",
    }
    saved = client.post(f"/projects/{project_id}/identity", data=payload, follow_redirects=False)
    assert saved.status_code == 303
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        event = session.scalar(select(AuditEvent).where(
            AuditEvent.action == "project_identity_updated", AuditEvent.entity_id == project_id,
        ))
        assert project.name == "Unidad Piloto Confirmada"
        assert project.address == "Carrera 50 # 45-20"
        assert project.identity_status == "confirmada"
        assert project.identity_reference == "ACTAADMIN20261012"
        assert project.identity_confirmed_by == workspace["user_ids"]["admin"]
        assert project.identity_confirmed_role == "admin"
        assert project.identity_confirmed_at is not None and app_main.utc(project.identity_confirmed_at).tzinfo is not None
        assert event is not None and event.detail["after"]["identity_status"] == "confirmada"
        record = FormRecord(
            project_id=project_id, form_code="D-01", title="Ficha de identidad sintética",
            status="RAW", source_note="Prueba sintética", created_by=workspace["user_ids"]["admin"],
            updated_by=workspace["user_ids"]["admin"],
        )
        session.add(record)
        session.commit()
    profile = client.get(f"/projects/{project_id}")
    assert "Confirmada con fuente" in profile.text
    assert "Carrera 50 # 45-20" in profile.text
    export = client.get(f"/projects/{project_id}/records/export.csv")
    assert export.status_code == 200
    assert b"ACTAADMIN20261012" in export.content
    reset = client.post(
        f"/projects/{project_id}/identity",
        data={**payload, "csrf": csrf_for(client, f"/projects/{project_id}"), "action": "reset"},
        follow_redirects=False,
    )
    assert reset.status_code == 303
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        assert project.name == "Unidad Piloto Confirmada" and project.address == "Carrera 50 # 45-20"
        assert project.identity_status == "pendiente"
        assert project.identity_reference == "" and project.identity_confirmed_by is None
        assert project.identity_confirmed_role is None
        assert project.identity_confirmed_at is None


def test_project_ph_administrator_can_confirm_only_its_own_unit(client, workspace):
    from app.export_notices import pmirs_project_identity_notice

    project_id, other_project_id = workspace["project_ids"][:2]
    with SessionLocal() as session:
        ph_admin = User(
            email="ph-admin@red.test", full_name="Administración PH · Unidad A",
            password_hash=hash_password(PASSWORD),
        )
        session.add(ph_admin)
        session.flush()
        session.add(ProjectMembership(project_id=project_id, user_id=ph_admin.id, role="administracion_ph"))
        ph_admin_id = ph_admin.id
        session.commit()

    sign_in(client, "ph-admin@red.test")
    page = client.get(f"/projects/{project_id}")
    assert page.status_code == 200
    assert "Administración PH de esta unidad" in page.text
    assert f'action="/projects/{project_id}/identity"' in page.text
    csrf = csrf_for(client, f"/projects/{project_id}")
    payload = {
        "csrf": csrf, "action": "confirm", "name": PROJECT_NAMES[0],
        "address": "Carrera 50 # 45-20", "municipality": "Bello", "department": "Antioquia",
        "identity_reference": "PHACTA20261012", "confirmation_checked": "yes",
    }
    saved = client.post(f"/projects/{project_id}/identity", data=payload, follow_redirects=False)
    assert saved.status_code == 303
    assert client.get(f"/projects/{other_project_id}").status_code == 404
    cross_project = client.post(
        f"/projects/{other_project_id}/identity",
        data={**payload, "csrf": csrf_for(client, f"/projects/{project_id}")}, follow_redirects=False,
    )
    assert cross_project.status_code == 404
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        assert project.identity_status == "confirmada"
        assert project.identity_confirmed_by == ph_admin_id
        assert project.identity_confirmed_role == "administracion_ph"
        assert "Administración PH de esta copropiedad" in pmirs_project_identity_notice({
            "identity_status": project.identity_status,
            "identity_reference": project.identity_reference,
            "identity_confirmed_role": project.identity_confirmed_role,
        })
        assert session.scalar(select(Project).where(Project.id == other_project_id)).identity_status == "pendiente"


def test_project_identity_confirmation_rejects_unprivileged_invalid_and_blocked_writes(client, workspace, monkeypatch):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    csrf = csrf_for(client, f"/projects/{project_id}")
    payload = {
        "csrf": csrf, "action": "confirm", "name": "Nombre confirmado", "address": "Calle 12 # 34-56",
        "municipality": "Bello", "department": "Antioquia", "identity_reference": "ACTA2026",
        "confirmation_checked": "yes",
    }
    assert client.post(f"/projects/{project_id}/identity", data=payload).status_code == 403
    sign_in(client, "admin@red.test")
    csrf = csrf_for(client, f"/projects/{project_id}")
    assert client.post(f"/projects/{project_id}/identity", data={**payload, "csrf": csrf, "identity_reference": "https://example.com"}).status_code == 422
    assert client.post(f"/projects/{project_id}/identity", data={**payload, "csrf": csrf, "confirmation_checked": ""}).status_code == 422
    duplicate_name = PROJECT_NAMES[1]
    assert client.post(f"/projects/{project_id}/identity", data={**payload, "csrf": csrf, "name": duplicate_name}).status_code == 409
    monkeypatch.setenv("RED_OPERATIONAL_WRITES_ENABLED", "false")
    blocked = client.post(f"/projects/{project_id}/identity", data={**payload, "csrf": csrf}, follow_redirects=False)
    assert blocked.status_code == 503
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        assert project.identity_status == "pendiente" and project.name == PROJECT_NAMES[0]


def test_identity_backup_schema_14_round_trips_confirmed_unit_and_rejects_bad_timestamp(workspace, tmp_path):
    from sqlalchemy.orm import sessionmaker

    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.address = "Carrera 50 # 45-20"
        project.identity_status = "confirmada"
        project.identity_reference = "ACTAADMIN20261012"
        project.identity_confirmed_by = workspace["user_ids"]["admin"]
        project.identity_confirmed_role = "admin"
        project.identity_confirmed_at = now_utc()
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)
    verified = backups.verify_backup_archive(archive_bytes)
    assert verified["schema_version"] == 15
    target_engine = create_engine(f"sqlite:///{tmp_path / 'identity-restore.sqlite3'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    backups.restore_backup_archive(
        archive_bytes, admin_email="recovery@red.test", admin_name="Admin de recuperación",
        admin_password="Synthetic-Recovery-Password-2026", session_factory=target_sessions,
    )
    with target_sessions() as session:
        restored = session.scalar(select(Project).where(Project.id == project_id))
        assert restored.identity_status == "confirmada"
        assert restored.address == "Carrera 50 # 45-20"
        assert restored.identity_reference == "ACTAADMIN20261012"
        assert restored.identity_confirmed_by == workspace["user_ids"]["admin"]
        assert restored.identity_confirmed_role == "admin"
    target_engine.dispose()

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        database = json.loads(archive.read("database.json"))
        database["projects"][0]["identity_confirmed_at"] = "2026-10-12T10:00:00"
        database_bytes = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode()
        manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
        malformed = io.BytesIO()
        with zipfile.ZipFile(malformed, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(manifest).encode())
            changed.writestr("database.json", database_bytes)
    with pytest.raises(ValueError, match="fecha de confirmación"):
        backups.verify_backup_archive(malformed.getvalue())

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        legacy_manifest = json.loads(archive.read("manifest.json"))
        legacy_database = json.loads(archive.read("database.json"))
        legacy_manifest["schema_version"] = legacy_database["schema_version"] = 13
        for row in legacy_database["projects"]:
            row.pop("identity_confirmed_role", None)
        legacy_database_bytes = json.dumps(legacy_database, ensure_ascii=False, sort_keys=True, indent=2).encode()
        legacy_manifest["data_sha256"] = hashlib.sha256(legacy_database_bytes).hexdigest()
        legacy = io.BytesIO()
        with zipfile.ZipFile(legacy, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(legacy_manifest).encode())
            changed.writestr("database.json", legacy_database_bytes)
            for name in archive.namelist():
                if name.startswith("evidence/"):
                    changed.writestr(name, archive.read(name))
    assert backups.verify_backup_archive(legacy.getvalue())["schema_version"] == 13
    legacy_engine = create_engine(f"sqlite:///{tmp_path / 'identity-restore-v13.sqlite3'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(legacy_engine)
    legacy_sessions = sessionmaker(bind=legacy_engine, autoflush=False, expire_on_commit=False)
    backups.restore_backup_archive(
        legacy.getvalue(), admin_email="recovery-v13@red.test", admin_name="Admin legado",
        admin_password="Synthetic-Recovery-Password-2026", session_factory=legacy_sessions,
    )
    with legacy_sessions() as session:
        restored = session.get(Project, project_id)
        assert restored.identity_status == "confirmada"
        assert restored.identity_confirmed_role == "admin"
    legacy_engine.dispose()


def test_restore_uses_the_same_open_archive_that_was_verified(workspace, tmp_path, monkeypatch):
    import os
    from sqlalchemy.orm import sessionmaker

    with SessionLocal() as session:
        archive_bytes, _counts = backups.build_backup_archive(session)
    archive_path = tmp_path / "verified-backup.zip"
    replacement_path = tmp_path / "replacement-backup.zip"
    archive_path.write_bytes(archive_bytes)
    replacement_path.write_bytes(b"not the archive that was verified")
    verify_source = backups._verify_backup_archive_source

    def verify_then_replace_open_path(source):
        manifest = verify_source(source)
        os.replace(replacement_path, archive_path)
        return manifest

    monkeypatch.setattr(backups, "_verify_backup_archive_source", verify_then_replace_open_path)
    target_engine = create_engine(
        f"sqlite:///{tmp_path / 'same-open-archive-restore.sqlite3'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)

    result = backups.restore_backup_archive(
        archive_path,
        admin_email="recovery@red.test",
        admin_name="Administración de recuperación",
        admin_password="Synthetic-Recovery-Password-2026",
        session_factory=target_sessions,
        target_engine=target_engine,
        storage_root=tmp_path / "same-open-archive-storage",
    )

    assert result["admin_email"] == "recovery@red.test"
    assert archive_path.read_bytes() == b"not the archive that was verified"
    with target_sessions() as session:
        assert session.scalar(select(Project).where(Project.name == PROJECT_NAMES[0])) is not None
    target_engine.dispose()


def test_field_capture_is_blocked_until_admin_reviews_per_project_visit_supports(client, workspace):
    project_id = workspace["project_ids"][0]
    form_path = f"/projects/{project_id}/records/new?form_code=D-03"
    with SessionLocal() as session:
        session.query(ProjectVisitAuthorization).filter_by(project_id=project_id).delete()
        session.commit()

    sign_in(client, "field@red.test")
    page = client.get(f"/projects/{project_id}")
    assert page.status_code == 200
    assert "Captura de campo bloqueada" in page.text
    assert "No hay una autorización registrada" in page.text
    form_page = client.get(form_path)
    assert form_page.status_code == 200
    assert "Vista de consulta" in form_page.text
    rejected = client.post(
        f"/projects/{project_id}/records/new",
        data={"form_code": "D-03", "action": "draft"},
    )
    assert rejected.status_code == 403
    assert rejected.headers["x-red-error-code"] == "field-visit-authorization-required"

    for email in ("consultant@red.test", "admin@red.test"):
        client.cookies.clear()
        sign_in(client, email)
        office_form = client.get(form_path)
        assert office_form.status_code == 200
        assert "Vista de consulta" in office_form.text
        assert "requieren que administración RED registre una autorización vigente" in office_form.text
        office_write = client.post(
            f"/projects/{project_id}/records/new",
            data={"csrf": csrf_for(client, form_path), "form_code": "D-03", "action": "draft"},
        )
        assert office_write.status_code == 403
        assert office_write.headers["x-red-error-code"] == "field-visit-authorization-required"

    client.cookies.clear()
    sign_in(client, "admin@red.test")
    invalid_reference = client.post(
        f"/projects/{project_id}/visit-authorization",
        data={
            "csrf": csrf_for(client, f"/projects/{project_id}"),
            "action": "approve",
            "site_access_reference": "https://drive.example/folder/ACCESS-001",
            "privacy_reference": "PRIVACY-RED-001",
            "method_reference": "METHOD-FIELD-001",
            "sst_reference": "SST-REVIEW-001",
            "valid_until": "2099-12-31",
            "reviewed_external_supports": "on",
        },
        follow_redirects=False,
    )
    assert invalid_reference.status_code == 422
    with SessionLocal() as session:
        assert session.scalar(select(func.count(ProjectVisitAuthorization.id)).where(
            ProjectVisitAuthorization.project_id == project_id,
        )) == 0
    response = client.post(
        f"/projects/{project_id}/visit-authorization",
        data={
            "csrf": csrf_for(client, f"/projects/{project_id}"),
            "action": "approve",
            "site_access_reference": "ACCESS-BELLO-001",
            "privacy_reference": "PRIVACY-RED-001",
            "method_reference": "METHOD-FIELD-001",
            "sst_reference": "SST-REVIEW-001",
            "valid_until": "2099-12-31",
            "reviewed_external_supports": "on",
        },
        follow_redirects=False,
    )
    assert response.status_code == 303
    with SessionLocal() as session:
        authorization = session.scalar(select(ProjectVisitAuthorization).where(
            ProjectVisitAuthorization.project_id == project_id,
        ))
        assert authorization is not None and authorization.status == "approved"
        approved_id = authorization.id
        approval_event = session.scalar(select(AuditEvent).where(
            AuditEvent.action == "project_visit_authorization_approved",
            AuditEvent.entity_id == approved_id,
        ))
        assert approval_event is not None
        assert "ACCESS-BELLO-001" not in json.dumps(approval_event.detail)

    client.cookies.clear()
    sign_in(client, "field@red.test")
    form_page = client.get(form_path)
    assert form_page.status_code == 200
    assert "Vista de consulta" not in form_page.text
    csrf = csrf_for(client, form_path)
    created = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf, "form_code": "D-03", "action": "draft",
            "submission_key": "A" * 32,
        },
        follow_redirects=False,
    )
    assert created.status_code == 303

    client.cookies.clear()
    sign_in(client, "admin@red.test")
    revoked = client.post(
        f"/projects/{project_id}/visit-authorization",
        data={
            "csrf": csrf_for(client, f"/projects/{project_id}"),
            "action": "revoke", "revocation_reason": "solicitud_administracion",
        },
        follow_redirects=False,
    )
    assert revoked.status_code == 303
    with SessionLocal() as session:
        authorization = session.get(ProjectVisitAuthorization, approved_id)
        assert authorization.status == "revoked"
        assert authorization.revoked_by == workspace["user_ids"]["admin"]
        assert authorization.revoked_at is not None
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.action == "project_visit_authorization_revoked",
            AuditEvent.entity_id == approved_id,
        )) is not None

    client.cookies.clear()
    sign_in(client, "field@red.test")
    denied_after_revocation = client.post(
        f"/projects/{project_id}/records/new",
        data={"form_code": "D-03", "action": "draft"},
    )
    assert denied_after_revocation.status_code == 403
    with SessionLocal() as session:
        assert session.scalar(select(func.count(FormRecord.id)).where(
            FormRecord.project_id == project_id, FormRecord.form_code == "D-03",
        )) == 1


def test_expired_visit_authorization_blocks_field_writes(client, workspace):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        authorization = session.scalar(select(ProjectVisitAuthorization).where(
            ProjectVisitAuthorization.project_id == project_id,
        ))
        authorization.valid_until = date(2000, 1, 1)
        session.commit()
    sign_in(client, "field@red.test")
    page = client.get(f"/projects/{project_id}")
    assert "Autorización vencida" in page.text
    assert "La autorización registrada está vencida" in page.text
    denied = client.post(
        f"/projects/{project_id}/records/new",
        data={"form_code": "D-03", "action": "draft"},
    )
    assert denied.status_code == 403


def test_project_activity_is_scoped_paginated_and_redacts_event_details(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    with SessionLocal() as session:
        created = now_utc()
        for index in range(51):
            session.add(AuditEvent(
                project_id=project_id,
                actor_id=workspace["user_ids"]["consultant"],
                action="pmirs_item_updated" if index < 50 else "private_internal_action_code",
                entity_type="pmirs_item",
                entity_id=f"synthetic-item-{index}",
                detail={
                    "reason": "PRIVATE_REVIEW_REASON_8f4b",
                    "email": "private-invite-8f4b@example.test",
                    "sha256": "private-hash-8f4b",
                },
                created_at=created - timedelta(minutes=index),
            ))
        session.add(AuditEvent(
            project_id=other_project_id,
            actor_id=workspace["user_ids"]["field"],
            action="record_created",
            entity_type="form_record",
            entity_id="other-project-record",
            detail={"reason": "OTHER_PROJECT_SECRET_8f4b"},
            created_at=created + timedelta(minutes=1),
        ))
        session.add(User(
            email="outside@red.test", full_name="Usuario externo", password_hash=hash_password(PASSWORD),
        ))
        session.commit()

    sign_in(client, "consultant@red.test")
    first_page = client.get(f"/projects/{project_id}/activity")
    assert first_page.status_code == 200
    assert "51 actividades · página 1 de 2" in first_page.text
    assert "Cambios y revisiones" in first_page.text
    assert "Objeto PMIRS" in first_page.text
    assert "Objeto PMIRS actualizado" in first_page.text
    assert "Consultor" in first_page.text
    assert first_page.text.count('class="record-row" data-activity-id=') == 50
    for private_value in (
        "PRIVATE_REVIEW_REASON_8f4b", "private-invite-8f4b@example.test",
        "private-hash-8f4b", "OTHER_PROJECT_SECRET_8f4b", "private_internal_action_code",
    ):
        assert private_value not in first_page.text
    assert f'href="/projects/{project_id}/activity?category=all&amp;page=2"' in first_page.text

    last_page = client.get(f"/projects/{project_id}/activity?page=2")
    assert last_page.status_code == 200
    assert "51 actividades · página 2 de 2" in last_page.text
    assert "Actividad registrada" in last_page.text
    assert last_page.text.count('class="record-row" data-activity-id=') == 1
    assert "private_internal_action_code" not in last_page.text
    assert f'href="/projects/{project_id}/activity?category=all&amp;page=1"' in last_page.text
    assert client.get(f"/projects/{project_id}/activity?page=999").status_code == 200
    assert client.get(f"/projects/{project_id}/activity?page=0").status_code == 422

    pmirs_activity = client.get(f"/projects/{project_id}/activity?category=pmirs")
    assert pmirs_activity.status_code == 200
    assert "50 actividades · página 1 de 1" in pmirs_activity.text
    assert "value=\"pmirs\" selected" in pmirs_activity.text
    assert pmirs_activity.text.count('class="record-row" data-activity-id=') == 50
    assert "private_internal_action_code" not in pmirs_activity.text
    no_forms_activity = client.get(f"/projects/{project_id}/activity?category=forms")
    assert no_forms_activity.status_code == 200
    assert "No hay actividades de este tipo" in no_forms_activity.text
    assert "0 actividades · página 1 de 1" in no_forms_activity.text
    assert client.get(f"/projects/{project_id}/activity?category=unknown").status_code == 422

    client.cookies.clear()
    sign_in(client, "reader@red.test")
    assert client.get(f"/projects/{project_id}/activity").status_code == 200
    assert client.get(f"/projects/{other_project_id}/activity").status_code == 404

    client.cookies.clear()
    sign_in(client, "admin@red.test")
    empty_project_id = workspace["project_ids"][2]
    empty_project = client.get(f"/projects/{empty_project_id}/activity")
    assert empty_project.status_code == 200
    assert "Aún no hay actividad" in empty_project.text
    assert "0 actividades · página 1 de 1" in empty_project.text

    client.cookies.clear()
    sign_in(client, "outside@red.test")
    assert client.get(f"/projects/{project_id}/activity").status_code == 404


def test_project_csv_export_is_scoped_audited_and_safe_for_spreadsheets(client, workspace):
    own_project, other_project = workspace["project_ids"][:2]
    with SessionLocal() as session:
        ph_admin = User(
            email="ph-admin@red.test", full_name="Administración PH de prueba",
            password_hash=hash_password(PASSWORD),
        )
        session.add(ph_admin)
        session.flush()
        session.add(ProjectMembership(project_id=own_project, user_id=ph_admin.id, role="administracion_ph"))
        session.add_all([
            FormRecord(
                project_id=own_project, form_code="D-02", title="D-02 sintético",
                status="RAW", record_date="2026-10-07", source_kind="declarado",
                source_note='=HYPERLINK("https://example.invalid")',
                payload={"D02-008": "=HYPERLINK(\"https://example.invalid\")", "D02-018": "Pendiente de consultar"},
                created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
            ),
            FormRecord(
                project_id=other_project, form_code="D-02", title="Otro conjunto sintético",
                source_note="Dato que no debe salir en la exportación del primer conjunto.",
                payload={"D02-008": "dato de otro proyecto"},
                created_by=workspace["user_ids"]["admin"], updated_by=workspace["user_ids"]["admin"],
            ),
        ])
        session.commit()

    sign_in(client, "consultant@red.test")
    page = client.get(f"/projects/{own_project}")
    assert f"/projects/{own_project}/records/export.csv" in page.text
    assert f"/projects/{own_project}/records/export.xlsx" in page.text
    response = client.get(f"/projects/{own_project}/records/export.csv")
    assert response.status_code == 200
    with SessionLocal() as session:
        own_project_slug = session.get(Project, own_project).slug
    assert response.headers["content-disposition"] == f'attachment; filename="greenatics-red-{own_project_slug}-registros.csv"'
    assert response.headers["cache-control"] == "no-store, max-age=0"
    assert response.headers["x-content-type-options"] == "nosniff"
    rows = list(csv.DictReader(io.StringIO(response.content.decode("utf-8-sig"))))
    assert rows and {row["Proyecto"] for row in rows} == {own_project_slug}
    assert not any("dato de otro proyecto" in row["Valor"] for row in rows)
    malicious = next(row for row in rows if row["ID de campo"] == "D02-008")
    assert malicious["Valor"].startswith("'=HYPERLINK")
    assert malicious["Nota de fuente"].startswith("'=HYPERLINK")
    assert any(row["ID de campo"] == "D02-019" and row["Valor"] == "" for row in rows)

    excel = client.get(f"/projects/{own_project}/records/export.xlsx")
    assert excel.status_code == 200
    assert excel.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert excel.headers["cache-control"] == "no-store, max-age=0"
    with zipfile.ZipFile(io.BytesIO(excel.content)) as workbook:
        assert workbook.testzip() is None
        members = set(workbook.namelist())
        assert {"[Content_Types].xml", "_rels/.rels", "xl/workbook.xml", "xl/styles.xml", "xl/worksheets/sheet1.xml"}.issubset(members)
        for name in members:
            if name.endswith(".xml"):
                ET.fromstring(workbook.read(name))
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
    namespace = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    assert not sheet.findall(".//s:f", namespace)
    excel_text = [node.text or "" for node in sheet.findall(".//s:t", namespace)]
    assert own_project_slug in excel_text
    assert "'=HYPERLINK(\"https://example.invalid\")" in excel_text
    assert "dato de otro proyecto" not in excel_text
    assert "D02-019" in excel_text
    with SessionLocal() as session:
        event = session.scalar(select(AuditEvent).where(
            AuditEvent.project_id == own_project, AuditEvent.action == "project_records_exported",
        ))
        assert event and event.detail["record_count"] == 1
        assert event.detail["attachment_contents_included"] is False

    client.cookies.clear()
    sign_in(client, "field@red.test")
    field_page = client.get(f"/projects/{own_project}")
    assert f"/projects/{own_project}/records/export.csv" not in field_page.text
    assert client.get(f"/projects/{own_project}/records/export.csv").status_code == 403
    assert client.get(f"/projects/{own_project}/records/export.xlsx").status_code == 403
    client.cookies.clear()
    sign_in(client, "reader@red.test")
    reader_page = client.get(f"/projects/{own_project}")
    assert f"/projects/{own_project}/records/export.csv" not in reader_page.text
    assert client.get(f"/projects/{own_project}/records/export.csv").status_code == 403
    assert client.get(f"/projects/{own_project}/records/export.xlsx").status_code == 403
    client.cookies.clear()
    sign_in(client, "ph-admin@red.test")
    assert client.get(f"/projects/{own_project}/records/export.csv").status_code == 200
    assert client.get(f"/projects/{own_project}/records/export.xlsx").status_code == 200


def test_master_list_and_multi_select_fields_use_structured_controls(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-02"
    response = client.get(path)
    assert response.status_code == 200
    assert '<select id="D02-004" name="D02-004" multiple' in response.text
    rendered_options = re.findall(r"<option[^>]*>([^<]*)</option>", response.text)
    assert "Lunes" in rendered_options
    assert '<select id="D02-008"' not in response.text  # Lista+texto keeps its free-text option.
    assert '<select id="D02-018" name="D02-018"' in response.text
    assert "La administración reporta servicio con soporte adjunto" in rendered_options
    assert '<select id="D02-020" name="D02-020"' in response.text
    assert any(option.startswith("Bello confirma que la actualización del PGIRS estaba en curso al 12-08-2026") for option in rendered_options)
    assert "El Plan de Acción programado no confirma el estado de transición." in response.text
    assert '<textarea id="D02-019" name="D02-019"' in response.text
    assert "17 de enero de 2027" in response.text
    assert "La excepción del art. 11 corresponde al art. 2.3.2.6.1.6" in response.text
    assert "no demuestra que este conjunto tenga una ruta o servicio" in response.text

    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-02")
    payload = _record_payload(FormData([
        ("D02-004", "Lunes"), ("D02-004", "Viernes"), ("D02-008", "Entrega"),
        ("D02-018", "La administración reporta servicio con soporte adjunto"),
        ("D02-019", "Prestador declarado; fuente pendiente de consultar RUPS y SUI."),
    ]), form_spec)
    assert payload["D02-004"] == "Lunes\nViernes"
    assert payload["D02-008"] == "Entrega"
    assert payload["D02-018"] == "La administración reporta servicio con soporte adjunto"
    assert payload["D02-019"].startswith("Prestador declarado")


def test_contact_and_duration_fields_use_source_semantics(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")

    identity_page = client.get(f"/projects/{project_id}/records/new?form_code=D-01")
    assert identity_page.status_code == 200
    assert 'id="D01-008" name="D01-008" type="email"' in identity_page.text
    assert 'id="D01-009" name="D01-009" type="tel" inputmode="tel" autocomplete="tel"' in identity_page.text

    access_page = client.get(f"/projects/{project_id}/records/new?form_code=D-10")
    assert access_page.status_code == 200
    assert 'id="D10-006" name="D10-006" type="number" step="any" min="0"' in access_page.text
    assert 'id="D10-007" name="D10-007" type="number" step="any" min="0"' in access_page.text

    contact_page = client.get(f"/projects/{project_id}/records/new?form_code=P-07")
    assert contact_page.status_code == 200
    assert 'id="P07-004" name="P07-004" type="text"' in contact_page.text
    assert 'placeholder="Correo o teléfono"' in contact_page.text

    identity_errors = submission_errors(
        app_main.FORM_BY_CODE["D-01"], {"D01-008": "esto-no-es-correo"},
        "Fuente sintética documentada para revisión.",
    )
    assert "Ingresa un correo válido para «Correo»." in identity_errors
    valid_identity_errors = submission_errors(
        app_main.FORM_BY_CODE["D-01"], {"D01-008": "admin@example.test"},
        "Fuente sintética documentada para revisión.",
    )
    assert not any("correo válido" in error for error in valid_identity_errors)
    valid_phone_errors = submission_errors(
        app_main.FORM_BY_CODE["D-01"], {"D01-009": "+57 (300) 000 0000"},
        "Fuente sintética documentada para revisión.",
    )
    assert not any("teléfono local o internacional válido" in error for error in valid_phone_errors)
    for invalid_phone in ("abc 123", "123456"):
        phone_errors = submission_errors(
            app_main.FORM_BY_CODE["D-01"], {"D01-009": invalid_phone},
            "Fuente sintética documentada para revisión.",
        )
        assert any("teléfono local o internacional válido" in error for error in phone_errors)

    duration_form = app_main.FORM_BY_CODE["D-10"]
    invalid_duration_errors = submission_errors(
        duration_form, {"D10-006": "quince minutos"}, "Observación sintética de campo.",
    )
    assert "«Tiempo de ingreso observado» debe ser un número válido de minutos igual o mayor que cero." in invalid_duration_errors
    negative_duration_errors = submission_errors(
        duration_form, {"D10-006": "-1"}, "Observación sintética de campo.",
    )
    assert "«Tiempo de ingreso observado» debe ser un número válido de minutos igual o mayor que cero." in negative_duration_errors
    valid_duration_errors = submission_errors(
        duration_form, {"D10-006": "15.5"}, "Observación sintética de campo.",
    )
    assert not any("Tiempo de ingreso observado" in error for error in valid_duration_errors)

    contact_form = app_main.FORM_BY_CODE["P-07"]
    invalid_contact_errors = submission_errors(
        contact_form, {"P07-004": "contacto sin formato"}, "Fuente sintética documentada.",
    )
    assert "Ingresa un correo válido o un teléfono de 7 a 15 dígitos para «Canal de contacto»." in invalid_contact_errors
    for contact_value in ("enlace@example.test", "+57 300 123 4567"):
        contact_errors = submission_errors(
            contact_form, {"P07-004": contact_value}, "Fuente sintética documentada.",
        )
        assert not any("Canal de contacto" in error for error in contact_errors)


def test_d01_responsibilities_use_project_roles_and_preserve_legacy_values(client, workspace):
    project_id = workspace["project_ids"][0]
    other_project_id = workspace["project_ids"][1]
    field_user_id = workspace["user_ids"]["field"]
    consultant_user_id = workspace["user_ids"]["consultant"]
    sign_in(client, "consultant@red.test")

    page = client.get(f"/projects/{project_id}/records/new?form_code=D-01")
    assert page.status_code == 200
    assert 'id="D01-017" name="D01-017"' in page.text
    assert 'id="D01-018" name="D01-018"' in page.text
    assert "Responsable de campo RED" in page.text
    assert "Responsable de consultoría GREENATICS" in page.text
    assert "Fecha prevista de inicio de actividades" in page.text
    assert "Fecha prevista de inicio ECO ABURRÁ" not in page.text
    assert "La referencia ECO ABURRÁ pertenece al formato fuente v7-2" in page.text
    assert "Selecciona una persona de este expediente" in page.text
    assert "persona activa con el perfil RED requerido y membresía en esta copropiedad" in page.text
    assert "Guarda el registro fuente correspondiente y vuelve aquí" not in page.text

    client.cookies.clear()
    sign_in(client, "admin@red.test")
    empty_page = client.get(f"/projects/{other_project_id}/records/new?form_code=D-01")
    assert "No hay personas activas con el rol requerido en este expediente" in empty_page.text
    assert "Administración RED debe invitar o habilitar a la persona" in empty_page.text

    form_spec = app_main.FORM_BY_CODE["D-01"]
    with SessionLocal() as session:
        options = relation_options_by_field(session, project_id, "D-01")
        assert [option["id"] for option in options["D01-017"]] == [field_user_id]
        assert [option["id"] for option in options["D01-018"]] == [consultant_user_id]
        assert relation_options_by_field(session, other_project_id, "D-01")["D01-017"] == []
        assert not relation_selection_errors(session, project_id, form_spec, {
            "D01-017": field_user_id, "D01-018": consultant_user_id,
        })
        invalid_roles = relation_selection_errors(session, project_id, form_spec, {
            "D01-017": consultant_user_id, "D01-018": field_user_id,
        })
        assert len(invalid_roles) == 2
        cross_project = relation_selection_errors(session, other_project_id, form_spec, {
            "D01-017": field_user_id,
        })
        assert len(cross_project) == 1

        legacy_record = FormRecord(
            project_id=project_id, form_code="D-01", title="Ficha sintética con responsables históricos",
            payload={
                "D01-017": "Responsable de campo externo sintético",
                "D01-018": "Consultoría anterior sintética",
            },
            created_by=consultant_user_id, updated_by=consultant_user_id,
        )
        session.add(legacy_record)
        session.commit()
        legacy_record_id = legacy_record.id
        edit_options = relation_options_by_field(session, project_id, "D-01", legacy_record_id)
        assert "sin vincular a una cuenta RED" in edit_options["D01-017"][0]["label"]
        assert "sin vincular a una cuenta RED" in edit_options["D01-018"][0]["label"]
        project = session.get(Project, project_id)
        export_rows = app_main.record_export_fields(session, project, legacy_record, form_spec, [])
        exported = {row["id"]: row["value"] for row in export_rows}
        assert "sin vincular a una cuenta RED" in exported["D01-017"]
        assert "sin vincular a una cuenta RED" in exported["D01-018"]

    edit_page = client.get(f"/records/{legacy_record_id}/edit")
    assert edit_page.status_code == 200
    assert "Responsable de campo externo sintético" in edit_page.text
    assert "Consultoría anterior sintética" in edit_page.text
    record_page = client.get(f"/records/{legacy_record_id}")
    assert record_page.status_code == 200
    assert "Responsable de campo externo sintético" in record_page.text
    assert "Consultoría anterior sintética" in record_page.text


def test_d06_collection_period_captures_and_preserves_its_unit(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    page = client.get(f"/projects/{project_id}/records/new?form_code=D-06")
    assert page.status_code == 200
    assert 'id="D06-004" name="D06-004__value" type="number"' in page.text
    assert 'id="D06-004-unit" name="D06-004__unit"' in page.text
    assert ">Horas</option>" in page.text and ">Días</option>" in page.text

    form_spec = app_main.FORM_BY_CODE["D-06"]
    combined = _record_payload(FormData([
        ("D06-004__value", "18.5"), ("D06-004__unit", "horas"),
    ]), form_spec)
    assert combined["D06-004"] == "18.5 horas"
    missing_unit = submission_errors(
        form_spec, {"D06-004": "18.5"}, "Fuente sintética documentada.",
    )
    assert any("selecciona si el periodo está en horas o días" in error for error in missing_unit)
    negative_period = submission_errors(
        form_spec, {"D06-004": "-1 días"}, "Fuente sintética documentada.",
    )
    assert any("selecciona si el periodo está en horas o días" in error for error in negative_period)
    valid_period = submission_errors(
        form_spec, {"D06-004": "18.5 horas"}, "Fuente sintética documentada.",
    )
    assert not any("Periodo desde última recolección" in error for error in valid_period)

    preserved = _record_payload(
        FormData([("D06-004__value", ""), ("D06-004__unit", "")]), form_spec,
        existing_payload={"D06-004": "12"},
    )
    assert preserved["D06-004"] == "12"
    cleared = _record_payload(
        FormData([("D06-004__value", ""), ("D06-004__unit", ""), ("D06-004__clear", "1")]), form_spec,
        existing_payload={"D06-004": "12"},
    )
    assert cleared["D06-004"] == ""


def test_source_numeric_controls_and_d13_units_are_validated(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    d01_page = client.get(f"/projects/{project_id}/records/new?form_code=D-01")
    assert d01_page.status_code == 200
    assert 'id="D01-010" name="D01-010" type="number" step="1" min="0"' in d01_page.text
    assert 'id="D01-011" name="D01-011" type="number" step="1" min="1" data-must-be-positive="true"' in d01_page.text
    d04_page = client.get(f"/projects/{project_id}/records/new?form_code=D-04")
    assert d04_page.status_code == 200
    assert 'id="D04-003" name="D04-003" type="number" step="any" min="0" data-must-be-positive="true"' in d04_page.text
    d09_page = client.get(f"/projects/{project_id}/records/new?form_code=D-09")
    assert d09_page.status_code == 200
    assert 'id="D09-002" name="D09-002" type="number" step="any" min="0" data-must-be-positive="true"' in d09_page.text
    d13_page = client.get(f"/projects/{project_id}/records/new?form_code=D-13")
    assert d13_page.status_code == 200
    assert 'name="D13-004__value" type="number"' in d13_page.text
    assert 'name="D13-004__unit" type="text"' in d13_page.text

    payload = _record_payload(FormData([
        ("D13-004__value", "50"), ("D13-004__unit", "kg"),
        ("D13-005__value", "0.1"), ("D13-005__unit", "kg"),
    ]), app_main.FORM_BY_CODE["D-13"])
    assert payload["D13-004"] == "50 kg"
    assert payload["D13-005"] == "0.1 kg"
    unitless = submission_errors(
        app_main.FORM_BY_CODE["D-13"], {"D13-004": "50"}, "Fuente sintética documentada.",
    )
    assert any("unidad técnica" in error for error in unitless)

    errors = submission_errors(app_main.FORM_BY_CODE["D-01"], {
        "D01-010": "1.5", "D01-011": "0", "D01-012": "-1", "D01-013": "5",
    }, "Fuente sintética documentada.")
    assert any("D01-010" not in error and "entero" in error for error in errors)
    assert any("Unidades privadas" in error and "mayor que cero" in error for error in errors)
    assert any("Unidades entregadas" in error and "igual o mayor que cero" in error for error in errors)
    assert any("unidades ocupadas" in error and "superar" in error for error in errors)

    fractional_count = submission_errors(
        app_main.FORM_BY_CODE["D-02"], {"D02-002": "2.5"}, "Fuente sintética documentada.",
    )
    assert any("entero" in error for error in fractional_count)


def test_p15_period_uses_date_controls_and_enforces_end_after_start(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "admin@red.test")
    page = client.get(f"/projects/{project_id}/records/new?form_code=P-15")
    assert page.status_code == 200
    assert 'id="P15-002-start" name="P15-002__start" type="date"' in page.text
    assert 'id="P15-002-end" name="P15-002__end" type="date"' in page.text

    form_spec = app_main.FORM_BY_CODE["P-15"]
    payload = _record_payload(FormData([
        ("P15-002__start", "2026-01-01"), ("P15-002__end", "2026-12-31"),
    ]), form_spec)
    assert payload["P15-002"] == "2026-01-01 / 2026-12-31"
    valid_errors = submission_errors(
        form_spec, {"P15-002": payload["P15-002"]}, "Periodo sintético documentado.",
    )
    assert not any("fecha final debe ser igual o posterior" in error for error in valid_errors)

    for invalid_period in (
        "2026-12-31 / 2026-01-01", "2026-01-01 /", "2026-02-30 / 2026-03-01",
    ):
        errors = submission_errors(
            form_spec, {"P15-002": invalid_period}, "Periodo sintético documentado.",
        )
        assert any("fecha final debe ser igual o posterior" in error for error in errors)

    history = app_main.p15_period_parts("Ciclo 2025 según acta")
    assert history == {"start": "", "end": "", "legacy": "Ciclo 2025 según acta"}
    preserved = _record_payload(
        FormData([("P15-002__start", ""), ("P15-002__end", "")]), form_spec,
        existing_payload={"P15-002": "Ciclo 2025 según acta"},
    )
    assert preserved["P15-002"] == "Ciclo 2025 según acta"
    cleared = _record_payload(
        FormData([("P15-002__start", ""), ("P15-002__end", ""), ("P15-002__clear", "1")]), form_spec,
        existing_payload={"P15-002": "Ciclo 2025 según acta"},
    )
    assert cleared["P15-002"] == ""


def test_field_and_reader_permissions_are_enforced_by_form(client, workspace):
    first_project = workspace["project_ids"][0]
    sign_in(client, "field@red.test")
    assert client.get(f"/projects/{first_project}/records/new?form_code=D-06").status_code == 200
    assert client.get(f"/projects/{first_project}/records/new?form_code=D-02").status_code == 403
    assert can_write_form("campo", "D-06")
    assert can_write_form("campo", "P-14")
    assert not can_write_form("campo", "D-02")
    assert not can_write_form("revisor", "D-06")
    assert not can_write_form("lector", "P-01")

    p14_path = f"/projects/{first_project}/records/new?form_code=P-14"
    p14_page = client.get(p14_path)
    assert p14_page.status_code == 200
    assert 'id="P14-001" name="P14-001" type="text" value="Pendiente: la guía operativa aprobada para este expediente aún no está registrada." readonly' in p14_page.text
    saved = client.post(
        f"/projects/{first_project}/records/new",
        data={
            "csrf": csrf_for(client, p14_path), "form_code": "P-14", "record_title": "Novedad sintética",
            "source_note": "Registro sintético de novedad para comprobar permisos.",
            "P14-001": "Referencia alterada", "P14-005": "NOVEDAD-FALSA", "P14-007": "Contingencia",
            "P14-008": "Se observó un evento sintético sin riesgo real.",
            "P14-012": "Sí", "action": "draft",
        },
        follow_redirects=False,
    )
    assert saved.status_code == 303
    with SessionLocal() as session:
        record = session.scalar(select(FormRecord).where(FormRecord.project_id == first_project, FormRecord.form_code == "P-14"))
        assert record.payload["P14-001"].startswith("Pendiente: la guía operativa aprobada")
        assert re.fullmatch(r"NOV-BEL-\d{3}-[A-F0-9]+", record.payload["P14-005"])
        assert record.payload["P14-005"] != "NOVEDAD-FALSA"
        assert record.payload["P14-007"] == "Contingencia"

    client.cookies.clear()
    sign_in(client, "reader@red.test")
    assert client.get(f"/projects/{first_project}/records/new?form_code=D-06").status_code == 403


def test_access_matrix_matches_documented_profiles():
    form_codes = {form["code"] for form in FORM_CATALOG["forms"]}
    field_forms = {*(f"D-{number:02d}" for number in range(3, 15)), "P-14"}
    ph_forms = {"D-01", "D-02", "P-02", *(f"P-{number:02d}" for number in range(7, 12)), "P-13", "P-14", "P-15"}
    expected_form_writes = {
        "admin": form_codes - {"P-12"},
        "consultor": form_codes - {"P-12"},
        "campo": field_forms,
        "administracion_ph": ph_forms,
        "revisor": set(),
        "lector": set(),
    }
    for role, expected in expected_form_writes.items():
        assert {code for code in form_codes if can_write_form(role, code)} == expected

    assert {role for role in expected_form_writes if can_manage_pmirs(role)} == {"admin", "consultor"}
    assert "en_validacion" in {code for code, _label in pmirs_progress_options("campo", "evidencia_cargada", evidence_count=1)}
    assert "validada" not in {code for code, _label in pmirs_progress_options("campo", "evidencia_cargada", evidence_count=1)}
    assert {code for code, _label in pmirs_progress_options("revisor", "en_validacion", evidence_count=1)} == {"validada", "requiere_correccion"}
    assert {code for code, _label in pmirs_progress_options("consultor", "en_validacion", evidence_count=1)} == {"en_proceso", "evidencia_cargada", "en_validacion"}
    assert {code for code, _label in pmirs_progress_options("lector", "pendiente", evidence_count=1)} == set()
    assert app_main.PROJECT_EXPORT_ROLES == {"admin", "consultor", "administracion_ph", "revisor"}


def test_p14_operational_documents_stay_pending_until_supported(client, workspace):
    project_id = workspace["project_ids"][0]
    actor_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        version = PMIRSVersion(
            project_id=project_id, version_label="PMIRS-v1", status="borrador",
            snapshot={}, change_reason="primera", change_summary="Versión sintética de prueba.",
            created_by=actor_id,
        )
        session.add(version)
        session.commit()
        options = relation_options_by_field(session, project_id, "P-14")
        assert "P14-001" not in options
        assert "P14-002" not in options

    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=P-14"
    page = client.get(path)
    assert page.status_code == 200
    assert 'id="P14-001" name="P14-001" type="text"' in page.text
    assert 'id="P14-002" name="P14-002" type="text"' in page.text
    assert "Mantén la referencia pendiente" in page.text
    assert 'id="P14-001" name="P14-001" multiple' not in page.text

    saved = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, path), "form_code": "P-14", "record_title": "Referencias P-14 sintéticas",
            "source_note": "Prueba sintética de referencias operativas pendientes.",
            "P14-001": "PMIRS-v1", "P14-002": "PMIRS-v1", "action": "draft",
        },
        follow_redirects=False,
    )
    assert saved.status_code == 303
    with SessionLocal() as session:
        record = session.scalar(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == "P-14",
            FormRecord.title == "Referencias P-14 sintéticas",
        ))
        assert record.payload["P14-001"].startswith("Pendiente: la guía operativa aprobada")
        assert record.payload["P14-002"].startswith("Pendiente: la tabla de separación aprobada")


def test_visit_relationships_are_selectable_and_project_scoped(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    sign_in(client, "consultant@red.test")

    def create_visit(target_project_id: str, title: str) -> str:
        path = f"/projects/{target_project_id}/records/new?form_code=D-03"
        response = client.post(
            f"/projects/{target_project_id}/records/new",
            data={
                "csrf": csrf_for(client, path), "form_code": "D-03", "record_title": title,
                "source_note": "Visita sintética para comprobar vínculos entre formularios.", "action": "draft",
            },
            follow_redirects=False,
        )
        assert response.status_code == 303
        return response.headers["location"].split("/records/", 1)[1].split("?", 1)[0]

    local_visit_id = create_visit(project_id, "Visita local sintética")
    client.cookies.clear()
    sign_in(client, "admin@red.test")
    foreign_visit_id = create_visit(other_project_id, "Visita externa sintética")
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    closeout_path = f"/projects/{project_id}/records/new?form_code=D-14"
    page = client.get(closeout_path)
    assert page.status_code == 200
    assert f'<option value="{local_visit_id}"' in page.text
    assert foreign_visit_id not in page.text

    base_data = {
        "csrf": csrf_for(client, closeout_path), "form_code": "D-14", "record_title": "Cierre sintético",
        "source_note": "Cierre sintético para validar vínculo de la visita.", "action": "draft",
    }
    rejected = client.post(
        f"/projects/{project_id}/records/new", data={**base_data, "D14-001": foreign_visit_id},
        follow_redirects=False,
    )
    assert rejected.status_code == 422
    assert "corresponder al tipo permitido" in rejected.text

    accepted = client.post(
        f"/projects/{project_id}/records/new", data={**base_data, "D14-001": local_visit_id},
        follow_redirects=False,
    )
    assert accepted.status_code == 303
    with SessionLocal() as session:
        closeout = session.scalar(select(FormRecord).where(
            FormRecord.project_id == project_id, FormRecord.form_code == "D-14",
        ))
        assert closeout.payload["D14-001"] == local_visit_id


def test_d14_open_incident_count_tracks_linked_incident_changes(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")

    visit_path = f"/projects/{project_id}/records/new?form_code=D-03"
    visit_response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, visit_path), "form_code": "D-03", "record_title": "Visita de control sintética",
            "source_note": "Visita sintética para validar el cierre y las incidencias.", "action": "draft",
        },
        follow_redirects=False,
    )
    visit_id = visit_response.headers["location"].split("/records/", 1)[1].split("?", 1)[0]

    closeout_path = f"/projects/{project_id}/records/new?form_code=D-14"
    closeout_response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, closeout_path), "form_code": "D-14", "record_title": "Cierre de control sintético",
            "source_note": "Cierre sintético para validar el conteo de incidencias abiertas.",
            "D14-001": visit_id, "action": "draft",
        },
        follow_redirects=False,
    )
    assert closeout_response.status_code == 303
    closeout_id = closeout_response.headers["location"].split("/records/", 1)[1].split("?", 1)[0]

    incident_path = f"/projects/{project_id}/records/new?form_code=D-12"
    incident_response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, incident_path), "form_code": "D-12", "record_title": "Incidencia sintética",
            "source_note": "Incidencia sintética para validar el recálculo del cierre.",
            "D12-001": visit_id, "D12-002": "Otro",
            "D12-003": "Incidencia sintética ligada a la visita para prueba.",
            "D12-004": "No", "D12-005": "Se dejó registro sintético para validación.",
            "D12-008": "Abierta", "action": "submit",
        },
        follow_redirects=False,
    )
    assert incident_response.status_code == 303
    incident_id = incident_response.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
    with SessionLocal() as session:
        closeout = session.get(FormRecord, closeout_id)
        assert closeout.payload["D14-005"] == "1 incidencia abierta"
        assert closeout.version == 2

    edit_path = f"/records/{incident_id}/edit"
    edited = client.post(
        f"/records/{incident_id}/edit",
        data={
            "csrf": csrf_for(client, edit_path), "form_code": "D-12", "record_title": "Incidencia sintética",
            "source_note": "Incidencia sintética cerrada para verificar el recálculo automático.",
            "D12-001": visit_id, "D12-002": "Otro",
            "D12-003": "Incidencia sintética ligada a la visita para prueba.",
            "D12-004": "No", "D12-005": "Se verificó cierre sintético pendiente de QA.",
            "D12-008": "Cerrada", "action": "submit",
        },
        follow_redirects=False,
    )
    assert edited.status_code == 303
    with SessionLocal() as session:
        closeout = session.get(FormRecord, closeout_id)
        assert closeout.payload["D14-005"] == "0 incidencias abiertas; 1 cierre sin validar"
        assert closeout.version == 3
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.action == "record_d14_summary_recalculated", AuditEvent.entity_id == closeout_id,
        )) is not None

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    reviewed = client.post(
        f"/records/{incident_id}/review",
        data=rendered_decision_data(client, f"/records/{incident_id}/review", {"expected_version": record_version_for_review(incident_id), 
            "csrf": csrf_for(client, f"/records/{incident_id}"), "decision": "VALIDATED",
            "reason": "Cierre sintético revisado para prueba.",
        }),
        follow_redirects=False,
    )
    assert reviewed.status_code == 303
    with SessionLocal() as session:
        closeout = session.get(FormRecord, closeout_id)
        assert closeout.payload["D14-005"] == "0 incidencias abiertas"
        assert closeout.version == 4


def test_d14_reports_observed_records_photos_and_weights_without_protocol_claims(workspace):
    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    reviewer_id = workspace["user_ids"]["reviewer"]
    with SessionLocal() as session:
        visit = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita de caracterización sintética",
            status="RAW", payload={"D03-002": "Caracterización"},
            source_note="Visita sintética para el checklist observable.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(visit)
        session.flush()
        shift = FormRecord(
            project_id=project_id, form_code="D-06", title="Jornada vinculada sintética", status="RAW",
            payload={"D06-002": "1", "D06-009": visit.id},
            source_note="Jornada vinculada para el checklist observable.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(shift)
        session.flush()
        source = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje vinculado sintético", status="RAW",
            payload={"D07-001": shift.id, "D07-002": "1", "D07-007": "2.5"},
            source_note="Pesaje vinculado para el checklist observable.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(source)
        session.flush()
        fraction = FormRecord(
            project_id=project_id, form_code="D-08", title="Fracción vinculada sintética", status="RAW",
            payload={"D08-001": source.id, "D08-005": "2.5"},
            source_note="Fracción vinculada para el checklist observable.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(fraction)
        session.flush()
        photo = EvidenceFile(
            project_id=project_id, record_id=fraction.id, field_id="D08-006",
            original_name="fraccion-sintetica.jpg", storage_name="synthetic-photo.jpg",
            media_type="image/jpeg", size_bytes=128, sha256="b" * 64, created_by=consultant_id,
        )
        session.add(photo)
        session.flush()

        calculated = apply_server_managed_fields(
            "D-14", {"D14-001": visit.id, "D14-002": "Checklist inventado", "D14-003": "Fotos inventadas"},
            session=session, project_id=project_id, actor_id=consultant_id,
        )
        assert "D-03: 1 localizado(s)" in calculated["D14-002"]
        assert "D-06: 1 localizado(s)" in calculated["D14-002"]
        assert "D-07: 1 localizado(s)" in calculated["D14-002"]
        assert "D-08: 1 localizado(s)" in calculated["D14-002"]
        assert "Campos obligatorios vacíos detectados:" in calculated["D14-002"]
        assert "no identifica formularios esperados" in calculated["D14-002"]
        assert "Imágenes en registros vinculados: 1" in calculated["D14-003"]
        assert "mínimo fotográfico por tipo no está configurado" in calculated["D14-003"]
        assert "1 pesaje(s) D-07 vinculado(s)" in calculated["D14-004"]
        assert "regla de pesajes requeridos por tipo de visita no está configurada" in calculated["D14-004"]
        assert "Completa no permitido" in calculated["D14-007"]
        assert "remitirse a QA con esta bandera" in calculated["D14-007"]
        assert "no la clasifica automáticamente como Incompleta justificada ni No válida" in calculated["D14-007"]
        assert "Pendiente de protocolo técnico" in calculated["D14-007"]
        assert "no declara el cierre completo ni incompleto" in calculated["D14-007"]
        assert "Checklist inventado" not in calculated["D14-002"]

        closeout = FormRecord(
            project_id=project_id, form_code="D-14", title="Cierre calculado sintético", status="VALIDATED",
            payload=calculated, source_note="Cierre sintético para recalcular al cambiar evidencia.",
            reviewed_by=reviewer_id, reviewed_at=now_utc(), created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(closeout)
        session.flush()
        source.status = "VALIDATED"
        recalculate_d14_for_visit(session, visit.id, project_id=project_id, actor_id=consultant_id)
        assert closeout.status == "CORRECTION_REQUESTED"
        assert closeout.version == 2
        assert "1 validado(s)" in closeout.payload["D14-002"]

        session.delete(photo)
        recalculate_d14_for_visit(session, visit.id, project_id=project_id, actor_id=consultant_id)
        assert closeout.version == 3
        assert "Imágenes en registros vinculados: 0" in closeout.payload["D14-003"]
        assert closeout.status == "CORRECTION_REQUESTED"


def test_d14_keeps_status_pending_without_validation_failures(workspace, monkeypatch):
    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        visit = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita sintética sin bloqueos",
            status="RAW", payload={"D03-002": "Caracterización"},
            source_note="Registro sintético para distinguir estado pendiente de una falla validada.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(visit)
        session.flush()
        monkeypatch.setattr(app_main, "submission_errors", lambda *args, **kwargs: [])
        monkeypatch.setattr(app_main, "relation_selection_errors", lambda *args, **kwargs: [])

        calculated = app_main.d14_visit_summary_fields(session, project_id, visit.id)

    assert "Completa no permitido" not in calculated["D14-007"]
    assert "Pendiente de protocolo técnico" in calculated["D14-007"]
    assert "no declara el cierre completo ni incompleto" in calculated["D14-007"]


def test_p15_open_actions_are_generated_from_pmirs_studio(client, workspace):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        session.add(PMIRSItem(
            project_id=project_id, item_type="accion", code="ACC-TEST-001", title="Acción sintética vencida",
            description="Acción sintética para validar el resumen de seguimiento.",
            data={"execution_status": "pendiente", "due_date": "2000-01-01"},
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        ))
        session.add(PMIRSItem(
            project_id=project_id, item_type="accion", code="ACC-TEST-002", title="Acción sintética cerrada",
            description="Acción sintética cerrada fuera del listado de pendientes.",
            data={"execution_status": "cerrada", "due_date": "2000-01-01"},
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        ))
        session.commit()
        payload = apply_server_managed_fields("P-15", {}, session=session, project_id=project_id, record_id="12345678-abcd-0000-0000-000000000000")
        assert "ACC-TEST-001 · Acción sintética vencida" in payload["P15-009"]
        assert "vencida" in payload["P15-009"]
        assert "ACC-TEST-002" not in payload["P15-009"]


def test_p15_due_dates_follow_bello_calendar_day(workspace, monkeypatch):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        session.add(PMIRSItem(
            project_id=project_id, item_type="accion", code="ACC-TEST-LOCAL-DATE",
            title="Acción con vencimiento local", description="Caso sintético de límite horario.",
            data={"execution_status": "pendiente", "due_date": "2026-10-09"},
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        ))
        session.add(PMIRSItem(
            project_id=project_id, item_type="accion", code="ACC-TEST-INVALID-DATE",
            title="Acción histórica con fecha inválida", description="Caso sintético de migración/legado.",
            data={"execution_status": "pendiente", "due_date": "2026-13-01"},
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        ))
        session.commit()

        # 03:30 UTC is still 22:30 of the previous calendar day in Bello.
        monkeypatch.setattr(app_main, "now_utc", lambda: datetime(2026, 10, 10, 3, 30, tzinfo=timezone.utc))
        due_today = app_main.p15_open_action_summary(session, project_id)
        assert "2026-10-09 · vence hoy" in due_today
        assert "2026-10-09 · vencida" not in due_today
        invalid_action = next(line for line in due_today.split("; ") if "ACC-TEST-INVALID-DATE" in line)
        assert "fecha objetivo inválida (2026-13-01)" in invalid_action
        assert "vencida" not in invalid_action

        # At 05:00 UTC, the local date has advanced to October 10.
        monkeypatch.setattr(app_main, "now_utc", lambda: datetime(2026, 10, 10, 5, 0, tzinfo=timezone.utc))
        overdue = app_main.p15_open_action_summary(session, project_id)
        assert "2026-10-09 · vencida" in overdue


def test_pmirs_action_dates_require_real_iso_calendar_dates(workspace):
    with SessionLocal() as session:
        errors = app_main.pmirs_submission_errors(
            session, workspace["project_ids"][0], "accion", "Acción sintética",
            "Datos sintéticos para validar el servidor.",
            {"start_date": "2026-02-30", "due_date": "2026-13-01"},
        )
        assert "La fecha de inicio debe ser una fecha real en formato AAAA-MM-DD." in errors
        assert "La fecha objetivo debe ser una fecha real en formato AAAA-MM-DD." in errors

        valid_date_errors = app_main.pmirs_submission_errors(
            session, workspace["project_ids"][0], "accion", "Acción sintética",
            "Datos sintéticos para validar el servidor.",
            {"start_date": "2028-02-28", "due_date": "2028-02-29"},
        )
        assert not any("fecha real" in error for error in valid_date_errors)


def test_p15_action_recalculation_reopens_review_and_preserves_period_data(workspace):
    project_id = workspace["project_ids"][0]
    actor_id = workspace["user_ids"]["consultant"]
    reviewer_id = workspace["user_ids"]["reviewer"]
    original_payload = {
        "P15-001": "CICLO-SINTETICO-01",
        "P15-006": "IND-TEST-001",
        "P15-007": "IND-TEST-001: 42.5",
        "P15-008": "Comparación del periodo conservada para revisión.",
        "P15-009": "Resumen previo de acciones abiertas.",
        "P15-010": "Método de seguimiento sintético documentado.",
    }
    with SessionLocal() as session:
        action = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-TEST-001",
            title="Acción de seguimiento sintética", description="Acción para probar el recálculo P-15.",
            data={"execution_status": "en_proceso", "due_date": "2099-12-31"},
            review_status="VALIDATED", version=1,
            created_by=actor_id, updated_by=actor_id,
        )
        follow_up = FormRecord(
            project_id=project_id, form_code="P-15", title="Seguimiento de periodo sintético",
            status="VALIDATED", payload=original_payload, version=4,
            reviewed_by=reviewer_id, reviewed_at=now_utc(), review_note="Revisión sintética previa.",
            created_by=actor_id, updated_by=reviewer_id,
        )
        session.add_all([action, follow_up])
        session.flush()

        app_main.recalculate_p15_for_project(session, project_id, actor_id=actor_id)
        session.flush()
        assert follow_up.status == "CORRECTION_REQUESTED"
        assert follow_up.version == 5
        assert "A-TEST-001 · Acción de seguimiento sintética" in follow_up.payload["P15-009"]
        for field_id in ("P15-001", "P15-006", "P15-007", "P15-008", "P15-010"):
            assert follow_up.payload[field_id] == original_payload[field_id]
        assert follow_up.reviewed_by is None and follow_up.reviewed_at is None
        assert follow_up.review_note == "Cambió la lista de acciones abiertas del PMIRS Studio; revisa el ciclo de seguimiento nuevamente."
        first_revision_id = session.scalar(select(FormRevision.id).where(FormRevision.record_id == follow_up.id))
        assert first_revision_id is not None
        first_recalculation_version = follow_up.version

        app_main.recalculate_p15_for_project(session, project_id, actor_id=actor_id)
        session.flush()
        assert follow_up.version == first_recalculation_version
        assert len(list(session.scalars(select(FormRevision).where(FormRevision.record_id == follow_up.id)))) == 1

        action.data = {**action.data, "execution_status": "cerrada"}
        app_main.recalculate_p15_for_project(session, project_id, actor_id=actor_id)
        session.flush()
        assert follow_up.version == 6
        assert follow_up.payload["P15-009"] == "Sin acciones abiertas registradas en PMIRS Studio."
        assert follow_up.payload["P15-007"] == original_payload["P15-007"]
        assert len(list(session.scalars(select(FormRevision).where(FormRevision.record_id == follow_up.id)))) == 2
        assert len(list(session.scalars(select(AuditEvent).where(
            AuditEvent.action == "record_p15_actions_recalculated",
            AuditEvent.entity_id == follow_up.id,
        )))) == 2


def test_p15_calculates_neutral_indicator_comparison_from_structured_values(client, workspace):
    project_id = workspace["project_ids"][0]
    actor_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        indicator = PMIRSItem(
            project_id=project_id, item_type="indicador", code="IND-01", title="Aprovechamiento",
            description="Indicador sintético para comparar el resultado con una meta.",
            data={"unit": "%", "target": "50%", "formula": "Porcentaje sobre masa total"},
            review_status="VALIDATED", created_by=actor_id, updated_by=actor_id,
        )
        session.add(indicator)
        session.commit()
        indicator_id = indicator.id

    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=P-15"
    page = client.get(path)
    assert page.status_code == 200
    assert 'id="P15-007" name="P15-007"' in page.text
    assert "IND-01: 42.5" in page.text
    assert '<textarea id="P15-008" name="P15-008"' in page.text
    assert "no concluye cumplimiento" in page.text

    saved = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, path), "form_code": "P-15", "record_title": "Seguimiento sintético",
            "source_note": "Valor sintético de un periodo de prueba.", "action": "draft",
            "P15-006": [indicator_id], "P15-007": "IND-01: 42,5", "P15-008": "Resultado falso del navegador",
        },
        follow_redirects=False,
    )
    assert saved.status_code == 303
    record_id = saved.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        assert record.payload["P15-007"] == "IND-01: 42,5"
        assert "IND-01: periodo 42.5 % vs meta 50 %" in record.payload["P15-008"]
        assert "diferencia matemática -7.5 p.p." in record.payload["P15-008"]
        assert "No determina cumplimiento" in record.payload["P15-008"]

    edit_path = f"/records/{record_id}/edit"
    edited = client.post(
        edit_path,
        data={
            "csrf": csrf_for(client, edit_path), "form_code": "P-15", "record_title": "Seguimiento sintético",
            "source_note": "Actualización sintética de un periodo de prueba.", "action": "draft",
            "P15-006": [indicator_id], "P15-007": "IND-01: 55", "P15-008": "Otro valor falso",
        },
        follow_redirects=False,
    )
    assert edited.status_code == 303
    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        assert "diferencia matemática 5 p.p." in record.payload["P15-008"]
        assert record.version == 2
        assert len(list(session.scalars(select(FormRevision).where(FormRevision.record_id == record_id)))) == 2

    rejected = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, path), "form_code": "P-15", "record_title": "Vínculo de medida inválido",
            "source_note": "Valor sintético que no corresponde al indicador elegido.", "action": "draft",
            "P15-006": [indicator_id], "P15-007": "IND-99: 12",
        },
        follow_redirects=False,
    )
    assert rejected.status_code == 422
    assert "IND-99 debe estar seleccionado" in rejected.text


def test_q01_summarizes_d08_neutrally_and_reopens_when_source_changes(client, workspace):
    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    reviewer_id = workspace["user_ids"]["reviewer"]
    sign_in(client, "consultant@red.test")
    q01_path = f"/projects/{project_id}/records/new?form_code=Q-01"
    q01_page = client.get(q01_path)
    assert q01_page.status_code == 200
    assert '<textarea id="Q01-002" name="Q01-002" rows="3" data-derived-field="Q01-002" readonly' in q01_page.text
    assert "Resume registros, validaciones y evidencias observados" in q01_page.text
    assert '<input id="Q01-010" name="Q01-010"' in q01_page.text
    assert 'id="Q01-010"' in q01_page.text and 'value="Pendiente: la entidad C-03 no está configurada en RED' in q01_page.text
    assert "solo lectura hasta que exista un flujo verificable de solicitudes" in q01_page.text
    assert '<textarea id="Q01-003" name="Q01-003"' in q01_page.text
    assert 'readonly aria-readonly="true"' in q01_page.text
    assert "no aplica tolerancias ni declara aceptación técnica" in q01_page.text

    create_path = f"/projects/{project_id}/records/new"
    forged_relation = client.post(
        create_path,
        data={
            "csrf": csrf_for(client, q01_path), "form_code": "Q-01",
            "record_title": "Solicitud C-03 sintética no vinculada", "source_note": "Ensayo sintético de control de relación.",
            "action": "draft", "Q01-010": "C-03-FAKE-001",
        },
        follow_redirects=False,
    )
    assert forged_relation.status_code == 303
    forged_record_id = forged_relation.headers["location"].split("/records/")[-1].split("?")[0]
    with SessionLocal() as session:
        forged_record = session.get(FormRecord, forged_record_id)
        assert forged_record.payload["Q01-010"] == "Pendiente: la entidad C-03 no está configurada en RED; no ingreses identificadores manuales."

    with SessionLocal() as session:
        shift = FormRecord(
            project_id=project_id, form_code="D-06", title="Jornada sintética 1", status="VALIDATED",
            payload={"D06-002": "1"}, source_note="Jornada sintética para resumen QA.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(shift)
        session.flush()
        source = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje sintético 1", status="VALIDATED",
            payload={"D07-001": shift.id, "D07-002": "1", "D07-007": "1.75"},
            source_note="Pesaje sintético para resumen QA.", created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(source)
        session.flush()
        fraction = FormRecord(
            project_id=project_id, form_code="D-08", title="Fracción sintética", status="VALIDATED",
            payload={
                "D08-001": source.id, "D08-008": "1.75", "D08-009": "0 kg; 0.00%",
                "D08-010": "Pendiente de revisar completitud, evidencia y tolerancia técnica interna.",
            }, source_note="Fracción sintética para resumen QA.", created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(fraction)
        session.flush()
        qa = FormRecord(
            project_id=project_id, form_code="Q-01", title="QA sintético", status="VALIDATED",
            payload={"Q01-001": shift.id, "Q01-002": "Completitud confirmada", "Q01-003": "Resultado falso del navegador"},
            source_note="QA sintético para confirmar el resumen server-side.",
            reviewed_by=reviewer_id, reviewed_at=now_utc(), created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(qa)
        session.flush()

        bind_synthetic_fraction_source(session, project_id)
        calculated = apply_server_managed_fields(
            "Q-01", {
                "Q01-001": shift.id, "Q01-002": "Completitud confirmada",
                "Q01-003": "Resultado falso del navegador", "Q01-010": "C-03-FAKE-001",
            },
            session=session, project_id=project_id, record_id=qa.id, actor_id=consultant_id,
        )
        assert "Observaciones calculadas para jornada D-06" in calculated["Q01-002"]
        assert "D-06: 1 registro(s); 1 validado(s)." in calculated["Q01-002"]
        assert "D-07: 1 registro(s); 1 validado(s)." in calculated["Q01-002"]
        assert "D-08: 1 registro(s); 1 validado(s)." in calculated["Q01-002"]
        assert "Pendiente de confirmar completitud" in calculated["Q01-002"]
        assert "la persona revisora registra su resultado en Q01-008" in calculated["Q01-002"]
        assert calculated["Q01-010"] == "Pendiente: la entidad C-03 no está configurada en RED; no ingreses identificadores manuales."
        assert "Jornada 1" in calculated["Q01-003"]
        assert "peso inicial 1.75 kg" in calculated["Q01-003"]
        assert "total caracterizado 1.75 kg" in calculated["Q01-003"]
        assert "diferencia 0 kg; 0.00%" in calculated["Q01-003"]
        assert "1/1 filas válidas" in calculated["Q01-003"]
        assert "no aplica una tolerancia ni declara el balance aceptable" in calculated["Q01-003"]
        assert "Resultado falso del navegador" not in calculated["Q01-003"]
        qa.payload = calculated

        # An upstream D-08 change updates the summary and invalidates prior QA.
        fraction.payload = {**fraction.payload, "D08-008": "1.5", "D08-009": "0.25 kg; 14.29%"}
        recalculate_q01_for_shift(session, shift.id, project_id=project_id, actor_id=consultant_id)
        assert qa.status == "CORRECTION_REQUESTED"
        assert qa.version == 2
        assert qa.reviewed_by is None and qa.reviewed_at is None
        assert "total caracterizado 1.5 kg" in qa.payload["Q01-003"]
        assert "revisa nuevamente" in qa.review_note
        session.flush()
        assert session.scalar(select(FormRevision).where(
            FormRevision.record_id == qa.id, FormRevision.revision == 2,
        )) is not None
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.action == "record_q01_balance_recalculated", AuditEvent.entity_id == qa.id,
        )) is not None

        evidence = EvidenceFile(
            project_id=project_id, record_id=fraction.id, field_id="D08-006",
            original_name="fraccion-qa-sintetica.jpg", storage_name="fraccion-qa-sintetica.jpg",
            media_type="image/jpeg", size_bytes=64, sha256="c" * 64, created_by=consultant_id,
        )
        session.add(evidence)
        session.flush()
        recalculate_q01_for_shift(session, shift.id, project_id=project_id, actor_id=consultant_id)
        assert qa.version == 3
        assert "Evidencias vinculadas: 1 archivo(s), 1 imagen(es)." in qa.payload["Q01-002"]
        session.flush()
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.action == "record_q01_completeness_recalculated", AuditEvent.entity_id == qa.id,
        )) is not None

        visit = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita sintética", status="VALIDATED",
            payload={}, source_note="Visita sin vínculo a jornada en esta prueba.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(visit)
        session.flush()
        visit_summary = apply_server_managed_fields(
            "Q-01", {"Q01-001": visit.id}, session=session, project_id=project_id,
        )["Q01-003"]
        assert "no tiene jornadas D-06 vinculadas" in visit_summary
        assert "1.5 kg" not in visit_summary


def test_d06_visit_extension_is_project_scoped_and_q01_aggregates_visit(client, workspace):
    project_id = workspace["project_ids"][0]
    other_project_id = workspace["project_ids"][1]
    consultant_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        visit = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita sintética A", status="VALIDATED",
            payload={"D03-002": "Medición"}, source_note="Visita sintética para el vínculo.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        other_visit = FormRecord(
            project_id=other_project_id, form_code="D-03", title="Visita de otro expediente", status="VALIDATED",
            payload={}, source_note="Visita sintética de otro expediente.",
            created_by=workspace["user_ids"]["admin"], updated_by=workspace["user_ids"]["admin"],
        )
        session.add_all([visit, other_visit])
        session.flush()
        shift = FormRecord(
            project_id=project_id, form_code="D-06", title="Jornada sintética vinculada", status="VALIDATED",
            payload={"D06-002": "3", "D06-009": visit.id}, source_note="Jornada vinculada a una visita sintética.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(shift)
        session.flush()
        source = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje sintético vinculado", status="VALIDATED",
            payload={"D07-001": shift.id, "D07-002": "1", "D07-007": "4.2"},
            source_note="Pesaje sintético para el resumen por visita.", created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(source)
        session.flush()
        fraction = FormRecord(
            project_id=project_id, form_code="D-08", title="Fracción sintética vinculada", status="VALIDATED",
            payload={"D08-001": source.id, "D08-008": "4.0", "D08-009": "0.2 kg; 4.76%"},
            source_note="Fracción sintética para el resumen por visita.", created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(fraction)
        qa = FormRecord(
            project_id=project_id, form_code="Q-01", title="QA de visita sintética", status="VALIDATED",
            payload={"Q01-001": visit.id, "Q01-003": "Resumen falso"},
            source_note="QA sintético asociado a la visita.", reviewed_by=workspace["user_ids"]["reviewer"],
            reviewed_at=now_utc(), created_by=consultant_id, updated_by=consultant_id,
        )
        qa_shift = FormRecord(
            project_id=project_id, form_code="Q-01", title="QA de jornada sintética", status="VALIDATED",
            payload={"Q01-001": shift.id, "Q01-002": "Resumen falso"},
            source_note="QA sintético asociado a la jornada.", reviewed_by=workspace["user_ids"]["reviewer"],
            reviewed_at=now_utc(), created_by=consultant_id, updated_by=consultant_id,
        )
        session.add_all([qa, qa_shift])
        session.flush()

        relation_options = relation_options_by_field(session, project_id, "D-06")["D06-009"]
        assert [option["id"] for option in relation_options] == [visit.id]
        d06_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-06")
        assert not relation_selection_errors(session, project_id, d06_spec, {"D06-009": visit.id})
        assert relation_selection_errors(session, project_id, d06_spec, {"D06-009": other_visit.id})

        calculated = apply_server_managed_fields(
            "Q-01", {"Q01-001": visit.id, "Q01-003": "Resumen falso"},
            session=session, project_id=project_id, record_id=qa.id, actor_id=consultant_id,
        )
        shift_calculated = apply_server_managed_fields(
            "Q-01", {"Q01-001": shift.id, "Q01-002": "Resumen falso"},
            session=session, project_id=project_id, record_id=qa_shift.id, actor_id=consultant_id,
        )
        assert "visita «Visita sintética A»" in calculated["Q01-003"]
        assert "jornada D-06 3" in calculated["Q01-003"]
        assert "peso inicial 4.2 kg" in calculated["Q01-003"]
        assert "total caracterizado 4 kg" in calculated["Q01-003"]
        assert "ni declara el balance aceptable" in calculated["Q01-003"]
        assert "Resumen falso" not in calculated["Q01-003"]
        qa.payload = calculated
        qa_shift.payload = shift_calculated

        incident = FormRecord(
            project_id=project_id, form_code="D-12", title="Incidencia sintética de visita", status="RAW",
            payload={"D12-001": visit.id}, source_note="Incidencia sintética para recalcular completitud.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(incident)
        session.flush()
        incident_contexts = app_main.q01_context_ids_for_record(session, project_id, incident)
        assert {visit.id, shift.id}.issubset(incident_contexts)
        app_main.recalculate_q01_for_context_ids(
            session, incident_contexts, project_id=project_id, actor_id=consultant_id,
        )
        assert qa.version == 2 and qa_shift.version == 2
        assert "D-12: 1 registro(s); 0 validado(s)." in qa.payload["Q01-002"]
        assert "D-12: 1 registro(s); 0 validado(s)." in qa_shift.payload["Q01-002"]

        incident_photo = EvidenceFile(
            project_id=project_id, record_id=incident.id, field_id="D12-006",
            original_name="incidencia-sintetica.jpg", storage_name="incidencia-sintetica.jpg",
            media_type="image/jpeg", size_bytes=64, sha256="d" * 64, created_by=consultant_id,
        )
        session.add(incident_photo)
        session.flush()
        app_main.recalculate_q01_for_context_ids(
            session, app_main.q01_context_ids_for_record(session, project_id, incident),
            project_id=project_id, actor_id=consultant_id,
        )
        assert "Evidencias vinculadas: 1 archivo(s), 1 imagen(es)." in qa.payload["Q01-002"]
        assert "Evidencias vinculadas: 1 archivo(s), 1 imagen(es)." in qa_shift.payload["Q01-002"]

        fraction.payload = {**fraction.payload, "D08-008": "3.5", "D08-009": "0.7 kg; 16.67%"}
        recalculate_q01_for_shift(session, shift.id, project_id=project_id, actor_id=consultant_id)
        assert qa.status == "CORRECTION_REQUESTED"
        assert "total caracterizado 3.5 kg" in qa.payload["Q01-003"]

        qa.status = "VALIDATED"
        qa.reviewed_by = workspace["user_ids"]["reviewer"]
        qa.reviewed_at = now_utc()
        shift.payload = {**shift.payload, "D06-009": ""}
        recalculate_q01_for_shift(
            session, shift.id, project_id=project_id, actor_id=consultant_id,
            additional_context_ids={visit.id},
        )
        assert qa.status == "CORRECTION_REQUESTED"
        assert "no tiene jornadas D-06 vinculadas" in qa.payload["Q01-003"]
        session.commit()

    sign_in(client, "consultant@red.test")
    d06_path = f"/projects/{project_id}/records/new?form_code=D-06"
    d06_page = client.get(d06_path)
    assert f'<option value="{visit.id}"' in d06_page.text
    created_shift = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d06_path), "form_code": "D-06", "record_title": "Nueva jornada de visita A",
            "source_note": "Jornada sintética vinculada desde el formulario.", "action": "draft",
            "D06-004__value": "2", "D06-004__unit": "horas",
            "D06-006": "No", "D06-008": workspace["user_ids"]["field"],
            "D06-009": visit.id,
        },
        follow_redirects=False,
    )
    assert created_shift.status_code == 303
    with SessionLocal() as session:
        qa = session.scalar(select(FormRecord).where(
            FormRecord.project_id == project_id, FormRecord.form_code == "Q-01",
            FormRecord.title == "QA de visita sintética",
        ))
        assert "sin pesajes D-07 vinculados" in qa.payload["Q01-003"]


def test_q01_reviewer_is_server_recorded_on_the_review_decision(client, workspace):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="Q-01", title="QA sintético", status="PENDING_REVIEW",
            source_note="Revisión QA sintética para acreditar responsable.", payload={"Q01-011": "Revisor falso"},
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        )
        session.add(record)
        other_project_record = FormRecord(
            project_id=workspace["project_ids"][1], form_code="D-03",
            title="Visita sintética de otro expediente", status="RAW",
            record_date="2026-10-09", source_kind="observado",
            source_note="Registro sintético para comprobar aislamiento entre proyectos.",
            payload={}, created_by=workspace["user_ids"]["admin"],
            updated_by=workspace["user_ids"]["admin"],
        )
        session.add(other_project_record)
        session.commit()
        record_id = record.id
        other_project_record_id = other_project_record.id

    sign_in(client, "reviewer@red.test")
    response = client.post(
        f"/records/{record_id}/review",
        data=rendered_decision_data(client, f"/records/{record_id}/review", {"expected_version": record_version_for_review(record_id), 
            "csrf": csrf_for(client, f"/records/{record_id}"), "decision": "CORRECTION_REQUESTED",
            "reason": "Revisar balance sintético antes de aprobar.",
        }),
        follow_redirects=False,
    )
    assert response.status_code == 303
    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        assert record.payload["Q01-011"] == "Revisor (reviewer@red.test)"
        assert record.version == 2
        revision = session.scalar(select(FormRevision).where(
            FormRevision.record_id == record_id, FormRevision.revision == 2,
        ))
        assert revision.payload["Q01-011"] == "Revisor (reviewer@red.test)"


def test_form_field_evidence_upload_is_private_and_scoped(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "field@red.test")
    form_path = f"/projects/{project_id}/records/new?form_code=D-07"
    form_response = client.get(form_path)
    assert form_response.status_code == 200
    assert 'enctype="multipart/form-data"' in form_response.text
    assert 'name="evidence__D07-010"' in form_response.text

    payload = {
        "csrf": csrf_for(client, form_path),
        "form_code": "D-07",
        "record_title": "Pesaje sintético con foto",
        "record_date": "2026-10-08",
        "source_kind": "medido",
        "source_note": "Pesaje sintético para probar carga privada de foto.",
        "action": "draft",
    }
    photo = b"\xff\xd8\xffsynthetic image bytes"
    response = client.post(
        f"/projects/{project_id}/records/new",
        data=payload,
        files={"evidence__D07-010": ("bascula.jpg", photo, "application/pdf")},
        follow_redirects=False,
    )
    assert response.status_code == 303
    record_id = response.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        evidence = session.scalar(select(EvidenceFile).where(EvidenceFile.record_id == record_id))
        assert record.payload["D07-010"] == ""
        assert evidence.field_id == "D07-010"
        assert evidence.project_id == project_id
        assert evidence.media_type == "image/jpeg"  # Derived from file content/extension, not the browser header.
        saved_path = settings.storage_root / "evidence" / evidence.storage_name
        evidence_id = evidence.id
    assert saved_path.read_bytes() == photo

    detail = client.get(f"/records/{record_id}")
    assert "Fotografía" in detail.text and "bascula.jpg" in detail.text
    downloaded = client.get(f"/evidence/{evidence_id}")
    assert downloaded.content == photo
    assert downloaded.headers["content-type"] == "application/octet-stream"
    assert downloaded.headers["content-disposition"].startswith("attachment;")
    assert downloaded.headers["x-content-type-options"] == "nosniff"
    assert downloaded.headers["cache-control"] == "private, no-store"

    with SessionLocal() as session:
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        snapshot = json.loads(archive.read("database.json"))
        assert snapshot["schema_version"] == 15
        assert next(row for row in snapshot["evidence"] if row["id"] == evidence_id)["field_id"] == "D07-010"


def test_evidence_endpoints_reject_mismatched_binary_content_before_storage(client, workspace):
    from app.models import PMIRSItem

    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje sintético",
            status="RAW", source_note="Fuente sintética suficiente para la prueba.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        item = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="HAL-UPLOAD-01",
            title="Hallazgo sintético", description="Prueba del contenido real de una evidencia.",
            data={}, review_status="RAW", version=1,
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add_all([record, item])
        session.commit()
        record_id, item_id = record.id, item.id

    sign_in(client, "consultant@red.test")
    evidence_dir = settings.storage_root / "evidence"
    existing_files = set(evidence_dir.glob("*")) if evidence_dir.exists() else set()
    fake_jpeg = "<html>contenido que no es una fotografía</html>".encode("utf-8")
    record_upload = client.post(
        f"/records/{record_id}/evidence",
        data={"csrf": csrf_for(client, f"/records/{record_id}")},
        files={"file": ("foto.jpg", fake_jpeg, "image/jpeg")},
        follow_redirects=False,
    )
    assert record_upload.status_code == 422
    assert "no coincide con el formato" in record_upload.json()["detail"]

    pmirs_path = f"/projects/{project_id}/pmirs"
    pmirs_upload = client.post(
        f"/pmirs/items/{item_id}/evidence",
        data={"csrf": csrf_for(client, pmirs_path)},
        files={"file": ("evidencia.png", fake_jpeg, "image/png")},
        follow_redirects=False,
    )
    assert pmirs_upload.status_code == 422
    assert "no coincide con el formato" in pmirs_upload.json()["detail"]
    after_files = set(evidence_dir.glob("*")) if evidence_dir.exists() else set()
    assert after_files == existing_files
    with SessionLocal() as session:
        assert session.scalar(select(EvidenceFile).where(EvidenceFile.project_id == project_id)) is None


def test_standalone_evidence_upload_retries_are_idempotent_and_reject_key_reuse(client, workspace):
    from app.models import PMIRSItem

    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje sintético",
            status="RAW", source_note="Registro sintético para probar cargas repetidas.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        item = PMIRSItem(
            project_id=project_id, item_type="accion", code="ACT-UPLOAD-01",
            title="Acción sintética", description="Prueba de idempotencia de evidencia.",
            data={"execution_status": "pendiente"}, review_status="VALIDATED", version=1,
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add_all([record, item])
        session.commit()
        record_id, item_id = record.id, item.id

    sign_in(client, "consultant@red.test")
    record_path = f"/records/{record_id}"
    record_key = "record-upload-submission-key-000001"
    payload = b"Acta y pesaje sinteticos para la prueba."
    record_endpoint = f"/records/{record_id}/evidence"
    record_data = {"csrf": csrf_for(client, record_path), "submission_key": record_key}
    first = client.post(
        record_endpoint, data=rendered_decision_data(client, record_endpoint, record_data),
        files={"file": ("acta.txt", payload, "text/plain")}, follow_redirects=False,
    )
    replay = client.post(
        record_endpoint, data=rendered_decision_data(client, record_endpoint, record_data),
        files={"file": ("acta.txt", payload, "text/plain")}, follow_redirects=False,
    )
    changed_payload = client.post(
        record_endpoint, data=rendered_decision_data(client, record_endpoint, record_data),
        files={"file": ("acta.txt", payload + b" cambio", "text/plain")}, follow_redirects=False,
    )
    assert first.status_code == replay.status_code == 303
    assert "ya%20estaba%20adjuntada" in replay.headers["location"]
    assert changed_payload.status_code == 409

    studio_path = f"/projects/{project_id}/pmirs"
    pmirs_key = "pmirs-upload-submission-key-000001"
    pmirs_endpoint = f"/pmirs/items/{item_id}/evidence"
    pmirs_data = {"csrf": csrf_for(client, studio_path), "submission_key": pmirs_key}
    pmirs_first = client.post(
        pmirs_endpoint, data=rendered_decision_data(client, pmirs_endpoint, pmirs_data),
        files={"file": ("acta.txt", payload, "text/plain")}, follow_redirects=False,
    )
    pmirs_replay = client.post(
        pmirs_endpoint, data=rendered_decision_data(client, pmirs_endpoint, pmirs_data),
        files={"file": ("acta.txt", payload, "text/plain")}, follow_redirects=False,
    )
    pmirs_wrong_target = client.post(
        f"/pmirs/items/{item_id}/evidence", data=record_data,
        files={"file": ("acta.txt", payload, "text/plain")}, follow_redirects=False,
    )
    assert pmirs_first.status_code == pmirs_replay.status_code == 303
    assert "ya%20estaba%20adjuntada" in pmirs_replay.headers["location"]
    assert pmirs_wrong_target.status_code == 409

    with SessionLocal() as session:
        record_rows = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record_id)))
        pmirs_rows = list(session.scalars(select(EvidenceFile).where(EvidenceFile.pmirs_item_id == item_id)))
        assert len(record_rows) == len(pmirs_rows) == 1
        assert record_rows[0].submission_key == record_key and record_rows[0].sha256 == hashlib.sha256(payload).hexdigest()
        assert pmirs_rows[0].submission_key == pmirs_key and pmirs_rows[0].sha256 == hashlib.sha256(payload).hexdigest()
        assert session.scalar(select(func.count(AuditEvent.id)).where(
            AuditEvent.action == "evidence_uploaded", AuditEvent.entity_id == record_rows[0].id,
        )) == 1
        assert session.scalar(select(func.count(AuditEvent.id)).where(
            AuditEvent.action == "pmirs_evidence_uploaded", AuditEvent.entity_id == pmirs_rows[0].id,
        )) == 1

    record_page = client.get(record_path)
    studio_page = client.get(studio_path)
    record_page_key = re.search(r'<form[^>]*data-evidence-upload-form[^>]*>.*?name="submission_key" value="([^"]+)"', record_page.text, re.S)
    pmirs_page_key = re.search(r'<form[^>]*data-evidence-upload-form[^>]*>.*?name="submission_key" value="([^"]+)"', studio_page.text, re.S)
    assert record_page_key and re.fullmatch(r"[A-Za-z0-9_-]{32,64}", record_page_key.group(1))
    assert pmirs_page_key and re.fullmatch(r"[A-Za-z0-9_-]{32,64}", pmirs_page_key.group(1))
    assert "/static/evidence-upload.js?v=20261012-idempotent-evidence1" in record_page.text
    assert "/static/evidence-upload.js?v=20261012-idempotent-evidence1" in studio_page.text


def test_concurrent_duplicate_standalone_evidence_uploads_store_one_file_per_key(workspace):
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier

    from fastapi.testclient import TestClient

    from app.main import app
    from app.models import PMIRSItem

    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-07", title="Registro concurrente sintético",
            status="RAW", source_note="Fuente sintética de concurrencia.",
            created_by=consultant_id, updated_by=consultant_id,
        )
        item = PMIRSItem(
            project_id=project_id, item_type="accion", code="ACT-CONCURRENT-UPLOAD",
            title="Acción concurrente sintética", description="Carga para una prueba concurrente.",
            data={"execution_status": "pendiente"}, review_status="VALIDATED", version=1,
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add_all([record, item])
        session.commit()
        record_id, item_id = record.id, item.id

    project_path = f"/projects/{project_id}/pmirs"
    submissions = [
        (f"/records/{record_id}/evidence", f"/records/{record_id}", record_id, "record"),
        (f"/pmirs/items/{item_id}/evidence", project_path, item_id, "pmirs"),
    ]
    payload = b"Una evidencia sintetica enviada en paralelo."
    storage_keys = []
    for endpoint, source_path, target_id, kind in submissions:
        key = secrets.token_urlsafe(32)
        start_together = Barrier(2)

        def submit(_index):
            with TestClient(app) as concurrent_client:
                sign_in(concurrent_client, "consultant@red.test")
                page = concurrent_client.get(source_path)
                assert page.status_code == 200
                csrf = re.search(r'name="csrf" value="([^"]+)"', page.text).group(1)
                start_together.wait(timeout=10)
                return concurrent_client.post(
                    endpoint,
                    data=rendered_decision_data(concurrent_client, endpoint, {"csrf": csrf, "submission_key": key}),
                    files={"file": ("soporte-concurrente.txt", payload, "text/plain")},
                    follow_redirects=False,
                )

        try:
            with ThreadPoolExecutor(max_workers=2) as pool:
                responses = list(pool.map(submit, range(2)))
            assert all(response.status_code == 303 for response in responses)
            with SessionLocal() as session:
                query = select(EvidenceFile).where(EvidenceFile.submission_key == key)
                stored = list(session.scalars(query))
                assert len(stored) == 1
                if kind == "record":
                    assert stored[0].record_id == target_id and stored[0].pmirs_item_id is None
                    action_name = "evidence_uploaded"
                else:
                    assert stored[0].pmirs_item_id == target_id and stored[0].record_id is None
                    action_name = "pmirs_evidence_uploaded"
                assert session.scalar(select(func.count(AuditEvent.id)).where(
                    AuditEvent.action == action_name, AuditEvent.entity_id == stored[0].id,
                )) == 1
                storage_keys.append(f"evidence/{stored[0].storage_name}")
        finally:
            for storage_key in storage_keys:
                app_main.storage.delete(storage_key)
            storage_keys.clear()


def test_remote_evidence_download_redirect_is_private_and_does_not_leak_referer(client, workspace, monkeypatch):
    project_id = workspace["project_ids"][0]
    evidence = EvidenceFile(
        project_id=project_id, field_id="D07-010", original_name="balanza sintética.jpg",
        storage_name="synthetic-evidence.jpg", media_type="image/jpeg", size_bytes=64,
        sha256="a" * 64, created_by=workspace["user_ids"]["consultant"],
    )
    with SessionLocal() as session:
        session.add(evidence)
        session.commit()
        evidence_id = evidence.id

    requested = {}
    monkeypatch.setattr(app_main.storage, "backend", "s3")
    monkeypatch.setattr(app_main.storage, "exists", lambda _key: True)
    monkeypatch.setattr(
        app_main.storage, "presigned_download_url",
        lambda key, filename: requested.update(key=key, filename=filename) or "https://private-storage.test/signed",
    )
    sign_in(client, "consultant@red.test")

    response = client.get(f"/evidence/{evidence_id}", follow_redirects=False)

    assert response.status_code == 302
    assert response.headers["location"] == "https://private-storage.test/signed"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["cache-control"] == "private, no-store"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert requested == {"key": "evidence/synthetic-evidence.jpg", "filename": "balanza sintética.jpg"}


def test_reviewed_record_evidence_requires_a_new_version_and_new_qa_decision(client, workspace):
    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    reviewer_id = workspace["user_ids"]["reviewer"]
    field_id = workspace["user_ids"]["field"]
    d01 = next(form for form in FORM_CATALOG["forms"] if form["code"] == "D-01")
    original_payload = {
        field["id"]: "Dato sintético previo"
        for field in d01["fields"]
    }
    original_payload.update({
        "D01-002": "Unidad sintética", "D01-003": "Dirección ficticia 123",
        "D01-004": "Bello", "D01-007": "Administración sintética",
        "D01-008": "admin@example.test", "D01-011": "100", "D01-013": "90",
        "D01-016": "En preparación", "D01-017": field_id,
        "D01-018": consultant_id, "D01-019": "Declarado",
    })
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.baseline_status = "validada"
        project.baseline_reference = "LB sintética validada"
        project.baseline_note = "Fuentes de prueba revisadas."
        project.baseline_reviewed_by = reviewer_id
        project.baseline_reviewed_at = now_utc()
        record = FormRecord(
            project_id=project_id, form_code="D-01", title="Identidad validada sintética",
            status="VALIDATED", record_date="2026-10-09", source_kind="documental",
            source_note="Fuente sintética aceptada para esta prueba.", payload=original_payload,
            created_by=consultant_id, updated_by=consultant_id, reviewed_by=reviewer_id,
            reviewed_at=now_utc(),
        )
        session.add(record)
        session.flush()
        item = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="HAL-EVIDENCE-01",
            title="Hallazgo aprobado sintético", description="Depende de la Línea Base de prueba.",
            data={}, review_status="VALIDATED", version=1, created_by=consultant_id,
            updated_by=reviewer_id, reviewed_by=reviewer_id,
        )
        version = PMIRSVersion(
            project_id=project_id, version_label="v0.1", status="aprobada_interna",
            change_summary="Versión sintética validada.", change_reason="Prueba de integridad.",
            snapshot={}, baseline_reference=project.baseline_reference, created_by=consultant_id,
        )
        session.add_all([item, version])
        session.flush()
        record_id, item_id, version_id = record.id, item.id, version.id
        session.commit()

    sign_in(client, "consultant@red.test")
    detail = client.get(f"/records/{record_id}")
    assert "La evidencia de un registro en revisión, validado o devuelto no se modifica por separado." in detail.text
    assert f'href="/records/{record_id}/edit">Editar versión y adjuntar evidencia</a>' in detail.text
    assert f'action="/records/{record_id}/evidence"' not in detail.text
    blocked = client.post(
        f"/records/{record_id}/evidence",
        data={"csrf": csrf_for(client, f"/records/{record_id}")},
        files={"file": ("soporte-nuevo.pdf", b"%PDF-1.7\nnew synthetic support", "application/pdf")},
        follow_redirects=False,
    )
    assert blocked.status_code == 409
    assert "edita una nueva versión y envíala a QA/QC" in blocked.json()["detail"]
    with SessionLocal() as session:
        assert session.scalar(select(EvidenceFile).where(EvidenceFile.record_id == record_id)) is None
        assert session.get(FormRecord, record_id).status == "VALIDATED"
        assert session.get(Project, project_id).baseline_status == "validada"
        source_record = session.get(FormRecord, record_id)
        source_record.status = "PENDING_REVIEW"
        session.commit()
    pending_attempt = client.post(
        f"/records/{record_id}/evidence",
        data={"csrf": csrf_for(client, f"/records/{record_id}")},
        files={"file": ("soporte-en-revision.pdf", b"%PDF-1.7\npending synthetic support", "application/pdf")},
        follow_redirects=False,
    )
    assert pending_attempt.status_code == 409
    with SessionLocal() as session:
        source_record = session.get(FormRecord, record_id)
        source_record.status = "CORRECTION_REQUESTED"
        session.commit()
    correction_attempt = client.post(
        f"/records/{record_id}/evidence",
        data={"csrf": csrf_for(client, f"/records/{record_id}")},
        files={"file": ("soporte-correccion.pdf", b"%PDF-1.7\ncorrection synthetic support", "application/pdf")},
        follow_redirects=False,
    )
    assert correction_attempt.status_code == 409
    with SessionLocal() as session:
        source_record = session.get(FormRecord, record_id)
        source_record.status = "VALIDATED"
        assert session.scalar(select(EvidenceFile).where(EvidenceFile.record_id == record_id)) is None
        session.commit()

    edit_path = f"/records/{record_id}/edit"
    edit_page = client.get(edit_path)
    assert edit_page.status_code == 200
    assert 'name="evidence__general"' in edit_page.text
    submission_key = re.search(r'name="submission_key" value="([^"]+)"', edit_page.text)
    assert submission_key
    update_data = {
        "csrf": csrf_for(client, edit_path), "submission_key": submission_key.group(1),
        "action": "submit", "record_title": "Identidad actualizada sintética",
        "record_date": "2026-10-09", "source_kind": "documental",
        "source_note": "Nueva fuente sintética adjunta para revisión.",
        **original_payload,
    }
    update_data["D01-008"] = "admin@example.test"
    update_data["D01-009"] = "+573000000000"
    update_data["D01-010"] = "4"
    update_data["D01-011"] = "100"
    update_data["D01-012"] = "90"
    update_data["D01-013"] = "90"
    update_data["D01-014"] = "0"
    update_data["D01-016"] = "en ejecución"
    update_data["D01-017"] = field_id
    update_data["D01-018"] = consultant_id
    updated = client.post(
        edit_path, data=update_data,
        files={"evidence__general": ("soporte-nuevo.pdf", b"%PDF-1.7\nnew synthetic support", "application/pdf")},
        follow_redirects=False,
    )
    assert updated.status_code == 303, " ".join(re.findall(r"<li>(.*?)</li>", updated.text, re.S))
    retried = client.post(
        edit_path, data=update_data,
        files={"evidence__general": ("soporte-nuevo.pdf", b"%PDF-1.7\nnew synthetic support", "application/pdf")},
        follow_redirects=False,
    )
    assert retried.status_code == 303
    with SessionLocal() as session:
        changed = session.get(FormRecord, record_id)
        assert changed.version == 2 and changed.status == "PENDING_REVIEW"
        assert session.get(Project, project_id).baseline_status == "no_iniciada"
        new_evidence = session.scalar(select(EvidenceFile).where(EvidenceFile.record_id == record_id))
        assert new_evidence is not None and new_evidence.field_id is None
        assert len(list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record_id)))) == 1
        assert (settings.storage_root / "evidence" / new_evidence.storage_name).read_bytes() == b"%PDF-1.7\nnew synthetic support"
        assert session.get(PMIRSItem, item_id).review_status == "CORRECTION_REQUESTED"
        assert session.get(PMIRSVersion, version_id).status == "obsoleta"

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    reviewed = client.post(
        f"/records/{record_id}/review",
        data=rendered_decision_data(client, f"/records/{record_id}/review", {"expected_version": record_version_for_review(record_id), "csrf": csrf_for(client, f"/records/{record_id}"), "decision": "VALIDATED", "reason": "Nueva fuente sintética revisada."}),
        follow_redirects=False,
    )
    assert reviewed.status_code == 303
    with SessionLocal() as session:
        assert session.get(FormRecord, record_id).status == "VALIDATED"
        assert session.get(Project, project_id).baseline_status == "no_iniciada"
        assert session.get(PMIRSItem, item_id).review_status == "CORRECTION_REQUESTED"


def test_record_detail_shows_related_form_labels_and_small_file_size(client, workspace):
    project_id = workspace["project_ids"][0]
    field_id = workspace["user_ids"]["field"]
    with SessionLocal() as session:
        visit = FormRecord(
            project_id=project_id, form_code="D-06", title="Jornada norte sintética", status="RAW",
            source_note="Fuente sintética de la visita.", payload={}, created_by=field_id, updated_by=field_id,
        )
        equipment = FormRecord(
            project_id=project_id, form_code="D-13", title="Báscula azul sintética", status="RAW",
            source_note="Inventario sintético.", payload={}, created_by=field_id, updated_by=field_id,
        )
        session.add_all([visit, equipment])
        session.flush()
        record = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje vinculado sintético", status="RAW",
            source_note="Pesaje sintético para verificar las etiquetas de relación.",
            payload={"D07-001": visit.id, "D07-003": equipment.id, "D07-005": "1", "D07-006": "1.5"},
            created_by=field_id, updated_by=field_id,
        )
        session.add(record)
        session.flush()
        evidence = EvidenceFile(
            project_id=project_id, record_id=record.id, field_id="D07-010", original_name="foto-mini.png",
            storage_name="synthetic-mini.png", media_type="image/png", size_bytes=70,
            sha256="a" * 64, created_by=field_id,
        )
        session.add(evidence)
        record_id, visit_id, equipment_id = record.id, visit.id, equipment.id
        session.commit()

    sign_in(client, "field@red.test")
    response = client.get(f"/records/{record_id}")
    assert response.status_code == 200
    assert "D-06 · Jornada norte sintética" in response.text
    assert "D-13 · Báscula azul sintética" in response.text
    assert "70 B · SHA-256" in response.text
    assert visit_id not in response.text
    assert equipment_id not in response.text


def test_invalid_form_submission_does_not_persist_selected_evidence(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "field@red.test")
    form_path = f"/projects/{project_id}/records/new?form_code=D-07"
    evidence_dir = settings.storage_root / "evidence"
    existing_files = set(evidence_dir.glob("*")) if evidence_dir.exists() else set()
    photo = b"\xff\xd8\xffsynthetic invalid-submission photo"
    response = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, form_path),
            "form_code": "D-07",
            "record_title": "Envío inválido con foto sintética",
            "record_date": "2026-10-08",
            "source_kind": "medido",
            "source_note": "",
            "action": "submit",
        },
        files={"evidence__D07-010": ("foto-sintetica.jpg", photo, "image/jpeg")},
        follow_redirects=False,
    )

    assert response.status_code == 422
    assert "Los archivos no se guardaron; selecciónalos de nuevo." in response.text
    with SessionLocal() as session:
        assert session.scalar(select(FormRecord).where(FormRecord.project_id == project_id)) is None
        assert session.scalar(select(EvidenceFile).where(EvidenceFile.project_id == project_id)) is None
    files_after = set(evidence_dir.glob("*")) if evidence_dir.exists() else set()
    assert files_after == existing_files


def test_confirmed_bello_pgirs_transition_requires_reference_and_attachment(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    form_path = f"/projects/{project_id}/records/new?form_code=D-02"
    form_spec = next(form for form in FORM_CATALOG["forms"] if form["code"] == "D-02")
    status = next(field for field in form_spec["fields"] if field["id"] == "D02-020")["options"][3]
    required_values = {}
    for field in form_spec["fields"]:
        if not field.get("required") or field.get("server_managed") or field["id"] == "D02-020":
            continue
        control = str(field.get("control", "")).casefold()
        if field.get("file_upload"):
            continue
        if field.get("options"):
            required_values[field["id"]] = field["options"][0]
        elif any(token in control for token in ("número", "numero", "decimal", "peso", "cantidad")):
            required_values[field["id"]] = "1"
        else:
            required_values[field["id"]] = "Dato sintético para probar el flujo."
    form_data = {
        "csrf": csrf_for(client, form_path),
        "form_code": "D-02",
        "record_title": "Consulta PGIRS sintética",
        "record_date": "2026-10-09",
        "source_kind": "documento fuente",
        "source_note": "Respuesta municipal sintética para probar los soportes.",
        "D02-008": "No separa orgánicos según declaración sintética",
        "D02-020": status,
        "D02-021__field_id": ["D02-001", "D02-002", "D02-004", "D02-010", "D02-012"],
        "D02-021__status": ["Pendiente de solicitar"] * 5,
        "D02-021__detail": ["Solicitar a administración para esta prueba."] * 5,
        "action": "submit",
        **required_values,
    }

    missing_support = client.post(
        f"/projects/{project_id}/records/new", data=form_data, follow_redirects=False,
    )
    assert missing_support.status_code == 422
    assert "D-02-016" in missing_support.text and "D-02-013" in missing_support.text
    with SessionLocal() as session:
        assert session.scalar(select(FormRecord).where(FormRecord.project_id == project_id)) is None

    supported = client.post(
        f"/projects/{project_id}/records/new",
        data={**form_data, "D02-016": "Decreto municipal sintético, versión y periodo"},
        files={"evidence__D02-013": ("acto-sintetico.pdf", b"%PDF-1.4\nsynthetic municipal support", "application/pdf")},
        follow_redirects=False,
    )
    assert supported.status_code == 303
    with SessionLocal() as session:
        record = session.scalar(select(FormRecord).where(
            FormRecord.project_id == project_id, FormRecord.form_code == "D-02",
        ))
        assert record is not None and record.payload["D02-020"] == status
        evidence = session.scalar(select(EvidenceFile).where(EvidenceFile.record_id == record.id))
        assert evidence is not None and evidence.field_id == "D02-013"


def test_field_operator_can_remove_own_unreviewed_evidence_with_audit(client, workspace):
    project_id = workspace["project_ids"][0]
    user_id = workspace["user_ids"]["field"]
    storage_name = "synthetic-removal.jpg"
    file_path = settings.storage_root / "evidence" / storage_name
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(b"synthetic evidence to remove")
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje sin revisar", status="RAW",
            created_by=user_id, updated_by=user_id,
        )
        session.add(record)
        session.flush()
        evidence = EvidenceFile(
            project_id=project_id, record_id=record.id, field_id="D07-010",
            original_name="foto-prueba.jpg", storage_name=storage_name,
            media_type="image/jpeg", size_bytes=file_path.stat().st_size,
            sha256=hashlib.sha256(file_path.read_bytes()).hexdigest(), created_by=user_id,
        )
        session.add(evidence)
        session.commit()
        record_id, evidence_id = record.id, evidence.id

    sign_in(client, "field@red.test")
    detail = client.get(f"/records/{record_id}")
    assert "Retirar" in detail.text
    response = client.post(
        f"/evidence/{evidence_id}/delete",
        data={"csrf": csrf_for(client, f"/records/{record_id}")},
        follow_redirects=False,
    )
    assert response.status_code == 303
    assert response.headers["location"].startswith(f"/records/{record_id}")
    assert not file_path.exists()
    assert client.get(f"/evidence/{evidence_id}").status_code == 404
    with SessionLocal() as session:
        assert session.get(EvidenceFile, evidence_id) is None
        event = session.scalar(select(AuditEvent).where(
            AuditEvent.action == "evidence_removed", AuditEvent.entity_id == evidence_id,
        ))
        assert event is not None
        assert event.detail["field_id"] == "D07-010"
        assert event.detail["sha256"] == hashlib.sha256(b"synthetic evidence to remove").hexdigest()


def test_validated_record_evidence_cannot_be_removed_by_field_role(client, workspace):
    project_id = workspace["project_ids"][0]
    user_id = workspace["user_ids"]["field"]
    storage_name = "synthetic-validated.jpg"
    file_path = settings.storage_root / "evidence" / storage_name
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(b"validated synthetic evidence")
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje validado", status="VALIDATED",
            created_by=user_id, updated_by=user_id,
        )
        session.add(record)
        session.flush()
        evidence = EvidenceFile(
            project_id=project_id, record_id=record.id, field_id="D07-010",
            original_name="foto-validada.jpg", storage_name=storage_name,
            media_type="image/jpeg", size_bytes=file_path.stat().st_size,
            sha256=hashlib.sha256(file_path.read_bytes()).hexdigest(), created_by=user_id,
        )
        session.add(evidence)
        session.commit()
        record_id, evidence_id = record.id, evidence.id

    sign_in(client, "field@red.test")
    response = client.post(
        f"/evidence/{evidence_id}/delete",
        data={"csrf": csrf_for(client, f"/records/{record_id}")},
        follow_redirects=False,
    )
    assert response.status_code == 409
    assert file_path.is_file()
    with SessionLocal() as session:
        assert session.get(EvidenceFile, evidence_id) is not None


def test_admin_can_revoke_membership_and_invalidate_account_sessions(client, workspace):
    from fastapi.testclient import TestClient

    from app.main import app

    project_id = workspace["project_ids"][0]
    field_id = workspace["user_ids"]["field"]
    with TestClient(app) as field_client, TestClient(app) as admin_client:
        sign_in(field_client, "field@red.test")
        sign_in(admin_client, "admin@red.test")
        with SessionLocal() as session:
            membership = session.scalar(select(ProjectMembership).where(
                ProjectMembership.user_id == field_id,
                ProjectMembership.project_id == project_id,
            ))
            membership_id = membership.id

        csrf = csrf_for(admin_client, "/admin/users")
        revoked = admin_client.post(
            f"/admin/memberships/{membership_id}",
            data={"csrf": csrf, "action": "deactivate"},
            follow_redirects=False,
        )
        assert revoked.status_code == 303
        assert field_client.get(f"/projects/{project_id}").status_code == 404

        csrf = csrf_for(admin_client, "/admin/users")
        changed_role = admin_client.post(
            f"/admin/memberships/{membership_id}",
            data={"csrf": csrf, "action": "change_role", "role": "revisor"},
            follow_redirects=False,
        )
        assert changed_role.status_code == 303
        assert field_client.get(f"/projects/{project_id}").status_code == 404
        with SessionLocal() as session:
            membership = session.get(ProjectMembership, membership_id)
            assert membership.role == "revisor" and membership.active is False
            event = session.scalar(select(AuditEvent).where(
                AuditEvent.action == "membership_updated",
                AuditEvent.entity_id == membership_id,
            ).order_by(AuditEvent.created_at.desc()))
            assert event is not None
            assert event.detail["previous_role"] == "campo"
            assert event.detail["role"] == "revisor"
            assert event.detail["previous_active"] is False
            assert event.detail["active"] is False
        activity = admin_client.get(f"/projects/{project_id}/activity")
        assert "Rol del proyecto: Equipo de campo → Revisor QA/QC" in activity.text

        csrf = csrf_for(admin_client, "/admin/users")
        reactivated = admin_client.post(
            f"/admin/memberships/{membership_id}",
            data={"csrf": csrf, "action": "activate"},
            follow_redirects=False,
        )
        assert reactivated.status_code == 303
        assert field_client.get(f"/projects/{project_id}").status_code == 200

        csrf = csrf_for(admin_client, "/admin/users")
        deactivated_account = admin_client.post(
            f"/admin/users/{field_id}/status",
            data={"csrf": csrf, "action": "deactivate"},
            follow_redirects=False,
        )
        assert deactivated_account.status_code == 303
        assert field_client.get("/", follow_redirects=False).status_code == 303

        csrf = csrf_for(admin_client, "/admin/users")
        inactive_account_membership = admin_client.post(
            f"/admin/memberships/{membership_id}",
            data={"csrf": csrf, "action": "activate"},
            follow_redirects=False,
        )
        assert inactive_account_membership.status_code == 409
        with SessionLocal() as session:
            membership = session.get(ProjectMembership, membership_id)
            assert membership.active is False

        csrf = csrf_for(admin_client, "/admin/users")
        admin_client.post(
            f"/admin/users/{field_id}/status",
            data={"csrf": csrf, "action": "activate"},
            follow_redirects=False,
        )
        assert field_client.get("/", follow_redirects=False).status_code == 303
        sign_in(field_client, "field@red.test")
        assert field_client.get(f"/projects/{project_id}").status_code == 404
        with SessionLocal() as session:
            membership = session.scalar(select(ProjectMembership).where(
                ProjectMembership.user_id == field_id,
                ProjectMembership.project_id == project_id,
            ))
            membership_id = membership.id
        restored_access = admin_client.post(
            f"/admin/memberships/{membership_id}",
            data={"csrf": csrf_for(admin_client, "/admin/users"), "action": "activate"},
            follow_redirects=False,
        )
        assert restored_access.status_code == 303
        assert field_client.get(f"/projects/{project_id}").status_code == 200


def test_global_admin_invitation_requires_explicit_confirmation_and_grants_global_scope(
    client, workspace,
):
    from fastapi.testclient import TestClient

    from app.main import app

    sign_in(client, "admin@red.test")
    base_data = {
        "csrf": csrf_for(client, "/admin/users"),
        "email": "new.platform-admin@red.test",
        "full_name": "Administración RED nueva",
        "platform_admin_invite": "on",
    }
    rejected = client.post("/admin/invitations", data=base_data)
    assert rejected.status_code == 422
    assert "Confirma que la persona necesita acceso global" in rejected.text
    with SessionLocal() as session:
        assert session.scalar(select(Invitation.id).where(
            Invitation.email == "new.platform-admin@red.test",
        )) is None

    confirmed = client.post("/admin/invitations", data={
        **base_data,
        "csrf": csrf_for(client, "/admin/users"),
        "platform_admin_confirmation": "confirmed",
    })
    assert confirmed.status_code == 200
    assert "acceso global" in confirmed.text.lower()
    match = re.search(r'id="invite-link" readonly value="([^"]+)"', confirmed.text)
    assert match
    invitation_url = match.group(1)
    token = invitation_url.rsplit("/", 1)[-1]

    with SessionLocal() as session:
        invitation = session.scalar(select(Invitation).where(
            Invitation.email == "new.platform-admin@red.test",
        ))
        assert invitation is not None
        assert invitation.platform_admin is True
        assert invitation.project_id is None
        assert invitation.role == "admin"

    with TestClient(app) as invitee:
        invite_form = invitee.get(invitation_url)
        assert "Administración RED · acceso global a los cuatro expedientes" in invite_form.text
        assert "antes de activar" in invite_form.text
        csrf = re.search(r'name="csrf" value="([^"]+)"', invite_form.text).group(1)
        accepted = invitee.post(
            f"/invitations/accept/{token}",
            data={"csrf": csrf, "password": PASSWORD, "password_confirm": PASSWORD},
            follow_redirects=False,
        )
        assert accepted.status_code == 303
        assert invitee.get("/admin/users").status_code == 200
        for project_id in workspace["project_ids"]:
            assert invitee.get(f"/projects/{project_id}").status_code == 200

    with SessionLocal() as session:
        new_admin = session.scalar(select(User).where(User.email == "new.platform-admin@red.test"))
        assert new_admin is not None and new_admin.is_platform_admin is True
        assert session.scalar(select(ProjectMembership.id).where(
            ProjectMembership.user_id == new_admin.id,
        )) is None


def test_project_and_platform_admin_invites_are_visually_separated(client, workspace):
    sign_in(client, "admin@red.test")
    page = client.get("/admin/users")
    invite_forms = re.findall(
        r'<form method="post" action="/admin/invitations"[^>]*>(.*?)</form>',
        page.text,
        flags=re.DOTALL,
    )
    assert len(invite_forms) == 2
    assert "name=\"project_id\"" in invite_forms[0]
    assert "name=\"project_id\" required" in invite_forms[0]
    assert "name=\"platform_admin_invite\"" not in invite_forms[0]
    assert "acceso global" in invite_forms[1].lower()
    assert 'name="platform_admin_invite" value="on"' in invite_forms[1]
    assert 'name="platform_admin_confirmation" value="confirmed" required' in invite_forms[1]


def test_invitation_is_project_scoped_and_single_use(client, workspace):
    project_id = workspace["project_ids"][1]
    sign_in(client, "admin@red.test")
    csrf = csrf_for(client, "/admin/users")
    created = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf,
            "email": "new.field@red.test",
            "full_name": "Nuevo operario",
            "project_id": project_id,
            "role": "campo",
        },
    )
    assert created.status_code == 200
    match = re.search(r'id="invite-link" readonly value="([^"]+)"', created.text)
    assert match, "No se mostró el enlace para entregar por canal autorizado"
    assert 'data-copy-link-target="invite-link"' in created.text
    assert 'data-copy-status-target="invite-link-copy-status"' in created.text
    assert 'aria-live="polite"' in created.text
    assert '/static/copy-link.js?v=20261009-1' in created.text
    assert client.get("/static/copy-link.js").status_code == 200
    invitation_url = match.group(1)
    token = invitation_url.rsplit("/", 1)[-1]

    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as invitee:
        invitation = invitee.get(invitation_url)
        assert invitation.status_code == 200
        assert invitation.headers["referrer-policy"] == "no-referrer"
        assert invitation.headers["cache-control"] == "private, no-store"
        csrf = re.search(r'name="csrf" value="([^"]+)"', invitation.text).group(1)
        accepted = invitee.post(
            f"/invitations/accept/{token}",
            data={"csrf": csrf, "password": PASSWORD, "password_confirm": PASSWORD},
            follow_redirects=False,
        )
        assert accepted.status_code == 303
        assert invitee.get(f"/projects/{project_id}").status_code == 200
        assert invitee.get(
            f"/projects/{project_id}/records/new?form_code=D-06"
        ).status_code == 200
        assert invitee.get(
            f"/projects/{project_id}/records/new?form_code=D-01"
        ).status_code == 403
        assert invitee.get(f"/projects/{workspace['project_ids'][0]}").status_code == 404
        assert invitee.get(invitation_url).status_code == 410

    with SessionLocal() as session:
        accepted_invitation = session.scalar(select(Invitation).where(Invitation.email == "new.field@red.test"))
        assert accepted_invitation is not None and accepted_invitation.accepted_at is not None
        accepted_invitation_id = accepted_invitation.id

    revoked = client.post(
        f"/admin/invitations/{accepted_invitation_id}/revoke",
        data={"csrf": csrf_for(client, "/admin/users")},
    )
    assert revoked.status_code == 409
    with SessionLocal() as session:
        membership = session.scalar(select(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == session.scalar(
                select(User.id).where(User.email == "new.field@red.test")
            ),
        ))
        assert membership is not None and membership.active is True

    with TestClient(app) as admin:
        sign_in(admin, "admin@red.test")
        with SessionLocal() as session:
            invitee_user = session.scalar(select(User).where(User.email == "new.field@red.test"))
            membership = session.scalar(select(ProjectMembership).where(
                ProjectMembership.project_id == project_id,
                ProjectMembership.user_id == invitee_user.id,
            ))
            membership_id = membership.id
        disabled = admin.post(
            f"/admin/memberships/{membership_id}",
            data={"csrf": csrf_for(admin, "/admin/users"), "action": "deactivate"},
            follow_redirects=False,
        )
        assert disabled.status_code == 303
        with TestClient(app) as revoked_user:
            sign_in(revoked_user, "new.field@red.test")
            assert revoked_user.get(f"/projects/{project_id}").status_code == 404
            assert revoked_user.get(
                f"/projects/{project_id}/records/new?form_code=D-06"
            ).status_code == 404
    assert revoked.status_code == 409


def test_new_account_invitation_validates_password_before_consuming_access(client, workspace):
    project_id = workspace["project_ids"][2]
    invited_email = "new.password-check@red.test"
    sign_in(client, "admin@red.test")
    created = client.post("/admin/invitations", data={
        "csrf": csrf_for(client, "/admin/users"),
        "email": invited_email,
        "full_name": "Alta sintética",
        "project_id": project_id,
        "role": "campo",
    })
    assert created.status_code == 200
    invitation_url = re.search(r'id="invite-link" readonly value="([^"]+)"', created.text).group(1)
    token = invitation_url.rsplit("/", 1)[-1]

    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as invitee:
        page = invitee.get(invitation_url)
        csrf = re.search(r'name="csrf" value="([^"]+)"', page.text).group(1)
        too_short = invitee.post(f"/invitations/accept/{token}", data={
            "csrf": csrf, "password": "short-pass", "password_confirm": "short-pass",
        }, follow_redirects=False)
        assert too_short.status_code == 422
        assert "12 y 1.024 caracteres" in too_short.text

        mismatch = invitee.post(f"/invitations/accept/{token}", data={
            "csrf": csrf, "password": "Synthetic-Invite-2026", "password_confirm": "Different-Invite-2026",
        }, follow_redirects=False)
        assert mismatch.status_code == 422
        assert "no coinciden" in mismatch.text
        too_long = invitee.post(f"/invitations/accept/{token}", data={
            "csrf": csrf, "password": "x" * (MAX_PASSWORD_CHARACTERS + 1),
            "password_confirm": "x" * (MAX_PASSWORD_CHARACTERS + 1),
        }, follow_redirects=False)
        assert too_long.status_code == 422
        assert "1.024 caracteres" in too_long.text
        assert invitee.get(invitation_url).status_code == 200

        with SessionLocal() as session:
            assert session.scalar(select(User.id).where(User.email == invited_email)) is None
            pending = session.scalar(select(Invitation).where(Invitation.email == invited_email))
            assert pending is not None and pending.accepted_at is None

        accepted = invitee.post(f"/invitations/accept/{token}", data={
            "csrf": csrf, "password": "Synthetic-Invite-2026", "password_confirm": "Synthetic-Invite-2026",
        }, follow_redirects=False)
        assert accepted.status_code == 303
        assert invitee.get(f"/projects/{project_id}").status_code == 200
        assert invitee.get(invitation_url).status_code == 410

    with SessionLocal() as session:
        invited_user = session.scalar(select(User).where(User.email == invited_email))
        membership = session.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == invited_user.id,
            ProjectMembership.project_id == project_id,
        ))
        invitation = session.scalar(select(Invitation).where(Invitation.email == invited_email))
        assert invited_user is not None and invited_user.active
        assert membership is not None and membership.active and membership.role == "campo"
        assert invitation is not None and invitation.accepted_at is not None


@pytest.mark.parametrize(
    ("project_index", "role"),
    [(project_index, role) for role in ("consultor", "campo", "administracion_ph", "revisor", "lector") for project_index in range(4)],
    ids=[f"{role}-project-{project_index + 1}" for role in ("consultor", "campo", "administracion_ph", "revisor", "lector") for project_index in range(4)],
)
def test_project_invitation_acceptance_preserves_role_scope_for_all_bello_units(client, workspace, project_index, role):
    from fastapi.testclient import TestClient
    from app.main import app

    project_ids = workspace["project_ids"]
    project_id = project_ids[project_index]
    invited_email = f"invite-scope-{role}-{project_index}@red.test"
    sign_in(client, "admin@red.test")
    created = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"),
            "email": invited_email,
            "full_name": f"Invitado sintético {role}",
            "project_id": project_id,
            "role": role,
        },
    )
    assert created.status_code == 200
    invitation_url = re.search(r'id="invite-link" readonly value="([^"]+)"', created.text).group(1)
    token = invitation_url.rsplit("/", 1)[-1]

    with TestClient(app) as invitee:
        invitation_page = invitee.get(invitation_url)
        assert invitation_page.status_code == 200
        with SessionLocal() as session:
            expected_project_name = session.get(Project, project_id).name
        role_labels = {
            "consultor": "Consultor RED", "campo": "Equipo de campo",
            "administracion_ph": "Administración PH", "revisor": "Revisor QA/QC", "lector": "Consulta",
        }
        role_capabilities = {
            "consultor": "Prepara y edita registros",
            "campo": "visitas autorizadas, evidencia y avances de acciones asignadas; no valida ni cierra",
            "administracion_ph": "Aporta información del conjunto",
            "revisor": "toma decisiones de QA/QC y Línea Base",
            "lector": "no puede editar",
        }
        assert 'id="invitation-scope"' in invitation_page.text
        assert expected_project_name in invitation_page.text
        assert f"Perfil: {role_labels[role]}" in invitation_page.text
        assert role_capabilities[role] in invitation_page.text
        invitation_csrf = re.search(r'name="csrf" value="([^"]+)"', invitation_page.text).group(1)
        accepted = invitee.post(
            f"/invitations/accept/{token}",
            data={"csrf": invitation_csrf, "password": PASSWORD, "password_confirm": PASSWORD},
            follow_redirects=False,
        )
        assert accepted.status_code == 303
        assert invitee.get(f"/projects/{project_id}").status_code == 200
        assert invitee.get(f"/projects/{project_id}/pmirs").status_code == 200
        assert invitee.get("/admin/users").status_code == 403
        if role == "consultor":
            assert invitee.get(f"/projects/{project_id}/records/new?form_code=D-01").status_code == 200
        elif role == "campo":
            assert invitee.get(f"/projects/{project_id}/records/new?form_code=D-06").status_code == 200
        elif role == "administracion_ph":
            assert invitee.get(f"/projects/{project_id}/records/new?form_code=D-02").status_code == 200
        else:
            assert invitee.get(f"/projects/{project_id}/records/new?form_code=D-06").status_code == 403
        for other_project_id in project_ids:
            if other_project_id != project_id:
                assert invitee.get(f"/projects/{other_project_id}").status_code == 404
        assert invitee.get(invitation_url).status_code == 410

    with SessionLocal() as session:
        invited_user = session.scalar(select(User).where(User.email == invited_email))
        membership = session.scalar(select(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == invited_user.id,
        ))
        assert invited_user is not None and invited_user.is_platform_admin is False
        assert membership is not None and membership.active is True and membership.role == role
        assert session.scalar(select(ProjectMembership.id).where(
            ProjectMembership.user_id == invited_user.id,
            ProjectMembership.project_id != project_id,
        )) is None


def test_invitation_for_existing_account_is_throttled_without_consuming_token_and_recovers(client, workspace, monkeypatch):
    project_id = workspace["project_ids"][1]
    sign_in(client, "admin@red.test")
    created = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"),
            "email": "field@red.test",
            "full_name": "Operario existente",
            "project_id": project_id,
            "role": "campo",
        },
    )
    assert created.status_code == 200
    match = re.search(r'id="invite-link" readonly value="([^"]+)"', created.text)
    assert match
    invitation_url = match.group(1)
    token = invitation_url.rsplit("/", 1)[-1]

    from fastapi.testclient import TestClient

    from app.main import app

    with SessionLocal() as session:
        expected_project_name = session.get(Project, project_id).name

    attempt_time = app_main.now_utc()
    with TestClient(app) as invitee:
        form = invitee.get(invitation_url)
        assert expected_project_name in form.text
        assert "Perfil: Equipo de campo" in form.text
        csrf = re.search(r'name="csrf" value="([^"]+)"', form.text).group(1)
        for attempt in range(app_main.LOGIN_ACCOUNT_ATTEMPT_LIMIT):
            rejected = invitee.post(
                f"/invitations/accept/{token}",
                data={"csrf": csrf, "existing_password": f"wrong synthetic password {attempt}"},
                follow_redirects=False,
            )
            assert rejected.status_code == 401
            assert expected_project_name in rejected.text
            assert "Perfil: Equipo de campo" in rejected.text
            csrf = re.search(r'name="csrf" value="([^"]+)"', rejected.text).group(1)

        paused = invitee.post(
            f"/invitations/accept/{token}",
            data={"csrf": csrf, "existing_password": PASSWORD},
            follow_redirects=False,
        )
        assert paused.status_code == 429
        assert "Se pausó temporalmente" in paused.text
        assert expected_project_name in paused.text
        assert "Perfil: Equipo de campo" in paused.text
        assert invitee.get(invitation_url).status_code == 200

    with SessionLocal() as session:
        pending = session.scalar(select(Invitation).where(Invitation.email == "field@red.test"))
        assert pending is not None and pending.accepted_at is None

    monkeypatch.setattr(
        app_main, "now_utc", lambda: attempt_time + app_main.LOGIN_THROTTLE_WINDOW + timedelta(minutes=1),
    )
    with TestClient(app) as invitee:
        form = invitee.get(invitation_url)
        csrf = re.search(r'name="csrf" value="([^"]+)"', form.text).group(1)
        accepted = invitee.post(
            f"/invitations/accept/{token}",
            data={"csrf": csrf, "existing_password": PASSWORD},
            follow_redirects=False,
        )
        assert accepted.status_code == 303
        assert invitee.get(f"/projects/{project_id}").status_code == 200

    with SessionLocal() as session:
        invitation = session.scalar(select(Invitation).where(Invitation.email == "field@red.test"))
        assert invitation is not None and invitation.accepted_at is not None


@pytest.mark.parametrize("membership_active", [True, False])
def test_invitation_cannot_change_or_reactivate_an_existing_project_membership(
    client, workspace, membership_active,
):
    project_id = workspace["project_ids"][0]
    field_id = workspace["user_ids"]["field"]
    with SessionLocal() as session:
        membership = session.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == field_id,
            ProjectMembership.project_id == project_id,
        ))
        membership.active = membership_active
        session.commit()

    sign_in(client, "admin@red.test")
    response = client.post("/admin/invitations", data={
        "csrf": csrf_for(client, "/admin/users"),
        "email": "field@red.test",
        "full_name": "Operario existente",
        "project_id": project_id,
        "role": "revisor",
    })

    assert response.status_code == 409
    assert "Usa «Editar acceso»" in response.text
    with SessionLocal() as session:
        membership = session.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == field_id,
            ProjectMembership.project_id == project_id,
        ))
        assert membership.role == "campo"
        assert membership.active is membership_active
        assert session.scalar(select(Invitation.id).where(
            Invitation.email == "field@red.test",
            Invitation.project_id == project_id,
            Invitation.accepted_at.is_(None),
        )) is None


def test_pending_invitation_can_be_revoked_and_token_is_invalidated(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "admin@red.test")
    created = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"),
            "email": "revoked.field@red.test",
            "full_name": "Invitación revocable",
            "project_id": project_id,
            "role": "campo",
        },
        follow_redirects=False,
    )
    assert created.status_code == 200
    match = re.search(r'id="invite-link" readonly value="([^"]+)"', created.text)
    assert match
    pending_page = client.get("/admin/users")
    assert "Revocar invitación" in pending_page.text
    invitation_url = match.group(1)
    token = invitation_url.rsplit("/", 1)[-1]
    with SessionLocal() as session:
        invitation = session.scalar(select(Invitation).where(Invitation.email == "revoked.field@red.test"))
        assert invitation is not None
        invitation_id = invitation.id
        original_hash = invitation.token_hash

    duplicate = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"),
            "email": "revoked.field@red.test",
            "full_name": "Invitación revocable",
            "project_id": project_id,
            "role": "revisor",
        },
    )
    assert duplicate.status_code == 409
    assert "Revócala antes de generar otra" in duplicate.text

    assert client.get(invitation_url).status_code == 200
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as consultant:
        sign_in(consultant, "consultant@red.test")
        unauthorized = consultant.post(
            f"/admin/invitations/{invitation_id}/revoke",
            data={"csrf": csrf_for(consultant)},
        )
        assert unauthorized.status_code == 403

    revoked = client.post(
        f"/admin/invitations/{invitation_id}/revoke",
        data={"csrf": csrf_for(client, "/admin/users")},
        follow_redirects=False,
    )
    assert revoked.status_code == 303
    assert revoked.headers["location"] == "/admin/users?notice=Invitaci%C3%B3n%20revocada"
    assert client.get(invitation_url).status_code == 410
    assert "revoked.field@red.test" not in client.get("/admin/users").text

    with SessionLocal() as session:
        invitation = session.get(Invitation, invitation_id)
        assert invitation is not None
        assert utc(invitation.expires_at) <= now_utc()
        assert invitation.token_hash != original_hash
        assert invitation.token_hash != hash_token(token)
        event = session.scalar(select(AuditEvent).where(
            AuditEvent.entity_type == "invitation",
            AuditEvent.entity_id == invitation_id,
            AuditEvent.action == "invitation_revoked",
        ))
        assert event is not None
        assert event.project_id == project_id

    replacement = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"),
            "email": "revoked.field@red.test",
            "full_name": "Invitación revocable",
            "project_id": project_id,
            "role": "revisor",
        },
    )
    assert replacement.status_code == 200
    replacement_url = re.search(r'id="invite-link" readonly value="([^"]+)"', replacement.text).group(1)
    assert replacement_url.rsplit("/", 1)[-1] != token
    assert client.get(replacement_url).status_code == 200


def test_admin_password_reset_is_one_time_and_revokes_old_session(workspace):
    from fastapi.testclient import TestClient

    from app.main import app

    new_password = "Replacement-Synthetic-2026"
    target_id = workspace["user_ids"]["consultant"]
    with TestClient(app) as user_client, TestClient(app) as admin_client, TestClient(app) as reset_client:
        sign_in(user_client, "consultant@red.test")
        sign_in(admin_client, "admin@red.test")
        csrf = csrf_for(admin_client, "/admin/users")
        issued = admin_client.post(
            f"/admin/users/{target_id}/password-reset",
            data={"csrf": csrf},
        )
        assert issued.status_code == 200
        match = re.search(r'id="reset-link" readonly value="([^"]+)"', issued.text)
        assert match, "No se mostró el enlace único de recuperación"
        superseded_reset_url = match.group(1)
        reissued = admin_client.post(
            f"/admin/users/{target_id}/password-reset",
            data={"csrf": csrf_for(admin_client, "/admin/users")},
        )
        assert reissued.status_code == 200
        match = re.search(r'id="reset-link" readonly value="([^"]+)"', reissued.text)
        assert match
        reset_url = match.group(1)
        assert reset_client.get(superseded_reset_url).status_code == 410

        form = reset_client.get(reset_url)
        assert form.status_code == 200
        assert form.headers["referrer-policy"] == "no-referrer"
        assert form.headers["cache-control"] == "private, no-store"
        csrf = re.search(r'name="csrf" value="([^"]+)"', form.text).group(1)
        too_long = reset_client.post(
            reset_url,
            data={"csrf": csrf, "password": "x" * (MAX_PASSWORD_CHARACTERS + 1),
                  "confirmation": "x" * (MAX_PASSWORD_CHARACTERS + 1)},
            follow_redirects=False,
        )
        assert too_long.status_code == 422
        assert "12 y 1.024 caracteres" in too_long.text
        assert reset_client.get(reset_url).status_code == 200
        changed = reset_client.post(
            reset_url,
            data={"csrf": csrf, "password": new_password, "confirmation": new_password},
            follow_redirects=False,
        )
        assert changed.status_code == 303
        assert reset_client.get(reset_url).status_code == 410
        assert user_client.get("/", follow_redirects=False).status_code == 303

        rejected = user_client.post(
            "/login",
            data={"email": "consultant@red.test", "password": PASSWORD, "csrf": csrf_for(user_client)},
            follow_redirects=False,
        )
        assert rejected.status_code == 401
        sign_in(user_client, "consultant@red.test", new_password)
        assert user_client.get("/").status_code == 200


def test_deactivating_an_account_invalidates_pending_password_reset_after_reactivation(workspace):
    from fastapi.testclient import TestClient

    from app.main import app

    target_id = workspace["user_ids"]["consultant"]
    with TestClient(app) as admin_client, TestClient(app) as reset_client:
        sign_in(admin_client, "admin@red.test")
        account_page = admin_client.get("/admin/users")
        assert "<h2>Cuentas</h2>" in account_page.text
        assert "Reactivar la cuenta no devuelve accesos" in account_page.text
        issued = admin_client.post(
            f"/admin/users/{target_id}/password-reset",
            data={"csrf": csrf_for(admin_client, "/admin/users")},
        )
        reset_url = re.search(r'id="reset-link" readonly value="([^"]+)"', issued.text).group(1)
        invitation_response = admin_client.post(
            "/admin/invitations",
            data={
                "csrf": csrf_for(admin_client, "/admin/users"),
                "email": "consultant@red.test",
                "full_name": "Consultor existente",
                "project_id": workspace["project_ids"][1],
                "role": "consultor",
            },
        )
        invitation_match = re.search(r'id="invite-link" readonly value="([^"]+)"', invitation_response.text)
        assert invitation_match
        invitation_url = invitation_match.group(1)

        deactivated = admin_client.post(
            f"/admin/users/{target_id}/status",
            data={"csrf": csrf_for(admin_client, "/admin/users"), "action": "deactivate"},
            follow_redirects=False,
        )
        assert deactivated.status_code == 303
        assert reset_client.get(invitation_url).status_code == 410
        cannot_reinvite_inactive = admin_client.post(
            "/admin/invitations",
            data={
                "csrf": csrf_for(admin_client, "/admin/users"),
                "email": "consultant@red.test",
                "full_name": "Consultor existente",
                "project_id": workspace["project_ids"][2],
                "role": "consultor",
            },
            follow_redirects=False,
        )
        assert cannot_reinvite_inactive.status_code == 409
        with SessionLocal() as session:
            event = session.scalar(select(AuditEvent).where(
                AuditEvent.action == "user_deactivated", AuditEvent.entity_id == target_id,
            ))
            assert event and event.detail["pending_password_resets_invalidated"] == 1
            assert event.detail["pending_invitations_invalidated"] == 1
            assert event.detail["active_memberships_revoked"] == 1
            invitation = session.scalar(select(Invitation).where(Invitation.email == "consultant@red.test"))
            assert invitation and utc(invitation.expires_at) <= now_utc()
            revoked_memberships = list(session.scalars(select(ProjectMembership).where(ProjectMembership.user_id == target_id)))
            assert revoked_memberships and all(not membership.active for membership in revoked_memberships)
        reactivated = admin_client.post(
            f"/admin/users/{target_id}/status",
            data={"csrf": csrf_for(admin_client, "/admin/users"), "action": "activate"},
            follow_redirects=False,
        )
        assert reactivated.status_code == 303
        assert reset_client.get(reset_url).status_code == 410
        assert reset_client.get(invitation_url).status_code == 410
        with SessionLocal() as session:
            revoked_memberships = list(session.scalars(select(ProjectMembership).where(ProjectMembership.user_id == target_id)))
            assert revoked_memberships and all(not membership.active for membership in revoked_memberships)


def test_review_cannot_approve_a_draft(client, workspace):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-01", title="Ficha sintética", status="RAW",
            source_kind="declarado", source_note="Fuente sintética para prueba", payload={"sample": "dato"},
            created_by=workspace["user_ids"]["field"], updated_by=workspace["user_ids"]["field"],
        )
        session.add(record)
        session.commit()
        record_id = record.id

    sign_in(client, "reviewer@red.test")
    csrf = csrf_for(client, f"/records/{record_id}")
    response = client.post(
        f"/records/{record_id}/review",
        data=rendered_decision_data(client, f"/records/{record_id}/review", {"expected_version": record_version_for_review(record_id), "csrf": csrf, "decision": "VALIDATED", "reason": "Revisión sintética"}),
        follow_redirects=False,
    )
    assert response.status_code == 409
    with SessionLocal() as session:
        assert session.get(FormRecord, record_id).status == "RAW"


def test_submission_requires_source_and_method_note(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-01"
    csrf = csrf_for(client, path)
    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-01")
    data = {
        "csrf": csrf,
        "form_code": "D-01",
        "record_title": "Registro sintético",
        "record_date": "2026-10-07",
        "source_kind": "declarado",
        "source_note": "",
        "action": "submit",
    }
    data.update({field["id"]: "Respuesta sintética" for field in form_spec["fields"] if field["required"]})
    response = client.post(f"/projects/{project_id}/records/new", data=data)
    assert response.status_code == 422
    assert "fuente" in response.text.casefold() or "método" in response.text.casefold()
    with SessionLocal() as session:
        assert session.scalar(select(FormRecord).where(FormRecord.project_id == project_id)) is None


def test_retried_new_record_submission_returns_existing_record(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-01"
    form_page = client.get(path)
    submission_key = re.search(r'name="submission_key" value="([^"]+)"', form_page.text)
    assert form_page.status_code == 200 and submission_key
    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-01")
    data = {
        "csrf": csrf_for(client, path),
        "form_code": "D-01",
        "submission_key": submission_key.group(1),
        "record_title": "Captura sintética única",
        "record_date": "2026-10-08",
        "source_kind": "declarado",
        "source_note": "Fuente declarada para prueba de reintento idempotente.",
        "action": "submit",
    }
    data.update({field["id"]: "Respuesta sintética" for field in form_spec["fields"] if field["required"]})
    data.update({
        "D01-008": "admin@example.test", "D01-010": "1", "D01-011": "10",
        "D01-012": "10", "D01-013": "10", "D01-014": "0",
        "D01-016": "", "D01-019": "Declarado",
        "D01-017": workspace["user_ids"]["field"],
        "D01-018": workspace["user_ids"]["consultant"],
    })

    invalid = client.post(f"/projects/{project_id}/records/new", data=data, follow_redirects=False)
    assert invalid.status_code == 422
    assert f'action="/projects/{project_id}/records/new"' in invalid.text
    assert f'name="submission_key" value="{submission_key.group(1)}"' in invalid.text
    data["D01-016"] = "Prospecto"

    first = client.post(f"/projects/{project_id}/records/new", data=data, follow_redirects=False)
    assert first.status_code == 303, first.text
    record_path = first.headers["location"].split("?", 1)[0]

    retry_data = {**data, "record_title": "Título alterado durante un reintento"}
    retry = client.post(f"/projects/{project_id}/records/new", data=retry_data, follow_redirects=False)
    assert retry.status_code == 303
    assert retry.headers["location"].split("?", 1)[0] == record_path
    with SessionLocal() as session:
        records = list(session.scalars(select(FormRecord).where(FormRecord.project_id == project_id)))
        assert len(records) == 1
        assert records[0].title == "Captura sintética única"
        assert records[0].submission_key == submission_key.group(1)


def test_retry_after_lost_response_does_not_duplicate_record_or_uploaded_evidence(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-07"
    form_page = client.get(path)
    csrf = re.search(r'name="csrf" value="([^"]+)"', form_page.text).group(1)
    submission_key = re.search(r'name="submission_key" value="([^"]+)"', form_page.text).group(1)
    data = {
        "csrf": csrf, "form_code": "D-07", "submission_key": submission_key,
        "record_title": "Captura D-07 respuesta perdida", "source_note": "Fuente sintética para probar el reintento sin duplicar evidencia.",
        "action": "draft",
    }
    first_photo = b"\x89PNG\r\n\x1a\nsynthetic-first-evidence"
    retry_photo = b"\x89PNG\r\n\x1a\nsynthetic-retry-evidence"
    first = client.post(
        f"/projects/{project_id}/records/new", data=data,
        files={"evidence__D07-010": ("primera.png", first_photo, "image/png")},
        follow_redirects=False,
    )
    assert first.status_code == 303
    record_path = first.headers["location"].split("?", 1)[0]
    stored_key = None
    try:
        with SessionLocal() as session:
            record = session.scalar(select(FormRecord).where(FormRecord.submission_key == submission_key))
            evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id)))
            assert record is not None and record.status == "RAW"
            assert len(evidence) == 1 and evidence[0].original_name == "primera.png"
            stored_key = f"evidence/{evidence[0].storage_name}"
            assert app_main.storage.get_bytes(stored_key) == first_photo

        # This identical POST represents the browser retrying after the first response was lost.
        retry = client.post(
            f"/projects/{project_id}/records/new", data=data,
            files={"evidence__D07-010": ("reintento.png", retry_photo, "image/png")},
            follow_redirects=False,
        )
        assert retry.status_code == 303
        assert retry.headers["location"].split("?", 1)[0] == record_path
        with SessionLocal() as session:
            records = list(session.scalars(select(FormRecord).where(FormRecord.submission_key == submission_key)))
            evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == records[0].id)))
            assert len(records) == 1
            assert len(evidence) == 1 and evidence[0].original_name == "primera.png"
            assert app_main.storage.get_bytes(f"evidence/{evidence[0].storage_name}") == first_photo
    finally:
        if stored_key:
            app_main.storage.delete(stored_key)


def test_concurrent_duplicate_record_submission_stores_only_one_record_and_evidence(workspace):
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier

    from fastapi.testclient import TestClient

    from app.main import app

    project_id = workspace["project_ids"][0]
    path = f"/projects/{project_id}/records/new?form_code=D-07"
    endpoint = f"/projects/{project_id}/records/new"
    submission_key = secrets.token_urlsafe(32)
    start_together = Barrier(2)
    photos = [
        ("primera-concurrente.png", b"\x89PNG\r\n\x1a\nfirst-concurrent-synthetic-photo"),
        ("segunda-concurrente.png", b"\x89PNG\r\n\x1a\nsecond-concurrent-synthetic-photo"),
    ]

    def submit(index: int):
        with TestClient(app) as concurrent_client:
            sign_in(concurrent_client, "consultant@red.test")
            form_page = concurrent_client.get(path)
            assert form_page.status_code == 200
            csrf = re.search(r'name="csrf" value="([^"]+)"', form_page.text).group(1)
            start_together.wait(timeout=10)
            return concurrent_client.post(
                endpoint,
                data=rendered_decision_data(concurrent_client, endpoint, {
                    "csrf": csrf,
                    "form_code": "D-07",
                    "submission_key": submission_key,
                    "record_title": "Reintento concurrente sintético",
                    "source_note": "Fuente sintética para validar concurrencia e idempotencia.",
                    "action": "draft",
                }),
                files={"evidence__D07-010": (photos[index][0], photos[index][1], "image/png")},
                follow_redirects=False,
            )

    stored_keys = []
    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            responses = list(pool.map(submit, range(2)))

        assert all(response.status_code == 303 for response in responses)
        record_paths = {response.headers["location"].split("?", 1)[0] for response in responses}
        assert len(record_paths) == 1
        record_id = next(iter(record_paths)).rsplit("/", 1)[-1]

        with SessionLocal() as session:
            records = list(session.scalars(select(FormRecord).where(FormRecord.submission_key == submission_key)))
            evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record_id)))
            assert len(records) == 1 and records[0].id == record_id
            assert len(evidence) == 1
            stored_keys = [f"evidence/{evidence[0].storage_name}"]
            assert evidence[0].original_name in {name for name, _content in photos}
            assert app_main.storage.get_bytes(stored_keys[0]) in {content for _name, content in photos}
    finally:
        for stored_key in stored_keys:
            app_main.storage.delete(stored_key)


def test_concurrent_duplicate_pmirs_progress_submission_creates_one_revision(workspace):
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier

    from fastapi.testclient import TestClient

    from app.main import app

    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.baseline_status = "validada"
        action = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-REINTENTO",
            title="Acción sintética para reintento", description="Acción de prueba de idempotencia.",
            data={"execution_status": "pendiente", "progress_pct": 0},
            review_status="VALIDATED", version=1,
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(action)
        session.commit()
        action_id = action.id

    project_path = f"/projects/{project_id}/pmirs"
    endpoint = f"/pmirs/items/{action_id}/progress"
    submission_key = secrets.token_urlsafe(32)
    start_together = Barrier(2)

    def submit(_index: int):
        with TestClient(app) as concurrent_client:
            sign_in(concurrent_client, "consultant@red.test")
            csrf = csrf_for(concurrent_client, project_path)
            start_together.wait(timeout=10)
            return concurrent_client.post(
                endpoint,
                data=rendered_decision_data(concurrent_client, endpoint, {"expected_version": pmirs_version_for_progress(action_id), 
                    "csrf": csrf, "submission_key": submission_key,
                    "execution_status": "en_proceso", "progress_pct": 25,
                    "progress_note": "Inspección sintética iniciada en el sitio.",
                }),
                follow_redirects=False,
            )

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(submit, range(2)))

    assert all(response.status_code == 303 for response in responses), [
        (response.status_code, response.text) for response in responses
    ]
    with SessionLocal() as session:
        revisions = list(session.scalars(select(PMIRSItemRevision).where(
            PMIRSItemRevision.submission_key == submission_key,
        )))
        saved_action = session.get(PMIRSItem, action_id)
        audit_rows = list(session.scalars(select(AuditEvent).where(
            AuditEvent.action == "pmirs_action_progress", AuditEvent.entity_id == action_id,
        )))
        assert len(revisions) == 1
        assert len(audit_rows) == 1
        assert saved_action.version == 2
        assert saved_action.data["execution_status"] == "en_proceso"
        assert saved_action.data["progress_pct"] == 25


def test_only_consultant_can_reopen_closed_pmirs_action_with_reason(client, workspace):
    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    field_id = workspace["user_ids"]["field"]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.baseline_status = "validada"
        action = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-REAPERTURA",
            title="Acción cerrada sintética", description="Cierre de práctica para comprobar reapertura.",
            data={"execution_status": "cerrada", "progress_pct": 100,
                  "close_reason": "Cierre anterior sintético con QA aprobado.",
                  "assignee_user_ids": [field_id]},
            review_status="VALIDATED", version=1,
            created_by=consultant_id, updated_by=consultant_id,
        )
        session.add(action)
        session.commit()
        action_id = action.id

    endpoint = f"/pmirs/items/{action_id}/progress"
    studio_path = f"/projects/{project_id}/pmirs"
    sign_in(client, "field@red.test")
    field_attempt = client.post(
        endpoint,
        data=rendered_decision_data(client, endpoint, {"expected_version": pmirs_version_for_progress(action_id), "csrf": csrf_for(client, studio_path), "execution_status": "reabierta",
              "progress_pct": 100, "progress_note": "La acción requiere seguimiento adicional.",
              "close_reason": "Motivo sintético de reapertura."}),
    )
    assert field_attempt.status_code == 403
    with SessionLocal() as session:
        assert session.get(PMIRSItem, action_id).data["execution_status"] == "cerrada"

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    missing_reason = client.post(
        endpoint,
        data=rendered_decision_data(client, endpoint, {"expected_version": pmirs_version_for_progress(action_id), "csrf": csrf_for(client, studio_path), "execution_status": "reabierta",
              "progress_pct": 100, "progress_note": "La acción requiere seguimiento adicional.",
              "close_reason": ""}),
    )
    assert missing_reason.status_code == 422
    with SessionLocal() as session:
        assert session.get(PMIRSItem, action_id).data["execution_status"] == "cerrada"

    reopened = client.post(
        endpoint,
        data=rendered_decision_data(client, endpoint, {"expected_version": pmirs_version_for_progress(action_id), "csrf": csrf_for(client, studio_path), "execution_status": "reabierta",
              "progress_pct": 100, "progress_note": "Se reabre para completar una verificación adicional.",
              "close_reason": "La evidencia requiere una revisión complementaria."}),
        follow_redirects=False,
    )
    assert reopened.status_code == 303
    with SessionLocal() as session:
        saved = session.get(PMIRSItem, action_id)
        assert saved.version == 2
        assert saved.data["execution_status"] == "reabierta"
        assert saved.data["close_reason"] == "La evidencia requiere una revisión complementaria."
        revision = session.scalar(select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == action_id))
        assert revision.snapshot["data"]["execution_status"] == "reabierta"
        event = session.scalar(select(AuditEvent).where(
            AuditEvent.action == "pmirs_action_progress", AuditEvent.entity_id == action_id,
        ))
        assert event.detail["from_status"] == "cerrada"
        assert event.detail["to_status"] == "reabierta"
    history_page = client.get(studio_path)
    assert "Cambios recientes de ejecución (1)" in history_page.text
    assert "Se reabre para completar una verificación adicional." in history_page.text
    assert "Motivo de cierre o reapertura:" in history_page.text
    assert "La evidencia requiere una revisión complementaria." in history_page.text


def test_retried_record_edit_is_idempotent_and_keeps_key_after_validation(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    new_path = f"/projects/{project_id}/records/new?form_code=D-06"
    created = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, new_path), "form_code": "D-06",
            "submission_key": secrets.token_urlsafe(32), "record_title": "Visita sintética inicial",
            "record_date": "2026-10-09", "source_kind": "observado",
            "source_note": "Visita creada para validar el reintento de una edición.", "action": "draft",
        },
        follow_redirects=False,
    )
    assert created.status_code == 303
    record_id = created.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
    edit_path = f"/records/{record_id}/edit"
    edit_page = client.get(edit_path)
    key_match = re.search(r'name="submission_key" value="([^\"]+)"', edit_page.text)
    assert edit_page.status_code == 200 and key_match
    submission_key = key_match.group(1)
    csrf = csrf_for(client, edit_path)
    base = {
        "csrf": csrf, "submission_key": submission_key, "form_code": "D-06",
        "record_title": "Visita sintética corregida", "record_date": "2026-10-09",
        "source_kind": "observado", "source_note": "Ajuste sintético idempotente.",
    }

    invalid = client.post(edit_path, data={**base, "action": "submit"}, follow_redirects=False)
    assert invalid.status_code == 422
    assert f'name="submission_key" value="{submission_key}"' in invalid.text

    first = client.post(edit_path, data={**base, "action": "draft", "D06-007": "Corrección original"}, follow_redirects=False)
    assert first.status_code == 303
    retry = client.post(
        edit_path,
        data={**base, "record_title": "No reemplazar la corrección original", "action": "draft", "D06-007": "Cambio del reintento"},
        follow_redirects=False,
    )
    assert retry.status_code == 303
    assert retry.headers["location"].split("?", 1)[0] == first.headers["location"].split("?", 1)[0]

    with SessionLocal() as session:
        record = session.get(FormRecord, record_id)
        revisions = list(session.scalars(select(FormRevision).where(FormRevision.record_id == record_id)))
        assert record.version == 2
        assert record.title == "Visita sintética corregida"
        assert record.payload["D06-007"] == "Corrección original"
        edit_revision = next(revision for revision in revisions if revision.revision == 2)
        assert edit_revision.submission_key == submission_key
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        backup_data = json.loads(archive.read("database.json"))
        saved_revision = next(row for row in backup_data["form_revisions"] if row["id"] == edit_revision.id)
        assert backup_data["schema_version"] == 15
        assert saved_revision["submission_key"] == submission_key

    next_edit_page = client.get(edit_path)
    next_key = re.search(r'name="submission_key" value="([^\"]+)"', next_edit_page.text).group(1)
    assert next_key != submission_key


def test_edit_idempotency_key_cannot_be_replayed_against_another_record(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    new_path = f"/projects/{project_id}/records/new?form_code=D-06"

    def create_record(title: str) -> str:
        response = client.post(
            f"/projects/{project_id}/records/new",
            data={
                "csrf": csrf_for(client, new_path), "form_code": "D-06",
                "submission_key": secrets.token_urlsafe(32), "record_title": title,
                "record_date": "2026-10-09", "source_kind": "observado",
                "source_note": "Registro sintético para probar el alcance de la clave.", "action": "draft",
            },
            follow_redirects=False,
        )
        assert response.status_code == 303
        return response.headers["location"].split("/records/", 1)[1].split("?", 1)[0]

    first_id = create_record("Primer registro sintético")
    other_id = create_record("Segundo registro sintético")
    first_path = f"/records/{first_id}/edit"
    first_page = client.get(first_path)
    key = re.search(r'name="submission_key" value="([^\"]+)"', first_page.text).group(1)
    first_save = client.post(
        first_path,
        data={
            "csrf": csrf_for(client, first_path), "submission_key": key, "form_code": "D-06",
            "record_title": "Primer registro editado", "source_note": "Edición sintética original.",
            "D06-007": "Dato de la primera edición", "action": "draft",
        },
        follow_redirects=False,
    )
    assert first_save.status_code == 303

    other_path = f"/records/{other_id}/edit"
    replay = client.post(
        other_path,
        data={
            "csrf": csrf_for(client, other_path), "submission_key": key, "form_code": "D-06",
            "record_title": "Intento cruzado", "source_note": "No debe aplicar al otro registro.",
            "D06-007": "Dato cruzado", "action": "draft",
        },
        follow_redirects=False,
    )
    assert replay.status_code == 409
    with SessionLocal() as session:
        other = session.get(FormRecord, other_id)
        assert other.version == 1
        assert other.title == "Segundo registro sintético"
        assert session.scalar(select(FormRevision).where(
            FormRevision.record_id == other_id, FormRevision.submission_key == key,
        )) is None


def test_form_draft_can_be_partial_but_blank_submission_is_blocked(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    form_spec = next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-01")
    path = f"/projects/{project_id}/records/new?form_code=D-01"
    base_data = {
        "csrf": csrf_for(client, path), "form_code": "D-01", "record_title": "Ficha parcial sintética",
        "record_date": "2026-10-07", "source_kind": "declarado",
        "source_note": "Dato parcial declarado por administración en prueba sintética.",
    }
    blank_fields = {field["id"]: "" for field in form_spec["fields"]}
    submitted = client.post(
        f"/projects/{project_id}/records/new",
        data={**base_data, **blank_fields, "action": "submit"},
        follow_redirects=False,
    )
    assert submitted.status_code == 422
    assert "Campo requerido: Nombre de la unidad residencial" in submitted.text

    draft = client.post(
        f"/projects/{project_id}/records/new",
        data={**base_data, **blank_fields, "action": "draft"},
        follow_redirects=False,
    )
    assert draft.status_code == 303
    with SessionLocal() as session:
        record = session.scalar(select(FormRecord).where(FormRecord.project_id == project_id))
        assert record.status == "RAW"
        assert re.fullmatch(r"BEL-\d{3}", record.payload["D01-001"])
        assert not any(str(value).strip() for key, value in record.payload.items() if key != "D01-001")


def test_measurement_calculations_are_recomputed_from_source_fields(client, workspace):
    assert apply_supported_calculations("D-07", {
        "D07-005": "0.375", "D07-006": "2.125", "D07-007": "999",
    })["D07-007"] == "1.75"
    assert apply_supported_calculations("D-07", {
        "D07-005": "2", "D07-006": "1", "D07-007": "999",
    })["D07-007"] == ""
    assert apply_supported_calculations("D-09", {
        "D09-002": "3", "D09-003": "1", "D09-004": "999",
    })["D09-004"] == "33.33"
    assert apply_supported_calculations("D-09", {
        "D09-002": "0", "D09-003": "0", "D09-004": "999",
    })["D09-004"] == ""

    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-07"
    page = client.get(path)
    assert page.status_code == 200
    assert 'id="D07-007"' in page.text and 'readonly aria-readonly="true"' in page.text
    data = {
        "csrf": csrf_for(client, path), "form_code": "D-07", "record_title": "Pesaje sintético",
        "record_date": "2026-10-07", "source_kind": "medido",
        "source_note": "Pesaje sintético de prueba con tara y bruto anotados.",
        "D07-005": "0.375", "D07-006": "2.125", "D07-007": "999", "action": "draft",
    }
    saved = client.post(f"/projects/{project_id}/records/new", data=data, follow_redirects=False)
    assert saved.status_code == 303
    with SessionLocal() as session:
        record = session.scalar(select(FormRecord).where(FormRecord.project_id == project_id, FormRecord.form_code == "D-07"))
        assert record.payload["D07-007"] == "1.75"


def test_d08_groups_fractions_by_same_project_lot_and_keeps_review_auditable(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    d06_path = f"/projects/{project_id}/records/new?form_code=D-06"
    saved_d06 = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d06_path), "form_code": "D-06", "record_title": "Jornada sintética 01",
            "source_note": "Jornada sintética para vincular el pesaje del lote.", "action": "draft",
        },
        follow_redirects=False,
    )
    assert saved_d06.status_code == 303
    d06_id = saved_d06.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
    d13_path = f"/projects/{project_id}/records/new?form_code=D-13"
    saved_d13 = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d13_path), "form_code": "D-13", "record_title": "Báscula sintética 01",
            "source_note": "Equipo sintético para validar la relación al pesaje.",
            "D13-001": "BASC-SINT-01", "D13-002": "Báscula",
            "D13-004__value": "50", "D13-004__unit": "kg",
            "D13-006": "Operativo", "D13-007": "Método aprobado y resultado sintético documentado.",
            "action": "submit",
        },
        follow_redirects=False,
    )
    assert saved_d13.status_code == 303
    d13_id = saved_d13.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
    d07_path = f"/projects/{project_id}/records/new?form_code=D-07"
    d07_payload = {
        "csrf": csrf_for(client, d07_path), "form_code": "D-07", "record_title": "Lote sintético 01",
        "record_date": "2026-10-07", "source_kind": "medido",
        "source_note": "Pesaje sintético de prueba con tara y peso bruto.",
        "D07-001": d06_id, "D07-003": d13_id,
        "D07-004": "Recipiente sintético 60 L", "D07-005": "0.375",
        "D07-006": "2.125", "D07-008": "Aprovechable", "action": "submit",
    }
    equipment_gate = client.post(
        f"/projects/{project_id}/records/new", data=d07_payload, follow_redirects=False,
    )
    assert equipment_gate.status_code == 422
    assert "debe estar revisado y validado" in equipment_gate.text

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    review_page = client.get(f"/records/{d13_id}")
    assert "Control de equipo antes de habilitar pesajes" in review_page.text
    assert "conditional-required.js?v=20261009-d13review1" in review_page.text
    assert 'name="equipment_review_confirmed" value="yes"' in review_page.text
    assert 'data-required-when-field="review-decision" data-required-when-values="VALIDATED"' in review_page.text
    reviewed_d13 = client.post(
        f"/records/{d13_id}/review",
        data=rendered_decision_data(client, f"/records/{d13_id}/review", {"expected_version": record_version_for_review(d13_id), 
            "csrf": csrf_for(client, f"/records/{d13_id}"), "decision": "VALIDATED",
            "reason": "Método, aplicabilidad y soporte sintéticos revisados.",
        }),
        follow_redirects=True,
    )
    assert reviewed_d13.status_code == 200
    assert "Confirma la revisión del método" in reviewed_d13.text
    reviewed_d13_missing_basis = client.post(
        f"/records/{d13_id}/review",
        data=rendered_decision_data(client, f"/records/{d13_id}/review", {"expected_version": record_version_for_review(d13_id), 
            "csrf": csrf_for(client, f"/records/{d13_id}"), "decision": "VALIDATED",
            "reason": "Método, aplicabilidad y soporte sintéticos revisados.",
            "equipment_review_confirmed": "yes",
        }),
        follow_redirects=True,
    )
    assert reviewed_d13_missing_basis.status_code == 200
    assert "D13-009 debe registrar la decisión de aplicabilidad" in reviewed_d13_missing_basis.text
    assert 'role="alert" tabindex="-1"' in reviewed_d13_missing_basis.text
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    corrected_equipment = client.post(
        f"/records/{d13_id}/edit",
        data={
            "csrf": csrf_for(client, f"/records/{d13_id}/edit"),
            "source_note": "Equipo sintético con referencia documental para revisión metrológica.",
            "D13-001": "BASC-SINT-01", "D13-002": "Báscula",
            "D13-004__value": "50", "D13-004__unit": "kg",
            "D13-006": "Operativo", "D13-007": "Método aprobado y resultado sintético documentado.",
            "D13-009": "Decisión sintética de aplicabilidad; fuente 2026-10-09; memo MET-SINT-01.",
            "action": "submit",
        },
        follow_redirects=False,
    )
    assert corrected_equipment.status_code == 303
    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    reviewed_d13 = client.post(
        f"/records/{d13_id}/review",
        data=rendered_decision_data(client, f"/records/{d13_id}/review", {"expected_version": record_version_for_review(d13_id), 
            "csrf": csrf_for(client, f"/records/{d13_id}"), "decision": "VALIDATED",
            "reason": "Método, aplicabilidad y soporte sintéticos revisados.",
            "equipment_review_confirmed": "yes",
        }),
        follow_redirects=False,
    )
    assert reviewed_d13.status_code == 303

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    with SessionLocal() as session:
        equipment = session.get(FormRecord, d13_id)
        original_payload = dict(equipment.payload)
        equipment.payload = {**original_payload, "D13-006": "No usar"}
        assert any(
            "No usar" in error
            for error in app_main.d07_submission_errors(session, project_id, {"D07-003": d13_id})
        )
        equipment.payload = original_payload
        session.commit()
    d07_payload["csrf"] = csrf_for(client, d07_path)
    saved_d07 = client.post(
        f"/projects/{project_id}/records/new",
        data=d07_payload,
        follow_redirects=False,
    )
    assert saved_d07.status_code == 303
    with SessionLocal() as session:
        source = session.scalar(select(FormRecord).where(FormRecord.project_id == project_id, FormRecord.form_code == "D-07"))
        source_id = source.id
        other_project_source = FormRecord(
            id="00000000-0000-0000-0000-000000000007", project_id=workspace["project_ids"][1],
            form_code="D-07", title="Otro expediente", status="VALIDATED", source_note="Fuente sintética válida",
            payload={"D07-007": "1"}, created_by=workspace["user_ids"]["admin"], updated_by=workspace["user_ids"]["admin"],
        )
        session.add(other_project_source)
        session.commit()
        assert d08_source_record(session, project_id, other_project_source.id) is None
        assert [item["id"] for item in d08_relation_options(session, project_id)] == [source_id]
        other_source_id = other_project_source.id

    d08_path = f"/projects/{project_id}/records/new?form_code=D-08"
    rejected_cross_project = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d08_path), "form_code": "D-08", "record_title": "Vínculo no permitido",
            "source_note": "Prueba sintética de límite entre expedientes.",
            "D08-001": other_source_id, "D08-003": "Orgánicos", "D08-005": "1", "action": "draft",
        },
    )
    assert rejected_cross_project.status_code == 422
    assert "pertenece a otro expediente" in rejected_cross_project.text

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    changed_equipment = client.post(
        f"/records/{d13_id}/edit",
        data={
            "csrf": csrf_for(client, f"/records/{d13_id}/edit"),
            "source_note": "Soporte actualizado de equipo sintético para reabrir QA.",
            "D13-001": "BASC-SINT-01", "D13-002": "Báscula",
            "D13-004__value": "50", "D13-004__unit": "kg",
            "D13-006": "Operativo", "D13-007": "Método aprobado y resultado sintético documentado.",
            "D13-009": "Decisión sintética documentada; fuente 2026-10-09; memo MET-SINT-02.", "action": "submit",
        },
        follow_redirects=False,
    )
    assert changed_equipment.status_code == 303, changed_equipment.text
    with SessionLocal() as session:
        assert session.get(FormRecord, source_id).status == "CORRECTION_REQUESTED"
    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    stale_equipment_review = client.post(
        f"/records/{source_id}/review",
        data=rendered_decision_data(client, f"/records/{source_id}/review", {"expected_version": record_version_for_review(source_id), 
            "csrf": csrf_for(client, f"/records/{source_id}"), "decision": "VALIDATED",
            "reason": "Revisión sintética del vínculo de equipo.",
        }),
        follow_redirects=True,
    )
    assert stale_equipment_review.status_code == 200
    assert "debe estar revisado y validado" in stale_equipment_review.text
    reviewed_d13_again = client.post(
        f"/records/{d13_id}/review",
        data=rendered_decision_data(client, f"/records/{d13_id}/review", {"expected_version": record_version_for_review(d13_id), 
            "csrf": csrf_for(client, f"/records/{d13_id}"), "decision": "VALIDATED",
            "reason": "Soporte actualizado del equipo revisado.",
            "equipment_review_confirmed": "yes",
        }),
        follow_redirects=False,
    )
    assert reviewed_d13_again.status_code == 303
    reviewed_d07 = client.post(
        f"/records/{source_id}/review",
        data=rendered_decision_data(client, f"/records/{source_id}/review", {"expected_version": record_version_for_review(source_id), "csrf": csrf_for(client, f"/records/{source_id}"), "decision": "VALIDATED", "reason": "Tara y bruto cotejados con evidencia sintética."}),
        follow_redirects=False,
    )
    assert reviewed_d07.status_code == 303

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    first = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d08_path), "form_code": "D-08", "record_title": "Fracción orgánica sintética",
            "record_date": "2026-10-07", "source_kind": "medido",
            "source_note": "Fracción sintética pesada en balanza de prueba.",
                "D08-001": source_id, "D08-002": "Caracterización inicial",
                "D08-003": "Orgánicos", "D08-005": "1", "action": "submit",
        },
        follow_redirects=False,
    )
    assert first.status_code == 303
    with SessionLocal() as session:
        first_row = session.scalar(select(FormRecord).where(FormRecord.project_id == project_id, FormRecord.form_code == "D-08"))
        first_id = first_row.id
        assert first_row.status == "PENDING_REVIEW"
        assert first_row.payload["D08-008"] == "1"
        assert first_row.payload["D08-009"] == "0.75 kg; 42.86%"
        assert "Pendiente de revisar" in first_row.payload["D08-010"]

    second = client.post(
        f"/projects/{project_id}/records/new",
        data={
            "csrf": csrf_for(client, d08_path), "form_code": "D-08", "record_title": "Fracción aprovechable sintética",
            "record_date": "2026-10-07", "source_kind": "medido",
            "source_note": "Otra fracción sintética pesada en balanza de prueba.",
            "D08-001": source_id, "D08-002": "Caracterización inicial",
            "D08-003": "Aprovechables", "D08-005": "0.75", "action": "draft",
        },
        follow_redirects=False,
    )
    assert second.status_code == 303
    with SessionLocal() as session:
        rows = list(session.scalars(select(FormRecord).where(FormRecord.project_id == project_id, FormRecord.form_code == "D-08")))
        first_row = next(item for item in rows if item.id == first_id)
        assert len(rows) == 2
        assert first_row.status == "CORRECTION_REQUESTED"
        assert first_row.payload["D08-008"] == "1.75"
        assert first_row.payload["D08-009"] == "0 kg; 0.00%"
        assert len(list(session.scalars(select(FormRevision).where(FormRevision.record_id == first_id)))) == 2
        assert all(item.payload["D08-008"] == "1.75" for item in rows)

    with SessionLocal() as session:
        linked_fraction = FormRecord(
            id="00000000-0000-0000-0000-000000000008", project_id=project_id,
            form_code="D-08", title="Fracción sintética validada para cascade",
            status="VALIDATED", source_note="Fracción sintética para probar reapertura de QA.",
            payload={"D08-001": source_id, "D08-003": "Vidrio", "D08-005": "0.25"},
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        )
        session.add(linked_fraction)
        session.flush()
        app_main.invalidate_equipment_measurements(
            session, project_id, d13_id, workspace["user_ids"]["reviewer"],
            "Prueba: el estado QA del equipo cambió.",
        )
        assert session.get(FormRecord, source_id).status == "CORRECTION_REQUESTED"
        assert session.get(FormRecord, linked_fraction.id).status == "CORRECTION_REQUESTED"


def test_d13_verification_help_does_not_claim_calibration(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    page = client.get(f"/projects/{project_id}/records/new?form_code=D-13")
    assert page.status_code == 200
    assert "método aprobado para esta medición" in page.text
    assert "Esta captura no es un certificado de calibración" in page.text
    assert "intervalo y soporte de calibración indicados por el fabricante" in page.text
    assert "solo si el responsable confirma" in page.text
    assert "conserva el registro como borrador" in page.text
    assert "Para aceptar D-13 como válido, registra aquí" in page.text
    assert "fuente/fecha y la referencia del soporte" in page.text
    assert "el revisor designado debe comprobar el método y el soporte aplicables" in page.text
    d07_page = client.get(f"/projects/{project_id}/records/new?form_code=D-07")
    assert "el equipo D-13 debe estar revisado y validado" in d07_page.text
    assert "El servidor aplica este control" in d07_page.text


def test_form_creation_timestamps_are_server_managed_and_stable(client, workspace):
    created_at = datetime(2026, 10, 7, 18, 25, tzinfo=timezone.utc)
    for code, field_id in [("D-03", "D03-003"), ("D-06", "D06-003"), ("D-11", "D11-002"), ("D-13", "D13-010"), ("Q-01", "Q01-012")]:
        payload = apply_server_managed_fields(code, {field_id: "1900-01-01T00:00:00+00:00"}, timestamp=created_at)
        assert payload[field_id] == "2026-10-07T18:25:00+00:00"

    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/records/new?form_code=D-03"
    page = client.get(path)
    assert page.status_code == 200
    assert 'id="D03-003"' in page.text and 'readonly aria-readonly="true"' in page.text
    data = {
        "csrf": csrf_for(client, path), "form_code": "D-03", "record_title": "Visita sintética",
        "source_kind": "observado", "source_note": "Apertura sintética de visita para validar sello automático.",
        "D03-003": "1900-01-01T00:00:00+00:00", "action": "draft",
    }
    saved = client.post(f"/projects/{project_id}/records/new", data=data, follow_redirects=False)
    assert saved.status_code == 303
    with SessionLocal() as session:
        record = session.scalar(select(FormRecord).where(FormRecord.project_id == project_id, FormRecord.form_code == "D-03"))
        assert record.payload["D03-003"] == utc(record.created_at).isoformat()


def test_support_records_can_reach_accepted_baseline_through_role_workflows_and_isolated_restore(client, workspace, tmp_path):
    project_id = workspace["project_ids"][0]
    record_ids = {}
    invited_field_email = "invited.field@red.test"

    sign_in(client, "admin@red.test")
    invitation = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"), "email": invited_field_email,
            "full_name": "Operario invitado sintético", "project_id": project_id, "role": "campo",
        },
        follow_redirects=False,
    )
    assert invitation.status_code == 200
    invitation_url = re.search(r'id="invite-link" readonly value="([^"]+)"', invitation.text).group(1)
    invitation_token = invitation_url.rsplit("/", 1)[-1]

    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as invitee:
        invitation_page = invitee.get(invitation_url)
        assert invitation_page.status_code == 200
        invitation_csrf = re.search(r'name="csrf" value="([^"]+)"', invitation_page.text).group(1)
        accepted_invitation = invitee.post(
            f"/invitations/accept/{invitation_token}",
            data={"csrf": invitation_csrf, "password": PASSWORD, "password_confirm": PASSWORD}, follow_redirects=False,
        )
        assert accepted_invitation.status_code == 303
        assert invitee.get(f"/projects/{project_id}").status_code == 200
        assert invitee.get(f"/projects/{workspace['project_ids'][1]}").status_code == 404
    with SessionLocal() as session:
        invited_field = session.scalar(select(User).where(User.email == invited_field_email))
        assert invited_field is not None and invited_field.active
        assert session.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == invited_field.id, ProjectMembership.project_id == project_id,
            ProjectMembership.role == "campo",
        )) is not None
        invited_field_id = invited_field.id

    invited_ph_email = "invited.ph@red.test"
    ph_invitation = client.post(
        "/admin/invitations",
        data={
            "csrf": csrf_for(client, "/admin/users"), "email": invited_ph_email,
            "full_name": "Administración PH sintética", "project_id": project_id,
            "role": "administracion_ph",
        },
        follow_redirects=False,
    )
    assert ph_invitation.status_code == 200
    ph_invitation_url = re.search(r'id="invite-link" readonly value="([^"]+)"', ph_invitation.text).group(1)
    ph_invitation_token = ph_invitation_url.rsplit("/", 1)[-1]
    with TestClient(app) as ph_user:
        ph_invitation_page = ph_user.get(ph_invitation_url)
        assert ph_invitation_page.status_code == 200
        ph_csrf = re.search(r'name="csrf" value="([^"]+)"', ph_invitation_page.text).group(1)
        accepted_ph_invitation = ph_user.post(
            f"/invitations/accept/{ph_invitation_token}",
            data={"csrf": ph_csrf, "password": PASSWORD, "password_confirm": PASSWORD}, follow_redirects=False,
        )
        assert accepted_ph_invitation.status_code == 303
        assert ph_user.get(f"/projects/{project_id}").status_code == 200
        assert ph_user.get(f"/projects/{workspace['project_ids'][1]}").status_code == 404
    with SessionLocal() as session:
        invited_ph = session.scalar(select(User).where(User.email == invited_ph_email))
        assert invited_ph is not None and invited_ph.active
        assert session.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == invited_ph.id, ProjectMembership.project_id == project_id,
            ProjectMembership.role == "administracion_ph",
        )) is not None

    def capture(code, title, values, actor="consultant@red.test", source_kind="declarado"):
        client.cookies.clear()
        sign_in(client, actor)
        path = f"/projects/{project_id}/records/new?form_code={code}"
        response = client.post(
            f"/projects/{project_id}/records/new",
            data={
                "csrf": csrf_for(client, path), "form_code": code, "record_title": title,
                "record_date": "2026-10-07", "source_kind": source_kind,
                "source_note": f"Captura sintética de prueba para {code}; no corresponde a datos reales.",
                **values, "action": "submit",
            },
            follow_redirects=False,
        )
        assert response.status_code == 303, re.search(r'<div class="notice error" role="alert">(.*?)</div>', response.text, re.S).group(1)
        record_id = response.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
        with SessionLocal() as session:
            record = session.get(FormRecord, record_id)
            assert record.status == "PENDING_REVIEW"
            assert record.project_id == project_id and record.form_code == code
        record_ids[code] = record_id
        return record_id

    def approve(code):
        client.cookies.clear()
        sign_in(client, "reviewer@red.test")
        record_id = record_ids[code]
        path = f"/records/{record_id}"
        response = client.post(
            f"/records/{record_id}/review",
            data=rendered_decision_data(client, f"/records/{record_id}/review", {"expected_version": record_version_for_review(record_id), "csrf": csrf_for(client, path), "decision": "VALIDATED",
                  "reason": "Fuente sintética revisada para validar el flujo de RED.",
                  **({"equipment_review_confirmed": "yes"} if code == "D-13" else {})}),
            follow_redirects=False,
        )
        assert response.status_code == 303, response.text
        with SessionLocal() as session:
            assert session.get(FormRecord, record_id).status == "VALIDATED"

    capture("D-01", "Unidad residencial sintética", {
        "D01-002": "Conjunto Sintético Bello", "D01-003": "Dirección de prueba 123",
        "D01-004": "Bello", "D01-007": "Administración de prueba",
        "D01-008": "admin@example.test", "D01-011": "100", "D01-013": "90",
        "D01-016": "Prospecto", "D01-017": invited_field_id,
        "D01-018": workspace["user_ids"]["consultant"], "D01-019": "Declarado",
    }, actor=invited_ph_email)
    approve("D-01")
    capture("D-02", "Condiciones actuales sintéticas", {
        "D02-001": "90", "D02-002": "3", "D02-004": ["Lunes", "Miércoles"],
        "D02-008": "Sin aprovechamiento reportado", "D02-010": "1",
        "D02-012": "No", "D02-014": "Sí — Administración PH sintética",
    }, actor=invited_ph_email)
    approve("D-02")

    capture("D-06", "Jornada de caracterización sintética", {
        "D06-004__value": "24", "D06-004__unit": "horas",
        "D06-006": "No", "D06-008": invited_field_id,
    }, actor=invited_field_email, source_kind="observado")
    approve("D-06")
    capture("D-13", "Báscula de prueba", {
        "D13-001": "BASC-SINT-01", "D13-002": "Báscula", "D13-004__value": "50", "D13-004__unit": "kg",
        "D13-006": "Operativo", "D13-007": "Verificación sintética inicial aprobada",
        "D13-009": "Decisión sintética de aplicabilidad; fuente 2026-10-09; memo MET-SINT-01.",
    }, actor=invited_field_email, source_kind="observado")
    approve("D-13")
    capture("D-07", "Pesaje de lote sintético", {
        "D07-001": record_ids["D-06"], "D07-003": record_ids["D-13"],
        "D07-004": "Recipiente de prueba 60 L", "D07-005": "0.375",
        "D07-006": "2.125", "D07-008": "Aprovechable",
    }, actor=invited_field_email, source_kind="medido")
    approve("D-07")
    capture("D-08", "Fracción de prueba sintética", {
        "D08-001": record_ids["D-07"], "D08-002": "Caracterización inicial",
        "D08-003": "Orgánicos", "D08-005": "1",
    }, actor=invited_field_email, source_kind="medido")
    approve("D-08")
    capture("Q-01", "Control QA de jornada sintética", {
        "Q01-001": record_ids["D-06"], "Q01-004": "Sí",
        "Q01-005": "Sin alerta", "Q01-008": "Aprobada",
    }, actor="consultant@red.test", source_kind="observado")
    approve("Q-01")

    with SessionLocal() as session:
        assert baseline_missing_forms(session, project_id) == []
    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    project_path = f"/projects/{project_id}"
    accepted = client.post(
        f"/projects/{project_id}/baseline",
        data={"csrf": csrf_for(client, project_path), "decision": "validada",
              "reference": "LB-SINTETICA-01", "reason": "Registros sintéticos revisados en flujo por roles."},
        follow_redirects=False,
    )
    assert accepted.status_code == 303, accepted.text
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        assert project.baseline_status == "validada"
        assert project.baseline_reference == "LB-SINTETICA-01"
        assert all(session.get(FormRecord, record_id).status == "VALIDATED" for record_id in record_ids.values())

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    pmirs_path = f"/projects/{project_id}/pmirs"

    def create_pmirs_item(item_type, fields):
        response = client.post(
            f"/projects/{project_id}/pmirs/items/new",
            data={"csrf": csrf_for(client, pmirs_path), "item_type": item_type,
                  "action": "submit", **fields},
            follow_redirects=False,
        )
        assert response.status_code == 303, response.text
        with SessionLocal() as session:
            return session.scalar(select(PMIRSItem).where(
                PMIRSItem.project_id == project_id, PMIRSItem.item_type == item_type,
            ).order_by(PMIRSItem.created_at.desc()))

    finding = create_pmirs_item("hallazgo", {
        "title": "Separación pendiente sintética",
        "description": "La muestra sintética indica mezcla en el punto común; requiere confirmar alcance en campo.",
        "topic": "Separación", "support_level": "C", "priority": "media",
        "priority_reason": "Atender antes de ampliar el muestreo de residuos.",
        "lifecycle_status": "abierto", "source_record_ids": [record_ids["D-01"]],
    })
    assert finding.code == "H-001" and finding.review_status == "PENDING_REVIEW"

    def approve_pmirs_item(item):
        client.cookies.clear()
        sign_in(client, "reviewer@red.test")
        response = client.post(
            f"/pmirs/items/{item.id}/review",
            data=rendered_decision_data(client, f"/pmirs/items/{item.id}/review", {"csrf": csrf_for(client, pmirs_path), "expected_version": item.version, "decision": "validar",
                  "reason": "Fuente y formulación sintéticas revisadas."}),
            follow_redirects=False,
        )
        assert response.status_code == 303, response.text
        with SessionLocal() as session:
            assert session.get(PMIRSItem, item.id).review_status == "VALIDATED"

    approve_pmirs_item(finding)
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    program = create_pmirs_item("programa", {
        "title": "Separación en la fuente", "description": "Programa sintético de mejora para validar el flujo.",
        "applies": "si", "applicability_reason": "El hallazgo sintético señala una oportunidad de mejora.",
        "objective": "Mejorar la separación observada en el punto común.",
        "scope": "Personal operativo y punto común de entrega.", "owner_role": "Administración PH",
        "program_status": "borrador", "finding_ids": [finding.id],
    })
    assert program.code == "PR-01" and program.review_status == "PENDING_REVIEW"
    approve_pmirs_item(program)

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    indicator = create_pmirs_item("indicador", {
        "title": "Jornadas de separación registradas", "description": "Indicador sintético para el seguimiento del programa.",
        "definition": "Cuenta jornadas registradas; no mide por sí sola la calidad de la separación.",
        "formula": "Número de jornadas registradas en el periodo", "unit": "número",
        "source_description": "Formulario D-06 validado en RED", "frequency": "Mensual",
        "report_owner": "Equipo operativo", "data_available": "no",
        "capture_method": "Registrar fecha, responsable y resultado de cada jornada.",
    })
    approve_pmirs_item(indicator)

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    action = create_pmirs_item("accion", {
        "title": "Realizar jornada de separación", "description": "Completar jornada y registrar asistencia y resultado.",
        "program_id": program.id, "owner": "Equipo operativo", "priority": "media",
        "start_date": "2026-10-10", "due_date": "2026-10-17",
        "completion_criteria": "Jornada registrada con acta y evidencia de cierre.",
        "indicator_id": indicator.id, "expected_evidence": "acta",
        "expected_evidence_detail": "Acta sintética de la jornada", "execution_status": "pendiente",
        "assignee_user_ids": [invited_field_id],
        "progress_pct": "0", "finding_ids": [finding.id],
    })
    approve_pmirs_item(action)

    client.cookies.clear()
    sign_in(client, invited_field_email)
    studio_path = pmirs_path
    assert "Realizar jornada de separación" in client.get(f"/projects/{project_id}").text
    studio_page = client.get(studio_path)
    assert 'name="submission_key" value=' in studio_page.text
    evidence = client.post(
        f"/pmirs/items/{action.id}/evidence",
        data={"csrf": csrf_for(client, studio_path)},
        files={"file": ("acta.txt", b"Acta sintetica de la jornada", "text/plain")},
        follow_redirects=False,
    )
    assert evidence.status_code == 303
    progress_key = secrets.token_urlsafe(32)
    progress_data = {"expected_version": pmirs_version_for_progress(action.id), 
        "csrf": csrf_for(client, studio_path), "submission_key": progress_key,
        "execution_status": "evidencia_cargada", "progress_pct": 80,
        "progress_note": "Acta sintética adjunta para revisión.",
    }
    progress = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", progress_data),
        follow_redirects=False,
    )
    assert progress.status_code == 303
    replay = client.post(
        f"/pmirs/items/{action.id}/progress", data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", progress_data), follow_redirects=False,
    )
    assert replay.status_code == 303 and "ya%20estaba%20guardado" in replay.headers["location"]
    changed_replay = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {**progress_data, "progress_note": "Intento de reutilizar la clave con otro contenido."}),
        follow_redirects=False,
    )
    assert changed_replay.status_code == 409
    with SessionLocal() as session:
        saved_progress = list(session.scalars(select(PMIRSItemRevision).where(
            PMIRSItemRevision.submission_key == progress_key,
        )))
        saved_audit = list(session.scalars(select(AuditEvent).where(
            AuditEvent.action == "pmirs_action_progress", AuditEvent.entity_id == action.id,
            AuditEvent.detail["progress_pct"].as_integer() == 80,
        )))
        assert len(saved_progress) == 1
        assert len(saved_audit) == 1
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        backup_data = json.loads(archive.read("database.json"))
        saved_backup_revision = next(
            row for row in backup_data["pmirs_item_revisions"] if row["submission_key"] == progress_key
        )
        assert backup_data["schema_version"] == 15
        assert saved_backup_revision["item_id"] == action.id
    submitted = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "en_validacion",
              "progress_pct": 100, "progress_note": "La jornada se completó según el criterio de prueba."}),
        follow_redirects=False,
    )
    assert submitted.status_code == 303

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    validated = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "validada",
              "progress_pct": 100, "progress_note": "Evidencia sintética revisada; cumple el criterio de prueba."}),
        follow_redirects=False,
    )
    assert validated.status_code == 303

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    closed = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "cerrada",
              "progress_pct": 100, "progress_note": "Ciclo sintético completado.",
              "close_reason": "Cierre de prueba sintética con QA aprobado."}),
        follow_redirects=False,
    )
    assert closed.status_code == 303

    version = client.post(
        f"/projects/{project_id}/pmirs/versions",
        data={"csrf": csrf_for(client, studio_path), "change_reason": "inicial",
              "change_summary": "Primera versión PMIRS sintética posterior a Línea Base."},
        follow_redirects=False,
    )
    assert version.status_code == 303
    with SessionLocal() as session:
        assert session.get(PMIRSItem, finding.id).review_status == "VALIDATED"
        assert session.get(PMIRSItem, program.id).review_status == "VALIDATED"
        assert session.get(PMIRSItem, indicator.id).review_status == "VALIDATED"
        action_result = session.get(PMIRSItem, action.id)
        assert action_result.review_status == "VALIDATED"
        assert action_result.data["execution_status"] == "cerrada"
        assert session.get(PMIRSItem, program.id).data["finding_ids"] == [finding.id]
        created_version = session.scalar(select(PMIRSVersion).where(PMIRSVersion.project_id == project_id))
        assert created_version.version_label == "v0.1"
        assert len(created_version.snapshot["items"]) == 4
        version_id = created_version.id

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    submitted_for_internal_review = client.post(
        f"/pmirs/versions/{version_id}/status",
        data={"csrf": csrf_for(client, pmirs_path), "status": "revision_interna",
              "status_note": "El borrador sintético se envía a revisión documental."},
        follow_redirects=False,
    )
    assert submitted_for_internal_review.status_code == 303

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    approved_for_internal_use = client.post(
        f"/pmirs/versions/{version_id}/status",
        data={"csrf": csrf_for(client, pmirs_path), "status": "aprobada_interna",
              "status_note": "Revisión del documento sintético completada."},
        follow_redirects=False,
    )
    assert approved_for_internal_use.status_code == 303
    signed = client.post(
        f"/pmirs/versions/{version_id}/sign",
        data={"csrf": csrf_for(client, pmirs_path), "confirm_signature": "yes",
              "password": PASSWORD,
              "signature_strokes": json.dumps([[[.08, .7], [.32, .35], [.58, .68], [.9, .28]]])},
        follow_redirects=False,
    )
    assert signed.status_code == 303

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    post_signature_item = create_pmirs_item("hallazgo", {
        "title": "Hallazgo agregado después de la firma",
        "description": "Registro sintético posterior a la captura PMIRS firmada.",
        "topic": "Infraestructura", "support_level": "C", "priority": "baja",
        "priority_reason": "Ejemplo de diferencia posterior a la captura.",
        "lifecycle_status": "abierto", "source_record_ids": [record_ids["D-01"]],
    })
    assert post_signature_item.review_status == "PENDING_REVIEW"

    signed_html = client.get(f"/pmirs/versions/{version_id}/export")
    assert signed_html.status_code == 200
    assert "Separación en la fuente" in signed_html.text
    assert "Constancias de lectura y recepción" in signed_html.text
    assert "Revisor" in signed_html.text
    assert "Esta captura difiere del expediente actual" in signed_html.text
    assert "1 objeto actual no está incluido en la captura" in signed_html.text
    signed_pdf = client.get(f"/pmirs/versions/{version_id}/export.pdf")
    assert signed_pdf.status_code == 200
    signed_pdf_text = " ".join(" ".join(
        page.extract_text() or "" for page in PdfReader(io.BytesIO(signed_pdf.content)).pages
    ).split())
    assert "Separación en la fuente" in signed_pdf_text
    assert "Constancias de lectura y recepción" in signed_pdf_text
    assert "Revisor" in signed_pdf_text
    assert "Esta captura difiere del expediente actual" in signed_pdf_text
    assert "1 objeto actual no está incluido en la captura" in signed_pdf_text
    signed_pdf_pages = PdfReader(io.BytesIO(signed_pdf.content)).pages
    assert "Programas" not in (signed_pdf_pages[0].extract_text() or "")
    assert "Programas" in (signed_pdf_pages[1].extract_text() or "")
    assert "PR-01" in (signed_pdf_pages[1].extract_text() or "")
    signed_pdf_drawing = "\n".join(
        page.get_contents().get_data().decode("latin1") for page in signed_pdf_pages
    )
    assert re.search(
        r"n\s+-?[\d.]+\s+-?[\d.]+\s+m"
        r"(?:\s+-?[\d.]+\s+-?[\d.]+\s+l){3}\s*\nS",
        signed_pdf_drawing,
    ), "El PDF debe dibujar el trazo de la firma como ruta vectorial."
    signed_docx = client.get(f"/pmirs/versions/{version_id}/export.docx")
    assert signed_docx.status_code == 200
    with zipfile.ZipFile(io.BytesIO(signed_docx.content)) as archive:
        assert "word/media/image1.png" in archive.namelist()
        signed_docx_text = archive.read("word/document.xml").decode("utf-8")
        assert "Separación en la fuente" in signed_docx_text
        assert "Constancias de lectura y recepción" in signed_docx_text
        assert "Revisor" in signed_docx_text
        assert "Esta captura difiere del expediente actual" in signed_docx_text
        assert "1 objeto actual no está incluido en la captura" in signed_docx_text
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        docx_root = ET.fromstring(archive.read("word/document.xml"))
        grid_widths = [int(node.attrib["{http://schemas.openxmlformats.org/wordprocessingml/2006/main}w"])
                       for node in docx_root.find(".//w:tbl/w:tblGrid", ns)]
        assert grid_widths == [1900, 2780, 1800, 2880]

    with SessionLocal() as session:
        signature = session.scalar(select(PMIRSSignature).where(PMIRSSignature.version_id == version_id))
        assert signature is not None
        assert signature.signer_user_id == workspace["user_ids"]["reviewer"]
        assert signature.document_sha256
        assert session.get(PMIRSVersion, version_id).status == "aprobada_interna"
        export_formats = set(session.scalars(select(AuditEvent.detail["format"].as_string()).where(
            AuditEvent.action == "pmirs_version_exported", AuditEvent.entity_id == version_id,
        )))
        assert export_formats >= {"html", "pdf", "docx"}
        final_archive, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(final_archive)) as archive:
        backup_data = json.loads(archive.read("database.json"))
        assert any(row["version_id"] == version_id for row in backup_data["pmirs_signatures"])

    recovery_database = tmp_path / "workflow-recovery.sqlite3"
    recovery_storage = tmp_path / "workflow-recovery-private"
    recovery_backup = tmp_path / "workflow-recovery.zip"
    recovery_backup.write_bytes(final_archive)
    recovery_env = {
        **os.environ,
        "APP_ENV": "local",
        "INSTANCE_DIR": str(tmp_path / "workflow-recovery-instance"),
        "DATABASE_URL": f"sqlite:///{recovery_database}",
        "RED_STORAGE_ROOT": str(recovery_storage),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-cli-recovery-session-secret-2026",
        "SESSION_HTTPS_ONLY": "false",
        "TRUSTED_HOSTS": "localhost,127.0.0.1,testserver",
    }
    migrate_recovery_target = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=PROJECT_DIR, env=recovery_env, check=False,
        capture_output=True, text=True, timeout=60,
    )
    assert migrate_recovery_target.returncode == 0, migrate_recovery_target.stdout + migrate_recovery_target.stderr
    verified_backup = subprocess.run(
        [sys.executable, "-m", "app.cli", "verify-backup", str(recovery_backup)],
        cwd=PROJECT_DIR, env=recovery_env, check=False,
        capture_output=True, text=True, timeout=60,
    )
    assert verified_backup.returncode == 0, verified_backup.stdout + verified_backup.stderr
    assert "Respaldo íntegro" in verified_backup.stdout
    recovery_password = "Synthetic-Workflow-Recovery-2026"
    restored = subprocess.run(
        [
            sys.executable, "-m", "app.cli", "restore-backup", str(recovery_backup),
            "--admin-email", "recovery@red.test", "--admin-name", "Administración de recuperación",
        ],
        cwd=PROJECT_DIR, env=recovery_env,
        input=f"{recovery_password}\n{recovery_password}\n",
        check=False, capture_output=True, text=True, timeout=120,
    )
    assert restored.returncode == 0, restored.stdout + restored.stderr
    assert "Respaldo GREENATICS RED restaurado en el destino vacío." in restored.stdout
    assert "Cuenta administradora habilitada: recovery@red.test" in restored.stdout
    assert recovery_password not in restored.stdout + restored.stderr

    recovery_engine = create_engine(
        f"sqlite:///{recovery_database}", connect_args={"check_same_thread": False},
    )
    recovery_sessions = sessionmaker(bind=recovery_engine, autoflush=False, expire_on_commit=False)
    with recovery_sessions() as recovery:
        restored_manifest = backups.verify_backup_archive(recovery_backup.read_bytes())
        assert restored_manifest["counts"]["projects"] == 4
        assert restored_manifest["counts"]["pmirs_signatures"] == 1
        restored_project = recovery.get(Project, project_id)
        restored_version = recovery.get(PMIRSVersion, version_id)
        restored_signature = recovery.scalar(select(PMIRSSignature).where(
            PMIRSSignature.version_id == version_id,
        ))
        assert restored_signature is not None
        assert restored_signature.document_sha256 == pmirs_document_sha256(restored_version)
        restored_items = list(recovery.scalars(select(PMIRSItem).where(
            PMIRSItem.project_id == project_id,
        )))
        restored_currentness = pmirs_version_currentness(restored_version, restored_project, restored_items)
        assert restored_currentness["items_not_in_capture"] == 1
        restored_evidence = list(recovery.scalars(select(EvidenceFile).where(
            EvidenceFile.project_id == project_id,
        )))
        assert len(restored_evidence) == 1
        evidence_path = recovery_storage / "evidence" / restored_evidence[0].storage_name
        assert hashlib.sha256(evidence_path.read_bytes()).hexdigest() == restored_evidence[0].sha256
        assert recovery.get(PMIRSItem, post_signature_item.id).review_status == "PENDING_REVIEW"
        restored_export_events = list(recovery.scalars(select(AuditEvent).where(
            AuditEvent.action == "pmirs_version_exported", AuditEvent.entity_id == version_id,
        )))
        assert {event.detail["format"] for event in restored_export_events} >= {"html", "pdf", "docx"}
        assert recovery.scalar(select(AuditEvent).where(AuditEvent.action == "backup_restored")) is not None
        active_users = list(recovery.scalars(select(User).where(User.active.is_(True))))
        assert [user.email for user in active_users] == ["recovery@red.test"]
    recovery_engine.dispose()


def test_baseline_gate_and_invalidation_on_support_edit(client, workspace):
    project_id = workspace["project_ids"][0]
    support_codes = ["D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        assert baseline_missing_forms(session, project_id) == support_codes
        for code in support_codes:
            payload = ({
                "D02-001": "90", "D02-002": "3", "D02-004": "Lunes\nMiércoles",
                "D02-008": "Sin aprovechamiento reportado en ejercicio sintético",
                "D02-010": "1", "D02-012": "No", "D02-014": "Sí — Administración PH sintética",
            } if code == "D-02" else {"synthetic": "respuesta de prueba"})
            session.add(FormRecord(
                project_id=project_id, form_code=code, title=f"{code} sintético", status="VALIDATED",
                record_date="2026-10-07", source_kind="declarado", source_note="Fuente sintética de prueba",
                payload=payload, created_by=workspace["user_ids"]["consultant"],
                updated_by=workspace["user_ids"]["consultant"], reviewed_by=workspace["user_ids"]["reviewer"],
            ))
        bind_synthetic_fraction_source(session, project_id)
        session.commit()
        records = list(session.scalars(select(FormRecord).where(FormRecord.project_id == project_id)))
        target = next(item for item in records if item.form_code == "D-01")
        record_id = target.id
        assert baseline_missing_forms(session, project_id) == []

    sign_in(client, "reviewer@red.test")
    csrf = csrf_for(client, f"/projects/{project_id}")
    accepted = client.post(
        f"/projects/{project_id}/baseline",
        data={"csrf": csrf, "decision": "validada", "reference": "PMIRS-sintetico-v1", "reason": "Fuentes sintéticas revisadas"},
        follow_redirects=False,
    )
    assert accepted.status_code == 303
    with SessionLocal() as session:
        assert session.get(Project, project_id).baseline_status == "validada"
        baseline_item = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="H-001", title="Hallazgo sintético",
            description="Hallazgo respaldado para verificar invalidación.", data={"source_record_ids": []},
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"], reviewed_by=workspace["user_ids"]["reviewer"],
        )
        session.add(baseline_item)
        session.flush()
        session.add(PMIRSVersion(
            project_id=project_id, version_label="v0.1", status="aprobada_interna",
            change_summary="Captura sintética aprobada para prueba.", change_reason="inicial",
            snapshot={"items": [{"id": baseline_item.id, "review_status": "VALIDATED"}]},
            baseline_reference="PMIRS-sintetico-v1", created_by=workspace["user_ids"]["consultant"],
        ))
        baseline_item_id = baseline_item.id
        session.commit()

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    csrf = csrf_for(client, f"/records/{record_id}/edit")
    update_data = {
        "csrf": csrf,
        "action": "draft",
        "record_title": "Ficha sintética actualizada",
        "record_date": "2026-10-07",
        "source_kind": "documental",
        "source_note": "Nueva fuente sintética",
    }
    update_data.update({field["id"]: "Dato actualizado" for field in next(item for item in FORM_CATALOG["forms"] if item["code"] == "D-01")["fields"]})
    update_data["D01-017"] = workspace["user_ids"]["field"]
    update_data["D01-018"] = workspace["user_ids"]["consultant"]
    response = client.post(f"/records/{record_id}/edit", data=update_data, follow_redirects=False)
    assert response.status_code == 303
    with SessionLocal() as session:
        assert session.get(Project, project_id).baseline_status == "no_iniciada"
        changed = session.get(FormRecord, record_id)
        assert changed.version == 2
        assert changed.status == "RAW"
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == "baseline_invalidated")) is not None
        invalidated_item = session.get(PMIRSItem, baseline_item_id)
        assert invalidated_item.review_status == "CORRECTION_REQUESTED"
        assert invalidated_item.version == 2
        assert session.scalar(select(PMIRSItemRevision).where(
            PMIRSItemRevision.item_id == baseline_item_id, PMIRSItemRevision.revision == 2,
        )) is not None
        invalidated_version = session.scalar(select(PMIRSVersion).where(PMIRSVersion.project_id == project_id))
        assert invalidated_version.status == "obsoleta"
        assert invalidated_version.snapshot["items"][0]["review_status"] == "VALIDATED"


def test_baseline_gate_requires_latest_support_record_to_be_validated(client, workspace):
    project_id = workspace["project_ids"][0]
    now = now_utc()
    with SessionLocal() as session:
        for code in ["D-02", "D-06", "D-07", "D-08", "Q-01"]:
            payload = ({
                "D02-001": "90", "D02-002": "3", "D02-004": "Lunes\nMiércoles",
                "D02-008": "Sin aprovechamiento reportado en ejercicio sintético",
                "D02-010": "1", "D02-012": "No", "D02-014": "Sí — Administración PH sintética",
            } if code == "D-02" else {"synthetic": "respuesta vigente"})
            session.add(FormRecord(
                project_id=project_id, form_code=code, title=f"{code} sintético", status="VALIDATED",
                record_date="2026-10-10", source_kind="observado", source_note="Fuente sintética revisada",
                payload=payload, created_by=workspace["user_ids"]["consultant"],
                updated_by=workspace["user_ids"]["consultant"], reviewed_by=workspace["user_ids"]["reviewer"],
                created_at=now - timedelta(days=1), updated_at=now - timedelta(days=1),
            ))
        session.add(FormRecord(
            project_id=project_id, form_code="D-01", title="D-01 validado anterior", status="VALIDATED",
            record_date="2026-10-09", source_kind="declarado", source_note="Fuente sintética anterior",
            payload={"synthetic": "respuesta anterior"}, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"], reviewed_by=workspace["user_ids"]["reviewer"],
            created_at=now - timedelta(days=2), updated_at=now - timedelta(days=2),
        ))
        latest_d01 = FormRecord(
            project_id=project_id, form_code="D-01", title="D-01 nuevo pendiente", status="PENDING_REVIEW",
            record_date="2026-10-10", source_kind="declarado", source_note="Fuente sintética más reciente",
            payload={"synthetic": "respuesta nueva"}, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"], created_at=now, updated_at=now,
        )
        session.add(latest_d01)
        bind_synthetic_fraction_source(session, project_id)
        session.commit()
        latest_id = latest_d01.id
        assert baseline_missing_forms(session, project_id) == ["D-01"]

    sign_in(client, "reviewer@red.test")
    project_path = f"/projects/{project_id}"
    blocked = client.post(
        f"/projects/{project_id}/baseline",
        data={"csrf": csrf_for(client, project_path), "decision": "validada",
              "reference": "LB-SINTETICA-02", "reason": "D-01 más reciente sigue pendiente de QA/QC."},
        follow_redirects=False,
    )
    assert blocked.status_code == 422 and "Falta revisar como válido: D-01" in blocked.text
    with SessionLocal() as session:
        latest_d01 = session.get(FormRecord, latest_id)
        latest_d01.status = "VALIDATED"
        session.commit()
        assert baseline_missing_forms(session, project_id) == []

    accepted = client.post(
        f"/projects/{project_id}/baseline",
        data={"csrf": csrf_for(client, project_path), "decision": "validada",
              "reference": "LB-SINTETICA-02", "reason": "Se revisaron las fuentes sintéticas vigentes."},
        follow_redirects=False,
    )
    assert accepted.status_code == 303
    with SessionLocal() as session:
        assert session.get(Project, project_id).baseline_status == "validada"


def test_d13_change_reopens_baseline_when_validated_pesaje_depends_on_equipment(client, workspace):
    project_id = workspace["project_ids"][0]
    consultant_id = workspace["user_ids"]["consultant"]
    reviewer_id = workspace["user_ids"]["reviewer"]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.baseline_status = "validada"
        project.baseline_reference = "LB sintética con pesaje validado"
        project.baseline_note = "Fuentes sintéticas revisadas."
        project.baseline_reviewed_by = reviewer_id
        project.baseline_reviewed_at = now_utc()
        equipment = FormRecord(
            project_id=project_id, form_code="D-13", title="Báscula sintética validada",
            status="VALIDATED", source_note="Inspección sintética aprobada.",
            payload={"D13-001": "BAS-TEST-01", "D13-006": "Operativo"},
            created_by=consultant_id, updated_by=reviewer_id, reviewed_by=reviewer_id,
            reviewed_at=now_utc(),
        )
        session.add(equipment)
        session.flush()
        lot = FormRecord(
            project_id=project_id, form_code="D-07", title="Pesaje dependiente validado",
            status="VALIDATED", source_note="Pesaje sintético aceptado.",
            payload={"D07-001": "JORNADA-SINTETICA-01", "D07-003": equipment.id, "D07-007": "12"},
            created_by=consultant_id, updated_by=reviewer_id, reviewed_by=reviewer_id,
            reviewed_at=now_utc(),
        )
        item = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="HAL-D13-01",
            title="Hallazgo aprobado con pesaje", description="Depende del equipo D-13 sintético.",
            data={}, review_status="VALIDATED", version=1, created_by=consultant_id,
            updated_by=reviewer_id, reviewed_by=reviewer_id,
        )
        version = PMIRSVersion(
            project_id=project_id, version_label="v0.1", status="aprobada_interna",
            change_summary="Versión con pesaje sintético.", change_reason="Prueba de vigencia de fuente.",
            snapshot={}, baseline_reference=project.baseline_reference, created_by=consultant_id,
        )
        session.add_all([lot, item, version])
        session.flush()
        equipment_id, lot_id, item_id, version_id = equipment.id, lot.id, item.id, version.id
        session.commit()

    sign_in(client, "consultant@red.test")
    edit_path = f"/records/{equipment_id}/edit"
    edit_page = client.get(edit_path)
    assert edit_page.status_code == 200
    key = re.search(r'name="submission_key" value="([^"]+)"', edit_page.text)
    assert key
    changed = client.post(edit_path, data={
        "csrf": csrf_for(client, edit_path), "submission_key": key.group(1),
        "action": "draft", "record_title": "Báscula con observación sintética",
        "record_date": "2026-10-09", "source_kind": "observado",
        "source_note": "Se actualiza la condición del equipo para la prueba.",
        "D13-001": "BAS-TEST-01", "D13-002": "Báscula", "D13-006": "Observación",
    }, follow_redirects=False)
    assert changed.status_code == 303, changed.text

    with SessionLocal() as session:
        assert session.get(Project, project_id).baseline_status == "no_iniciada"
        updated_lot = session.get(FormRecord, lot_id)
        assert updated_lot.status == "CORRECTION_REQUESTED"
        assert updated_lot.version == 2
        assert session.scalar(select(FormRevision).where(
            FormRevision.record_id == lot_id, FormRevision.revision == 2,
        )) is not None
        assert session.get(PMIRSItem, item_id).review_status == "CORRECTION_REQUESTED"
        assert session.get(PMIRSItem, item_id).version == 2
        assert session.get(PMIRSVersion, version_id).status == "obsoleta"
        invalidation = session.scalar(select(AuditEvent).where(
            AuditEvent.action == "baseline_invalidated", AuditEvent.project_id == project_id,
        ))
        assert invalidation is not None
        assert invalidation.detail["source"] == "cambio de equipo D-13"
        assert invalidation.detail["equipment_record_id"] == equipment_id


def test_pmirs_create_links_name_the_object_for_assistive_technology(client, workspace):
    project_id = workspace["project_ids"][0]
    sign_in(client, "admin@red.test")

    page = client.get(f"/projects/{project_id}/pmirs")

    assert page.status_code == 200
    for item_type, label in (
        ("hallazgo", "hallazgo"),
        ("programa", "programa"),
        ("indicador", "indicador"),
        ("accion", "acción"),
    ):
        assert (
            f'aria-label="Agregar {label}" '
            f'href="/projects/{project_id}/pmirs/new?item_type={item_type}">Agregar</a>'
        ) in page.text


def test_pmirs_roles_and_project_isolation(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    with SessionLocal() as session:
        # This test covers role and project scope; the dedicated baseline-gate
        # test verifies that execution remains hidden while the baseline is pending.
        session.get(Project, project_id).baseline_status = "validada"
        own_item = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-001", title="Acción sintética",
            description="Acción para revisar permisos de PMIRS.", data={"execution_status": "pendiente", "assignee_user_ids": [workspace["user_ids"]["field"]]},
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
        )
        other_item = PMIRSItem(
            project_id=other_project_id, item_type="accion", code="A-001", title="Acción de otro proyecto",
            description="Acción sintética aislada.", data={}, review_status="VALIDATED", version=1,
            created_by=workspace["user_ids"]["admin"], updated_by=workspace["user_ids"]["admin"],
        )
        own_finding = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="H-001", title="Hallazgo sintético",
            description="Hallazgo para verificar que el rol de campo no adjunte evidencia aquí.",
            data={}, review_status="PENDING_REVIEW", version=1,
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        )
        session.add_all([own_item, other_item, own_finding])
        session.commit()
        own_item_id, other_item_id, own_finding_id = own_item.id, other_item.id, own_finding.id

    sign_in(client, "field@red.test")
    field_view = client.get(f"/projects/{project_id}/pmirs")
    assert field_view.status_code == 200
    assert 'option value="en_proceso"' in field_view.text
    assert 'option value="validada"' not in field_view.text
    assert 'option value="cerrada"' not in field_view.text
    assert f'action="/pmirs/items/{own_item_id}/evidence"' in field_view.text
    assert f'action="/pmirs/items/{own_finding_id}/evidence"' not in field_view.text
    assert client.get(f"/projects/{project_id}/pmirs/new?item_type=hallazgo").status_code == 403
    assert client.get(f"/pmirs/items/{other_item_id}/edit").status_code == 404
    assert client.get(f"/pmirs/items/{own_item_id}/edit").status_code == 403
    field_csrf = csrf_for(client, f"/projects/{project_id}/pmirs")
    forbidden_evidence = client.post(
        f"/pmirs/items/{own_finding_id}/evidence", data={"csrf": field_csrf},
        files={"file": ("evidencia.txt", b"evidencia sintetica", "text/plain")},
    )
    assert forbidden_evidence.status_code == 403
    with SessionLocal() as session:
        assert session.scalar(select(EvidenceFile).where(EvidenceFile.pmirs_item_id == own_finding_id)) is None

    client.cookies.clear()
    sign_in(client, "reader@red.test")
    assert client.get(f"/projects/{project_id}/pmirs").status_code == 200
    assert client.get(f"/projects/{project_id}/pmirs/new?item_type=hallazgo").status_code == 403


@pytest.mark.parametrize("scope_index", range(4), ids=["parque-alto", "tulipanes", "majagua", "trigales"])
def test_each_bello_project_is_isolated_from_the_other_three(client, workspace, scope_index):
    project_ids = workspace["project_ids"]
    scoped_project_id = project_ids[scope_index]
    with SessionLocal() as session:
        scoped_user = User(
            email="four-project-scope@red.test", full_name="Consultoría de una copropiedad",
            password_hash=hash_password(PASSWORD),
        )
        session.add(scoped_user)
        session.flush()
        session.add(ProjectMembership(project_id=scoped_project_id, user_id=scoped_user.id, role="consultor"))

        resources = []
        for index, project_id in enumerate(project_ids):
            marker = f"UNIDAD-PRIVADA-{index + 1}"
            record = FormRecord(
                project_id=project_id, form_code="D-01", title=f"Identificación sintética {marker}",
                status="VALIDATED", payload={"D01-001": marker}, created_by=workspace["user_ids"]["admin"],
                updated_by=workspace["user_ids"]["admin"],
            )
            item = PMIRSItem(
                project_id=project_id, item_type="hallazgo", code=f"H-SCOPE-{index + 1}",
                title=f"Hallazgo sintético {marker}", description="Alcance por copropiedad.",
                data={}, review_status="VALIDATED", version=1,
                created_by=workspace["user_ids"]["admin"], updated_by=workspace["user_ids"]["admin"],
            )
            version = PMIRSVersion(
                project_id=project_id, version_label="v0.1", status="aprobada_interna",
                change_summary=f"Versión sintética {marker}", change_reason="inicial",
                snapshot={"project": {"name": marker}, "baseline": {"review_note": ""}, "items": []},
                created_by=workspace["user_ids"]["admin"],
            )
            storage_name = f"four-project-scope-{index + 1}.txt"
            content = f"evidencia privada {marker}".encode("utf-8")
            evidence = EvidenceFile(
                project_id=project_id, record_id=record.id, pmirs_item_id=None, field_id="D01-001",
                original_name=f"soporte-{index + 1}.txt", storage_name=storage_name,
                media_type="text/plain", size_bytes=len(content), sha256=hashlib.sha256(content).hexdigest(),
                created_by=workspace["user_ids"]["admin"],
            )
            session.add_all([record, item, version, evidence])
            resources.append((record, item, version, evidence, storage_name, content, marker))
        session.commit()
        scoped_user_email = scoped_user.email
        resource_ids = [
            (record.id, item.id, version.id, evidence.id, storage_name, content, marker)
            for record, item, version, evidence, storage_name, content, marker in resources
        ]

    for _record_id, _item_id, _version_id, _evidence_id, storage_name, content, _marker in resource_ids:
        app_main.storage.put_bytes(f"evidence/{storage_name}", content, "text/plain")

    sign_in(client, scoped_user_email)
    own_record_id, own_item_id, own_version_id, own_evidence_id, _own_name, own_content, own_marker = resource_ids[scope_index]
    own_project_page = client.get(f"/projects/{scoped_project_id}")
    assert own_project_page.status_code == 200
    assert own_marker in own_project_page.text
    own_pmirs = client.get(f"/projects/{scoped_project_id}/pmirs")
    assert own_pmirs.status_code == 200
    assert own_marker in own_pmirs.text
    assert client.get(f"/projects/{scoped_project_id}/records/export.csv").status_code == 200
    assert client.get(f"/projects/{scoped_project_id}/records/export.xlsx").status_code == 200
    own_record = client.get(f"/records/{own_record_id}")
    assert own_record.status_code == 200
    assert own_marker in own_record.text
    assert client.get(f"/records/{own_record_id}/export").status_code == 200
    assert client.get(f"/records/{own_record_id}/export.pdf").status_code == 200
    assert client.get(f"/records/{own_record_id}/export.docx").status_code == 200
    assert client.get(f"/evidence/{own_evidence_id}").content == own_content
    assert client.get(f"/pmirs/versions/{own_version_id}/export").status_code == 200
    assert client.get(f"/pmirs/versions/{own_version_id}/export.pdf").status_code == 200
    assert client.get(f"/pmirs/versions/{own_version_id}/export.docx").status_code == 200

    for index, project_id in enumerate(project_ids):
        if project_id == scoped_project_id:
            continue
        record_id, item_id, version_id, evidence_id, _name, _content, foreign_marker = resource_ids[index]
        assert client.get(f"/projects/{project_id}").status_code == 404
        assert client.get(f"/projects/{project_id}/pmirs").status_code == 404
        assert client.get(f"/projects/{project_id}/records/new?form_code=D-01").status_code == 404
        assert client.get(f"/projects/{project_id}/records/export.csv").status_code == 404
        assert client.get(f"/projects/{project_id}/records/export.xlsx").status_code == 404
        assert client.get(f"/records/{record_id}").status_code == 404
        assert client.get(f"/records/{record_id}/export").status_code == 404
        assert client.get(f"/records/{record_id}/export.pdf").status_code == 404
        assert client.get(f"/records/{record_id}/export.docx").status_code == 404
        assert client.get(f"/pmirs/items/{item_id}/edit").status_code == 404
        assert client.get(f"/pmirs/versions/{version_id}/export").status_code == 404
        assert client.get(f"/pmirs/versions/{version_id}/export.pdf").status_code == 404
        assert client.get(f"/pmirs/versions/{version_id}/export.docx").status_code == 404
        assert client.get(f"/evidence/{evidence_id}").status_code == 404
        assert foreign_marker not in own_project_page.text
        assert foreign_marker not in own_pmirs.text


def test_platform_admin_can_work_across_all_four_projects_but_project_users_cannot_manage_platform(
    client, workspace,
):
    project_ids = workspace["project_ids"]
    admin_id = workspace["user_ids"]["admin"]
    markers = [f"ADMIN-VIEW-UNIDAD-{index + 1}" for index in range(len(project_ids))]
    with SessionLocal() as session:
        for project_id, marker in zip(project_ids, markers, strict=True):
            session.add(FormRecord(
                project_id=project_id,
                form_code="D-01",
                title=f"Registro sintético {marker}",
                status="DRAFT",
                payload={"D01-001": marker},
                created_by=admin_id,
                updated_by=admin_id,
            ))
        session.commit()

    sign_in(client, "admin@red.test")
    for project_id, marker in zip(project_ids, markers, strict=True):
        project_page = client.get(f"/projects/{project_id}")
        assert project_page.status_code == 200
        assert marker in project_page.text
        records_export = client.get(f"/projects/{project_id}/records/export.csv")
        assert records_export.status_code == 200
        assert marker in records_export.text
    for admin_path in ("/admin/users", "/admin/privacy", "/admin/projects/new"):
        assert client.get(admin_path).status_code == 200

    for email in ("field@red.test", "reviewer@red.test", "consultant@red.test", "reader@red.test"):
        sign_in(client, email)
        for admin_path in ("/admin/users", "/admin/privacy", "/admin/projects/new"):
            assert client.get(admin_path).status_code == 403, f"{email} abrió {admin_path}."


PROJECT_ROLE_SCOPE_CASES = [
    (project_index, role)
    for role in ("consultor", "campo", "administracion_ph", "revisor", "lector")
    for project_index in range(4)
]


@pytest.mark.parametrize(
    ("scope_index", "role"),
    PROJECT_ROLE_SCOPE_CASES,
    ids=[f"{role}-project-{index + 1}" for index, role in PROJECT_ROLE_SCOPE_CASES],
)
def test_each_red_role_has_only_its_project_scope_and_form_permissions(client, workspace, scope_index, role):
    project_ids = workspace["project_ids"]
    scoped_project_id = project_ids[scope_index]
    scoped_user = User(
        email=f"scope-{role}-{scope_index}@red.test", full_name=f"Cuenta sintética {role}",
        password_hash=hash_password(PASSWORD),
    )
    with SessionLocal() as session:
        session.add(scoped_user)
        session.flush()
        session.add(ProjectMembership(project_id=scoped_project_id, user_id=scoped_user.id, role=role))
        session.commit()
        email = scoped_user.email

    sign_in(client, email)
    assert client.get(f"/projects/{scoped_project_id}").status_code == 200
    assert client.get(f"/projects/{scoped_project_id}/pmirs").status_code == 200
    for index, project_id in enumerate(project_ids):
        if index == scope_index:
            continue
        assert client.get(f"/projects/{project_id}").status_code == 404
        assert client.get(f"/projects/{project_id}/pmirs").status_code == 404
        assert client.get(f"/projects/{project_id}/records/new?form_code=D-01").status_code == 404
        assert client.get(f"/projects/{project_id}/records/new?form_code=P-12").status_code == 404

    allowed_forms = {
        "consultor": {"D-01", "D-02", "D-06"},
        "campo": {"D-06"},
        "administracion_ph": {"D-01", "D-02"},
        "revisor": set(),
        "lector": set(),
    }[role]
    for form_code in ("D-01", "D-02", "D-06"):
        expected_status = 200 if form_code in allowed_forms else 403
        assert client.get(
            f"/projects/{scoped_project_id}/records/new?form_code={form_code}"
        ).status_code == expected_status, f"Permiso inesperado para {role} en {form_code}."

    p12_route = client.get(
        f"/projects/{scoped_project_id}/records/new?form_code=P-12", follow_redirects=False,
    )
    assert p12_route.status_code == 303
    assert p12_route.headers["location"] == f"/projects/{scoped_project_id}/pmirs#versions-heading"

    expected_pmirs_create = 200 if role == "consultor" else 403
    assert client.get(
        f"/projects/{scoped_project_id}/pmirs/new?item_type=hallazgo"
    ).status_code == expected_pmirs_create
    export_status = 200 if role in {"consultor", "administracion_ph", "revisor"} else 403
    assert client.get(f"/projects/{scoped_project_id}/records/export.csv").status_code == export_status


def test_pmirs_action_assignment_rejects_non_field_and_cross_project_users(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    with SessionLocal() as session:
        remote_field = User(
            email="remote-field@red.test", full_name="Operario de otro conjunto",
            password_hash=hash_password(PASSWORD),
        )
        session.add(remote_field)
        session.flush()
        session.add(ProjectMembership(project_id=other_project_id, user_id=remote_field.id, role="campo"))
        remote_field_id = remote_field.id
        session.commit()

    sign_in(client, "consultant@red.test")
    path = f"/projects/{project_id}/pmirs/items/new"
    csrf = csrf_for(client, f"/projects/{project_id}/pmirs")
    for assignee_id in [workspace["user_ids"]["consultant"], remote_field_id]:
        response = client.post(path, data={
            "csrf": csrf, "item_type": "accion", "action": "draft",
            "title": "Acción de asignación sintética", "description": "Validación del límite de asignación.",
            "assignee_user_ids": [assignee_id],
        })
        assert response.status_code == 422
        assert "solo admite operarios activos con perfil de campo" in response.text


def test_pmirs_field_progress_requires_current_baseline_in_ui_and_server(client, workspace):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        action = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-DEMO-01", title="Acción sintética asignada",
            description="Tarea de prueba para verificar el bloqueo de seguimiento antes de la Línea Base.",
            data={"execution_status": "pendiente", "progress_pct": 0,
                  "assignee_user_ids": [workspace["user_ids"]["field"]]},
            review_status="VALIDATED", version=1,
            created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
            reviewed_by=workspace["user_ids"]["reviewer"],
        )
        session.add(action)
        session.flush()
        session.add(EvidenceFile(
            project_id=project_id, record_id=None, pmirs_item_id=action.id, field_id=None,
            original_name="evidencia-demo.txt", storage_name="baseline-gate-evidence-demo.txt",
            media_type="text/plain", size_bytes=172, sha256="a" * 64,
            created_by=workspace["user_ids"]["field"],
        ))
        action_id = action.id
        session.commit()

    sign_in(client, "field@red.test")
    path = f"/projects/{project_id}/pmirs"
    studio = client.get(path)
    assert studio.status_code == 200
    assert "El seguimiento de acciones se habilita cuando la Línea Base del expediente esté vigente." in studio.text
    assert "El registro de avance está bloqueado hasta que QA/QC acepte una Línea Base vigente." in studio.text
    assert "Puedes guardar objetos como borrador" not in studio.text
    assert 'class="pmirs-columns pmirs-columns-field"' in studio.text
    assert "Objeto PMIRS · v1 · QA/QC: Revisado · válido" in studio.text
    assert "Acción: Pendiente" in studio.text
    assert "Indicador: Pendiente</span>" in studio.text
    assert 'data-pmirs-progress-form' not in studio.text
    assert "172 B" in studio.text
    assert "evidencia-demo.txt" in studio.text

    rejected = client.post(
        f"/pmirs/items/{action_id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action_id}/progress", {"expected_version": pmirs_version_for_progress(action_id), 
            "csrf": csrf_for(client, path), "submission_key": secrets.token_urlsafe(32),
            "execution_status": "en_proceso", "progress_pct": 25,
            "progress_note": "Avance sintético que debe rechazarse por falta de Línea Base.",
        }),
        follow_redirects=False,
    )
    assert rejected.status_code == 409
    assert "La Línea Base debe estar vigente" in rejected.text
    with SessionLocal() as session:
        saved_action = session.get(PMIRSItem, action_id)
        assert saved_action.version == 1
        assert saved_action.data["execution_status"] == "pendiente"
        assert saved_action.data["progress_pct"] == 0
        assert saved_action.data.get("progress_note") is None
        assert session.scalar(select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == action_id)) is None
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.action == "pmirs_action_progress", AuditEvent.entity_id == action_id,
        )) is None


def test_pmirs_field_user_sees_and_updates_only_assigned_actions(client, workspace):
    project_id, other_project_id = workspace["project_ids"][:2]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.baseline_status = "validada"
        own_action = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-ASIGNADA", title="Acción asignada visible",
            description="Acción sintética asignada al operario del proyecto.",
            data={
                "execution_status": "pendiente", "progress_pct": 0,
                "assignee_user_ids": [workspace["user_ids"]["field"]],
                "completion_criteria": "Jornada terminada con acta y registro de pesaje ficticio.",
                "expected_evidence": "acta",
                "expected_evidence_detail": "Acta firmada de práctica sin datos personales.",
            },
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
        )
        other_action = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-NO-ASIGNADA", title="Acción ajena oculta",
            description="Acción sintética no asignada a este operario.",
            data={
                "execution_status": "pendiente", "progress_pct": 0, "assignee_user_ids": [],
                "completion_criteria": "DATO PRIVADO DE ACCIÓN NO ASIGNADA",
                "expected_evidence": "documento",
                "expected_evidence_detail": "DETALLE PRIVADO NO ASIGNADO",
            },
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
        )
        private_finding = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="H-PRIVADO", title="Hallazgo técnico oculto",
            description="Detalle de hallazgo no requerido para ejecutar la asignación.", data={},
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
        )
        private_program = PMIRSItem(
            project_id=project_id, item_type="programa", code="P-PRIVADO", title="Programa técnico oculto",
            description="Detalle de programa no requerido para ejecutar la asignación.", data={},
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
        )
        private_indicator = PMIRSItem(
            project_id=project_id, item_type="indicador", code="I-PRIVADO", title="Indicador técnico oculto",
            description="Detalle de indicador no requerido para ejecutar la asignación.", data={},
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
        )
        foreign_action = PMIRSItem(
            project_id=other_project_id, item_type="accion", code="A-OTRO-PROYECTO",
            title="Acción de otro proyecto", description="Objeto sintético de aislamiento.",
            data={"assignee_user_ids": [workspace["user_ids"]["field"]]},
            review_status="VALIDATED", version=1, created_by=workspace["user_ids"]["consultant"],
            updated_by=workspace["user_ids"]["consultant"],
        )
        teammate = User(
            email="teammate@red.test", full_name="Otro operario",
            password_hash=hash_password(PASSWORD),
        )
        session.add_all([own_action, other_action, private_finding, private_program, private_indicator, foreign_action, teammate])
        session.flush()
        session.add(ProjectMembership(project_id=project_id, user_id=teammate.id, role="campo"))
        evidence_cases = []
        for item, suffix, content in [
            (own_action, "assigned", b"evidence for assigned action"),
            (other_action, "unassigned", b"evidence for unassigned action"),
            (private_finding, "finding", b"evidence for non-action item"),
            (foreign_action, "cross-project", b"evidence linked to an object in another project"),
        ]:
            storage_name = f"pmirs-field-scope-{suffix}.txt"
            evidence = EvidenceFile(
                project_id=project_id, pmirs_item_id=item.id, record_id=None, field_id=None,
                original_name=f"{suffix}.txt", storage_name=storage_name, media_type="text/plain",
                size_bytes=len(content), sha256=hashlib.sha256(content).hexdigest(),
                created_by=workspace["user_ids"]["consultant"],
            )
            session.add(evidence)
            evidence_cases.append((evidence, storage_name, content))
        session.flush()
        own_action_id, other_action_id = own_action.id, other_action.id
        assigned_evidence_id, unassigned_evidence_id, finding_evidence_id, cross_project_evidence_id = [row[0].id for row in evidence_cases]
        teammate_id = teammate.id
        session.commit()
        for _row, storage_name, content in evidence_cases:
            app_main.storage.put_bytes(f"evidence/{storage_name}", content, "text/plain")

    sign_in(client, "field@red.test")
    home = client.get(f"/projects/{project_id}")
    assert "Acción asignada visible" in home.text
    assert "Acción ajena oculta" not in home.text
    field_pmirs = client.get(f"/projects/{project_id}/pmirs")
    assert field_pmirs.status_code == 200
    assert "Acción asignada visible" in field_pmirs.text
    assert "Acción ajena oculta" not in field_pmirs.text
    assert "Criterio de terminación:" in field_pmirs.text
    assert "Jornada terminada con acta y registro de pesaje ficticio." in field_pmirs.text
    assert "Evidencia esperada" in field_pmirs.text
    assert "Acta" in field_pmirs.text
    assert "Acta firmada de práctica sin datos personales." in field_pmirs.text
    assert "DATO PRIVADO DE ACCIÓN NO ASIGNADA" not in field_pmirs.text
    assert "DETALLE PRIVADO NO ASIGNADO" not in field_pmirs.text
    assert "Hallazgo técnico oculto" not in field_pmirs.text
    assert "Programa técnico oculto" not in field_pmirs.text
    assert "Indicador técnico oculto" not in field_pmirs.text
    assert "Acciones asignadas a ti" in field_pmirs.text
    assert client.get(f"/evidence/{assigned_evidence_id}").content == b"evidence for assigned action"
    assert client.get(f"/evidence/{unassigned_evidence_id}").status_code == 404
    assert client.get(f"/evidence/{finding_evidence_id}").status_code == 404
    assert client.get(f"/evidence/{cross_project_evidence_id}").status_code == 404
    with SessionLocal() as session:
        field_download_events = list(session.scalars(select(AuditEvent).where(
            AuditEvent.actor_id == workspace["user_ids"]["field"],
            AuditEvent.action == "evidence_download_authorized",
        )))
        assert [event.entity_id for event in field_download_events] == [assigned_evidence_id]

    client.cookies.clear()
    sign_in(client, "teammate@red.test")
    assert "Acción asignada visible" not in client.get(f"/projects/{project_id}").text
    teammate_pmirs = client.get(f"/projects/{project_id}/pmirs")
    assert teammate_pmirs.status_code == 200
    assert "Acción asignada visible" not in teammate_pmirs.text
    assert "Acción ajena oculta" not in teammate_pmirs.text
    assert "Hallazgo técnico oculto" not in teammate_pmirs.text
    assert "Programa técnico oculto" not in teammate_pmirs.text
    assert "Indicador técnico oculto" not in teammate_pmirs.text
    assert "Sin acciones asignadas" in teammate_pmirs.text
    assert client.get(f"/evidence/{assigned_evidence_id}").status_code == 404
    with SessionLocal() as session:
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.actor_id == teammate_id,
            AuditEvent.action == "evidence_download_authorized",
        )) is None
    path = f"/projects/{project_id}/pmirs"
    csrf = csrf_for(client, path)
    update = client.post(f"/pmirs/items/{own_action_id}/progress", data=rendered_decision_data(client, f"/pmirs/items/{own_action_id}/progress", {"expected_version": pmirs_version_for_progress(own_action_id), 
        "csrf": csrf, "execution_status": "en_proceso", "progress_pct": 20,
        "progress_note": "Inicio sintético de una acción ajena.",
    }))
    assert update.status_code == 403
    evidence = client.post(
        f"/pmirs/items/{own_action_id}/evidence", data={"csrf": csrf},
        files={"file": ("evidencia.txt", b"evidencia sintetica", "text/plain")},
    )
    assert evidence.status_code == 403
    with SessionLocal() as session:
        assert session.get(PMIRSItem, own_action_id).data["execution_status"] == "pendiente"
        assert session.get(PMIRSItem, other_action_id).data["assignee_user_ids"] == []


def test_pmirs_studio_reviews_tracks_actions_and_versions(client, workspace, tmp_path):
    project_id = workspace["project_ids"][0]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        project.baseline_status = "validada"
        project.baseline_reference = "LB-sintetica-v1"
        project.baseline_note = "Conjunto de datos sintético validado para prueba."
        project.baseline_reviewed_by = workspace["user_ids"]["reviewer"]
        for code in ["D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"]:
            session.add(FormRecord(
                project_id=project_id, form_code=code, title=f"{code} sintético", status="VALIDATED",
                record_date="2026-10-07", source_kind="medido", source_note="Dato sintético de prueba",
                payload={"synthetic": "respuesta"}, created_by=workspace["user_ids"]["consultant"],
                updated_by=workspace["user_ids"]["consultant"], reviewed_by=workspace["user_ids"]["reviewer"],
            ))
        bind_synthetic_fraction_source(session, project_id)
        session.commit()
        source_id = session.scalar(select(FormRecord.id).where(FormRecord.project_id == project_id, FormRecord.form_code == "D-01"))

    sign_in(client, "consultant@red.test")
    assert client.get(f"/projects/{project_id}/pmirs").status_code == 200

    def create_item(item_type, fields):
        csrf = csrf_for(client, f"/projects/{project_id}/pmirs")
        response = client.post(
            f"/projects/{project_id}/pmirs/items/new",
            data={"csrf": csrf, "item_type": item_type, "action": "submit", **fields},
            follow_redirects=False,
        )
        assert response.status_code == 303, response.text
        with SessionLocal() as session:
            return session.scalar(select(PMIRSItem).where(
                PMIRSItem.project_id == project_id, PMIRSItem.item_type == item_type,
            ).order_by(PMIRSItem.created_at.desc()))

    finding = create_item("hallazgo", {
        "title": "Separación pendiente en punto común",
        "description": "La visita sintética identifica mezcla en el punto de entrega; alcance limitado a una muestra.",
        "topic": "Separación", "support_level": "C", "priority": "media",
        "priority_reason": "Conviene atenderlo antes de ampliar el muestreo.",
        "lifecycle_status": "abierto", "source_record_ids": [source_id],
    })
    assert finding.code == "H-001" and finding.review_status == "PENDING_REVIEW"

    def review_item(item_id):
        client.cookies.clear()
        sign_in(client, "reviewer@red.test")
        csrf = csrf_for(client, f"/projects/{project_id}/pmirs")
        with SessionLocal() as session:
            displayed_version = session.get(PMIRSItem, item_id).version
        response = client.post(
            f"/pmirs/items/{item_id}/review",
            data=rendered_decision_data(client, f"/pmirs/items/{item_id}/review", {"csrf": csrf, "expected_version": displayed_version, "decision": "validar", "reason": "Fuente sintética verificada para esta prueba."}),
            follow_redirects=False,
        )
        assert response.status_code == 303, response.text
        with SessionLocal() as session:
            assert session.get(PMIRSItem, item_id).review_status == "VALIDATED"

    review_item(finding.id)
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    program = create_item("programa", {
        "title": "Separación en la fuente", "description": "Programa sintético de separación para prueba de flujo.",
        "applies": "si", "applicability_reason": "El hallazgo sintético señala la necesidad.",
        "objective": "Mejorar la separación observada en el punto común.",
        "scope": "Personal operativo y espacio común de entrega.", "owner_role": "Administración PH",
        "program_status": "borrador", "finding_ids": [finding.id],
    })
    review_item(program.id)
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    indicator = create_item("indicador", {
        "title": "Registro de jornadas de separación", "description": "Seguimiento sintético sin meta calculada.",
        "definition": "Cuenta las jornadas registradas, no mide por sí sola la calidad de separación.",
        "formula": "Número de jornadas registradas en el periodo", "unit": "número",
        "source_description": "Formulario D-06 validado en RED", "frequency": "Mensual",
        "report_owner": "Equipo operativo", "data_available": "no",
        "capture_method": "Registrar una jornada con fecha, responsable y evidencia.",
    })
    review_item(indicator.id)
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    action = create_item("accion", {
        "title": "Realizar jornada de separación", "description": "Completar la jornada y registrar asistencia y resultado.",
        "program_id": program.id, "owner": "Equipo operativo", "priority": "media",
        "start_date": "2026-10-10", "due_date": "2026-10-17",
        "completion_criteria": "Jornada registrada con acta y evidencia de cierre.",
        "indicator_id": indicator.id, "expected_evidence": "acta",
        "expected_evidence_detail": "Acta sintética de la jornada", "execution_status": "pendiente",
        "assignee_user_ids": [workspace["user_ids"]["field"]],
        "progress_pct": "0", "finding_ids": [finding.id],
    })
    review_item(action.id)
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    manager_studio = client.get(f"/projects/{project_id}/pmirs")
    assert "Operario · field@red.test" in manager_studio.text

    with SessionLocal() as session:
        session.add(FormRecord(
            project_id=project_id, form_code="P-15", title="Seguimiento sintético",
            status="VALIDATED",
            payload={
                "P15-007": "IND-01: 42,5",
                "P15-008": "Comparación del periodo sintético conservada.",
                "P15-009": "Resumen previo sintético",
            },
            version=2, reviewed_by=workspace["user_ids"]["reviewer"], reviewed_at=now_utc(),
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        ))
        session.commit()

    client.cookies.clear()
    sign_in(client, "field@red.test")
    studio_path = f"/projects/{project_id}/pmirs"
    field_home = client.get(f"/projects/{project_id}")
    assert "Mis acciones asignadas" in field_home.text
    assert "Realizar jornada de separación" in field_home.text
    field_studio = client.get(studio_path)
    assert "Operario" in field_studio.text
    assert "Cómo registrar tu trabajo" in field_studio.text
    assert "Con evidencia adjunta, cambia el estado a “Evidencia cargada” o “En validación”." in field_studio.text
    assert "Evidencia adjunta." not in field_studio.text
    assert "Operario · field@red.test" not in field_studio.text
    assert "Registrar avance o novedad" in client.get(studio_path).text
    assert 'data-pmirs-progress-form' in field_studio.text
    assert 'name="close_reason"' not in field_studio.text
    assert 'data-unsaved-notice' in field_studio.text
    assert '/static/pmirs-progress-submit.js' in field_studio.text
    assert '/static/unsaved-changes.js?v=20261012-field-pending-guard1' in field_studio.text
    csrf = csrf_for(client, studio_path)
    closed_without_evidence = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf, "execution_status": "cerrada", "progress_pct": 100,
              "progress_note": "La jornada finalizó según el criterio previsto.", "close_reason": "Cierre de prueba sintética."}),
    )
    assert closed_without_evidence.status_code == 403
    no_evidence_for_review = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf, "execution_status": "evidencia_cargada", "progress_pct": 100,
              "progress_note": "La jornada finalizó según el criterio previsto."}),
    )
    assert no_evidence_for_review.status_code == 422
    evidence_response = client.post(
        f"/pmirs/items/{action.id}/evidence",
        data={"csrf": csrf}, files={"file": ("acta.txt", b"Acta sintetica", "text/plain")},
        follow_redirects=False,
    )
    assert evidence_response.status_code == 303
    evidence_studio = client.get(studio_path)
    assert "Evidencia adjunta." in evidence_studio.text
    assert "Cuando el soporte corresponda al trabajo reportado" in evidence_studio.text
    assert f'href="#action-progress-summary-{action.id}"' in evidence_studio.text
    assert f'id="action-progress-summary-{action.id}"' in evidence_studio.text
    csrf = csrf_for(client, studio_path)
    evidence_logged = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf, "execution_status": "evidencia_cargada", "progress_pct": 80,
              "progress_note": "Se adjunta el acta sintética para revisar el resultado."}),
        follow_redirects=False,
    )
    assert evidence_logged.status_code == 303
    evidence_pending_studio = client.get(studio_path)
    assert "Evidencia enviada a revisión QA/QC." in evidence_pending_studio.text
    assert "El porcentaje de avance reportado no sustituye esas decisiones." in evidence_pending_studio.text
    assert "Trabajo reportado al 100 %; revisión QA/QC pendiente." not in evidence_pending_studio.text
    csrf = csrf_for(client, studio_path)
    submitted_for_validation = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf, "execution_status": "en_validacion", "progress_pct": 100,
              "progress_note": "La jornada finalizó según el criterio previsto."}),
        follow_redirects=False,
    )
    assert submitted_for_validation.status_code == 303

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    unauthorized_return = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "requiere_correccion",
              "progress_pct": 100, "progress_note": "Devolución no autorizada por el perfil consultor."}),
        follow_redirects=False,
    )
    assert unauthorized_return.status_code == 403

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    reviewer_dashboard = client.get("/")
    assert "acción con evidencia para QA/QC" in reviewer_dashboard.text
    assert '<strong>1</strong><small>acción con evidencia para QA/QC</small>' in reviewer_dashboard.text
    reviewer_project = client.get(f"/projects/{project_id}")
    assert f'{action.code} · {action.title}' in reviewer_project.text
    assert "Acción con evidencia pendiente de QA/QC" in reviewer_project.text
    assert f'href="/projects/{project_id}/pmirs#action-{action.id}"' in reviewer_project.text
    reviewer_studio = client.get(studio_path)
    assert "Requiere corrección" in reviewer_studio.text
    assert "Acciones con evidencia pendiente de QA/QC" in reviewer_studio.text
    assert f'id="action-review-queue-heading"' in reviewer_studio.text
    assert f'<details class="pmirs-progress" open><summary id="action-progress-summary-{action.id}">Decidir revisión QA/QC</summary>' in reviewer_studio.text
    assert "Guardar decisión QA/QC" in reviewer_studio.text
    assert "Decisión QA/QC y justificación" in reviewer_studio.text
    assert 'name="close_reason"' not in reviewer_studio.text
    returned_for_correction = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "requiere_correccion",
              "progress_pct": 100,
              "progress_note": "La foto no muestra completa la separación; adjunta una imagen del punto entero."}),
        follow_redirects=False,
    )
    assert returned_for_correction.status_code == 303
    returned_studio = client.get(studio_path)
    assert 'class="status-pill status-attention pmirs-action-status">Acción: Requiere corrección</span>' in returned_studio.text
    with SessionLocal() as session:
        follow_up = session.scalar(select(FormRecord).where(
            FormRecord.project_id == project_id, FormRecord.form_code == "P-15",
        ))
        assert "Requiere corrección" in follow_up.payload["P15-009"]
        correction_revision = session.scalar(select(PMIRSItemRevision).where(
            PMIRSItemRevision.item_id == action.id,
            PMIRSItemRevision.snapshot["data"]["execution_status"].as_string() == "requiere_correccion",
        ))
        assert correction_revision is not None
        assert correction_revision.changed_by == workspace["user_ids"]["reviewer"]
        assert "La foto no muestra completa la separación" in correction_revision.snapshot["data"]["progress_note"]

    client.cookies.clear()
    sign_in(client, "field@red.test")
    returned_studio = client.get(studio_path)
    assert "QA/QC devolvió esta acción para corrección." in returned_studio.text
    assert "La foto no muestra completa la separación" in returned_studio.text
    rework = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "en_proceso",
              "progress_pct": 70, "progress_note": "Se repite la captura para mostrar todo el punto."}),
        follow_redirects=False,
    )
    assert rework.status_code == 303
    corrected_photo = client.post(
        f"/pmirs/items/{action.id}/evidence",
        data={"csrf": csrf_for(client, studio_path)},
        files={"file": ("foto-corregida.png", b"\x89PNG\r\n\x1a\nsynthetic", "image/png")},
        follow_redirects=False,
    )
    assert corrected_photo.status_code == 303
    evidence_resubmitted = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "evidencia_cargada",
              "progress_pct": 95, "progress_note": "Se adjunta la fotografía corregida del punto completo."}),
        follow_redirects=False,
    )
    assert evidence_resubmitted.status_code == 303
    submitted_again = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "en_validacion",
              "progress_pct": 100, "progress_note": "La jornada y la corrección solicitada están completas."}),
        follow_redirects=False,
    )
    assert submitted_again.status_code == 303

    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    csrf = csrf_for(client, studio_path)
    validated_execution = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf, "execution_status": "validada", "progress_pct": 100,
              "progress_note": "La evidencia de la jornada fue revisada y cumple el criterio."}),
        follow_redirects=False,
    )
    assert validated_execution.status_code == 303

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    csrf = csrf_for(client, studio_path)
    closed = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf, "execution_status": "cerrada", "progress_pct": 100,
              "progress_note": "La jornada finalizó según el criterio previsto.", "close_reason": "Cierre de prueba sintética."}),
        follow_redirects=False,
    )
    assert closed.status_code == 303
    client.cookies.clear()
    sign_in(client, "field@red.test")
    closed_studio = client.get(studio_path)
    assert "Consultoría RED cerró esta acción." in closed_studio.text
    assert "Cierre de prueba sintética." in closed_studio.text

    with SessionLocal() as session:
        follow_up = session.scalar(select(FormRecord).where(
            FormRecord.project_id == project_id, FormRecord.form_code == "P-15",
        ))
        assert follow_up.payload["P15-009"] == "Sin acciones abiertas registradas en PMIRS Studio."
        assert follow_up.status == "CORRECTION_REQUESTED"
        assert follow_up.reviewed_by is None and follow_up.reviewed_at is None
        assert follow_up.payload["P15-007"] == "IND-01: 42,5"
        assert follow_up.payload["P15-008"] == "Comparación del periodo sintético conservada."

    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    reopened = client.post(
        f"/pmirs/items/{action.id}/progress",
        data=rendered_decision_data(client, f"/pmirs/items/{action.id}/progress", {"expected_version": pmirs_version_for_progress(action.id), "csrf": csrf_for(client, studio_path), "execution_status": "reabierta",
              "progress_pct": 100, "progress_note": "Reapertura sintética para probar el aviso de campo.",
              "close_reason": "Se requiere una verificación adicional en la siguiente jornada."}),
        follow_redirects=False,
    )
    assert reopened.status_code == 303
    client.cookies.clear()
    sign_in(client, "field@red.test")
    reopened_studio = client.get(studio_path)
    assert "Consultoría RED reabrió esta acción." in reopened_studio.text
    assert "Se requiere una verificación adicional en la siguiente jornada." in reopened_studio.text
    assert f'href="#action-progress-summary-{action.id}"' in reopened_studio.text
    with SessionLocal() as session:
        follow_up = session.scalar(select(FormRecord).where(
            FormRecord.project_id == project_id, FormRecord.form_code == "P-15",
        ))
        assert "A-001 · Realizar jornada de separación · Reabierta" in follow_up.payload["P15-009"]
        assert follow_up.status == "CORRECTION_REQUESTED"
        assert follow_up.reviewed_by is None and follow_up.reviewed_at is None
        assert follow_up.payload["P15-007"] == "IND-01: 42,5"
        assert follow_up.payload["P15-008"] == "Comparación del periodo sintético conservada."

    # Populate relationships that historically risked leaking their UUIDs into exports.
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    evidence_bytes = b"evidencia pmirs sintetica"
    evidence_response = client.post(
        f"/pmirs/items/{finding.id}/evidence",
        data={"csrf": csrf_for(client, studio_path)},
        files={"file": ("nombre-personal-no-exportar.txt", evidence_bytes, "text/plain")},
        follow_redirects=False,
    )
    assert evidence_response.status_code == 303
    with SessionLocal() as session:
        linked_evidence = session.scalar(select(EvidenceFile).where(
            EvidenceFile.project_id == project_id,
            EvidenceFile.pmirs_item_id == finding.id,
            EvidenceFile.original_name == "nombre-personal-no-exportar.txt",
        ))
        assert linked_evidence is not None
        evidence_hash = hashlib.sha256(evidence_bytes).hexdigest()
        assert linked_evidence.sha256 == evidence_hash and linked_evidence.size_bytes == len(evidence_bytes)
        finding_row = session.get(PMIRSItem, finding.id)
        finding_row.data = {
            **finding_row.data,
            "recommended_program_id": program.id,
            "evidence_ids": [linked_evidence.id],
        }
        indicator_row = session.get(PMIRSItem, indicator.id)
        indicator_row.data = {**indicator_row.data, "capture_action_id": action.id}
        session.commit()
        linked_evidence_id = linked_evidence.id

    csrf = csrf_for(client, studio_path)
    created_version = client.post(
        f"/projects/{project_id}/pmirs/versions",
        data={"csrf": csrf, "change_reason": "inicial", "change_summary": "Primera captura de trabajo sintética."},
        follow_redirects=False,
    )
    assert created_version.status_code == 303
    with SessionLocal() as session:
        version = session.scalar(select(PMIRSVersion).where(PMIRSVersion.project_id == project_id))
        version_id = version.id
        assert version.version_label == "v0.1" and len(version.snapshot["items"]) == 4
        assert version.snapshot["source_records"] == [{
            "id": source_id, "form_code": "D-01", "record_date": "2026-10-07",
            "version": 1, "status": "VALIDATED",
        }]
        assert version.snapshot["evidence_files"] == [{
            "id": linked_evidence_id, "field_id": None, "size_bytes": len(evidence_bytes),
            "sha256": evidence_hash,
        }]
        assert "original_name" not in version.snapshot["evidence_files"][0]
        assert "nombre-personal-no-exportar.txt" not in json.dumps(version.snapshot)
        first_version_id = version.id
        version_id = version.id

    first_version_page = client.get(studio_path)
    assert "Control documental P-12" in first_version_page.text
    assert "P12-001 · Número de versión" in first_version_page.text
    assert "Primera captura" in first_version_page.text

    with SessionLocal() as session:
        changed_action = session.get(PMIRSItem, action.id)
        changed_action.title = "Realizar jornada de separación con ajuste"
        changed_action.version += 1
        changed_action.updated_by = workspace["user_ids"]["consultant"]
        changed_action.updated_at = now_utc()
        session.add(PMIRSItemRevision(
            item_id=changed_action.id, revision=changed_action.version,
            snapshot=pmirs_item_snapshot(changed_action), note="Cambio sintético de prueba",
            changed_by=workspace["user_ids"]["consultant"],
        ))
        session.commit()

    csrf = csrf_for(client, studio_path)
    second_version_response = client.post(
        f"/projects/{project_id}/pmirs/versions",
        data={"csrf": csrf, "change_reason": "seguimiento", "change_summary": "Ajuste sintético para comprobar el vínculo P-12."},
        follow_redirects=False,
    )
    assert second_version_response.status_code == 303
    with SessionLocal() as session:
        second_version = session.scalar(select(PMIRSVersion).where(
            PMIRSVersion.project_id == project_id, PMIRSVersion.version_label == "v0.2",
        ))
        assert second_version.previous_version_id == first_version_id
        second_version_id = second_version.id
    second_version_page = client.get(studio_path)
    assert "v0.2" in second_version_page.text and "Modificado · A-001" in second_version_page.text
    assert "Esta captura difiere del expediente actual:" in second_version_page.text
    assert "Coincide con el expediente actual." in second_version_page.text
    assert f'href="/pmirs/versions/{version_id}/export.pdf">Descargar PDF</a>' in second_version_page.text
    assert not can_write_form("consultor", "P-12")

    p12_create_page = client.get(f"/projects/{project_id}/records/new?form_code=P-12", follow_redirects=False)
    assert p12_create_page.status_code == 303
    assert p12_create_page.headers["location"].endswith("/pmirs#versions-heading")
    p12_post = client.post(
        f"/projects/{project_id}/records/new",
        data={"csrf": csrf_for(client, studio_path), "form_code": "P-12", "action": "draft"},
    )
    assert p12_post.status_code == 409

    csrf = csrf_for(client, studio_path)
    sent_to_review = client.post(
        f"/pmirs/versions/{version_id}/status",
        data={"csrf": csrf, "status": "revision_interna", "status_note": "Todos los objetos de la captura están revisados."},
        follow_redirects=False,
    )
    assert sent_to_review.status_code == 303
    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    csrf = csrf_for(client, studio_path)
    approved = client.post(
        f"/pmirs/versions/{version_id}/status",
        data={"csrf": csrf, "status": "aprobada_interna", "status_note": "Revisión interna sintética completada."},
        follow_redirects=False,
    )
    assert approved.status_code == 303
    signature_prompt = client.get(studio_path)
    assert 'aria-label="Área para dibujar la constancia con el dedo, mouse o teclado"' in signature_prompt.text
    assert 'tabindex="0"' in signature_prompt.text
    assert "mantén Espacio mientras mueves para dibujar" in signature_prompt.text
    assert f'id="signature-canvas-{version_id}"' in signature_prompt.text
    signature_data = {"csrf": csrf_for(client, studio_path), "confirm_signature": "yes",
                      "signature_strokes": json.dumps([[[0.08, 0.7], [0.32, 0.35], [0.58, 0.68], [0.9, 0.28]]])}
    wrong_password = client.post(
        f"/pmirs/versions/{version_id}/sign", data={**signature_data, "password": "wrong synthetic password"},
        follow_redirects=False,
    )
    assert wrong_password.status_code == 403
    signature_response = client.post(
        f"/pmirs/versions/{version_id}/sign",
        data={**signature_data, "password": PASSWORD},
        follow_redirects=False,
    )
    assert signature_response.status_code == 303
    signed_studio = client.get(studio_path)
    assert f'href="/pmirs/versions/{version_id}/export.pdf">Descargar PDF firmado</a>' in signed_studio.text
    assert f'href="/pmirs/versions/{version_id}/export.docx">Descargar Word firmado</a>' in signed_studio.text
    assert "La constancia está incluida en el PDF, el Word y el HTML imprimible." in signed_studio.text
    assert "los cambios posteriores a su descarga no quedan cubiertos por el hash" in signed_studio.text
    duplicate_signature = client.post(
        f"/pmirs/versions/{version_id}/sign",
        data={**signature_data, "csrf": csrf_for(client, studio_path), "password": PASSWORD},
        follow_redirects=False,
    )
    assert duplicate_signature.status_code == 409
    exported = client.get(f"/pmirs/versions/{version_id}/export")
    assert exported.status_code == 200
    assert "documento de trabajo" in exported.text.casefold() and "separación en la fuente" in exported.text.casefold()
    assert "Instrumento técnico-operativo preparado para el alcance acordado con esta copropiedad." in exported.text
    assert "No sustituye el PGIRS municipal ni determina por sí solo las obligaciones legales o contractuales particulares" in exported.text
    assert "Constancias de lectura y recepción" in exported.text
    assert "Revisor" in exported.text and "SHA-256 del contenido canónico de esta versión PMIRS" in exported.text
    assert '<path d="M48.00,126.00' in exported.text
    assert "D-01 · 2026-10-07 · v1 · Validado" in exported.text
    assert "H-001 · Separación pendiente en punto común" in exported.text
    assert f"{program.code} · Separación en la fuente" in exported.text
    evidence_reference_label = f"Evidencia 1 · Adjunto del expediente · {len(evidence_bytes)} bytes"
    assert evidence_reference_label in exported.text
    assert "nombre-personal-no-exportar.txt" not in exported.text
    assert "Programa sugerido" in exported.text
    assert "Acción de captura vinculada" in exported.text
    assert f"{indicator.code} · Registro de jornadas de separación" in exported.text
    assert "VALIDATED" not in exported.text
    assert source_id not in exported.text and program.id not in exported.text and indicator.id not in exported.text
    assert linked_evidence_id not in exported.text and action.id not in exported.text
    assert workspace["user_ids"]["field"] not in exported.text
    exported_pdf = client.get(f"/pmirs/versions/{version_id}/export.pdf")
    assert exported_pdf.status_code == 200
    assert exported_pdf.headers["content-type"] == "application/pdf"
    assert exported_pdf.headers["cache-control"] == "no-store, max-age=0"
    pdf_text = "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(exported_pdf.content)).pages)
    pdf_text_normalized = " ".join(pdf_text.split())
    assert "Plan de gestión integral de residuos" in pdf_text
    assert "Alcance y estado" in pdf_text_normalized
    assert "Instrumento técnico-operativo preparado para el alcance acordado con esta copropiedad." in pdf_text_normalized
    assert "No sustituye el PGIRS municipal ni determina por sí solo las obligaciones legales o contractuales particulares" in pdf_text_normalized
    assert "Constancias de lectura y recepción" in pdf_text
    assert "Revisor" in pdf_text and "SHA-256 del contenido canónico al que se vincula esta constancia" in pdf_text
    assert "SHA-256 del contenido canónico de esta versión PMIRS:" not in pdf_text
    assert "D-01 · 2026-10-07 · v1 · Validado" in pdf_text_normalized
    assert "H-001 · Separación pendiente en punto común" in pdf_text_normalized
    assert f"{program.code} · Separación en la fuente" in pdf_text_normalized
    assert evidence_reference_label in pdf_text_normalized
    assert "nombre-personal-no-exportar.txt" not in pdf_text_normalized
    assert "Programa sugerido" in pdf_text_normalized
    assert "Acción de captura vinculada" in pdf_text_normalized
    assert f"{indicator.code} · Registro de jornadas de separación" in pdf_text_normalized
    assert "VALIDATED" not in pdf_text_normalized
    assert source_id not in pdf_text and program.id not in pdf_text and indicator.id not in pdf_text
    assert linked_evidence_id not in pdf_text and action.id not in pdf_text
    assert workspace["user_ids"]["field"] not in pdf_text

    exported_docx = client.get(f"/pmirs/versions/{version_id}/export.docx")
    assert exported_docx.status_code == 200
    assert exported_docx.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert exported_docx.headers["cache-control"] == "no-store, max-age=0"
    with zipfile.ZipFile(io.BytesIO(exported_docx.content)) as docx_archive:
        assert "word/document.xml" in docx_archive.namelist()
        assert "word/media/image1.png" in docx_archive.namelist()
        docx_root = ET.fromstring(docx_archive.read("word/document.xml"))
        docx_text = " ".join(node.text or "" for node in docx_root.findall(".//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"))
        assert "Plan de gestión integral de residuos" in docx_text
        assert "Alcance y estado" in docx_text
        assert "Instrumento técnico-operativo preparado para el alcance acordado con esta copropiedad." in docx_text
        assert "No sustituye el PGIRS municipal ni determina por sí solo las obligaciones legales o contractuales particulares" in docx_text
        assert "Constancias de lectura y recepción" in docx_text
        assert "Revisor" in docx_text and "SHA-256 del contenido canónico de la versión PMIRS vinculada" in docx_text
        assert "D-01 · 2026-10-07 · v1 · Validado" in docx_text
        assert "H-001 · Separación pendiente en punto común" in docx_text
        assert f"{program.code} · Separación en la fuente" in docx_text
        assert evidence_reference_label in docx_text
        assert "nombre-personal-no-exportar.txt" not in docx_text
        assert "Programa sugerido" in docx_text
        assert "Acción de captura vinculada" in docx_text
        assert f"{indicator.code} · Registro de jornadas de separación" in docx_text
        assert "VALIDATED" not in docx_text
        assert source_id not in docx_text and program.id not in docx_text and indicator.id not in docx_text
        assert linked_evidence_id not in docx_text and action.id not in docx_text
        assert workspace["user_ids"]["field"] not in docx_text
        assert "Huella SHA-256 del contenido canónico de esta versión PMIRS" not in docx_text
        assert "constancia de Revisor" in docx_archive.read("word/document.xml").decode()
        assert docx_archive.read("word/media/image1.png").startswith(b"\x89PNG\r\n\x1a\n")
        document_ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        paragraphs = docx_root.findall(f".//{{{document_ns}}}p")
        paragraph_texts = [
            " ".join(node.text or "" for node in paragraph.findall(f".//{{{document_ns}}}t"))
            for paragraph in paragraphs
        ]
        for label in (
            "Indicadores y metas",
            "IND-01 · Indicador · Validado",
            "Registro de jornadas de separación",
        ):
            paragraph = paragraphs[paragraph_texts.index(label)]
            assert paragraph.find(f"{{{document_ns}}}pPr/{{{document_ns}}}keepNext") is not None
        signature_heading = next(
            paragraph for paragraph in paragraphs
            if "Constancias de lectura y recepción" in " ".join(
                node.text or "" for node in paragraph.findall(f".//{{{document_ns}}}t")
            )
        )
        assert signature_heading.find(f"{{{document_ns}}}pPr/{{{document_ns}}}pageBreakBefore") is None
        assert signature_heading.find(f"{{{document_ns}}}pPr/{{{document_ns}}}keepNext") is not None
        baseline_heading = next(
            paragraph for paragraph in paragraphs
            if "Referencia de Línea Base" in " ".join(
                node.text or "" for node in paragraph.findall(f".//{{{document_ns}}}t")
            )
        )
        assert baseline_heading.find(f"{{{document_ns}}}pPr/{{{document_ns}}}keepNext") is not None
        signature_drawing_paragraph = next(
            paragraph for paragraph in paragraphs
            if paragraph.find(f".//{{{document_ns}}}drawing") is not None
        )
        assert signature_drawing_paragraph.find(f"{{{document_ns}}}pPr/{{{document_ns}}}keepNext") is not None
    with SessionLocal() as session:
        valid_export_events = list(session.scalars(select(AuditEvent).where(
            AuditEvent.action == "pmirs_version_exported", AuditEvent.entity_id == version_id,
        )))
        assert {event.detail["format"] for event in valid_export_events} >= {"html", "pdf", "docx"}
        assert all(event.detail["signatures_valid"] is True for event in valid_export_events)
        assert all(event.detail["signature_count"] == 1 for event in valid_export_events)

    with SessionLocal() as session:
        signature = session.scalar(select(PMIRSSignature).where(PMIRSSignature.version_id == version_id))
        assert signature is not None
        original_document_sha256 = signature.document_sha256
        signature.document_sha256 = "0" * 64
        session.commit()
    integrity_studio = client.get(f"/projects/{project_id}/pmirs")
    assert integrity_studio.status_code == 200
    assert "PDF: firma no verificada" in integrity_studio.text
    assert "Hay una constancia registrada, pero su integridad no pudo verificarse" in integrity_studio.text
    assert "Revisor ·" not in integrity_studio.text
    mismatched_pdf = client.get(f"/pmirs/versions/{version_id}/export.pdf")
    assert mismatched_pdf.status_code == 200
    mismatched_pdf_text = "\n".join(
        page.extract_text() or "" for page in PdfReader(io.BytesIO(mismatched_pdf.content)).pages
    )
    assert "No fue posible verificar la correspondencia" in mismatched_pdf_text
    assert "Revisor" not in mismatched_pdf_text
    mismatched_docx = client.get(f"/pmirs/versions/{version_id}/export.docx")
    assert mismatched_docx.status_code == 200
    with zipfile.ZipFile(io.BytesIO(mismatched_docx.content)) as docx_archive:
        mismatch_root = ET.fromstring(docx_archive.read("word/document.xml"))
        mismatch_text = " ".join(node.text or "" for node in mismatch_root.findall(".//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"))
        assert "No fue posible verificar la correspondencia" in mismatch_text
        assert "Revisor" not in mismatch_text
        assert not any(path.startswith("word/media/") for path in docx_archive.namelist())
    with SessionLocal() as session:
        invalid_export_events = list(session.scalars(select(AuditEvent).where(
            AuditEvent.action == "pmirs_version_exported", AuditEvent.entity_id == version_id,
        )))
        assert any(event.detail["format"] == "pdf" and event.detail["signatures_valid"] is False for event in invalid_export_events)
        assert any(event.detail["format"] == "docx" and event.detail["signatures_valid"] is False for event in invalid_export_events)
    with SessionLocal() as session:
        signature = session.scalar(select(PMIRSSignature).where(PMIRSSignature.version_id == version_id))
        assert signature is not None
        signature.document_sha256 = original_document_sha256
        session.commit()

    with SessionLocal() as session:
        assert session.get(PMIRSVersion, version_id).status == "aprobada_interna"
        assert session.get(PMIRSVersion, second_version_id).previous_version_id == version_id
        assert session.scalar(select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == action.id)) is not None
        signature = session.scalar(select(PMIRSSignature).where(PMIRSSignature.version_id == version_id))
        assert signature is not None and signature.signer_user_id == workspace["user_ids"]["reviewer"]
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.action == "pmirs_version_signed", AuditEvent.entity_id == version_id,
        )) is not None
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        backup_data = json.loads(archive.read("database.json"))
        assert backup_data["schema_version"] == 15 and len(backup_data["pmirs_signatures"]) == 1
        assert len(backup_data["visit_authorizations"]) == 4

    # Exercise the user-created, signed/exported PMIRS through an isolated restore,
    # not only through backup serialization. This stays entirely synthetic/local.
    restored_engine = create_engine(
        f"sqlite:///{tmp_path / 'signed-pmirs-roundtrip.sqlite3'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(restored_engine)
    restored_sessions = sessionmaker(bind=restored_engine, autoflush=False, expire_on_commit=False)
    restore_result = backups.restore_backup_archive(
        archive_bytes,
        admin_email="admin@red.test",
        admin_name="Administración de recuperación sintética",
        admin_password="Synthetic-PMIRS-Restore-2026!",
        session_factory=restored_sessions,
        target_engine=restored_engine,
        storage_root=tmp_path / "signed-pmirs-roundtrip-storage",
    )
    assert restore_result["admin_email"] == "admin@red.test"
    with restored_sessions() as restored:
        restored_version = restored.get(PMIRSVersion, version_id)
        assert restored_version.status == "aprobada_interna"
        assert restored.get(PMIRSVersion, second_version_id).previous_version_id == version_id
        restored_signature = restored.scalar(
            select(PMIRSSignature).where(PMIRSSignature.version_id == version_id)
        )
        assert restored_signature.signer_user_id == workspace["user_ids"]["reviewer"]
        assert restored_signature.document_sha256 == pmirs_document_sha256(restored_version)
        restored_authorization = restored.scalar(select(ProjectVisitAuthorization).where(
            ProjectVisitAuthorization.project_id == workspace["project_ids"][0],
        ))
        assert restored_authorization is not None
        assert restored_authorization.status == "approved"
        assert restored_authorization.site_access_reference == "SYNTHACCESS001"
        restored_evidence = restored.scalar(
            select(EvidenceFile).where(EvidenceFile.pmirs_item_id == action.id)
        )
        assert restored_evidence is not None
        restored_blob = (
            tmp_path / "signed-pmirs-roundtrip-storage" / "evidence" / restored_evidence.storage_name
        ).read_bytes()
        assert restored_blob == b"Acta sintetica"
        assert hashlib.sha256(restored_blob).hexdigest() == restored_evidence.sha256
        restored_exports = list(restored.scalars(select(AuditEvent).where(
            AuditEvent.action == "pmirs_version_exported",
            AuditEvent.entity_id == version_id,
        )))
        valid_formats = {
            event.detail["format"] for event in restored_exports
            if event.detail.get("signatures_valid") is True
        }
        assert valid_formats >= {"html", "pdf", "docx"}
        assert restored.scalar(select(AuditEvent).where(
            AuditEvent.action == "pmirs_version_signed",
            AuditEvent.entity_id == version_id,
        )) is not None
        assert restored.scalar(select(AuditEvent).where(AuditEvent.action == "backup_restored")) is not None
    restored_engine.dispose()


def test_field_record_signature_is_version_bound_exported_and_backed_up(client, workspace, tmp_path):
    project_id = workspace["project_ids"][0]
    field_id = workspace["user_ids"]["field"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita sintética al cuarto de residuos",
            status="RAW", record_date="2026-10-09", source_kind="observado",
            source_note="Observación sintética creada solo para prueba.",
            payload={"D03-001": "Visita de prueba", "D03-002": "2026-10-09"},
            created_by=field_id, updated_by=field_id,
        )
        other_project_record = FormRecord(
            project_id=workspace["project_ids"][1], form_code="D-03",
            title="Visita sintética de otro expediente", status="RAW",
            record_date="2026-10-09", source_kind="observado",
            source_note="Registro sintético para comprobar aislamiento entre proyectos.",
            payload={}, created_by=workspace["user_ids"]["admin"],
            updated_by=workspace["user_ids"]["admin"],
        )
        session.add(record)
        session.add(other_project_record)
        session.commit()
        record_id = record.id
        other_project_record_id = other_project_record.id

    sign_in(client, "field@red.test")
    detail = client.get(f"/records/{record_id}")
    assert detail.status_code == 200
    assert f'href="/records/{record_id}/export.pdf">Descargar PDF</a>' in detail.text
    assert f'href="/records/{record_id}/export.docx">Descargar Word</a>' in detail.text
    assert f'href="/records/{record_id}/export">Descargar HTML imprimible</a>' in detail.text
    assert 'id="record-signature-canvas"' in detail.text
    assert "participación o revisión de esta versión" in detail.text
    unsigned_docx = client.get(f"/records/{record_id}/export.docx")
    with zipfile.ZipFile(io.BytesIO(unsigned_docx.content)) as archive:
        unsigned_docx_text = archive.read("word/document.xml").decode("utf-8")
        assert "No hay constancias vigentes" in unsigned_docx_text
        assert not [name for name in archive.namelist() if name.startswith("word/media/")]
    sign_data = {
        "csrf": csrf_for(client, f"/records/{record_id}"),
        "confirm_signature": "yes", "password": PASSWORD,
        "signature_strokes": json.dumps([[[.08, .7], [.32, .35], [.58, .68], [.9, .28]]]),
    }
    response = client.post(f"/records/{record_id}/sign", data=rendered_decision_data(client, f"/records/{record_id}/sign", sign_data), follow_redirects=False)
    assert response.status_code == 303
    changed_evidence = b"synthetic evidence added after the first signature"
    changed_evidence_name = "after-signature.txt"
    evidence_dir = settings.storage_root / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / changed_evidence_name).write_bytes(changed_evidence)
    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=project_id, record_id=record_id, field_id="D03-008",
            original_name=changed_evidence_name, storage_name=changed_evidence_name,
            media_type="text/plain", size_bytes=len(changed_evidence),
            sha256=hashlib.sha256(changed_evidence).hexdigest(), created_by=field_id,
        ))
        session.commit()
    stale_export = client.get(f"/records/{record_id}/export.pdf")
    stale_text = "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(stale_export.content)).pages)
    assert "contenido previo o versiones anteriores" in stale_text
    assert "Operario" not in stale_text
    stale_docx = client.get(f"/records/{record_id}/export.docx")
    assert stale_docx.status_code == 200
    assert stale_docx.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert stale_docx.headers["cache-control"] == "no-store, max-age=0"
    assert stale_docx.headers["content-disposition"].endswith("_d-03_v1.docx\"")
    with zipfile.ZipFile(io.BytesIO(stale_docx.content)) as archive:
        stale_docx_text = archive.read("word/document.xml").decode("utf-8")
        assert "contenido previo o versiones anteriores" in stale_docx_text
        assert "Operario" not in stale_docx_text
        assert not [name for name in archive.namelist() if name.startswith("word/media/")]
    refreshed_signature = client.post(
        f"/records/{record_id}/sign",
        data=rendered_decision_data(client, f"/records/{record_id}/sign", {**sign_data, "csrf": csrf_for(client, f"/records/{record_id}")}),
        follow_redirects=False,
    )
    assert refreshed_signature.status_code == 303
    duplicate = client.post(f"/records/{record_id}/sign", data=rendered_decision_data(client, f"/records/{record_id}/sign", {**sign_data, "csrf": csrf_for(client, f"/records/{record_id}")}), follow_redirects=False)
    assert duplicate.status_code == 409

    printable = client.get(f"/records/{record_id}/export")
    assert printable.status_code == 200
    assert "Constancias de participación / revisión" in printable.text
    assert "Operario" in printable.text and "SHA-256 del contenido" in printable.text
    assert '<path d="M48.00,126.00' in printable.text
    exported = client.get(f"/records/{record_id}/export.pdf")
    assert exported.status_code == 200 and exported.headers["content-type"] == "application/pdf"
    assert exported.headers["cache-control"] == "no-store, max-age=0"
    exported_text = "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(exported.content)).pages)
    assert "Visita sintética al cuarto de residuos" in exported_text
    assert "Constancias de participación / revisión" in exported_text
    assert "Operario" in exported_text and "SHA-256 del contenido canónico del registro y las evidencias vinculadas" in exported_text
    docx_response = client.get(f"/records/{record_id}/export.docx")
    assert docx_response.status_code == 200
    assert docx_response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert docx_response.headers["cache-control"] == "no-store, max-age=0"
    assert docx_response.headers["content-disposition"].endswith("_d-03_v1.docx\"")
    with zipfile.ZipFile(io.BytesIO(docx_response.content)) as archive:
        document_xml = archive.read("word/document.xml").decode("utf-8")
        assert "Visita sintética al cuarto de residuos" in document_xml
        assert "Constancias de participación y revisión" in document_xml
        assert "Visita de prueba" in document_xml
        assert "Operario" in document_xml
        assert "SHA-256 del contenido canónico del registro y las evidencias vinculadas" in document_xml
        assert len([name for name in archive.namelist() if name.startswith("word/media/")]) == 1

    with SessionLocal() as session:
        signature = session.scalar(select(FormSignature).where(FormSignature.record_id == record_id))
        assert signature is not None and signature.record_version == 1
        record = session.get(FormRecord, record_id)
        record.version = 2
        record.payload = {**record.payload, "D03-005": "Cambio de contenido de prueba"}
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)
    verified_backup = backups.verify_backup_archive(archive_bytes)
    assert verified_backup["legacy_unverifiable_form_signatures"] == 0
    target_engine = create_engine(f"sqlite:///{tmp_path / 'form-signature-restore.sqlite3'}")
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    backups.restore_backup_archive(
        archive_bytes, admin_email="recovery@red.test", admin_name="Admin de recuperación",
        admin_password="Synthetic-Recovery-Password-2026!", session_factory=target_sessions,
        target_engine=target_engine, storage_root=tmp_path / "form-signature-restore-storage",
    )
    with target_sessions() as target:
        restored_signatures = list(target.scalars(select(FormSignature).where(FormSignature.record_id == record_id)))
        assert len(restored_signatures) == 2
        assert all(row.document_snapshot for row in restored_signatures)
        assert all(row.snapshot_status == "verified" for row in restored_signatures)
        assert len({row.document_sha256 for row in restored_signatures}) == 2
    target_engine.dispose()
    old_version_export = client.get(f"/records/{record_id}/export.pdf")
    old_version_text = "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(old_version_export.content)).pages)
    assert "versiones anteriores" in old_version_text
    assert "Operario" not in old_version_text
    old_version_docx = client.get(f"/records/{record_id}/export.docx")
    with zipfile.ZipFile(io.BytesIO(old_version_docx.content)) as archive:
        old_version_docx_text = archive.read("word/document.xml").decode("utf-8")
        assert "versiones anteriores" in old_version_docx_text
        assert "Operario" not in old_version_docx_text
        assert not [name for name in archive.namelist() if name.startswith("word/media/")]
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        backup_data = json.loads(archive.read("database.json"))
        assert backup_data["schema_version"] == 15
        assert len(backup_data["form_signatures"]) == 2
        assert backup_data["form_signatures"][0]["record_version"] == 1
    with SessionLocal() as session:
        docx_exports = list(session.scalars(select(AuditEvent).where(
            AuditEvent.action == "form_record_exported",
            AuditEvent.entity_id == record_id,
        )))
        docx_events = [event for event in docx_exports if event.detail.get("format") == "docx"]
        assert any(event.detail["signature_count"] == 0 for event in docx_events)
        assert any(event.detail["signature_count"] == 1 for event in docx_events)

    client.cookies.clear()
    unauthenticated_docx = client.get(f"/records/{record_id}/export.docx", follow_redirects=False)
    assert unauthenticated_docx.status_code == 303
    sign_in(client, "reader@red.test")
    reader_detail = client.get(f"/records/{record_id}")
    assert reader_detail.status_code == 200 and "Agregar mi constancia" not in reader_detail.text
    assert client.get(f"/records/{record_id}/export.docx").status_code == 200
    assert client.get(f"/records/{other_project_record_id}/export.docx").status_code == 404
    reader_response = client.post(
        f"/records/{record_id}/sign",
        data=rendered_decision_data(client, f"/records/{record_id}/sign", {**sign_data, "csrf": csrf_for(client, f"/records/{record_id}")}),
        follow_redirects=False,
    )
    assert reader_response.status_code == 403


def test_signature_password_reauthentication_is_throttled_without_blocking_login(client, workspace):
    project_id = workspace["project_ids"][0]
    field_id = workspace["user_ids"]["field"]
    with SessionLocal() as session:
        record = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita sintética para control de intentos",
            status="RAW", record_date="2026-10-09", source_kind="observado",
            source_note="Registro sintético para prueba de limitación de intentos.",
            payload={}, created_by=field_id, updated_by=field_id,
        )
        session.add(record)
        session.commit()
        record_id = record.id

    sign_in(client, "field@red.test")
    signature = json.dumps([[[.1, .7], [.9, .3]]])
    for attempt in range(1, 7):
        response = client.post(
            f"/records/{record_id}/sign",
            data=rendered_decision_data(client, f"/records/{record_id}/sign", {"csrf": csrf_for(client, f"/records/{record_id}"), "confirm_signature": "yes",
                  "password": "incorrect synthetic password", "signature_strokes": signature}),
            follow_redirects=False,
        )
        assert response.status_code == (429 if attempt == 6 else 403)

    correct_password_during_lockout = client.post(
        f"/records/{record_id}/sign",
        data=rendered_decision_data(client, f"/records/{record_id}/sign", {"csrf": csrf_for(client, f"/records/{record_id}"), "confirm_signature": "yes",
              "password": PASSWORD, "signature_strokes": signature}),
        follow_redirects=False,
    )
    assert correct_password_during_lockout.status_code == 429
    with SessionLocal() as session:
        throttle = session.scalar(select(LoginThrottle).where(
            LoginThrottle.key == hashlib.sha256(f"signature-reauth:{field_id}".encode("utf-8")).hexdigest(),
        ))
        assert throttle is not None and throttle.attempts == 6 and throttle.blocked_until is not None
        assert session.scalar(select(FormSignature).where(FormSignature.record_id == record_id)) is None

    client.cookies.clear()
    sign_in(client, "field@red.test", PASSWORD)


def test_pmirs_pdf_export_does_not_disclose_another_project(client, workspace):
    other_project_id = workspace["project_ids"][1]
    with SessionLocal() as session:
        version = PMIRSVersion(
            project_id=other_project_id, version_label="v0.1", status="aprobada_interna",
            change_summary="Versión sintética aislada para control de acceso.", change_reason="inicial",
            snapshot={"project": {}, "baseline": {"review_note": ""}, "items": []},
            created_by=workspace["user_ids"]["consultant"],
        )
        session.add(version)
        session.commit()
        version_id = version.id

    sign_in(client, "reader@red.test")
    response = client.get(f"/pmirs/versions/{version_id}/export.pdf")
    assert response.status_code == 404
    assert response.headers.get("content-type", "").startswith("application/json")
    docx_response = client.get(f"/pmirs/versions/{version_id}/export.docx")
    assert docx_response.status_code == 404
    assert docx_response.headers.get("content-type", "").startswith("application/json")
    with SessionLocal() as session:
        assert session.scalar(select(AuditEvent).where(
            AuditEvent.action == "pmirs_version_exported", AuditEvent.entity_id == version_id,
        )) is None


def test_backup_integrity_and_secret_exclusion(tmp_path, workspace, monkeypatch):
    evidence_dir = settings.storage_root / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    blob = b"synthetic evidence file"
    digest = hashlib.sha256(blob).hexdigest()
    storage_name = "synthetic-proof.txt"
    (evidence_dir / storage_name).write_bytes(blob)
    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None, original_name="evidencia.txt",
            storage_name=storage_name, media_type="text/plain", size_bytes=len(blob), sha256=digest,
            created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()
        archive_bytes, counts = backups.build_backup_archive(session)

    manifest = backups.verify_backup_archive(archive_bytes)
    assert manifest["counts"]["projects"] == 4
    assert manifest["counts"]["evidence_files"] == 1
    assert counts["evidence_files"] == 1
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        snapshot = json.loads(archive.read("database.json"))
        assert "password_hash" not in archive.read("database.json").decode("utf-8")
        assert "encrypted_refresh_token" not in archive.read("database.json").decode("utf-8")
        assert archive.read("evidence/" + storage_name) == blob
        snapshot["projects"][0]["name"] = "manipulated"
        altered = io.BytesIO()
        with zipfile.ZipFile(altered, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", archive.read("manifest.json"))
            changed.writestr("database.json", json.dumps(snapshot).encode("utf-8"))
            changed.writestr("evidence/" + storage_name, blob)
    with pytest.raises(ValueError, match="database.json"):
        backups.verify_backup_archive(altered.getvalue())


def test_backup_verifier_rejects_pmirs_signature_not_bound_to_version_snapshot(tmp_path, workspace):
    project_id = workspace["project_ids"][0]
    admin_id = workspace["user_ids"]["admin"]
    with SessionLocal() as session:
        version = PMIRSVersion(
            project_id=project_id, version_label="v0.1", status="borrador",
            change_summary="Versión sintética de prueba", change_reason="inicial",
            snapshot={"project": {"id": project_id, "name": "DEMO sintética"}, "items": []},
            baseline_reference="", created_by=admin_id,
        )
        session.add(version)
        session.flush()
        session.add(PMIRSSignature(
            project_id=project_id, version_id=version.id, signer_user_id=admin_id,
            signer_name="Administración DEMO", signer_email="admin@red.test", signer_role="admin",
            declaration="Constancia sintética de prueba.", signature_path="M48.00,126.00 L192.00,63.00",
            document_sha256=pmirs_document_sha256(version),
        ))
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        database = json.loads(archive.read("database.json"))
        database["pmirs_signatures"][0]["document_sha256"] = "0" * 64
        database_bytes = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
        manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
        altered = io.BytesIO()
        with zipfile.ZipFile(altered, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2))
            changed.writestr("database.json", database_bytes)

    with pytest.raises(ValueError, match="firma PMIRS.*huella.*versión"):
        backups.verify_backup_archive(altered.getvalue())

    target_engine = create_engine(f"sqlite:///{tmp_path / 'rejected-signature-restore.sqlite3'}")
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    storage_root = tmp_path / "rejected-signature-evidence"
    with pytest.raises(ValueError, match="firma PMIRS.*huella.*versión"):
        backups.restore_backup_archive(
            altered.getvalue(), admin_email="recovery@red.test", admin_name="Recuperación DEMO",
            admin_password="Synthetic-Backup-Recovery-2026!", session_factory=target_sessions,
            target_engine=target_engine, storage_root=storage_root,
        )
    with target_sessions() as target:
        assert target.scalar(select(func.count()).select_from(User)) == 0
    assert not storage_root.exists()
    target_engine.dispose()


def test_backup_verifier_rejects_form_signature_not_bound_to_current_record(tmp_path, workspace):
    project_id = workspace["project_ids"][0]
    signer_id = workspace["user_ids"]["field"]
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        record = FormRecord(
            project_id=project_id, form_code="D-03", title="Visita sintética firmada",
            status="RAW", record_date="2026-10-13", source_kind="observado",
            source_note="Constancia sintética de respaldo.", payload={"D03-001": "DEMO"}, version=1,
            created_by=signer_id, updated_by=signer_id,
        )
        session.add(record)
        session.flush()
        session.add(FormSignature(
            project_id=project_id, record_id=record.id, record_version=1,
            signer_user_id=signer_id, signer_name="Operario DEMO", signer_email="field@red.test",
            signer_role="campo", declaration="Constancia sintética para probar integridad.",
            signature_path="M48.00,126.00 L192.00,63.00",
            document_sha256=app_main.form_record_document_sha256(project, record, []),
            document_snapshot=app_main.form_record_document_snapshot(project, record, []),
            snapshot_status="verified",
        ))
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        database = json.loads(archive.read("database.json"))
        database["form_signatures"][0]["document_sha256"] = "0" * 64
        database_bytes = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
        manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
        altered = io.BytesIO()
        with zipfile.ZipFile(altered, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2))
            changed.writestr("database.json", database_bytes)

    with pytest.raises(ValueError, match="firma.*formulario.*huella.*captura"):
        backups.verify_backup_archive(altered.getvalue())

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        database = json.loads(archive.read("database.json"))
        database["form_signatures"][0]["document_snapshot"] = None
        database_bytes = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
        manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
        downgraded = io.BytesIO()
        with zipfile.ZipFile(downgraded, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2))
            changed.writestr("database.json", database_bytes)
    with pytest.raises(ValueError, match="estado de integridad.*captura"):
        backups.verify_backup_archive(downgraded.getvalue())

    target_engine = create_engine(f"sqlite:///{tmp_path / 'rejected-form-signature-restore.sqlite3'}")
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    storage_root = tmp_path / "rejected-form-signature-evidence"
    with pytest.raises(ValueError, match="firma.*formulario.*huella.*captura"):
        backups.restore_backup_archive(
            altered.getvalue(), admin_email="recovery@red.test", admin_name="Recuperación DEMO",
            admin_password="Synthetic-Backup-Recovery-2026!", session_factory=target_sessions,
            target_engine=target_engine, storage_root=storage_root,
        )
    with target_sessions() as target:
        assert target.scalar(select(func.count()).select_from(User)) == 0
    assert not storage_root.exists()
    target_engine.dispose()


@pytest.mark.parametrize("target_kind", ["record", "pmirs_item"])
def test_cross_project_evidence_is_rejected_by_download_and_backup_restore(tmp_path, client, workspace, target_kind):
    project_id, evidence_project_id = workspace["project_ids"][:2]
    admin_id = workspace["user_ids"]["admin"]
    storage_name = f"cross-project-record-evidence-{secrets.token_hex(8)}.txt"
    evidence_bytes = b"Synthetic evidence linked to another project's record."
    storage_path = settings.storage_root / "evidence" / storage_name
    storage_path.parent.mkdir(parents=True, exist_ok=True)
    storage_path.write_bytes(evidence_bytes)

    with SessionLocal() as session:
        if target_kind == "record":
            target = FormRecord(
                project_id=project_id, form_code="D-03", title="Registro sintético entre expedientes",
                status="RAW", record_date="2026-10-13", source_kind="observado",
                source_note="Registro DEMO para comprobar la frontera entre expedientes.", payload={},
                created_by=admin_id, updated_by=admin_id,
            )
            field_id = "D03-001"
        else:
            target = PMIRSItem(
                project_id=project_id, item_type="accion", code="A-BOUNDARY", title="Acción sintética",
                description="Prueba de frontera entre expedientes.", data={}, review_status="RAW",
                created_by=admin_id, updated_by=admin_id,
            )
            field_id = None
        session.add(target)
        session.flush()
        evidence = EvidenceFile(
            project_id=evidence_project_id,
            record_id=target.id if target_kind == "record" else None,
            pmirs_item_id=target.id if target_kind == "pmirs_item" else None,
            field_id=field_id, original_name=storage_name, storage_name=storage_name,
            media_type="text/plain", size_bytes=len(evidence_bytes),
            sha256=hashlib.sha256(evidence_bytes).hexdigest(), created_by=admin_id,
        )
        session.add(evidence)
        session.commit()
        evidence_id = evidence.id
        archive_bytes, _counts = backups.build_backup_archive(session)

    expected_error = "evidencia.*registro de otro expediente" if target_kind == "record" else "evidencia.*objeto PMIRS de otro expediente"
    with pytest.raises(ValueError, match=expected_error):
        backups.verify_backup_archive(archive_bytes)

    target_engine = create_engine(f"sqlite:///{tmp_path / 'cross-project-restore.sqlite3'}")
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    restore_storage = tmp_path / "cross-project-restore-evidence"
    with pytest.raises(ValueError, match=expected_error):
        backups.restore_backup_archive(
            archive_bytes, admin_email="recovery@red.test", admin_name="Recuperación DEMO",
            admin_password="Synthetic-Backup-Recovery-2026!", session_factory=target_sessions,
            target_engine=target_engine, storage_root=restore_storage,
        )
    with target_sessions() as target:
        assert target.scalar(select(func.count()).select_from(User)) == 0
    assert not restore_storage.exists()
    target_engine.dispose()

    sign_in(client, "admin@red.test")
    assert client.get(f"/evidence/{evidence_id}").status_code == 404


@pytest.mark.parametrize("relationship", ["cross_project", "cycle"])
def test_backup_verifier_rejects_invalid_pmirs_version_chains(workspace, relationship):
    from app.models import new_id

    first_project_id, second_project_id = workspace["project_ids"][:2]
    first_version_id, second_version_id = new_id(), new_id()
    second_project_id = second_project_id if relationship == "cross_project" else first_project_id
    with SessionLocal() as session:
        session.add_all([
            PMIRSVersion(
                id=first_version_id, project_id=first_project_id, version_label="v0.1",
                status="borrador", change_summary="Primera versión sintética", change_reason="inicial",
                snapshot={"project": {"id": first_project_id}, "items": []},
                baseline_reference="", created_by=workspace["user_ids"]["admin"],
            ),
            PMIRSVersion(
                id=second_version_id, project_id=second_project_id, previous_version_id=first_version_id,
                version_label="v0.2", status="borrador", change_summary="Versión sintética cruzada",
                change_reason="seguimiento", snapshot={"project": {"id": second_project_id}, "items": []},
                baseline_reference="", created_by=workspace["user_ids"]["admin"],
            ),
        ])
        if relationship == "cycle":
            session.flush()
            first_version = session.get(PMIRSVersion, first_version_id)
            first_version.previous_version_id = second_version_id
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)

    expected_error = (
        "P-12 a una versión ausente o de otro proyecto"
        if relationship == "cross_project" else "ciclo en la cadena P-12"
    )
    with pytest.raises(ValueError, match=expected_error):
        backups.verify_backup_archive(archive_bytes)


def test_backup_verifier_cross_checks_database_evidence_metadata(workspace, monkeypatch):
    evidence_dir = settings.storage_root / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    blob = b"synthetic evidence whose index must match"
    storage_name = "cross-check-proof.txt"
    (evidence_dir / storage_name).write_bytes(blob)
    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None, original_name=storage_name,
            storage_name=storage_name, media_type="text/plain", size_bytes=len(blob),
            sha256=hashlib.sha256(blob).hexdigest(), created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)

    original_read = zipfile.ZipFile.read

    def reject_full_evidence_read(archive, member, *args, **kwargs):
        if isinstance(member, str) and member.startswith("evidence/"):
            pytest.fail("El verificador materializó un miembro de evidencia mediante ZipFile.read.")
        return original_read(archive, member, *args, **kwargs)

    monkeypatch.setattr(zipfile.ZipFile, "read", reject_full_evidence_read)
    assert backups.verify_backup_archive(archive_bytes)["counts"]["evidence_files"] == 1
    monkeypatch.setattr(zipfile.ZipFile, "read", original_read)

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        tampered_blob = b"different but internally hashed evidence"
        manifest["evidence"][0]["sha256"] = hashlib.sha256(tampered_blob).hexdigest()
        manifest["evidence"][0]["size_bytes"] = len(tampered_blob)
        altered = io.BytesIO()
        with zipfile.ZipFile(altered, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(manifest).encode("utf-8"))
            changed.writestr("database.json", archive.read("database.json"))
            changed.writestr(f"evidence/{storage_name}", tampered_blob)

    with pytest.raises(ValueError, match="no coinciden con database.json"):
        backups.verify_backup_archive(altered.getvalue())


def test_backup_verifier_rejects_duplicate_and_unknown_zip_members(workspace):
    with SessionLocal() as session:
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest_bytes = archive.read("manifest.json")
        database_bytes = archive.read("database.json")

    duplicate = io.BytesIO()
    with zipfile.ZipFile(duplicate, "w", compression=zipfile.ZIP_DEFLATED) as changed:
        with pytest.warns(UserWarning, match="Duplicate name"):
            changed.writestr("manifest.json", manifest_bytes)
            changed.writestr("manifest.json", manifest_bytes)
        changed.writestr("database.json", database_bytes)
    with pytest.raises(ValueError, match="rutas ZIP duplicadas"):
        backups.verify_backup_archive(duplicate.getvalue())

    with pytest.raises(ValueError, match="archivos no reconocidos"):
        unknown = io.BytesIO()
        with zipfile.ZipFile(unknown, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", manifest_bytes)
            changed.writestr("database.json", database_bytes)
            changed.writestr("unexpected.txt", b"not part of a RED backup")
        backups.verify_backup_archive(unknown.getvalue())


def test_backup_verifier_rejects_path_traversal_member(workspace):
    with SessionLocal() as session:
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as source:
        manifest_bytes = source.read("manifest.json")
        database_bytes = source.read("database.json")
    malicious = io.BytesIO()
    with zipfile.ZipFile(malicious, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("manifest.json", manifest_bytes)
        archive.writestr("database.json", database_bytes)
        archive.writestr("../outside.txt", b"synthetic traversal payload")

    with pytest.raises(ValueError, match="archivos no reconocidos"):
        backups.verify_backup_archive(malicious.getvalue())


def test_restore_treats_symlink_marked_zip_member_as_regular_evidence(tmp_path, workspace):
    import stat
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app.storage import StorageService

    filename = "opaque-symlink-entry.txt"
    payload = b"synthetic bytes stored as ordinary evidence"
    source_path = settings.storage_root / "evidence" / filename
    source_path.parent.mkdir(parents=True, exist_ok=True)
    source_path.write_bytes(payload)
    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None, original_name=filename,
            storage_name=filename, media_type="text/plain", size_bytes=len(payload),
            sha256=hashlib.sha256(payload).hexdigest(), created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)

    rewritten = io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as source, zipfile.ZipFile(
        rewritten, "w", compression=zipfile.ZIP_DEFLATED,
    ) as target:
        for name in source.namelist():
            member = zipfile.ZipInfo(name)
            member.compress_type = zipfile.ZIP_DEFLATED
            if name == f"evidence/{filename}":
                member.create_system = 3
                member.external_attr = (stat.S_IFLNK | 0o777) << 16
            target.writestr(member, source.read(name))

    symlink_archive = rewritten.getvalue()
    assert backups.verify_backup_archive(symlink_archive)["counts"]["evidence_files"] == 1
    target_engine = create_engine(f"sqlite:///{tmp_path / 'symlink-restore.sqlite3'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    private_root = tmp_path / "private-restore"
    backups.restore_backup_archive(
        symlink_archive, admin_email="symlink-restore@red.test", admin_name="Administradora",
        admin_password="Synthetic-Symlink-Restore-Password-2026", session_factory=target_sessions,
        target_engine=target_engine, storage_service=StorageService(backend="local", local_root=private_root),
    )

    restored = private_root / "evidence" / filename
    assert restored.is_file() and not restored.is_symlink()
    assert restored.read_bytes() == payload
    assert not (tmp_path / "outside.txt").exists()
    target_engine.dispose()


@pytest.mark.parametrize(
    ("archive", "size_cap", "expected_error"),
    [
        (b"larger than cap", 5, "tamaño máximo configurado"),
        (
            struct.pack("<4s4H2LH", b"PK\x05\x06", 0, 0,
                        backups.MAX_BACKUP_ARCHIVE_ENTRIES + 1,
                        backups.MAX_BACKUP_ARCHIVE_ENTRIES + 1, 0, 0, 0),
            None, "demasiadas entradas ZIP",
        ),
        (
            struct.pack("<4s4H2LH", b"PK\x05\x06", 0, 0, 2, 2,
                        backups.MAX_BACKUP_CENTRAL_DIRECTORY_BYTES + 1, 0, 0),
            None, "directorio ZIP.*tamaño máximo",
        ),
    ],
)
def test_backup_verifier_preflights_compressed_size_and_directory_before_zipfile(
    archive, size_cap, expected_error, monkeypatch,
):
    if size_cap is not None:
        monkeypatch.setattr(backups, "max_backup_archive_bytes", lambda: size_cap)

    def zipfile_must_not_open(*_args, **_kwargs):
        pytest.fail("ZipFile se abrió antes de limitar el directorio no confiable.")

    monkeypatch.setattr(zipfile, "ZipFile", zipfile_must_not_open)
    with pytest.raises(ValueError, match=expected_error):
        backups.verify_backup_archive(archive)


def test_backup_verifier_preflights_path_before_opening_zipfile(tmp_path, monkeypatch):
    archive_path = tmp_path / "oversized-red-backup.zip"
    archive_path.write_bytes(b"larger than cap")
    monkeypatch.setattr(backups, "max_backup_archive_bytes", lambda: 5)

    def zipfile_must_not_open(*_args, **_kwargs):
        pytest.fail("ZipFile se abrió antes de comprobar el tamaño de la ruta.")

    monkeypatch.setattr(zipfile, "ZipFile", zipfile_must_not_open)
    with pytest.raises(ValueError, match="tamaño máximo configurado"):
        backups.verify_backup_archive(archive_path)


def test_backup_zip64_directory_preflight_accepts_bounded_empty_directory():
    zip64_end = struct.pack(
        "<4sQ2H2L4Q", b"PK\x06\x06", 44, 45, 45, 0, 0, 0, 0, 0, 0,
    )
    zip64_locator = struct.pack("<4sLQL", b"PK\x06\x07", 0, 0, 1)
    end = struct.pack("<4s4H2LH", b"PK\x05\x06", 0, 0, 0xFFFF, 0xFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0)
    archive_bytes = zip64_end + zip64_locator + end
    with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as archive:
        assert archive.infolist() == []
    backups._zip_directory_preflight(io.BytesIO(archive_bytes))


def test_backup_builder_rejects_excessive_evidence_count_before_storage_read(workspace, monkeypatch):
    original_rows = backups._rows

    def rows_with_excess_evidence(session, model):
        if model is EvidenceFile:
            return [object()] * (backups.MAX_BACKUP_ARCHIVE_ENTRIES - 1)
        return original_rows(session, model)

    class StorageMustNotBeRead:
        def exists(self, _key):
            pytest.fail("El generador leyó almacenamiento tras exceder el máximo de entradas.")

        def get_bytes(self, _key):
            pytest.fail("El generador leyó evidencia tras exceder el máximo de entradas.")

    monkeypatch.setattr(backups, "_rows", rows_with_excess_evidence)
    with SessionLocal() as session:
        with pytest.raises(ValueError, match="demasiados archivos de evidencia"):
            backups.build_backup_archive(session, storage_service=StorageMustNotBeRead())


def test_backup_builder_spools_zip_after_small_memory_threshold(workspace, monkeypatch):
    monkeypatch.setattr(backups, "BACKUP_ARCHIVE_SPOOL_MEMORY_BYTES", 32)
    with SessionLocal() as session:
        archive_file, counts = backups.build_backup_archive_spooled(session)
    try:
        assert archive_file._rolled is True
        assert backups._verify_backup_archive_source(archive_file)["schema_version"] == 15
        assert counts["projects"] == 4
    finally:
        archive_file.close()


@pytest.mark.parametrize(
    ("limit_kind", "expected_error"),
    [
        ("metadata", "metadatos del respaldo exceden"),
        ("evidence", "evidencia expandida del respaldo supera"),
    ],
)
def test_backup_verifier_preflights_expanded_sizes_before_read(
    workspace, monkeypatch, limit_kind, expected_error,
):
    evidence_dir = settings.storage_root / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    blob = b"synthetic evidence for size preflight"
    storage_name = f"size-preflight-{limit_kind}.txt"
    (evidence_dir / storage_name).write_bytes(blob)
    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None, original_name=storage_name,
            storage_name=storage_name, media_type="text/plain", size_bytes=len(blob),
            sha256=hashlib.sha256(blob).hexdigest(), created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)

    original_infolist = zipfile.ZipFile.infolist

    def oversized_infolist(archive):
        infos = original_infolist(archive)
        if limit_kind == "metadata":
            next(info for info in infos if info.filename == "database.json").file_size = backups.MAX_BACKUP_METADATA_BYTES + 1
        else:
            from dataclasses import replace

            monkeypatch.setattr(backups, "settings", replace(
                backups.settings, max_evidence_project_mb=1, max_evidence_total_mb=1,
            ))
            next(info for info in infos if info.filename.startswith("evidence/")).file_size = 1024 * 1024 + 1
        return infos

    def reject_member_read(_archive, _member, *args, **kwargs):
        pytest.fail("El verificador leyó un miembro antes de rechazar el tamaño expandido.")

    monkeypatch.setattr(zipfile.ZipFile, "infolist", oversized_infolist)
    monkeypatch.setattr(zipfile.ZipFile, "read", reject_member_read)
    with pytest.raises(ValueError, match=expected_error):
        backups.verify_backup_archive(archive_bytes)


def test_backup_builder_preflights_evidence_total_before_storage_read(workspace, monkeypatch):
    from dataclasses import replace

    monkeypatch.setattr(backups, "settings", replace(
        backups.settings, max_evidence_project_mb=1, max_evidence_total_mb=1,
    ))

    class StorageMustNotBeRead:
        def exists(self, _key):
            pytest.fail("El generador consultó almacenamiento antes de validar el tamaño total.")

        def get_bytes(self, _key):
            pytest.fail("El generador leyó evidencia antes de validar el tamaño total.")

    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=workspace["project_ids"][0], record_id=None,
            original_name="oversized-evidence.bin", storage_name="oversized-evidence.bin",
            media_type="application/octet-stream", size_bytes=1024 * 1024 + 1,
            sha256="0" * 64, created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()

        with pytest.raises(ValueError, match="supera el límite total configurado"):
            backups.build_backup_archive(session, storage_service=StorageMustNotBeRead())


def test_backup_verifier_rejects_duplicate_json_keys_and_schema_mismatch(workspace):
    with SessionLocal() as session:
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest_bytes = archive.read("manifest.json")
        database_bytes = archive.read("database.json")
        evidence_members = {
            name: archive.read(name) for name in archive.namelist() if name.startswith("evidence/")
        }

    def package(changed_manifest: bytes, changed_database: bytes) -> bytes:
        result = io.BytesIO()
        with zipfile.ZipFile(result, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("manifest.json", changed_manifest)
            archive.writestr("database.json", changed_database)
            for name, payload in evidence_members.items():
                archive.writestr(name, payload)
        return result.getvalue()

    duplicate_manifest = manifest_bytes.rstrip()[:-1] + b',"format":"greenatics-red-backup"}'
    with pytest.raises(ValueError, match="clave JSON repetida: format"):
        backups.verify_backup_archive(package(duplicate_manifest, database_bytes))

    duplicate_database = database_bytes.rstrip()[:-1] + b',"schema_version":7}'
    duplicate_manifest_for_database = json.loads(manifest_bytes)
    duplicate_manifest_for_database["data_sha256"] = hashlib.sha256(duplicate_database).hexdigest()
    with pytest.raises(ValueError, match="clave JSON repetida: schema_version"):
        backups.verify_backup_archive(package(
            json.dumps(duplicate_manifest_for_database).encode("utf-8"), duplicate_database,
        ))

    mismatched_manifest = json.loads(manifest_bytes)
    mismatched_manifest["schema_version"] = 6
    with pytest.raises(ValueError, match="no coincide con la del manifiesto"):
        backups.verify_backup_archive(package(
            json.dumps(mismatched_manifest).encode("utf-8"), database_bytes,
        ))

    boolean_schema = json.loads(manifest_bytes)
    boolean_schema["schema_version"] = True
    with pytest.raises(ValueError, match="formato o versión del respaldo"):
        backups.verify_backup_archive(package(
            json.dumps(boolean_schema).encode("utf-8"), database_bytes,
        ))

    wrong_count_manifest = json.loads(manifest_bytes)
    wrong_count_manifest["counts"]["projects"] = 3
    with pytest.raises(ValueError, match="cantidad projects.*no coincide"):
        backups.verify_backup_archive(package(
            json.dumps(wrong_count_manifest).encode("utf-8"), database_bytes,
        ))

    boolean_count_manifest = json.loads(manifest_bytes)
    boolean_count_manifest["counts"]["projects"] = True
    with pytest.raises(ValueError, match="cantidad projects.*no coincide"):
        backups.verify_backup_archive(package(
            json.dumps(boolean_count_manifest).encode("utf-8"), database_bytes,
        ))

    missing_counts_manifest = json.loads(manifest_bytes)
    missing_counts_manifest.pop("counts")
    with pytest.raises(ValueError, match="manifiesto v7.*resumen de cantidades"):
        backups.verify_backup_archive(package(
            json.dumps(missing_counts_manifest).encode("utf-8"), database_bytes,
        ))


def test_backup_verifier_accepts_legacy_archive_without_empty_evidence_index(workspace):
    with SessionLocal() as session:
        archive_bytes, _counts = backups.build_backup_archive(session)

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        manifest["schema_version"] = 3
        manifest.pop("evidence", None)
        database = json.loads(archive.read("database.json"))
        database["schema_version"] = 3
        database_bytes = json.dumps(database).encode("utf-8")
        manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
        legacy = io.BytesIO()
        with zipfile.ZipFile(legacy, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(manifest).encode("utf-8"))
            changed.writestr("database.json", database_bytes)

    assert backups.verify_backup_archive(legacy.getvalue())["schema_version"] == 3


def test_restore_accepts_pre_privacy_schema_8_without_case_count(tmp_path, workspace):
    with SessionLocal() as session:
        archive_bytes, _counts = backups.build_backup_archive(session)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        database = json.loads(archive.read("database.json"))
        manifest["schema_version"] = database["schema_version"] = 8
        manifest["counts"].pop("privacy_cases")
        manifest["counts"].pop("visit_authorizations")
        database.pop("privacy_cases")
        database.pop("visit_authorizations")
        database_bytes = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode()
        manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
        legacy = io.BytesIO()
        with zipfile.ZipFile(legacy, "w", compression=zipfile.ZIP_DEFLATED) as changed:
            changed.writestr("manifest.json", json.dumps(manifest).encode())
            changed.writestr("database.json", database_bytes)

    assert backups.verify_backup_archive(legacy.getvalue())["schema_version"] == 8
    target_engine = create_engine(f"sqlite:///{tmp_path / 'legacy-v8.sqlite3'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    backups.restore_backup_archive(
        legacy.getvalue(), admin_email="recovery@red.test", admin_name="Admin de recuperación",
        admin_password="Synthetic-Recovery-Password-2026", session_factory=target_sessions,
        target_engine=target_engine, storage_root=tmp_path / "legacy-v8-storage",
    )
    with target_sessions() as target:
        assert target.scalar(select(func.count(PrivacyCase.id))) == 0
        assert target.scalar(select(func.count(Project.id))) == 4
    target_engine.dispose()


def test_restore_uses_empty_target_disables_old_accounts_and_restores_evidence(tmp_path, workspace, monkeypatch):
    project_id = workspace["project_ids"][0]
    admin_id = workspace["user_ids"]["admin"]
    field_id = workspace["user_ids"]["field"]
    evidence_bytes = b"synthetic evidence to restore"
    pmirs_evidence_bytes = b"synthetic PMIRS action evidence"
    evidence_name = "restore-proof.txt"
    pmirs_evidence_name = "pmirs-restore-proof.txt"
    evidence_hash = hashlib.sha256(evidence_bytes).hexdigest()
    pmirs_evidence_hash = hashlib.sha256(pmirs_evidence_bytes).hexdigest()
    evidence_dir = settings.storage_root / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / evidence_name).write_bytes(evidence_bytes)
    (evidence_dir / pmirs_evidence_name).write_bytes(pmirs_evidence_bytes)

    with SessionLocal() as source:
        source_users = {
            user.email: user.session_version
            for user in source.scalars(select(User))
        }
        field_membership = source.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == field_id,
            ProjectMembership.project_id == project_id,
        ))
        assert field_membership and field_membership.active
        # Model an account that was reactivated after offboarding: its project grant stays revoked.
        field_membership.active = False
        source.add(PasswordReset(
            user_id=field_id, token_hash=hash_token("synthetic-reset-before-backup"),
            created_by=admin_id, expires_at=now_utc().replace(year=now_utc().year + 1),
        ))
        edit_submission_key = secrets.token_urlsafe(32)
        record = FormRecord(
            project_id=project_id, form_code="D-06", title="Pesaje sintético", status="VALIDATED",
            record_date="2026-10-07", source_kind="medido", source_note="Báscula de prueba; ejercicio sintético",
            payload={"synthetic": "1 kg"}, version=2, created_by=field_id, updated_by=field_id,
            reviewed_by=workspace["user_ids"]["reviewer"], review_note="Control sintético",
        )
        source.add(record)
        source.flush()
        source.add(FormSignature(
            project_id=project_id, record_id=record.id, record_version=1, signer_user_id=field_id,
            signer_name="Operario", signer_email="field@red.test", signer_role="campo",
            declaration="Constancia sintética de registro para restauración.",
            signature_path="M48.00,126.00 L192.00,63.00", document_sha256="c" * 64,
        ))
        source.add(FormRevision(record_id=record.id, revision=1, payload=record.payload, note="Creación de prueba", changed_by=field_id))
        source.add(FormRevision(
            record_id=record.id, revision=2, payload={"synthetic": "1.1 kg"},
            note="Edición de prueba", submission_key=edit_submission_key, changed_by=field_id,
        ))
        receptacle_payload = {"D04-004": json.dumps([
            {"container_type": "Caneca sintética", "quantity": "2", "capacity": "120 L"},
        ], ensure_ascii=False, separators=(",", ":"))}
        receptacle_record = FormRecord(
            project_id=project_id, form_code="D-04", title="Recipientes sintéticos", status="RAW",
            source_note="Observación sintética de infraestructura.", payload=receptacle_payload,
            created_by=field_id, updated_by=field_id,
        )
        source.add(receptacle_record)
        source.flush()
        source.add(FormRevision(
            record_id=receptacle_record.id, revision=1, payload=receptacle_payload,
            note="Creación sintética de subtabla", changed_by=field_id,
        ))
        receptacle_record_id = receptacle_record.id
        action = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-001", title="Acción sintética restaurable",
            description="Acción con evidencia privada para la prueba de restauración.",
            data={"execution_status": "en_proceso", "progress_pct": 50}, review_status="VALIDATED", version=2,
            created_by=field_id, updated_by=field_id, reviewed_by=workspace["user_ids"]["reviewer"],
        )
        source.add(action)
        source.flush()
        pmirs_submission_key = secrets.token_urlsafe(32)
        source.add(PMIRSItemRevision(
            item_id=action.id, revision=2,
            snapshot={"id": action.id, "code": action.code, "review_status": action.review_status, "version": 2},
            note="Seguimiento sintético", submission_key=pmirs_submission_key, changed_by=field_id,
        ))
        first_version = PMIRSVersion(
            project_id=project_id, version_label="v0.1", status="borrador",
            change_summary="Versión sintética restaurable.", change_reason="inicial",
            snapshot={"items": [{"id": action.id, "review_status": "VALIDATED"}]},
            baseline_reference="LB sintética", created_by=workspace["user_ids"]["consultant"],
        )
        source.add(first_version)
        source.flush()
        source.add(PMIRSSignature(
            project_id=project_id, version_id=first_version.id, signer_user_id=field_id,
            signer_name="Operario", signer_email="field@red.test", signer_role="campo",
            declaration="Constancia sintética de prueba.", signature_path="M48.00,126.00 L192.00,63.00",
            document_sha256=pmirs_document_sha256(first_version),
        ))
        source.add(PMIRSVersion(
            project_id=project_id, previous_version_id=first_version.id,
            version_label="v0.2", status="borrador",
            change_summary="Segunda versión sintética restaurable.", change_reason="seguimiento",
            snapshot={"items": [{"id": action.id, "review_status": "VALIDATED"}]},
            baseline_reference="LB sintética", created_by=workspace["user_ids"]["consultant"],
        ))
        record_evidence_key = secrets.token_urlsafe(32)
        source.add(EvidenceFile(
            project_id=project_id, record_id=record.id, field_id="D06-004", original_name="comprobante.txt",
            storage_name=evidence_name, media_type="text/plain", size_bytes=len(evidence_bytes),
            sha256=evidence_hash, submission_key=record_evidence_key, created_by=field_id,
        ))
        pmirs_evidence_key = secrets.token_urlsafe(32)
        source.add(EvidenceFile(
            project_id=project_id, pmirs_item_id=action.id, original_name="acta-pmirs.txt",
            storage_name=pmirs_evidence_name, media_type="text/plain", size_bytes=len(pmirs_evidence_bytes),
            sha256=pmirs_evidence_hash, submission_key=pmirs_evidence_key, created_by=field_id,
        ))
        source.add(Invitation(
            email="pending@red.test", full_name="Invitación pendiente", project_id=project_id,
            role="campo", platform_admin=False, token_hash=hash_token("synthetic-pending-token"),
            created_by=admin_id, expires_at=now_utc().replace(year=now_utc().year + 1),
        ))
        privacy_case = PrivacyCase(
            case_type="consulta", project_scope="un_proyecto", project_id=project_id,
            classification="consulta", identity_status="verificada", status="respuesta_enviada",
            received_on="2026-10-10", external_reference="RAD-2026-014",
            target_response_on="2026-10-20", target_rule_reference="RULE-2026-01",
            response_on="2026-10-10", response_reference="OUT-2026-008",
            owner_user_id=admin_id, created_by=admin_id, updated_by=admin_id,
        )
        source.add(privacy_case)
        source.flush()
        source.add_all([
            AuditEvent(
                project_id=project_id, actor_id=admin_id, action="privacy_case_created",
                entity_type="privacy_case", entity_id=privacy_case.id,
                detail={"case_type": "consulta", "project_scope": "un_proyecto"},
            ),
            AuditEvent(
                project_id=project_id, actor_id=admin_id, action="privacy_case_updated",
                entity_type="privacy_case", entity_id=privacy_case.id,
                detail={"from_status": "analisis", "to_status": "respuesta_enviada", "response_reference_changed": True},
            ),
        ])
        source.commit()
        record_id = record.id
        privacy_case_id = privacy_case.id
        archive_bytes, _counts = backups.build_backup_archive(source)

    original_put_file = StorageService.put_file
    streamed_keys = []

    def record_streamed_put(storage, key, source_path, content_type="application/octet-stream"):
        streamed_keys.append(key)
        return original_put_file(storage, key, source_path, content_type)

    def reject_full_readback(_storage, _key):
        pytest.fail("La restauración leyó la evidencia completa mediante get_bytes.")

    monkeypatch.setattr(StorageService, "put_file", record_streamed_put)
    monkeypatch.setattr(StorageService, "get_bytes", reject_full_readback)

    target_database = tmp_path / "restored.sqlite3"
    target_engine = create_engine(f"sqlite:///{target_database}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    target_storage = tmp_path / "restored-private"
    result = backups.restore_backup_archive(
        archive_bytes,
        admin_email="admin@red.test",
        admin_name="Administrador recuperado",
        admin_password="New-Synthetic-Admin-Password-2026",
        session_factory=target_sessions,
        target_engine=target_engine,
        storage_root=target_storage,
    )
    assert result["admin_email"] == "admin@red.test"
    assert result["expired_pending_invitations"] == 1
    assert result["legacy_unverifiable_form_signatures"] == 1
    assert set(streamed_keys) == {f"evidence/{evidence_name}", f"evidence/{pmirs_evidence_name}"}
    assert (target_storage / "evidence" / evidence_name).read_bytes() == evidence_bytes
    assert (target_storage / "evidence" / pmirs_evidence_name).read_bytes() == pmirs_evidence_bytes
    verified_manifest = backups.verify_backup_archive(archive_bytes)
    assert verified_manifest["counts"]["evidence_files"] == 2
    assert verified_manifest["legacy_unverifiable_form_signatures"] == 1

    with target_sessions() as target:
        restored_users = list(target.scalars(select(User)))
        bootstrap = target.scalar(select(User).where(User.email == "admin@red.test"))
        restored_field = target.scalar(select(User).where(User.email == "field@red.test"))
        assert bootstrap.active and bootstrap.is_platform_admin
        assert verify_password("New-Synthetic-Admin-Password-2026", bootstrap.password_hash)
        assert not restored_field.active
        assert not restored_field.is_platform_admin
        assert restored_field.session_version == source_users["field@red.test"] + 1
        assert bootstrap.session_version == source_users["admin@red.test"] + 1
        assert not verify_password(PASSWORD, restored_field.password_hash)
        restored_membership = target.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == restored_field.id,
            ProjectMembership.project_id == project_id,
        ))
        assert restored_membership and not restored_membership.active
        assert [user.email for user in restored_users if user.active] == ["admin@red.test"]
        restored_field.active = True
        target.commit()
        assert not target.get(ProjectMembership, restored_membership.id).active
        assert target.scalar(select(PasswordReset).limit(1)) is None
        assert len(restored_users) == 5
        assert target.get(FormRecord, record_id).project_id == project_id
        restored_privacy_case = target.get(PrivacyCase, privacy_case_id)
        assert restored_privacy_case.status == "respuesta_enviada"
        assert restored_privacy_case.response_reference == "OUT-2026-008"
        restored_case_history = list(target.scalars(select(AuditEvent).where(
            AuditEvent.entity_type == "privacy_case", AuditEvent.entity_id == privacy_case_id,
        )))
        assert len(restored_case_history) == 2
        assert any(event.detail.get("response_reference_changed") is True for event in restored_case_history)
        assert "OUT-2026-008" not in str([event.detail for event in restored_case_history])
        assert target.get(FormRecord, receptacle_record_id).payload["D04-004"] == receptacle_payload["D04-004"]
        assert target.scalar(select(FormRevision).where(FormRevision.record_id == record_id)) is not None
        restored_edit_revision = target.scalar(select(FormRevision).where(
            FormRevision.record_id == record_id, FormRevision.revision == 2,
        ))
        assert restored_edit_revision.submission_key == edit_submission_key
        restored_form_signature = target.scalar(select(FormSignature).where(FormSignature.record_id == record_id))
        assert restored_form_signature.record_version == 1
        assert restored_form_signature.signer_email == "field@red.test"
        assert restored_form_signature.signature_path == "M48.00,126.00 L192.00,63.00"
        restored_evidence = target.scalar(select(EvidenceFile).where(EvidenceFile.record_id == record_id))
        assert restored_evidence.sha256 == evidence_hash
        assert restored_evidence.field_id == "D06-004"
        assert restored_evidence.submission_key == record_evidence_key
        restored_action = target.scalar(select(PMIRSItem).where(PMIRSItem.code == "A-001"))
        assert restored_action.project_id == project_id and restored_action.version == 2
        assert target.scalar(select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == restored_action.id)) is not None
        restored_progress_revision = target.scalar(select(PMIRSItemRevision).where(
            PMIRSItemRevision.item_id == restored_action.id,
            PMIRSItemRevision.submission_key == pmirs_submission_key,
        ))
        assert restored_progress_revision is not None
        restored_pmirs_evidence = target.scalar(select(EvidenceFile).where(EvidenceFile.pmirs_item_id == restored_action.id))
        assert restored_pmirs_evidence.sha256 == pmirs_evidence_hash
        assert restored_pmirs_evidence.submission_key == pmirs_evidence_key
        restored_version = target.scalar(select(PMIRSVersion).where(
            PMIRSVersion.project_id == project_id, PMIRSVersion.version_label == "v0.1",
        ))
        assert restored_version.snapshot["items"][0]["id"] == restored_action.id
        restored_followup = target.scalar(select(PMIRSVersion).where(PMIRSVersion.version_label == "v0.2"))
        assert restored_followup.previous_version_id == restored_version.id
        restored_signature = target.scalar(select(PMIRSSignature).where(PMIRSSignature.version_id == restored_version.id))
        assert restored_signature.signer_email == "field@red.test"
        assert restored_signature.signature_path == "M48.00,126.00 L192.00,63.00"
        pending = target.scalar(select(Invitation).where(Invitation.email == "archived-invitation@red.invalid"))
        assert pending.full_name == "Invitación archivada"
        assert pending.accepted_at is None and utc(pending.expires_at) < now_utc()
        assert pending.token_hash != hash_token("synthetic-pending-token")
        assert target.scalar(select(DriveConnection).limit(1)) is None
        assert target.scalar(select(AuditEvent).where(AuditEvent.action == "backup_restored")) is not None

    target_engine.dispose()


def test_restore_refuses_to_delete_a_modified_seed_project(tmp_path, workspace):
    with SessionLocal() as source:
        archive_bytes, _counts = backups.build_backup_archive(source)

    target_database = tmp_path / "modified-seed.sqlite3"
    target_engine = create_engine(f"sqlite:///{target_database}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    with target_sessions() as target:
        projects = [
            Project(slug=slug, name=name, municipality="Bello", department="Antioquia")
            for slug, name in BELLO_PROJECTS
        ]
        target.add_all(projects)
        target.flush()
        altered = projects[0]
        altered.baseline_status = "aceptada"
        altered.baseline_reference = "Referencia de prueba sintética"
        altered.baseline_note = "Criterio de aceptación sintético"
        target.commit()
        altered_id = altered.id

    target_storage = tmp_path / "modified-seed-private"
    with pytest.raises(ValueError, match="expedientes semilla alterados; no se sobrescribió"):
        backups.restore_backup_archive(
            archive_bytes,
            admin_email="admin@red.test",
            admin_name="Administrador recuperado",
            admin_password="New-Synthetic-Admin-Password-2026",
            session_factory=target_sessions,
            target_engine=target_engine,
            storage_root=target_storage,
        )

    with target_sessions() as target:
        preserved = target.get(Project, altered_id)
        assert preserved.baseline_status == "aceptada"
        assert preserved.baseline_reference == "Referencia de prueba sintética"
        assert preserved.baseline_note == "Criterio de aceptación sintético"
        assert target.scalar(select(User).where(User.email == "admin@red.test")) is None
    assert not target_storage.exists() or not any(target_storage.rglob("*"))
    target_engine.dispose()


def test_operational_reference_approval_supersedes_old_versions_and_scopes_field_download(client, workspace):
    from fastapi.testclient import TestClient
    from app.models import OperationalReference
    from sqlalchemy import select

    project_id = workspace["project_ids"][0]
    sign_in(client, "consultant@red.test")
    page_path = f"/projects/{project_id}/operational-references"
    pending_page = client.get(page_path)
    assert pending_page.status_code == 200
    assert "Pendiente de aprobación" in pending_page.text
    csrf = re.search(r'name="csrf" value="([^"]+)"', pending_page.text).group(1)
    upload = client.post(page_path, data={
        "csrf": csrf, "category": "guia_operativa", "title": "Guía sintética de prueba",
        "version_label": "v1", "source_note": "Archivo sintético para comprobar revisión por proyecto.",
        }, files={"file": ("guia.pdf", "%PDF-1.7\ncontenido sintético".encode(), "text/html")}, follow_redirects=False)
    assert upload.status_code == 303
    with SessionLocal() as session:
        reference = session.scalar(select(OperationalReference).where(OperationalReference.project_id == project_id))
        assert reference and reference.status == "pendiente_revision"
        reference_id, evidence_id = reference.id, reference.evidence_id
        assert session.get(EvidenceFile, evidence_id).media_type == "application/pdf"

    p14 = client.get(f"/projects/{project_id}/records/new?form_code=P-14")
    assert "Pendiente: la guía operativa aprobada" in p14.text
    reviewer_action = client.post(f"/operational-references/{reference_id}/review", data=rendered_decision_data(client, f"/operational-references/{reference_id}/review", {
        "csrf": csrf_for(client, page_path), "decision": "aprobar", "reason": "No corresponde a consultoría aprobar.",
    }), follow_redirects=False)
    assert reviewer_action.status_code == 403

    with TestClient(app_main.app) as reviewer, TestClient(app_main.app) as field:
        sign_in(reviewer, "reviewer@red.test")
        review_page = reviewer.get(page_path)
        review_csrf = re.search(r'name="csrf" value="([^"]+)"', review_page.text).group(1)
        approved = reviewer.post(f"/operational-references/{reference_id}/review", data=rendered_decision_data(reviewer, f"/operational-references/{reference_id}/review", {
            "csrf": review_csrf, "decision": "aprobar", "reason": "Versión sintética aprobada para la prueba.",
        }), follow_redirects=False)
        assert approved.status_code == 303

        sign_in(field, "field@red.test")
        field_page = field.get(page_path)
        assert "Guía sintética de prueba" in field_page.text
        assert "Abrir aprobado" in field_page.text
        p14 = field.get(f"/projects/{project_id}/records/new?form_code=P-14")
        assert "Guía sintética de prueba · versión v1 · Aprobada" in p14.text
        download = field.get(f"/evidence/{evidence_id}")
        assert download.status_code == 200
        assert download.content.startswith(b"%PDF-1.7")

    # A second version replaces the active one without deleting the prior record.
    version_two = client.post(page_path, data={
        "csrf": csrf_for(client, page_path), "category": "guia_operativa", "title": "Guía sintética actualizada",
        "version_label": "v2", "source_note": "Segunda fuente sintética para comprobar el historial de versiones.",
    }, files={"file": ("guia-v2.pdf", "%PDF-1.7\ncontenido sintético v2".encode(), "application/pdf")}, follow_redirects=False)
    assert version_two.status_code == 303
    with SessionLocal() as session:
        second = session.scalar(select(OperationalReference).where(
            OperationalReference.project_id == project_id, OperationalReference.version_label == "v2",
        ))
        assert second
        second_id, second_evidence_id = second.id, second.evidence_id

    with TestClient(app_main.app) as reviewer, TestClient(app_main.app) as field:
        sign_in(reviewer, "reviewer@red.test")
        review_page = reviewer.get(page_path)
        review_csrf = re.search(r'name="csrf" value="([^"]+)"', review_page.text).group(1)
        assert reviewer.post(f"/operational-references/{second_id}/review", data=rendered_decision_data(reviewer, f"/operational-references/{second_id}/review", {
            "csrf": review_csrf, "decision": "aprobar", "reason": "Se revisó la segunda versión sintética.",
        }), follow_redirects=False).status_code == 303
        sign_in(field, "field@red.test")
        p14 = field.get(f"/projects/{project_id}/records/new?form_code=P-14")
        assert "Guía sintética actualizada · versión v2 · Aprobada" in p14.text
        assert field.get(f"/evidence/{evidence_id}").status_code == 404
        assert field.get(f"/evidence/{second_evidence_id}").status_code == 200

    with SessionLocal() as session:
        rows = list(session.scalars(select(OperationalReference).where(
            OperationalReference.project_id == project_id,
        ).order_by(OperationalReference.version_label)))
        assert [(row.version_label, row.status) for row in rows] == [("v1", "reemplazada"), ("v2", "aprobada")]
        archive_bytes, counts = backups.build_backup_archive(session)
    manifest = backups.verify_backup_archive(archive_bytes)
    assert counts["operational_references"] == manifest["counts"]["operational_references"] == 2


def test_operational_reference_upload_rejects_malformed_files_and_keeps_project_boundary(client, workspace):
    from app.models import EvidenceFile, OperationalReference
    from sqlalchemy import func, select

    project_id, other_project_id = workspace["project_ids"][:2]
    path = f"/projects/{project_id}/operational-references"
    sign_in(client, "consultant@red.test")
    page = client.get(path)
    csrf = re.search(r'name="csrf" value="([^\"]+)"', page.text).group(1)
    rejected = client.post(path, data={
        "csrf": csrf, "category": "tabla_separacion", "title": "Tabla de prueba",
        "version_label": "v1", "source_note": "Archivo sintético para rechazo de contenido inválido.",
    }, files={"file": ("tabla.docx", b"no es un documento Office", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
    assert rejected.status_code == 422
    with SessionLocal() as session:
        assert session.scalar(select(func.count(EvidenceFile.id))) == 0
        assert session.scalar(select(func.count(OperationalReference.id))) == 0

    # A consultant's membership in one project does not reveal another project's library.
    assert client.get(f"/projects/{other_project_id}/operational-references").status_code == 404
    sign_in(client, "reader@red.test")
    reader_page = client.get(path)
    assert reader_page.status_code == 200
    assert "Cargar documento para revisión" not in reader_page.text


def test_backup_verifier_rejects_duplicate_or_misbound_operational_references(workspace):
    from app.models import OperationalReference, new_id

    blob = b"%PDF-1.7 synthetic operational reference"
    storage_name = "backup-operational-reference.pdf"
    reference_id = new_id()
    reference_field_id = f"operational-reference:{reference_id}"
    (settings.storage_root / "evidence").mkdir(parents=True, exist_ok=True)
    (settings.storage_root / "evidence" / storage_name).write_bytes(blob)
    with SessionLocal() as session:
        evidence = EvidenceFile(
            project_id=workspace["project_ids"][0], field_id=reference_field_id,
            original_name=storage_name, storage_name=storage_name, media_type="application/pdf",
            size_bytes=len(blob), sha256=hashlib.sha256(blob).hexdigest(),
            created_by=workspace["user_ids"]["admin"],
        )
        session.add(evidence)
        session.flush()
        session.add(OperationalReference(
            id=reference_id, project_id=workspace["project_ids"][0], category="guia_operativa",
            title="Guía sintética", version_label="v1", status="pendiente_revision",
            source_note="Fuente sintética de prueba del verificador.", review_note="",
            evidence_id=evidence.id, created_by=workspace["user_ids"]["admin"],
        ))
        session.commit()
        archive_bytes, _counts = backups.build_backup_archive(session)

    def rewrite_database(mutator):
        with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
            manifest = json.loads(archive.read("manifest.json"))
            database = json.loads(archive.read("database.json"))
            mutator(database)
            database_bytes = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
            manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
            manifest["counts"]["operational_references"] = len(database["operational_references"])
            rewritten = io.BytesIO()
            with zipfile.ZipFile(rewritten, "w", compression=zipfile.ZIP_DEFLATED) as target:
                target.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2))
                target.writestr("database.json", database_bytes)
                for member in archive.namelist():
                    if member.startswith("evidence/"):
                        target.writestr(member, archive.read(member))
        return rewritten.getvalue()

    duplicate = rewrite_database(lambda database: database["operational_references"].append(
        dict(database["operational_references"][0]),
    ))
    with pytest.raises(ValueError, match="referencia operativa con vínculos o estado no válidos"):
        backups.verify_backup_archive(duplicate)

    misbound = rewrite_database(lambda database: database["evidence"][0].update(field_id="P14-001"))
    with pytest.raises(ValueError, match="referencia operativa con vínculos o estado no válidos"):
        backups.verify_backup_archive(misbound)
