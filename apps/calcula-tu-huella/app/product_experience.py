from __future__ import annotations

"""Role-oriented product experience with V0.32 methodological closure.

The platform keeps every existing route and capability. This module only
controls how that breadth is presented so the inventory workflow remains the
primary product and advanced/internal functions do not overwhelm daily users.
"""

from typing import Any
from markupsafe import Markup

VIEW_MODES = {"essential", "complete"}

ROLE_PROFILES: dict[str, dict[str, str]] = {
    "Administrador": {
        "name": "Dirección y gobierno",
        "mission": "Supervisa el portafolio, destraba decisiones y asegura que el inventario avance con control.",
        "focus": "Avance, riesgos, aprobaciones y resultados para decisión.",
    },
    "Consultor": {
        "name": "Consultoría metodológica",
        "mission": "Configura el inventario, gobierna factores y acompaña el cierre técnico de principio a fin.",
        "focus": "Límites, datos, cálculo, calidad y entregables.",
    },
    "Cliente": {
        "name": "Responsable de información",
        "mission": "Entrega datos y evidencias confiables y responde las solicitudes del equipo del inventario.",
        "focus": "Pendientes, soportes, calidad y avance del periodo.",
    },
    "Revisor": {
        "name": "Revisión independiente",
        "mission": "Evalúa trazabilidad, calidad y consistencia antes de recomendar la aprobación.",
        "focus": "Hallazgos, factores, evidencias y puertas de cierre.",
    },
    "Verificador": {
        "name": "Verificación externa",
        "mission": "Reproduce la evidencia, documenta hallazgos y valida las respuestas de la organización.",
        "focus": "Paquete verificable, metodología, cálculos y hallazgos.",
    },
}

NAV_ICON_BY_ACTIVE = {
    "dashboard": "grid", "onboarding": "play", "product_intelligence": "spark",
    "journey": "route", "inventories": "layers", "sources": "leaf", "information": "rows",
    "operational_imports": "upload", "data_quality": "shield", "period_close": "calendar",
    "calculations": "calculator", "control": "check", "methodology_closure": "book_check",
    "reports": "document", "verification": "badge", "analysis": "chart", "reduction": "sprout",
    "methodology": "book", "methodology_core": "layers", "colombia_library": "map",
    "methodology_governance": "scale", "sectorization": "grid", "supply_chain": "network",
    "scenarios": "sliders", "impact": "globe", "climate_risk": "cloud", "climate_disclosure": "document_check",
    "compliance": "checklist", "documents": "files", "greenatics_pilot": "sprout",
    "greenatics_pilot_execution": "play", "organization": "building", "users": "users",
    "portfolio": "briefcase", "demo_environment": "monitor", "executive": "chart",
    "service_account": "wallet", "support": "support", "commercial": "briefcase",
    "commercial_operations": "document_check", "customer_success": "heart", "integrations": "network",
    "automations": "sliders", "platform_admin": "settings", "operations": "settings",
    "saas_admin": "box", "readiness": "badge", "modules": "grid", "consolidation": "merge",
}

