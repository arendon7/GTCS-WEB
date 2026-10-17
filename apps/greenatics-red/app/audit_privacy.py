"""Minimize duplicate user content in durable audit-event details."""


AUDIT_DETAIL_PRIVATE_FIELDS = {
    "baseline_decision": {"reference", "reason"},
    "baseline_invalidated": {"reason"},
    "drive_connected": {"email", "folder_id"},
    "evidence_removed": {"name", "reason"},
    "evidence_uploaded": {"name"},
    "pmirs_action_progress": {"note"},
    "pmirs_item_reviewed": {"reason"},
    "pmirs_version_created": {"reason"},
    "pmirs_version_obsoleted": {"reason"},
    "pmirs_version_status_changed": {"note"},
    "qa_decision": {"reason"},
    "user_invited": {"email"},
}


def sanitize_audit_detail(action: str, detail: dict | None) -> dict:
    """Remove duplicated free text and identifiers while retaining event metadata."""
    safe_detail = dict(detail or {})
    for private_field in AUDIT_DETAIL_PRIVATE_FIELDS.get(action, set()):
        safe_detail.pop(private_field, None)
    return safe_detail


def sanitize_invitation_snapshot(row: dict) -> dict:
    """Drop duplicated invitation identity; restored invites are always unusable."""
    safe_row = dict(row)
    safe_row["email"] = "archived-invitation@red.invalid"
    safe_row["full_name"] = "Invitación archivada"
    return safe_row
