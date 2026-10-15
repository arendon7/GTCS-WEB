from __future__ import annotations

import io
import json
import re
import zipfile
from collections.abc import Iterable
from xml.etree import ElementTree as ET

from PIL import Image, ImageDraw

from .export_notices import PMIRS_EXPORT_NOTICE, pmirs_project_identity_notice
from .pdf_exports import (
    EXPORT_STATUS_LABELS, ITEM_HEADINGS, _text, pmirs_export_fields,
)


NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
}
for prefix, uri in NS.items():
    ET.register_namespace(prefix, uri)

EMU_PER_INCH = 914400
INK = "17251C"
GREEN = "145B31"
MUTED = "58655C"
LINE = "D7DFD8"
PALE = "F3F6F3"


def _q(prefix: str, tag: str) -> str:
    return f"{{{NS[prefix]}}}{tag}"


def _sub(parent: ET.Element, prefix: str, tag: str, attrs: dict[str, str] | None = None) -> ET.Element:
    return ET.SubElement(parent, _q(prefix, tag), attrs or {})


def _set_cell_text(cell: ET.Element, value: object, *, bold: bool = False, color: str | None = None) -> None:
    paragraph = _sub(cell, "w", "p")
    run = _sub(paragraph, "w", "r")
    props = _sub(run, "w", "rPr")
    if bold:
        _sub(props, "w", "b")
    if color:
        _sub(props, "w", "color", { _q("w", "val"): color })
    for index, line in enumerate(_text(value).splitlines() or [""]):
        if index:
            _sub(run, "w", "br")
        text = _sub(run, "w", "t", {"{http://www.w3.org/XML/1998/namespace}space": "preserve"})
        text.text = line


def _paragraph(
    parent: ET.Element,
    value: object,
    *,
    style: str | None = None,
    bold: bool = False,
    color: str | None = None,
    page_break_before: bool = False,
    keep_with_next: bool = False,
) -> ET.Element:
    paragraph = _sub(parent, "w", "p")
    if style or page_break_before or keep_with_next:
        props = _sub(paragraph, "w", "pPr")
        if page_break_before:
            _sub(props, "w", "pageBreakBefore")
        if keep_with_next:
            _sub(props, "w", "keepNext")
        if style:
            _sub(props, "w", "pStyle", {_q("w", "val"): style})
    run = _sub(paragraph, "w", "r")
    run_props = _sub(run, "w", "rPr")
    if bold:
        _sub(run_props, "w", "b")
    if color:
        _sub(run_props, "w", "color", {_q("w", "val"): color})
    for index, line in enumerate(_text(value).splitlines() or [""]):
        if index:
            _sub(run, "w", "br")
        text = _sub(run, "w", "t", {"{http://www.w3.org/XML/1998/namespace}space": "preserve"})
        text.text = line
    return paragraph