NAV_ICON_SHAPES = {
    "grid": '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    "play": '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
    "spark": '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
    "route": '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v2a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v0"/>',
    "layers": '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    "leaf": '<path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z"/><path d="M4 21c3-5 7-8 13-11"/>',
    "rows": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11m6-11v11"/>',
    "upload": '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
    "shield": '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2m4 0h2m-8 4h2"/>',
    "calculator": '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M8 6h8M8 11h2m4 0h2M8 15h2m4 0h2M8 19h2m4 0h2"/>',
    "check": '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    "book_check": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="m10 11 2 2 4-4"/>',
    "document": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/>',
    "badge": '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    "chart": '<path d="M3 3v18h18M7 14l4-4 3 3 6-7"/><path d="M17 6h3v3"/>',
    "sprout": '<path d="M12 22v-9M12 13C5 13 4 7 4 4c6 0 10 3 8 9Zm0 2c0-5 4-8 9-8 0 5-2 9-9 9ZM5 22h14"/>',
    "book": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    "map": '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/>',
    "scale": '<path d="M12 3v18m-7 0h14M5 7h14M8 7l-4 7h8L8 7Zm8 0-4 7h8l-4-7Z"/>',
    "network": '<circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m10 10-3-3m7 3 3-3m-7 7-3 3m7-3 3 3"/>',
    "sliders": '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18m-9-9a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18"/>',
    "cloud": '<path d="M20 16.5A4.5 4.5 0 0 0 18 8h-1.2A7 7 0 1 0 4 16.2M3 20h18"/>',
    "document_check": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6m-12 5 2 2 4-4"/>',
    "checklist": '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"/>',
    "files": '<path d="M15 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V6Z"/><path d="M15 2v4h4M8 11h7m-7 4h7M8 20v2h11a2 2 0 0 0 2-2V8"/>',
    "building": '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2m-5 6v-3h2v3"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 11v-2a4 4 0 0 0-3-3.9m-1-13a4 4 0 0 1 0 7.8"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 6h18m-11-1v2h4v-2"/>',
    "monitor": '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4m-4-9 3-3 2 2 3-4"/>',
    "wallet": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18m-5 5h2M7 5V3h10v2"/>',
    "support": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6m5.6 5.6 3.6 3.6m0-12.8-3.6 3.6m-5.6 5.6-3.6 3.6"/>',
    "heart": '<path d="M20.8 8.7c0 5.5-8.8 11.3-8.8 11.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="m19 15 1 1-3 3-1-1a2 2 0 0 0-3 1v1h-4v-1a2 2 0 0 0-3-1l-1 1-3-3 1-1a2 2 0 0 0-1-3H1v-4h1a2 2 0 0 0 1-3L2 4l3-3 1 1a2 2 0 0 0 3-1V0h4v1a2 2 0 0 0 3 1l1-1 3 3-1 1a2 2 0 0 0 1 3h1v4h-1a2 2 0 0 0-1 3Z"/>',
    "box": '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8m-9 5v9"/>',
    "merge": '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h2a6 6 0 0 1 6 6v4m0 0 3-3m-3 3-3-3M6 8v10a2 2 0 0 0 2 2h8"/>',
    "default": '<circle cx="12" cy="12" r="8"/><path d="M12 8v8m-4-4h8"/>',
}


def _nav_icon_svg(active: str) -> Markup:
    shape = NAV_ICON_BY_ACTIVE.get(active, "default")
    path = NAV_ICON_SHAPES.get(shape, NAV_ICON_SHAPES["default"])
    return Markup(f'<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{path}</svg>')


def _item(
    label: str,
    href: str,
    active: str,
    icon: str,
    *,
    any_capability: tuple[str, ...] = (),
    roles: tuple[str, ...] = (),
) -> dict[str, object]:
    return {
        "label": label,
        "href": href,
        "active": active,
        "icon": icon,
        "icon_svg": _nav_icon_svg(active),
        "any_capability": any_capability,
        "roles": roles,
    }


CORE_SECTIONS: tuple[dict[str, object], ...] = (
    {
        "label": "INICIO",
        "items": (
            _item("Mi trabajo", "/dashboard", "dashboard", "⌂"),
            _item("Puesta en marcha", "/onboarding", "onboarding", "▶"),
            _item("Perfil y diagnóstico", "/inteligencia-producto", "product_intelligence", "◎", any_capability=("manage_org", "view_methodology", "manage_portfolio", "view_consolidation")),
            _item("Recorrido del inventario", "/recorrido-inventario", "journey", "→"),
        ),
    },
    {
        "label": "INVENTARIO",
        "items": (
            _item("Inventarios", "/inventarios", "inventories", "◔"),
            _item("Fuentes de emisión", "/inventario", "sources", "⌁"),
        ),
    },
    {
        "label": "DATOS Y EVIDENCIAS",
        "items": (
            _item("Datos y evidencias", "/informacion", "information", "▦"),
            _item(
                "Cargas operativas",
                "/cargas-operativas",
                "operational_imports",
                "⇩",
                any_capability=("provide_data", "manage_sources", "review", "approve", "view_methodology"),
            ),
            _item(
                "Calidad de datos",
                "/calidad-datos",
                "data_quality",
                "✓",
                any_capability=("provide_data", "manage_sources", "review", "approve", "view_methodology"),
            ),
            _item(
                "Cierre mensual",
                "/cierre-mensual",
                "period_close",
                "▣",
                any_capability=("provide_data", "manage_sources", "review", "approve", "view_methodology"),
            ),
        ),
    },
    {
        "label": "RESULTADOS Y CIERRE",
        "items": (
            _item("Motor y resultados", "/calculos", "calculations", "∑"),
            _item("Revisión y auditoría", "/control", "control", "◇"),
            _item("Cierre metodológico", "/metodologia/cierre", "methodology_closure", "◎", any_capability=("view_methodology", "review", "approve")),
            _item("Informes", "/reportes", "reports", "▤"),
            _item(
                "Portal del verificador",
                "/verificacion",
                "verification",
                "◈",
                any_capability=("external_audit", "review", "approve"),
            ),
        ),
    },
    {
        "label": "REDUCCIÓN",
        "items": (
            _item("Análisis", "/analisis", "analysis", "⌁"),
            _item("Plan de reducción", "/reduccion", "reduction", "↘"),
        ),
    },
)

