from __future__ import annotations

import io
import json
import re
from collections.abc import Iterable
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import CondPageBreak, Flowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from .export_notices import PMIRS_EXPORT_NOTICE, pmirs_project_identity_notice


INK = colors.HexColor("#17251c")
GREEN = colors.HexColor("#145b31")
MUTED = colors.HexColor("#58655c")
LINE = colors.HexColor("#d7dfd8")
PALE = colors.HexColor("#f3f6f3")
ITEM_HEADINGS = {
    "hallazgo": "Hallazgos técnicos",
    "programa": "Programas",
    "accion": "Plan de acciones",
    "indicador": "Indicadores y metas",
}
FIELD_LABELS = {
    "topic": "Tema", "priority": "Prioridad", "support_level": "Nivel de soporte",
    "source_record_ids": "Registros fuente", "evidence_ids": "Evidencias vinculadas",
    "priority_reason": "Justificación de prioridad", "recommended_program_id": "Programa sugerido",
    "discard_reason": "Motivo de descarte", "limitations": "Limitaciones",
    "lifecycle_status": "Estado del hallazgo",
    "applies": "Aplicabilidad", "applicability_reason": "Justificación de aplicabilidad",
    "objective": "Objetivo", "scope": "Alcance", "owner_role": "Responsable principal",
    "program_status": "Estado del programa", "finding_ids": "Hallazgos vinculados",
    "owner": "Responsable", "support": "Apoyo", "start_date": "Fecha de inicio",
    "due_date": "Fecha objetivo", "completion_criteria": "Criterio de terminación",
    "indicator_id": "Indicador asociado", "expected_evidence": "Evidencia esperada",
    "expected_evidence_detail": "Detalle de evidencia", "execution_status": "Estado de ejecución",
    "progress_pct": "Avance (%)", "progress_note": "Novedad registrada",
    "close_reason": "Motivo de cierre", "resources": "Recursos", "definition": "Definición",
    "formula": "Fórmula", "unit": "Unidad", "source_description": "Fuente",
    "frequency": "Frecuencia", "report_owner": "Responsable del reporte",
    "target": "Meta", "baseline_value": "Valor de Línea Base", "baseline_date": "Fecha de Línea Base",
    "baseline_support": "Soporte de la Línea Base", "capture_action_id": "Acción de captura vinculada",
    "indicator_status": "Estado del indicador",
    "data_available": "Disponibilidad del dato", "capture_method": "Método de captura",
    "program_id": "Programa vinculado", "indicator_id": "Indicador vinculado",
    "assignee_user_ids": "Asignación operativa en RED",
}
EXPORT_STATUS_LABELS = {
    "VALIDATED": "Validado", "PENDING_REVIEW": "Pendiente de revisión",
    "CORRECTION_REQUESTED": "Requiere corrección", "borrador": "Borrador",
    "revision_interna": "En revisión interna", "aprobada_interna": "Aprobada internamente",
    "aprobado_interno": "Aprobado internamente", "en_revision": "En revisión",
    "implementacion": "En implementación", "activo": "Activo", "no_aplica": "No aplica",
    "abierto": "Abierto", "tratado": "Tratado", "descartado": "Descartado", "monitoreo": "En monitoreo",
    "pendiente": "Pendiente", "en_proceso": "En proceso",
    "pendiente_tercero": "Pendiente de tercero", "evidencia_cargada": "Evidencia cargada",
    "en_validacion": "En validación", "requiere_correccion": "Requiere corrección",
    "validada": "Validada", "cerrada": "Cerrada",
}


def _text(value: object) -> str:
    if value is None or value == "":
        return "No registrado"
    if isinstance(value, (dict, list, tuple)):
        return json.dumps(value, ensure_ascii=False, sort_keys=True, default=str)
    return str(value)


def _paragraph_text(value: object) -> str:
    return escape(_text(value)).replace("\n", "<br/>")


