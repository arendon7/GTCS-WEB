import { test,expect,type Page } from "@playwright/test";

async function createPurchase(page:Page){
  await page.goto("/expenses/new");
  await page.getByLabel("Proveedor").fill("Proveedor Insumos QA");
  await page.getByLabel("Categoría").selectOption({label:"Materia prima / insumo"});
  await page.getByLabel("Concepto").fill("Compra melaza QA");
  await page.getByLabel("Monto COP").fill("185000");
  await page.getByLabel("Fecha del documento").fill("2026-08-11");
  await page.getByRole("button",{name:"Guardar compra o gasto"}).click();
  await expect(page).toHaveURL(/\/expenses$/);
}

async function receiveMelaza(page:Page,quantity:string){
  await page.goto("/supplies/receipts/new");
  await page.getByLabel("Insumo recibido").fill("Melaza QA");
  await page.getByLabel("Categoría").selectOption({label:"Insumo"});
  await page.getByLabel("Unidad").selectOption("kg");
  await page.getByLabel("Cantidad medida").fill(quantity);
  await page.getByLabel("Fecha de recepción").fill("2026-08-11");
  await page.getByLabel(/Compra real relacionada/).selectOption({label:"2026-08-11 · Proveedor Insumos QA · Compra melaza QA"});
  await page.getByRole("button",{name:"Registrar recepción física"}).click();
  await expect(page).toHaveURL(/\/supplies$/);
}

test("financial purchase can have measured physical receipts and stock only reflects receipts",async({page})=>{
  await createPurchase(page);
  await receiveMelaza(page,"60");
  await receiveMelaza(page,"40");

  const stock=page.getByLabel("Stock de insumos");
  await expect(stock).toContainText("Melaza QA");
  await expect(stock).toContainText("100 kg");
  await expect(stock).toContainText("2 lotes con saldo");
  await expect(stock).not.toContainText("185000");
});

test("consumption reduces an exact supply lot and blocks over-consumption",async({page})=>{
  await createPurchase(page);
  await receiveMelaza(page,"60");
  await receiveMelaza(page,"40");

  await page.goto("/supplies/consume");
  await page.getByLabel(/Cantidad consumida/).fill("30");
  await page.getByLabel("Fecha de consumo").fill("2026-08-11");
  await page.getByLabel("Destino / uso").fill("Formulación QA");
  await page.getByRole("button",{name:"Registrar consumo"}).click();
  await expect(page).toHaveURL(/\/supplies$/);
  await expect(page.getByLabel("Stock de insumos")).toContainText("70 kg");

  await page.goto("/supplies/consume");
  await page.getByLabel(/Cantidad consumida/).fill("40");
  await page.getByLabel("Destino / uso").fill("Sobreconsumo QA");
  await page.getByRole("button",{name:"Registrar consumo"}).click();
  const validationAlert=page.locator('p[role="alert"]');
  await expect(validationAlert).toContainText("Stock insuficiente");
  await expect(validationAlert).toContainText("Disponible: 30 kg");
});