ADVANCED_SECTIONS: tuple[dict[str, object], ...] = (
    {
        "label": "METODOLOGÍA",
        "items": (
            _item("Metodología", "/metodologia", "methodology", "⌘", any_capability=("view_methodology",)),
            _item("Núcleo metodológico", "/metodologia/nucleo", "methodology_core", "◈", any_capability=("view_methodology",)),
            _item("Biblioteca Colombia", "/metodologia/colombia", "colombia_library", "CO", any_capability=("view_methodology",)),
            _item("Gobierno metodológico", "/gobierno-metodologico", "methodology_governance", "◫", any_capability=("manage_methodology_governance",)),
            _item("Modelo sectorial", "/sectorizacion", "sectorization", "◎"),
        ),
    },
    {
        "label": "CAPACIDADES AVANZADAS",
        "items": (
            _item("Cadena de valor", "/cadena-valor", "supply_chain", "♧", any_capability=("manage_supply_chain", "review", "approve")),
            _item("Escenarios y MACC", "/escenarios", "scenarios", "◒"),
            _item("Inteligencia de impacto", "/inteligencia-impacto", "impact", "◉", any_capability=("view_impact", "manage_impact")),
            _item("Riesgos climáticos", "/riesgos-climaticos", "climate_risk", "△", any_capability=("view_climate_risk", "manage_climate_risk")),
            _item("Divulgación climática", "/divulgacion-climatica", "climate_disclosure", "◫", any_capability=("view_climate_disclosure", "manage_climate_disclosure")),
            _item("Cumplimiento", "/cumplimiento", "compliance", "✓", any_capability=("view_compliance", "manage_compliance")),
            _item("Centro documental", "/centro-documental", "documents", "▤", any_capability=("manage_documents",)),
        ),
    },
    {
        "label": "PILOTO GREENATICS",
        "items": (
            _item("Matriz del piloto", "/piloto-greenatics", "greenatics_pilot", "♻", any_capability=("view_methodology", "provide_data", "manage_sources")),
            _item("Ejecución del piloto", "/piloto-greenatics/ejecucion", "greenatics_pilot_execution", "▶", any_capability=("view_methodology", "provide_data", "manage_sources")),
        ),
    },
)

INTERNAL_SECTIONS: tuple[dict[str, object], ...] = (
    {
        "label": "ORGANIZACIÓN Y SERVICIO",
        "items": (
            _item("Organización", "/organizacion", "organization", "▥", any_capability=("manage_org",)),
            _item("Usuarios y roles", "/usuarios", "users", "♙", any_capability=("manage_org",)),
            _item("Portafolio multiempresa", "/portafolio", "portfolio", "▦", any_capability=("manage_portfolio",)),
            _item("Entorno demo", "/entorno-demo", "demo_environment", "◉", any_capability=("manage_portfolio",)),
            _item("Dirección ejecutiva", "/direccion-ejecutiva", "executive", "◉", any_capability=("manage_portfolio",)),
            _item("Cuenta y plan", "/cuenta-servicio", "service_account", "◌"),
            _item("Soporte", "/soporte", "support", "?", any_capability=("manage_support",)),
        ),
    },
    {
        "label": "OPERACIÓN INTERNA",
        "items": (
            _item("Gestión comercial", "/comercial", "commercial", "◇", any_capability=("manage_commercial",)),
            _item("Contratos y cartera", "/operacion-comercial", "commercial_operations", "▧", any_capability=("manage_commercial",)),
            _item("Éxito del cliente", "/exito-cliente", "customer_success", "♡", any_capability=("view_customer_success", "manage_customer_success")),
            _item("Integraciones", "/integraciones", "integrations", "⇄", any_capability=("manage_integrations",)),
            _item("Automatizaciones", "/automatizaciones", "automations", "◴", any_capability=("manage_automations",)),
            _item("Administración de plataforma", "/administracion-plataforma", "platform_admin", "⌬", any_capability=("manage_operations",)),
            _item("Operación y seguridad", "/operacion", "operations", "⚙", any_capability=("manage_operations",)),
            _item("Administración SaaS", "/administracion-saas", "saas_admin", "▣", any_capability=("manage_saas",)),
            _item("Alistamiento comercial", "/alistamiento", "readiness", "◆", any_capability=("manage_readiness",)),
            _item("Mapa del producto", "/modulos", "modules", "◫", any_capability=("manage_org", "view_methodology")),
            _item("Consolidación V1.0", "/consolidacion", "consolidation", "◆", any_capability=("view_consolidation", "manage_consolidation")),
        ),
    },
)