def _field_label(key: object) -> str:
    if str(key) in FIELD_LABELS:
        return FIELD_LABELS[str(key)]
    words = re.sub(r"[_\-]+", " ", str(key)).strip()
    if re.fullmatch(r"[A-Z]{1,4}\d{2}-\d{3}", words):
        return words.upper()
    return words[:1].upper() + words[1:]


def pmirs_reference_labels(snapshot: dict) -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    """Return human-readable, snapshot-bound labels for PMIRS, sources, and evidence."""
    item_labels = {
        str(item["id"]): f"{_text(item.get('code'))} · {_text(item.get('title'))}"
        for item in snapshot.get("items", [])
        if isinstance(item, dict) and item.get("id")
    }
    source_labels = {
        str(record["id"]): " · ".join(part for part in (
            _text(record.get("form_code")),
            str(record.get("record_date") or "Fecha sin registrar"),
            f"v{record.get('version')}" if record.get("version") else "",
            EXPORT_STATUS_LABELS.get(str(record.get("status")), _text(record.get("status"))),
        ) if part)
        for record in snapshot.get("source_records", [])
        if isinstance(record, dict) and record.get("id")
    }
    evidence_labels = {
        str(item["id"]): " · ".join(part for part in (
            f"Evidencia {index}",
            f"campo {item['field_id']}" if item.get("field_id") else "Adjunto del expediente",
            f"{item.get('size_bytes', 0)} bytes",
            f"SHA-256 {item['sha256']}" if item.get("sha256") else "",
        ) if part)
        for index, item in enumerate(snapshot.get("evidence_files", []), start=1)
        if isinstance(item, dict) and item.get("id")
    }
    return item_labels, source_labels, evidence_labels


def pmirs_export_fields(item: dict, snapshot: dict) -> list[tuple[str, str]]:
    """Format a captured PMIRS item's data without exposing internal database IDs."""
    item_labels, source_labels, evidence_labels = pmirs_reference_labels(snapshot)
    data = item.get("data") if isinstance(item.get("data"), dict) else {}
    rows: list[tuple[str, str]] = []
    for key, value in data.items():
        key_text = str(key)
        label = _field_label(key_text)
        if key_text in {"program_id", "indicator_id", "recommended_program_id", "capture_action_id"}:
            value_text = item_labels.get(str(value), "Objeto no incluido en esta versión") if value else "Sin objeto vinculado"
        elif key_text == "finding_ids":
            reference_ids = value if isinstance(value, (list, tuple)) else []
            value_text = "; ".join(item_labels.get(str(value_id), "Hallazgo no incluido en esta versión") for value_id in reference_ids) if reference_ids else "Sin hallazgos vinculados"
        elif key_text == "source_record_ids":
            reference_ids = value if isinstance(value, (list, tuple)) else []
            value_text = "; ".join(source_labels.get(str(value_id), "Registro de soporte sin referencia en esta versión") for value_id in reference_ids) if reference_ids else "Sin registros fuente vinculados"
        elif key_text == "evidence_ids":
            evidence_ids = value if isinstance(value, (list, tuple)) else []
            value_text = "; ".join(evidence_labels.get(str(evidence_id), "Evidencia sin referencia en esta versión") for evidence_id in evidence_ids) if evidence_ids else "Sin evidencias vinculadas"
        elif key_text == "assignee_user_ids":
            count = len(value) if isinstance(value, (list, tuple)) else 0
            noun = "persona asignada" if count == 1 else "personas asignadas"
            value_text = f"{count} {noun}; consulta la identidad y membresía en RED" if count else "Sin asignación individual en RED"
        elif key_text in {"review_status", "program_status", "execution_status", "lifecycle_status", "indicator_status"}:
            value_text = EXPORT_STATUS_LABELS.get(str(value), _text(value))
        elif key_text in {"applies", "data_available"}:
            value_text = {"si": "Sí", "no": "No", "parcial": "Parcial"}.get(str(value), _text(value))
        else:
            value_text = _text(value)
        rows.append((label, value_text))
    return rows


