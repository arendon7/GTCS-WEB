import { test,expect,type Page } from "@playwright/test";

async function submitRequest(page:Page,input:{concept:string;estimate:string;justification?:string}){
  await page.goto("/purchases/new");
  await page.getByLabel("Solicita").fill("Nelson QA");
  await page.getByLabel("Categoría").selectOption({label:"Repuesto / mantenimiento"});
  await page.getByLabel("Qué se necesita").fill(input.concept);
  await page.getByLabel("Justificación").fill(input.justification??"Necesidad operativa para mantener disponibilidad del molino.");
  await page.getByLabel("Monto estimado COP").fill(input.estimate);
  await page.getByRole("button",{name:"Enviar solicitud"}).click();
  await expect(page).toHaveURL(/\/purchases$/);
}

test("approved request becomes one real expense using actual amount, never estimate",async({page})=>{
  await submitRequest(page,{concept:"Rodamiento solicitud QA",estimate:"200000"});
  let card=page.locator("article").filter({hasText:"Rodamiento solicitud QA"});
  await expect(card).toContainText("Pendiente");
  await expect(card).toContainText(/200[.]000/);

  await card.getByLabel("Responsable de decisión").fill("Coordinador QA");
  await card.getByLabel("Nota / razón").fill("Aprobado para compra inmediata");
  await card.getByRole("button",{name:"Aprobar solicitud"}).click();
  await expect(card).toContainText("Aprobada");

  await card.getByLabel("Responsable").fill("Coordinador QA");
  await card.getByLabel("Proveedor real").fill("Ferretería Solicitudes S.A.S.");
  await card.getByLabel("Monto real COP").fill("185000");
  await card.getByLabel("Fecha documento").fill("2026-08-11");
  await card.getByLabel(/Factura \/ soporte/).fill("FV-SOL-001");
  await card.getByRole("button",{name:"Registrar compra real y cerrar solicitud"}).click();
  await expect(card).toContainText("Comprada / registrada");
  await expect(card).toContainText(/185[.]000/);

  await page.goto("/expenses");
  const expenseCard=page.locator("article").filter({hasText:"Rodamiento solicitud QA"});
  await expect(expenseCard).toContainText("Desde solicitud");
  await expect(expenseCard).toContainText(/185[.]000/);
  await expect(expenseCard).not.toContainText(/200[.]000/);
  await expect(expenseCard).toContainText("FV-SOL-001");

  await page.goto("/finance");
  await page.getByRole("button",{name:"Día",exact:true}).click();
  await page.getByLabel("Fecha").fill("2026-08-11");
  const expenses=page.getByLabel("Flujo de gastos");
  await expect(expenses).toContainText(/185[.]000/);
  await expect(expenses).not.toContainText(/200[.]000/);
});

test("rejected request cannot be converted into an operational expense",async({page})=>{
  await submitRequest(page,{concept:"Compra rechazada QA",estimate:"90000"});
  const card=page.locator("article").filter({hasText:"Compra rechazada QA"});
  await card.getByLabel("Responsable de decisión").fill("Coordinador QA");
  await card.getByLabel("Nota / razón").fill("No prioritaria este mes");
  await card.getByRole("button",{name:"Rechazar"}).click();
  await expect(card).toContainText("Rechazada");
  await expect(card.getByRole("button",{name:"Registrar compra real y cerrar solicitud"})).toHaveCount(0);

  await page.goto("/expenses");
  await expect(page.getByText("Compra rechazada QA")).toHaveCount(0);
});
