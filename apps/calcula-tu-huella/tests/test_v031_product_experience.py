/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 19: /bin/ps: Operation not permitted
from __future__ import annotations

import re
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.database import Base, ENGINE, EmissionCalculation, Inventory, SessionLocal, init_db
from app.main import app
from app.product_experience import journey_detail, navigation_for


@pytest.fixture(autouse=True)
def fresh_database():
    Base.metadata.drop_all(ENGINE)
    init_db()
    yield


def login(client: TestClient, email: str) -> None:
    response = client.post(
        "/login",
        data={"email": email, "password": "Demo2026!"},
        follow_redirects=False,
    )
    assert response.status_code == 303


def test_navigation_defaults_to_inventory_core() -> None:
    user = {
        "role": "Consultor",
        "capabilities": {
            "manage_inventory", "manage_sources", "view_methodology", "review",
            "manage_supply_chain", "manage_consolidation", "view_consolidation",
        },
    }
    navigation = navigation_for(user, "essential")
    labels = [item["label"] for section in navigation["core"] for item in section["items"]]
    assert "Mi trabajo" in labels
    assert "Recorrido del inventario" in labels
    assert "Datos y evidencias" in labels
    assert "Cierre metodológico" in labels
    assert navigation["advanced"] == []
    assert navigation["internal"] == []
    visible_items = [item for section in navigation["core"] for item in section["items"]]
    assert all('<svg class="nav-icon"' in item["icon_svg"] for item in visible_items)


def test_complete_navigation_preserves_advanced_capabilities() -> None:
    user = {
        "role": "Administrador",
        "capabilities": {
            "manage_org", "manage_inventory", "manage_sources", "view_methodology",
            "manage_methodology_governance", "manage_operations", "manage_saas",
            "manage_portfolio", "manage_consolidation", "view_consolidation",
        },
    }
    navigation = navigation_for(user, "complete")
    advanced = [item["label"] for section in navigation["advanced"] for item in section["items"]]
    internal = [item["label"] for section in navigation["internal"] for item in section["items"]]
    assert "Metodología" in advanced
    assert "Biblioteca Colombia" in advanced
    assert "Organización" in internal
    assert "Operación y seguridad" in internal
    assert "Consolidación V1.0" in internal
    all_items = [item for group in navigation["core"] + navigation["advanced"] + navigation["internal"] for item in group["items"]]
    assert all('<svg class="nav-icon"' in item["icon_svg"] for item in all_items)


def test_dashboard_switches_between_essential_and_complete_view() -> None:
    with TestClient(app) as client:
        login(client, "consultor@calculatuhuella.local")
        essential = client.get("/dashboard")
        assert essential.status_code == 200
        assert "Vista esencial" in essential.text
        assert "Herramientas avanzadas" not in essential.text
        assert "Recorrido del inventario" in essential.text

        response = client.post(
            "/preferencias/vista",
            data={"mode": "complete", "return_url": "/dashboard"},
            follow_redirects=False,
        )
        assert response.status_code == 303
        complete = client.get("/dashboard")
        assert "Vista completa" in complete.text
        assert "Herramientas avanzadas" in complete.text
        assert "Administración interna" in complete.text


def test_inventory_journey_has_five_decision_stages() -> None:
    with TestClient(app) as client:
        login(client, "cliente@calculatuhuella.local")
        response = client.get("/recorrido-inventario")
        assert response.status_code == 200
        for stage in ["Configurar", "Recolectar", "Calcular", "Revisar", "Reportar"]:
            assert stage in response.text
        assert '<progress max="100" value="' in response.text
        assert 'aria-label="Avance del recorrido:' in response.text


def test_source_page_distinguishes_period_coverage_from_calculation_review() -> None:
    with TestClient(app) as client:
        login(client, "consultor@calculatuhuella.local")
        response = client.get("/fuentes/1")
        assert response.status_code == 200
        assert "COBERTURA DE PERIODOS" in response.text
        assert "Periodos completos" in response.text
        assert "no confirma que los factores y cálculos estén libres de alertas" in response.text
        assert 'href="#memoria-de-calculo"' in response.text