class SignatureFlowable(Flowable):
    """Draw a stored, normalized signature path as vector marks in its PDF card."""

    def __init__(self, path_data: str, width: float, height: float = 30 * mm):
        super().__init__()
        self.width = width
        self.height = height
        self.path_data = path_data

    def draw(self) -> None:
        canvas = self.canv
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.roundRect(0, 0, self.width, self.height, 2 * mm, stroke=1, fill=0)
        canvas.setStrokeColor(INK)
        canvas.setLineWidth(1.2)
        canvas.setLineCap(1)
        canvas.setLineJoin(1)
        points = re.findall(r"([ML])(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)", self.path_data)
        if not points or "".join(match[0] for match in points) == "":
            canvas.restoreState()
            return
        path = canvas.beginPath()
        for command, raw_x, raw_y in points:
            x = float(raw_x) / 600 * max(1, self.width - 12)
            y = self.height - (float(raw_y) / 180 * max(1, self.height - 10)) - 5
            if command == "M":
                path.moveTo(x + 6, y)
            else:
                path.lineTo(x + 6, y)
        canvas.drawPath(path, stroke=1, fill=0)
        canvas.restoreState()


def _make_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("RedTitle", parent=base["Title"], fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=GREEN, alignment=TA_LEFT, spaceAfter=5),
        "subtitle": ParagraphStyle("RedSubtitle", parent=base["Normal"], fontName="Helvetica", fontSize=9, leading=13, textColor=MUTED, spaceAfter=5),
        "heading": ParagraphStyle("RedHeading", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=13, leading=17, textColor=GREEN, spaceBefore=12, spaceAfter=6, keepWithNext=True),
        "item_title": ParagraphStyle("RedItemTitle", parent=base["Heading3"], fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=INK, spaceBefore=4, spaceAfter=3, keepWithNext=True),
        "body": ParagraphStyle("RedBody", parent=base["BodyText"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=INK, spaceAfter=4),
        "small": ParagraphStyle("RedSmall", parent=base["BodyText"], fontName="Helvetica", fontSize=7.5, leading=10, textColor=MUTED, spaceAfter=3),
        "meta_label": ParagraphStyle("RedMetaLabel", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=7, leading=9, textColor=MUTED),
        "meta_value": ParagraphStyle("RedMetaValue", parent=base["BodyText"], fontName="Helvetica", fontSize=8.2, leading=11, textColor=INK),
        "field_label": ParagraphStyle("RedFieldLabel", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=7.4, leading=10, textColor=MUTED),
        "field_value": ParagraphStyle("RedFieldValue", parent=base["BodyText"], fontName="Helvetica", fontSize=8, leading=11, textColor=INK),
    }


def _item_block(item: dict, snapshot: dict, styles: dict, available_width: float) -> list[Flowable]:
    block: list[Flowable] = [
        Paragraph(f"{escape(_text(item.get('code')))} · {escape(_text(item.get('item_type_label')))} · {escape(EXPORT_STATUS_LABELS.get(str(item.get('review_status')), _text(item.get('review_status'))))}", styles["small"]),
        Paragraph(_paragraph_text(item.get("title")), styles["item_title"]),
    ]
    if item.get("description"):
        block.append(Paragraph(_paragraph_text(item["description"]), styles["body"]))
    rows = [
        [Paragraph(escape(label), styles["field_label"]), Paragraph(_paragraph_text(value), styles["field_value"])]
        for label, value in pmirs_export_fields(item, snapshot)
    ]
    if rows:
        table = Table(rows, colWidths=[available_width * 0.27, available_width * 0.73], repeatRows=0, hAlign="LEFT")
        table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LINEBELOW", (0, 0), (-1, -1), 0.25, LINE),
        ]))
        block.append(table)
    return [KeepTogether(block), Spacer(1, 4 * mm)]


