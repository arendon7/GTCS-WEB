import { test,expect,type Page } from "@playwright/test";

async function createSale(page:Page){
  await page.goto("/production/new");
  await page.getByLabel(/Cantidad producida/).fill("250");
  await page.getByLabel("Proceso fuente").fill("Producción finance QA");
  await page.getByRole("button",{name:"Guardar producción y entrar a inventario"}).click();
  await expect(page).toHaveURL(/\/production$/);
  await page.goto("/sales/new");
  await page.getByLabel("Cliente").fill("Cliente Finance QA");
  await page.getByLabel(/Cantidad vendida/).fill("60");
  await page.getByLabel(/Precio unitario COP/).fill("2000");
  await page.getByRole("button",{name:"Guardar venta y descontar inventario"}).click();
  await expect(page).toHaveURL(/\/sales$/);
}

async function createExpense(page:Page){
  await page.goto("/expenses/new");
  await page.getByLabel("Proveedor").fill("Ferretería Finance S.A.S.");
  await page.getByLabel("Categoría").selectOption({label:"Repuesto / mantenimiento"});
  await page.getByLabel("Concepto").fill("Rodamiento finance QA");
  await page.getByLabel("Monto COP").fill("185000");
  await page.getByLabel("Fecha del documento").fill("2026-08-11");
  await page.getByRole("button",{name:"Guardar compra o gasto"}).click();
  await expect(page).toHaveURL(/\/expenses$/);
}

test("economic center shows canonical flows separately and never invents profit",async({page})=>{
  await createSale(page);
  await createExpense(page);
  await page.goto("/finance");

  const commercial=page.getByLabel("Flujo comercial");
  const expenses=page.getByLabel("Flujo de gastos");
  const note=page.getByRole("note");
  await expect(page.getByRole("heading",{name:"Finanzas"})).toBeVisible();
  await expect(commercial).toContainText(/120[.]000/);
  await expect(commercial).toContainText("1 venta");
  await expect(commercial).toContainText("60");
  await expect(commercial).toContainText("kg");
  await expect(expenses).toContainText(/185[.]000/);
  await expect(expenses).toContainText("1 registro");
  await expect(note).toContainText("facturación no significa recaudo");
  await expect(note).toContainText("gasto registrado no significa pago");
  await expect(note).toContainText("no representa utilidad ni saldo bancario");
  await expect(page.getByRole("heading",{name:/^(Utilidad|Margen|Pérdida)$/})).toHaveCount(0);
  await expect(page.getByText(/65[.]000/)).toHaveCount(0);
});

test("economic center applies the same period to commercial and expense flows",async({page})=>{
  await createSale(page);
  await createExpense(page);
  await page.goto("/finance");
  await page.getByRole("button",{name:"Día",exact:true}).click();
  await page.getByLabel("Fecha").fill("2026-08-10");

  await expect(page.getByLabel("Flujo comercial")).toContainText("0 ventas");
  await expect(page.getByLabel("Flujo de gastos")).toContainText("0 registros");
  await expect(page.getByText("Sin eventos económicos para el periodo.")).toBeVisible();
});
