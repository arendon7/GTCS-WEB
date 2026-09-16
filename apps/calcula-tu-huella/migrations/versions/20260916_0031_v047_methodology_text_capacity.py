"""V0.47: preserve complete methodology source metadata."""
from typing import Sequence, Union

from alembic import op

revision: str = "20260916_0031"
down_revision: Union[str, None] = "20260916_0030"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Some staging databases were created with legacy VARCHAR limits. These
    # fields are descriptive metadata, so truncating them would damage the
    # audit trail and prevent the validated source library from loading.
    if op.get_bind().dialect.name != "postgresql":
        return

    table_exists = op.get_bind().exec_driver_sql(
        "SELECT to_regclass(current_schema() || '.methodology_source_documents')"
    ).scalar()
    if table_exists is None:
        return

    for column in (
        "title",
        "issuing_body",
        "document_type",
        "jurisdiction",
        "source_url",
        "status",
    ):
        op.execute(f"ALTER TABLE methodology_source_documents ALTER COLUMN {column} TYPE TEXT")


def downgrade() -> None:
    # Narrowing these columns could truncate validated citations and URLs.
    pass