def test_sources_page_never_offers_a_dead_next_step_link() -> None:
    with TestClient(app) as client:
        login(client, "consultor@calculatuhuella.local")
        response = client.get("/inventarios/1/fuentes")
        assert response.status_code == 200
        assert 'href="/informacion#datos"' in response.text
        assert 'href="#"' not in response.text


def test_empty_source_map_keeps_first_action_on_source_setup() -> None:
    with SessionLocal() as session:
        organization_id = session.get(Inventory, 1).organization_id
        inventory = Inventory(
            organization_id=organization_id,
            name="Inventario sin fuentes",
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
            base_year=2025,
            methodology="GHG Protocol",
        )
        session.add(inventory)
        session.commit()
        inventory_id = inventory.id

    with TestClient(app) as client:
        login(client, "consultor@calculatuhuella.local")
        response = client.get(f"/inventarios/{inventory_id}/fuentes")
        assert response.status_code == 200
        assert 'href="#configuracion-asistida">Elegir fuentes sugeridas</a>' in response.text
        assert 'id="configuracion-asistida" open' in response.text
        assert ">Cargar primer dato</a>" not in response.text


def test_dashboard_uses_calculated_monthly_data_not_placeholder_trend() -> None:
    with TestClient(app) as client:
        login(client, "consultor@calculatuhuella.local")
        response = client.get("/dashboard")
        assert response.status_code == 200
        assert "▼ 8,4%" not in response.text
        assert "periodo seleccionado" in response.text
        assert 'class="nav-icon"' in response.text
        assert "monthly-chart" in response.text or "Aún no hay resultados mensuales calculados" in response.text
        assert 'class="donut-chart"' in response.text
        assert 'aria-label="Distribución por alcance:' in response.text
        assert 'class="donut-segment d1"' in response.text
        assert 'height:150px' in response.text
        assert "Los registros con cálculo mensual suman" in response.text
        assert "no coincide con el total del inventario" in response.text
        assert 'href="/informacion">Revisar datos</a>' in response.text
        assert 'href="/calculos">Revisar cálculos' in response.text
        assert "resultados con alertas metodológicas" in response.text
        assert "Resultados calculados por mes del inventario" in response.text
        monthly_table = response.text.split('<table class="visually-hidden">', 1)[1].split("</table>", 1)[0]
        monthly_values = re.findall(r"<td>([\d.,]+)</td>", monthly_table)
        assert len(monthly_values) == 12
        assert any(float(value.replace(".", "").replace(",", ".")) > 0 for value in monthly_values)


def test_dashboard_explains_when_inventory_total_has_no_monthly_results() -> None:
    with TestClient(app) as client:
        login(client, "consultor@calculatuhuella.local")
        with SessionLocal() as session:
            session.execute(delete(EmissionCalculation))
            session.commit()
        response = client.get("/dashboard")
        assert response.status_code == 200
        assert "El total aún no tiene un desglose mensual calculado" in response.text
        assert "Revisa los periodos, los factores y el estado del motor" in response.text
        assert 'href="/informacion">Revisar datos' in response.text
        assert 'href="/calculos">Revisar cálculos' in response.text


def test_journey_detail_marks_only_one_current_stage() -> None:
    workspace = {
        "score": 20,
        "completed": 1,
        "total": 5,
        "actions": [],
        "milestones": [
            {"name": "Configurar", "done": True, "detail": "OK", "href": "/inventarios/1"},
            {"name": "Recolectar", "done": False, "detail": "2/5", "href": "/informacion"},
            {"name": "Calcular", "done": False, "detail": "0/5", "href": "/calculos"},
            {"name": "Revisar", "done": False, "detail": "Pendiente", "href": "/control"},
            {"name": "Reportar", "done": False, "detail": "0", "href": "/reportes"},
        ],
    }
    journey = journey_detail(workspace, "Consultor")
    current = [step for step in journey["steps"] if step["current"]]
    assert len(current) == 1
    assert current[0]["name"] == "Recolectar"