def _signature_block(signature, styles: dict, available_width: float) -> list[Flowable]:
    card_width = available_width
    card: list[Flowable] = [
        SignatureFlowable(signature.signature_path, card_width - 4 * mm),
        Spacer(1, 2 * mm),
        Paragraph(f"<b>{_paragraph_text(signature.signer_name)}</b> · {_paragraph_text(signature.signer_email)} · rol {_paragraph_text(signature.signer_role)}", styles["body"]),
        Paragraph(f"Fecha UTC: {_paragraph_text(signature.signed_at.strftime('%Y-%m-%d %H:%M:%S UTC'))}", styles["small"]),
        Paragraph(_paragraph_text(signature.declaration), styles["small"]),
        Paragraph(f"SHA-256 del contenido canónico al que se vincula esta constancia: {_paragraph_text(signature.document_sha256)}", styles["small"]),
    ]
    table = Table([[card]], colWidths=[card_width])
    table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return [KeepTogether([table, Spacer(1, 3 * mm)])]


def _draw_page(canvas, document, version_label: str) -> None:
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(GREEN)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(document.leftMargin, height - 13 * mm, "GREENATICS RED · DOCUMENTO DE TRABAJO")
    canvas.setStrokeColor(GREEN)
    canvas.setLineWidth(1)
    canvas.line(document.leftMargin, height - 15 * mm, width - document.rightMargin, height - 15 * mm)
    canvas.setStrokeColor(LINE)
    canvas.line(document.leftMargin, 13 * mm, width - document.rightMargin, 13 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(document.leftMargin, 9 * mm, f"GREENATICS RED · {version_label} · Captura de trabajo")
    canvas.drawRightString(width - document.rightMargin, 9 * mm, f"Página {document.page}")
    canvas.restoreState()


def build_pmirs_version_pdf(
    project, version, status_label: str, signatures: Iterable, signature_hash: str,
    signatures_valid: bool = True,
    currentness_notice: str = "",
) -> bytes:
    """Build a standalone PDF snapshot with only signatures bound to its content hash."""
    snapshot = version.snapshot if isinstance(version.snapshot, dict) else {}
    captured_project = snapshot.get("project") if isinstance(snapshot.get("project"), dict) else {}
    project_name = str(captured_project.get("name") or project.name)
    municipality = str(captured_project.get("municipality") or project.municipality)
    department = str(captured_project.get("department") or project.department)
    address = str(captured_project.get("address") or "")
    output = io.BytesIO()
    document = SimpleDocTemplate(
        output,
        pagesize=letter,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=22 * mm,
        bottomMargin=20 * mm,
        title=f"PMIRS {version.version_label} - {project_name}",
        author="GREENATICS RED",
        subject="Captura versionada de trabajo PMIRS",
    )
    styles = _make_styles()
    story: list[Flowable] = [
        Paragraph("Plan de gestión integral de residuos de la copropiedad", styles["title"]),
        Paragraph(" · ".join(filter(None, (
            _paragraph_text(project_name), _paragraph_text(address),
            f"{_paragraph_text(municipality)}, {_paragraph_text(department)}",
        ))), styles["subtitle"]),
        Paragraph(f"<b>Identificación de la unidad:</b> {_paragraph_text(pmirs_project_identity_notice(captured_project))}", styles["small"]),
    ]
    metadata = [
        ("Versión", version.version_label),
        ("Fecha de captura", version.created_at.strftime("%Y-%m-%d %H:%M UTC")),
        ("Dirección de la copropiedad", address or "Pendiente de confirmar"),
        ("Estado de identificación", "Confirmada" if captured_project.get("identity_status") == "confirmada" else "Pendiente o no conservada"),
        ("Referencia de confirmación", str(captured_project.get("identity_reference") or "Sin referencia")),
        ("Fecha de cotejo", str(captured_project.get("identity_confirmed_at") or "Sin confirmación registrada")),
        ("Motivo del cambio", str(version.change_reason).replace("_", " ")),
        ("Estado interno", status_label),
        ("Resumen", version.change_summary),
        ("Línea Base de referencia", version.baseline_reference or "Sin referencia registrada"),
    ]
    metadata_rows = []
    for index in range(0, len(metadata), 2):
        row = []
        for label, value in metadata[index:index + 2]:
            row.extend([Paragraph(escape(label.upper()), styles["meta_label"]), Paragraph(_paragraph_text(value), styles["meta_value"])])
        if len(row) < 4:
            row.extend([Paragraph("", styles["meta_label"]), Paragraph("", styles["meta_value"])])
        metadata_rows.append(row)
    meta_widths = [document.width * 0.17, document.width * 0.33, document.width * 0.17, document.width * 0.33]
    meta_table = Table(metadata_rows, colWidths=meta_widths, hAlign="LEFT")
    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
    ]))
    story.extend([meta_table, Spacer(1, 5 * mm), Paragraph(
        f"<b>Alcance y estado:</b> {_paragraph_text(PMIRS_EXPORT_NOTICE)}",
        styles["small"],
    )])
    if currentness_notice:
        story.append(Paragraph(
            f"<b>Comparación con el expediente actual:</b> {_paragraph_text(currentness_notice)}",
            styles["small"],
        ))
    snapshot = version.snapshot if isinstance(version.snapshot, dict) else {}
    items = snapshot.get("items", []) if isinstance(snapshot.get("items", []), list) else []
    for kind, heading in ITEM_HEADINGS.items():
        group = [item for item in items if isinstance(item, dict) and item.get("item_type") == kind]
        if group:
            # Keep section headings with enough room to introduce their first item.
            story.append(CondPageBreak(40 * mm))
        story.append(Paragraph(escape(heading), styles["heading"]))
        if group:
            for item in group:
                story.extend(_item_block(item, snapshot, styles, document.width))
        else:
            story.append(Paragraph("No hay objetos de este tipo en esta versión.", styles["body"]))
    baseline = snapshot.get("baseline") if isinstance(snapshot.get("baseline"), dict) else {}
    story.extend([
        Paragraph("Referencia de Línea Base", styles["heading"]),
        Paragraph(_paragraph_text(baseline.get("review_note") or "No se incluyó un fundamento en la captura."), styles["body"]),
    ])
    signature_rows = list(signatures)
    if signature_rows:
        first_signature = _signature_block(signature_rows[0], styles, document.width)
        story.append(KeepTogether([
            Paragraph("Constancias de lectura y recepción", styles["heading"]),
            Paragraph("Las constancias siguientes se vinculan a la huella de contenido de esta versión PMIRS.", styles["body"]),
            *first_signature,
        ]))
        for signature in signature_rows[1:]:
            story.extend(_signature_block(signature, styles, document.width))
    elif not signatures_valid:
        story.extend([
            Paragraph("Constancias de lectura y recepción", styles["heading"]),
            Paragraph("No fue posible verificar la correspondencia entre las firmas registradas y el contenido de esta versión. Solicita revisión antes de usar esta copia.", styles["body"]),
        ])
    else:
        story.extend([
            Paragraph("Constancias de lectura y recepción", styles["heading"]),
            Paragraph("No se han registrado constancias de firma para esta versión.", styles["body"]),
        ])
    story.append(Paragraph(
        "La firma capturada es una constancia electrónica vinculada a una cuenta autenticada y a esta versión. No es por sí sola una firma digital certificada, no acredita facultades de representación ni equivale a aprobación de autoridad.",
        styles["small"],
    ))
    if not signature_rows:
        story.append(Paragraph(f"SHA-256 del contenido canónico de esta versión PMIRS: {_paragraph_text(signature_hash)}", styles["small"]))
    document.build(story, onFirstPage=lambda canvas, doc: _draw_page(canvas, doc, version.version_label), onLaterPages=lambda canvas, doc: _draw_page(canvas, doc, version.version_label))
    return output.getvalue()