def _table(parent: ET.Element, rows: list[list[tuple[object, bool]]], *, widths: list[int] | None = None, shaded: bool = False) -> ET.Element:
    table = _sub(parent, "w", "tbl")
    props = _sub(table, "w", "tblPr")
    _sub(props, "w", "tblW", {_q("w", "w"): "9360", _q("w", "type"): "dxa"})
    borders = _sub(props, "w", "tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        _sub(borders, "w", edge, {_q("w", "val"): "single", _q("w", "sz"): "4", _q("w", "color"): LINE})
    grid = _sub(table, "w", "tblGrid")
    column_count = max((len(row) for row in rows), default=1)
    actual_widths = widths or [9360 // column_count] * column_count
    for width in actual_widths:
        _sub(grid, "w", "gridCol", {_q("w", "w"): str(width)})
    for row in rows:
        tr = _sub(table, "w", "tr")
        for index, (value, is_bold) in enumerate(row):
            tc = _sub(tr, "w", "tc")
            tcpr = _sub(tc, "w", "tcPr")
            cell_width = actual_widths[min(index, len(actual_widths) - 1)]
            _sub(tcpr, "w", "tcW", {_q("w", "w"): str(cell_width), _q("w", "type"): "dxa"})
            if shaded and index % 2 == 0:
                _sub(tcpr, "w", "shd", {_q("w", "fill"): PALE, _q("w", "val"): "clear"})
            _set_cell_text(tc, value, bold=is_bold, color=MUTED if is_bold else None)
    return table


def _signature_png(path_data: str) -> bytes:
    width, height = 1200, 360
    image = Image.new("RGBA", (width, height), "white")
    draw = ImageDraw.Draw(image)
    point_matches = re.findall(r"([ML])(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)", path_data)
    current: list[tuple[int, int]] = []
    for command, raw_x, raw_y in point_matches:
        point = (round(float(raw_x) / 600 * width), round(float(raw_y) / 180 * height))
        if command == "M":
            if len(current) > 1:
                draw.line(current, fill=f"#{INK}", width=7, joint="curve")
            current = [point]
        else:
            current.append(point)
    if len(current) > 1:
        draw.line(current, fill=f"#{INK}", width=7, joint="curve")
        radius = 3
        for x, y in (current[0], current[-1]):
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=f"#{INK}")
    output = io.BytesIO()
    image.save(output, format="PNG", dpi=(160, 160))
    return output.getvalue()


def _signature_drawing(
    parent: ET.Element,
    relationship_id: str,
    picture_id: int,
    label: str,
    *,
    width_inches: float = 6,
    height_inches: float = 1.8,
) -> None:
    run = _sub(parent, "w", "r")
    drawing = _sub(run, "w", "drawing")
    inline = _sub(drawing, "wp", "inline", {"distT": "0", "distB": "0", "distL": "0", "distR": "0"})
    width_emu = round(width_inches * EMU_PER_INCH)
    height_emu = round(height_inches * EMU_PER_INCH)
    _sub(inline, "wp", "extent", {"cx": str(width_emu), "cy": str(height_emu)})
    _sub(inline, "wp", "effectExtent", {"l": "0", "t": "0", "r": "0", "b": "0"})
    _sub(inline, "wp", "docPr", {"id": str(picture_id), "name": f"Constancia {picture_id}", "descr": label})
    frame = _sub(inline, "wp", "cNvGraphicFramePr")
    _sub(frame, "a", "graphicFrameLocks", {_q("a", "noChangeAspect"): "1"})
    graphic = _sub(inline, "a", "graphic")
    graphic_data = _sub(graphic, "a", "graphicData", {"uri": NS["pic"]})
    picture = _sub(graphic_data, "pic", "pic")
    nv = _sub(picture, "pic", "nvPicPr")
    _sub(nv, "pic", "cNvPr", {"id": str(picture_id), "name": f"Firma {picture_id}", "descr": label})
    _sub(nv, "pic", "cNvPicPr")
    fill = _sub(picture, "pic", "blipFill")
    _sub(fill, "a", "blip", {_q("r", "embed"): relationship_id})
    stretch = _sub(fill, "a", "stretch")
    _sub(stretch, "a", "fillRect")
    shape = _sub(picture, "pic", "spPr")
    transform = _sub(shape, "a", "xfrm")
    _sub(transform, "a", "off", {"x": "0", "y": "0"})
    _sub(transform, "a", "ext", {"cx": str(width_emu), "cy": str(height_emu)})
    geometry = _sub(shape, "a", "prstGeom", {"prst": "rect"})
    _sub(geometry, "a", "avLst")


def _styles_xml() -> bytes:
    root = ET.Element(_q("w", "styles"))
    defaults = _sub(root, "w", "docDefaults")
    run_defaults = _sub(defaults, "w", "rPrDefault")
    run_props = _sub(run_defaults, "w", "rPr")
    _sub(run_props, "w", "rFonts", {_q("w", "ascii"): "Aptos", _q("w", "hAnsi"): "Aptos"})
    _sub(run_props, "w", "sz", {_q("w", "val"): "20"})
    paragraph_defaults = _sub(defaults, "w", "pPrDefault")
    _sub(paragraph_defaults, "w", "pPr")
    for style_id, name, size, color, bold, before, after in [
        ("Normal", "Normal", "20", INK, False, "0", "120"),
        ("Title", "Title", "36", GREEN, True, "0", "180"),
        ("Subtitle", "Subtitle", "20", MUTED, False, "0", "220"),
        ("Heading1", "Heading 1", "28", GREEN, True, "320", "100"),
        ("Heading2", "Heading 2", "23", GREEN, True, "260", "80"),
    ]:
        style = _sub(root, "w", "style", {_q("w", "type"): "paragraph", _q("w", "styleId"): style_id})
        _sub(style, "w", "name", {_q("w", "val"): name})
        ppr = _sub(style, "w", "pPr")
        _sub(ppr, "w", "spacing", {_q("w", "before"): before, _q("w", "after"): after})
        rpr = _sub(style, "w", "rPr")
        _sub(rpr, "w", "rFonts", {_q("w", "ascii"): "Aptos", _q("w", "hAnsi"): "Aptos"})
        _sub(rpr, "w", "color", {_q("w", "val"): color})
        _sub(rpr, "w", "sz", {_q("w", "val"): size})
        if bold:
            _sub(rpr, "w", "b")
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def build_pmirs_version_docx(
    project, version, status_label: str, signatures: Iterable, signature_hash: str,
    signatures_valid: bool = True,
    currentness_notice: str = "",
) -> bytes:
    """Build an editable Word snapshot, embedding only signatures bound to this version hash."""
    snapshot = version.snapshot if isinstance(version.snapshot, dict) else {}
    captured_project = snapshot.get("project") if isinstance(snapshot.get("project"), dict) else {}
    project_name = str(captured_project.get("name") or project.name)
    municipality = str(captured_project.get("municipality") or project.municipality)
    department = str(captured_project.get("department") or project.department)
    address = str(captured_project.get("address") or "")
    document = ET.Element(_q("w", "document"))
    body = _sub(document, "w", "body")
    _paragraph(body, "GREENATICS RED · DOCUMENTO DE TRABAJO", bold=True, color=GREEN)
    _paragraph(body, "Plan de gestión integral de residuos de la copropiedad", style="Title")
    _paragraph(body, " · ".join(filter(None, (
        project_name, address, f"{municipality}, {department}",
    ))), style="Subtitle")
    _paragraph(body, f"Identificación de la unidad: {pmirs_project_identity_notice(captured_project)}")

    metadata = [
        [("Versión", version.version_label), ("Fecha de captura", version.created_at.strftime("%Y-%m-%d %H:%M UTC"))],
        [("Dirección de la copropiedad", address or "Pendiente de confirmar"), ("Estado de identificación", "Confirmada" if captured_project.get("identity_status") == "confirmada" else "Pendiente o no conservada")],
        [("Referencia de confirmación", str(captured_project.get("identity_reference") or "Sin referencia")), ("Fecha de cotejo", str(captured_project.get("identity_confirmed_at") or "Sin confirmación registrada"))],
        [("Motivo del cambio", str(version.change_reason).replace("_", " ")), ("Estado interno", status_label)],
        [("Resumen", version.change_summary), ("Línea Base de referencia", version.baseline_reference or "Sin referencia registrada")],
    ]
    _table(body, [[(label, True), (value, False), (label2, True), (value2, False)] for (label, value), (label2, value2) in metadata], widths=[1900, 2780, 1800, 2880], shaded=True)
    _paragraph(body, "Alcance y estado", bold=True, color=GREEN)
    _paragraph(body, PMIRS_EXPORT_NOTICE)
    if currentness_notice:
        _paragraph(body, "Comparación con el expediente actual", bold=True, color=GREEN)
        _paragraph(body, currentness_notice)

    snapshot = version.snapshot if isinstance(version.snapshot, dict) else {}
    items = snapshot.get("items", []) if isinstance(snapshot.get("items", []), list) else []
    for kind, heading in ITEM_HEADINGS.items():
        _paragraph(body, heading, style="Heading1", keep_with_next=True)
        group = [item for item in items if isinstance(item, dict) and item.get("item_type") == kind]
        if not group:
            _paragraph(body, "No hay objetos de este tipo en esta versión.")
            continue
        for item in group:
            _paragraph(
                body,
                f"{_text(item.get('code'))} · {_text(item.get('item_type_label'))} · {EXPORT_STATUS_LABELS.get(str(item.get('review_status')), _text(item.get('review_status')))}",
                bold=True, color=GREEN, keep_with_next=True,
            )
            _paragraph(body, item.get("title"), style="Heading2", keep_with_next=True)
            if item.get("description"):
                _paragraph(body, item["description"])
            rows = [[(label, True), (value, False)] for label, value in pmirs_export_fields(item, snapshot)]
            if rows:
                _table(body, rows, widths=[2600, 6760], shaded=True)
    baseline = snapshot.get("baseline") if isinstance(snapshot.get("baseline"), dict) else {}
    _paragraph(body, "Referencia de Línea Base", style="Heading1", keep_with_next=True)
    _paragraph(body, baseline.get("review_note") or "No se incluyó un fundamento en la captura.")

    signature_rows = list(signatures)
    image_parts: list[tuple[str, bytes]] = []
    _paragraph(
        body,
        "Constancias de lectura y recepción",
        style="Heading1",
        keep_with_next=bool(signature_rows),
    )
    if signature_rows:
        _paragraph(
            body,
            "Las constancias siguientes se vinculan a la huella de contenido de esta versión PMIRS.",
            keep_with_next=True,
        )
        for index, signature in enumerate(signature_rows, start=1):
            drawing_paragraph = _sub(body, "w", "p")
            drawing_properties = _sub(drawing_paragraph, "w", "pPr")
            _sub(drawing_properties, "w", "keepNext")
            _signature_drawing(
                drawing_paragraph, f"rId{index + 2}", index,
                f"Trazo de constancia de {signature.signer_name}",
                width_inches=4.5, height_inches=1.35,
            )
            image_parts.append((f"image{index}.png", _signature_png(signature.signature_path)))
            _paragraph(body, f"{signature.signer_name} · {signature.signer_email} · rol {signature.signer_role}", keep_with_next=True)
            _paragraph(body, f"Fecha UTC: {signature.signed_at.strftime('%Y-%m-%d %H:%M:%S UTC')}", keep_with_next=True)
            _paragraph(body, signature.declaration, keep_with_next=True)
            _paragraph(body, f"SHA-256 del contenido canónico de la versión PMIRS vinculada: {signature.document_sha256}")
    elif not signatures_valid:
        _paragraph(body, "No fue posible verificar la correspondencia entre las firmas registradas y el contenido de esta versión. Solicita revisión antes de usar esta copia.")
    else:
        _paragraph(body, "No se han registrado constancias de firma para esta versión.")
    _paragraph(body, "La constancia es una captura electrónica vinculada a una cuenta autenticada y a esta versión. No acredita por sí sola facultades de representación ni aprobación de autoridad. La firma representada en este archivo editable no convierte las ediciones posteriores a la descarga en contenido cubierto por el hash registrado.")
    if not signature_rows:
        _paragraph(body, f"Huella SHA-256 del contenido canónico de esta versión PMIRS: {signature_hash}")

    section = _sub(body, "w", "sectPr")
    _sub(section, "w", "pgSz", {_q("w", "w"): "12240", _q("w", "h"): "15840"})
    _sub(section, "w", "pgMar", {_q("w", "top"): "1000", _q("w", "right"): "1080", _q("w", "bottom"): "1000", _q("w", "left"): "1080", _q("w", "header"): "500", _q("w", "footer"): "500", _q("w", "gutter"): "0"})

    ct_ns = "http://schemas.openxmlformats.org/package/2006/content-types"
    content_types = ET.Element(f"{{{ct_ns}}}Types")
    ET.SubElement(content_types, f"{{{ct_ns}}}Default", {"Extension": "rels", "ContentType": "application/vnd.openxmlformats-package.relationships+xml"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Default", {"Extension": "xml", "ContentType": "application/xml"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Default", {"Extension": "png", "ContentType": "image/png"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Override", {"PartName": "/word/document.xml", "ContentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Override", {"PartName": "/word/styles.xml", "ContentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"})
    ET.register_namespace("", ct_ns)
    content_types_xml = ET.tostring(content_types, encoding="utf-8", xml_declaration=True)
    root_rels = ET.Element(_q("rel", "Relationships"))
    ET.SubElement(root_rels, _q("rel", "Relationship"), {"Id": "rId1", "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument", "Target": "word/document.xml"})
    ET.register_namespace("", NS["rel"])
    root_rels_xml = ET.tostring(root_rels, encoding="utf-8", xml_declaration=True)
    document_rels = ET.Element(_q("rel", "Relationships"))
    ET.SubElement(document_rels, _q("rel", "Relationship"), {"Id": "rId1", "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", "Target": "styles.xml"})
    for index, (filename, _png) in enumerate(image_parts, start=1):
        ET.SubElement(document_rels, _q("rel", "Relationship"), {"Id": f"rId{index + 2}", "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", "Target": f"media/{filename}"})
    document_rels_xml = ET.tostring(document_rels, encoding="utf-8", xml_declaration=True)

    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types_xml)
        archive.writestr("_rels/.rels", root_rels_xml)
        archive.writestr("word/document.xml", ET.tostring(document, encoding="utf-8", xml_declaration=True))
        archive.writestr("word/styles.xml", _styles_xml())
        archive.writestr("word/_rels/document.xml.rels", document_rels_xml)
        for filename, png_bytes in image_parts:
            archive.writestr(f"word/media/{filename}", png_bytes)
    return output.getvalue()


def build_form_record_docx(
    project,
    record,
    form_spec: dict,
    fields: Iterable[dict[str, str]],
    signatures: Iterable,
    signature_hash: str,
    *,
    status_label: str,
    has_prior_signatures: bool = False,
    signatures_valid: bool = True,
) -> bytes:
    """Build an editable record copy with only signatures bound to its current content."""
    document = ET.Element(_q("w", "document"))
    body = _sub(document, "w", "body")
    _paragraph(body, "GREENATICS RED · COPIA DE TRABAJO", bold=True, color=GREEN)
    _paragraph(body, f"{record.form_code} · {record.title}", style="Title")
    _paragraph(body, f"{project.name} · {project.municipality}, {project.department}", style="Subtitle")
    _paragraph(body, form_spec.get("purpose", "Registro operativo del expediente."))

    metadata = [
        [("Código", record.form_code), ("Versión", record.version)],
        [("Fecha del registro", record.record_date or "Sin fecha"), ("Estado RED", status_label or record.status)],
        [("Tipo de fuente", str(record.source_kind or "").replace("_", " ").title() or "Sin especificar"),
         ("Fuente o método", record.source_note or "Pendiente de documentar")],
    ]
    _table(
        body,
        [[(label, True), (_text(value), False), (label2, True), (_text(value2), False)]
         for (label, value), (label2, value2) in metadata],
        widths=[1500, 3180, 1500, 3180],
        shaded=True,
    )
    _paragraph(body, "SHA-256 del contenido canónico del registro y las evidencias vinculadas")
    _paragraph(body, " ".join(signature_hash[index:index + 8] for index in range(0, len(signature_hash), 8)))
    _paragraph(
        body,
        "Copia editable generada desde GREENATICS RED. Una firma visible es una constancia personal de participación en la captura o revisión de este registro; no certifica por sí sola la exactitud técnica, no acredita representación legal ni equivale a aprobación de autoridad. Las ediciones hechas después de descargar este Word no quedan cubiertas por la huella registrada.",
    )

    _paragraph(body, "Respuestas registradas", style="Heading1")
    for field in fields:
        _paragraph(body, f"{_text(field.get('label'))} · {_text(field.get('id'))}", bold=True, color=GREEN)
        _paragraph(body, field.get("value") or "Sin respuesta")

    signature_rows = list(signatures)
    image_parts: list[tuple[str, bytes]] = []
    _paragraph(body, "Constancias de participación y revisión", style="Heading1")
    if has_prior_signatures:
        _paragraph(body, "Este registro conserva constancias de contenido previo o versiones anteriores. No se muestran como vigentes en esta copia.")
    if signature_rows:
        _paragraph(body, "Las constancias siguientes están vinculadas a la versión y huella SHA-256 indicadas.")
        for index, signature in enumerate(signature_rows, start=1):
            _signature_drawing(
                _sub(body, "w", "p"), f"rId{index + 2}", index,
                f"Trazo de constancia de {signature.signer_name}",
            )
            image_parts.append((f"image{index}.png", _signature_png(signature.signature_path)))
            _paragraph(body, f"{signature.signer_name} · {signature.signer_email} · rol {signature.signer_role}")
            _paragraph(body, f"Fecha UTC: {signature.signed_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            _paragraph(body, signature.declaration)
    elif not signatures_valid:
        _paragraph(body, "No fue posible verificar la correspondencia entre las constancias registradas y el contenido actual. Solicita revisión antes de usar esta copia.")
    else:
        _paragraph(body, "No hay constancias vigentes para esta versión del registro.")
    section = _sub(body, "w", "sectPr")
    _sub(section, "w", "pgSz", {_q("w", "w"): "12240", _q("w", "h"): "15840"})
    _sub(section, "w", "pgMar", {_q("w", "top"): "1000", _q("w", "right"): "1080", _q("w", "bottom"): "1000", _q("w", "left"): "1080", _q("w", "header"): "500", _q("w", "footer"): "500", _q("w", "gutter"): "0"})

    ct_ns = "http://schemas.openxmlformats.org/package/2006/content-types"
    content_types = ET.Element(f"{{{ct_ns}}}Types")
    ET.SubElement(content_types, f"{{{ct_ns}}}Default", {"Extension": "rels", "ContentType": "application/vnd.openxmlformats-package.relationships+xml"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Default", {"Extension": "xml", "ContentType": "application/xml"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Default", {"Extension": "png", "ContentType": "image/png"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Override", {"PartName": "/word/document.xml", "ContentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"})
    ET.SubElement(content_types, f"{{{ct_ns}}}Override", {"PartName": "/word/styles.xml", "ContentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"})
    ET.register_namespace("", ct_ns)
    content_types_xml = ET.tostring(content_types, encoding="utf-8", xml_declaration=True)
    root_rels = ET.Element(_q("rel", "Relationships"))
    ET.SubElement(root_rels, _q("rel", "Relationship"), {"Id": "rId1", "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument", "Target": "word/document.xml"})
    ET.register_namespace("", NS["rel"])
    root_rels_xml = ET.tostring(root_rels, encoding="utf-8", xml_declaration=True)
    document_rels = ET.Element(_q("rel", "Relationships"))
    ET.SubElement(document_rels, _q("rel", "Relationship"), {"Id": "rId1", "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", "Target": "styles.xml"})
    for index, (filename, _png) in enumerate(image_parts, start=1):
        ET.SubElement(document_rels, _q("rel", "Relationship"), {"Id": f"rId{index + 2}", "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", "Target": f"media/{filename}"})
    document_rels_xml = ET.tostring(document_rels, encoding="utf-8", xml_declaration=True)

    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types_xml)
        archive.writestr("_rels/.rels", root_rels_xml)
        archive.writestr("word/document.xml", ET.tostring(document, encoding="utf-8", xml_declaration=True))
        archive.writestr("word/styles.xml", _styles_xml())
        archive.writestr("word/_rels/document.xml.rels", document_rels_xml)
        for filename, png_bytes in image_parts:
            archive.writestr(f"word/media/{filename}", png_bytes)
    return output.getvalue()
