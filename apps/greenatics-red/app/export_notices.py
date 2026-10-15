"""Shared scope notices for generated RED exports."""

PMIRS_EXPORT_NOTICE = (
    "Instrumento técnico-operativo preparado para el alcance acordado con esta copropiedad. "
    "No sustituye el PGIRS municipal ni determina por sí solo las obligaciones legales o "
    "contractuales particulares; estas deben verificarse frente a la normativa local, el "
    "reglamento de propiedad horizontal, los contratos y las actividades reales. La revisión "
    "o aprobación interna no equivale a aprobación de autoridad ni a radicación. Los valores "
    "y decisiones deben conservar sus fuentes, soportes y límites de interpretación."
)


def pmirs_project_identity_notice(project_snapshot: dict | None) -> str:
    """Explain whether this immutable PMIRS capture had source-backed unit identity."""
    if not isinstance(project_snapshot, dict) or "identity_status" not in project_snapshot:
        return (
            "Esta versión histórica no conserva el estado de confirmación del nombre y la dirección; "
            "verifica la identificación con la administración antes de usarla."
        )
    if project_snapshot.get("identity_status") != "confirmada":
        return (
            "En esta captura el nombre, la dirección y la ubicación de la copropiedad están pendientes "
            "de confirmación por su administración; no los uses como identificación oficial."
        )
    reference = str(project_snapshot.get("identity_reference") or "folio no consignado")
    confirmer_role = project_snapshot.get("identity_confirmed_role")
    if confirmer_role not in {"admin", "administracion_ph"}:
        # Schema 13 confirmations were restricted to the platform administrator.
        confirmer_role = "admin"
    role_label = "Administración PH de esta copropiedad" if confirmer_role == "administracion_ph" else "Administración RED"
    return (
        f"La identificación territorial de esta captura fue cotejada por el perfil {role_label} con "
        f"la fuente registrada {reference}. Esta constancia interna no certifica titularidad ni reemplaza "
        "una validación jurídica."
    )
