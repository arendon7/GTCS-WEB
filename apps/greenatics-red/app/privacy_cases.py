"""Controlled vocabulary for the RED privacy-request case log.

This is an administrative tracking aid. It does not determine the legal
classification, statutory deadline, required response, or retention period.
"""

CASE_TYPES = {
    "consulta": "Consulta o acceso",
    "actualizacion_rectificacion": "Actualización o rectificación",
    "supresion_revocatoria": "Supresión o revocatoria solicitada",
    "reclamo": "Reclamo",
    "otro": "Otra solicitud; clasificar manualmente",
}

PROJECT_SCOPES = {
    "red_global": "GREENATICS RED en general",
    "un_proyecto": "Una copropiedad",
    "varios_proyectos": "Varias copropiedades / alcance por revisar",
}

CLASSIFICATIONS = {
    "pendiente": "Pendiente de clasificación humana",
    "consulta": "Consulta",
    "reclamo": "Reclamo",
    "otra": "Otra clasificación humana",
}

IDENTITY_STATES = {
    "pendiente": "Pendiente de verificación",
    "verificada": "Verificación documentada fuera de RED",
    "requiere_informacion": "Requiere información por canal aprobado",
    "no_aplica": "No aplica según revisión humana",
}

CASE_STATES = {
    "recibida": "Recibida",
    "verificacion": "En verificación",
    "analisis": "En análisis",
    "respuesta_preparacion": "Preparando respuesta",
    "pendiente_informacion": "Pendiente de información",
    "pendiente_tercero": "Pendiente de responsable o tercero",
    "respuesta_enviada": "Respuesta enviada",
    "cerrada": "Cerrada por revisión humana",
    "trasladada": "Trasladada al responsable competente",
}

CASE_TRANSITIONS = {
    "recibida": {"verificacion", "analisis", "pendiente_informacion", "trasladada"},
    "verificacion": {"analisis", "pendiente_informacion", "trasladada"},
    "analisis": {"verificacion", "respuesta_preparacion", "pendiente_informacion", "pendiente_tercero", "trasladada"},
    "respuesta_preparacion": {"analisis", "respuesta_enviada", "pendiente_informacion", "pendiente_tercero", "trasladada"},
    "pendiente_informacion": {"verificacion", "analisis", "respuesta_preparacion", "trasladada"},
    "pendiente_tercero": {"analisis", "respuesta_preparacion", "trasladada"},
    "respuesta_enviada": {"cerrada", "analisis"},
    "cerrada": {"analisis"},
    "trasladada": {"analisis", "cerrada"},
}

REFERENCE_CHARACTERS = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .:/_#-")


def validate_opaque_reference(value: str, *, maximum: int) -> bool:
    """Reject email-like/free-form input; references must not contain correspondence or identity data."""
    return (
        len(value) <= maximum
        and all(character in REFERENCE_CHARACTERS for character in value)
        and (not value or (any(character.isdigit() for character in value) and any(character.isalpha() for character in value)))
    )


def case_reference(case_id: str) -> str:
    return f"PRV-{case_id[:8].upper()}"