def role_profile(role: str) -> dict[str, str]:
    return dict(ROLE_PROFILES.get(role, ROLE_PROFILES["Cliente"]))


def normalize_view_mode(value: object) -> str:
    mode = str(value or "essential").strip().lower()
    return mode if mode in VIEW_MODES else "essential"


def _allowed(item: dict[str, object], role: str, capabilities: set[str]) -> bool:
    roles = set(item.get("roles") or ())
    if roles and role not in roles:
        return False
    required_any = set(item.get("any_capability") or ())
    return not required_any or bool(required_any & capabilities)


def _filter_sections(sections: tuple[dict[str, object], ...], role: str, capabilities: set[str]) -> list[dict[str, object]]:
    result: list[dict[str, object]] = []
    for section in sections:
        items = [dict(item) for item in section["items"] if _allowed(item, role, capabilities)]
        if items:
            result.append({"label": section["label"], "items": items})
    return result


def navigation_for(user: dict[str, Any], mode: str) -> dict[str, object]:
    role = str(user.get("role", "Cliente"))
    capabilities = set(user.get("capabilities") or set())
    normalized = normalize_view_mode(mode)
    return {
        "mode": normalized,
        "core": _filter_sections(CORE_SECTIONS, role, capabilities),
        "advanced": _filter_sections(ADVANCED_SECTIONS, role, capabilities) if normalized == "complete" else [],
        "internal": _filter_sections(INTERNAL_SECTIONS, role, capabilities) if normalized == "complete" else [],
        "has_complete_view": bool(_filter_sections(ADVANCED_SECTIONS + INTERNAL_SECTIONS, role, capabilities)),
    }


def journey_detail(workspace: dict[str, Any], role: str) -> dict[str, Any]:
    """Transform the dashboard milestones into a decision-oriented journey."""
    owners = {
        "Configurar": "Consultor / administrador",
        "Recolectar": "Responsables de datos",
        "Calcular": "Consultor metodológico",
        "Revisar": "Revisor / aprobador",
        "Reportar": "Consultor / dirección",
    }
    descriptions = {
        "Configurar": "Definir periodo, límites, metodología, sedes y responsables.",
        "Recolectar": "Completar datos mensuales y evidencias con controles de calidad.",
        "Calcular": "Asignar factores vigentes y reproducir los resultados por fuente y gas.",
        "Revisar": "Resolver observaciones, conciliar periodos y aprobar el inventario.",
        "Reportar": "Emitir memoria de cálculo e informes para decisión y verificación.",
    }
    steps: list[dict[str, Any]] = []
    first_pending_found = False
    for index, milestone in enumerate(workspace.get("milestones", []), start=1):
        item = dict(milestone)
        item["number"] = index
        item["owner"] = owners.get(item["name"], "Equipo del inventario")
        item["description"] = descriptions.get(item["name"], item.get("detail", ""))
        item["current"] = not item.get("done", False) and not first_pending_found
        if item["current"]:
            first_pending_found = True
        steps.append(item)
    if not first_pending_found and steps:
        steps[-1]["current"] = True
    return {
        "role": role,
        "profile": role_profile(role),
        "steps": steps,
        "score": workspace.get("score", 0),
        "completed": workspace.get("completed", 0),
        "total": workspace.get("total", len(steps)),
        "actions": workspace.get("actions", []),
        "ready": bool(steps) and all(item.get("done") for item in steps),
    }
