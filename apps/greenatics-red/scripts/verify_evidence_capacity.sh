#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$APP_DIR"

if [ -n "${RED_PYTHON:-}" ]; then
  PYTHON_BIN=$RED_PYTHON
elif [ -x "$APP_DIR/.venv/bin/python" ]; then
  PYTHON_BIN=$APP_DIR/.venv/bin/python
else
  PYTHON_BIN=python3
fi

"$PYTHON_BIN" -m pytest -q \
  tests/test_evidence_quota.py \
  tests/test_migrations.py \
  tests/test_storage.py \
  tests/test_readiness.py::test_form_field_evidence_upload_is_private_and_scoped \
  tests/test_readiness.py::test_evidence_endpoints_reject_mismatched_binary_content_before_storage \
  tests/test_readiness.py::test_standalone_evidence_upload_retries_are_idempotent_and_reject_key_reuse \
  tests/test_readiness.py::test_concurrent_duplicate_standalone_evidence_uploads_store_one_file_per_key \
  tests/test_readiness.py::test_operational_reference_approval_supersedes_old_versions_and_scopes_field_download \
  tests/test_readiness.py::test_operational_reference_upload_rejects_malformed_files_and_keeps_project_boundary \
  tests/test_readiness.py::test_drive_backup_download_and_isolated_restore_round_trip_with_synthetic_transport
