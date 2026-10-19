"""Initial GREENATICS RED workspaces declared for the Bello PMIRS pilot."""

BELLO_PROJECTS = (
    ("bello-parque-alto", "Parque Alto - Apartamaentos"),
    ("bello-tulipanes", "Urbanización Tulipanes"),
    ("bello-majagua", "Majagua - Unidad Residencial"),
    ("bello-trigales", "Unidad Residencial Trigales"),
)

BELLO_PROJECT_SLUGS = frozenset(slug for slug, _name in BELLO_PROJECTS)
BELLO_PROJECT_ORDER = {slug: index for index, (slug, _name) in enumerate(BELLO_PROJECTS)}


def project_order_key(project):
    """Keep the four requested Bello PMIRS in briefing order; sort later projects by name."""
    name = str(getattr(project, "name", "")).casefold()
    slug = str(getattr(project, "slug", ""))
    return (BELLO_PROJECT_ORDER.get(slug, len(BELLO_PROJECT_ORDER)), name)