def build_form_record_pdf(
    *, project, record, form_spec: dict, fields: Iterable[tuple[str, str]],
    signatures: Iterable, signature_hash: str, signatures_valid: bool = True,
    has_prior_signatures: bool = False, status_label: str | None = None,
) -> bytes:
    """Build an individual field form with only signatures bound to its current revision."""
    output = io.BytesIO()
    version_label = f"{record.form_code} · v{record.version}"
    document = SimpleDocTemplate(
        output, pagesize=letter, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=22 * mm, bottomMargin=20 * mm,
        title=f"{record.form_code} - {project.name}", author="GREENATICS RED",
        subject="Registro operativo de trabajo",
    )
    styles = _make_styles()
    story: list[Flowable] = [
        Paragraph(escape(_text(form_spec.get("title", record.title))), styles["title"]),
        Paragraph(f"{_paragraph_text(project.name)} · {_paragraph_text(project.municipality)}, {_paragraph_text(project.department)}", styles["subtitle"]),
    ]
    metadata = [
        ("Código", record.form_code), ("Versión", record.version),
        ("Registro", record.title),
        ("Fecha del registro", record.record_date or "Sin fecha"),
        ("Estado RED", status_label or record.status), ("Tipo de fuente", record.source_kind.replace("_", " ").title()),
        ("Fuente / método", record.source_note or "Pendiente de documentar"),
    ]
    rows = []
    for index in range(0, len(metadata), 2):
        row = []
        for label, value in metadata[index:index + 2]:
            row.extend([Paragraph(escape(str(label).upper()), styles["meta_label"]), Paragraph(_paragraph_text(value), styles["meta_value"])])
        if len(row) < 4:
            row.extend([Paragraph("", styles["meta_label"]), Paragraph("", styles["meta_value"])])
        rows.append(row)
    table = Table(rows, colWidths=[document.width * .17, document.width * .33, document.width * .17, document.width * .33], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -1), .35, LINE),
    ]))
    story.extend([table, Spacer(1, 4 * mm), Paragraph(
        "Copia de trabajo generada desde GREENATICS RED. Una firma que aparezca aquí es una constancia personal de participación en la captura o revisión visible de este registro; no certifica por sí sola la veracidad técnica, no acredita representación legal ni equivale a aprobación de autoridad.",
        styles["small"],
    ), Paragraph("Respuestas", styles["heading"])])
    for label, value in fields:
        block = Table([[Paragraph(_paragraph_text(label), styles["field_label"])], [Paragraph(_paragraph_text(value), styles["field_value"])]], colWidths=[document.width])
        block.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5), ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3), ("LINEBELOW", (0, -1), (-1, -1), .35, LINE),
        ]))
        story.extend([block, Spacer(1, 1.5 * mm)])
    signature_rows = list(signatures)
    story.append(Paragraph("Constancias de participación / revisión", styles["heading"]))
    if has_prior_signatures:
        story.append(Paragraph("Existen constancias de contenido previo o versiones anteriores. No se muestran como vigentes en esta exportación.", styles["small"]))
    if signature_rows:
        for signature in signature_rows:
            story.extend(_signature_block(signature, styles, document.width))
    elif not signatures_valid:
        story.append(Paragraph("Hay firmas de otras versiones o una huella que no corresponde a esta versión. Se omitieron para evitar asociarlas al contenido actual.", styles["body"]))
    else:
        story.append(Paragraph("No se han registrado constancias para esta versión del registro.", styles["body"]))
    story.append(Paragraph(f"SHA-256 del contenido canónico del registro y las evidencias vinculadas: {_paragraph_text(signature_hash)}", styles["small"]))
    document.build(story, onFirstPage=lambda canvas, doc: _draw_page(canvas, doc, version_label), onLaterPages=lambda canvas, doc: _draw_page(canvas, doc, version_label))
    return output.getvalue()
