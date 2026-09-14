import { test,expect,type Page } from "@playwright/test";

async function createSale(page:Page){
  await page.goto("/production/new");
  await page.getByLabel(/Cantidad producida/).fill("250");
  await page.getByLabel("Proceso fuente").fill("Caja QA");
  await page.getByRole("button",{name:"Guardar producción y entrar a inventario"}).click();
  await expect(page).toHaveURL(/\/production$/);
  await page.goto("/sales/new");
  await page.getByLabel("Cliente").fill("Cliente Caja QA");
  await page.getByLabel(/Cantidad vendida/).fill("60");
  await page.getByLabel(/Precio unitario COP/).fill("2000");
  await page.getByRole("button",{name:"Guardar venta y descontar inventario"}).click();
  await expect(page).toHaveURL(/\/sales$/);
}

async function createExpense(page:Page){
  await page.goto("/expenses/new");
  await page.getByLabel("Proveedor").fill("Proveedor Caja QA");
  await page.getByLabel("Categoría").selectOption({label:"Servicios"});
  await page.getByLabel("Concepto").fill("Servicio caja QA");
  await page.getByLabel("Monto COP").fill("185000");
  await page.getByLabel("Fecha del documento").fill("2026-08-11");
  await page.getByRole("button",{name:"Guardar compra o gasto"}).click();
  await expect(page).toHaveURL(/\/expenses$/);
}

test("sale supports partial collections and blocks over-collection",async({page})=>{
  await createSale(page);
  await page.goto("/cash");
  const card=page.locator("article").filter({hasText:"Cliente Caja QA"});
  await card.getByLabel("Monto").fill("50000");
  await card.getByLabel("Fecha").fill("2026-08-11");
  await card.getByRole("button",{name:"Registrar recaudo"}).click();
  await expect(card).toContainText("Parcial");
  await expect(card).toContainText(/50[.]000/);
  await expect(card).toContainText(/70[.]000/);

  await card.getByLabel("Monto").fill("80000");
  await card.getByRole("button",{name:"Registrar recaudo"}).click();
  await expect(card).toContainText("excede el saldo pendiente");

  await card.getByLabel("Monto").fill("70000");
  await card.getByRole("button",{name:"Registrar recaudo"}).click();
  await expect(card).toContainText("Saldado");
  await expect(card).toContainText(/120[.]000/);
  await expect(card.getByRole("button",{name:"Registrar recaudo"})).toHaveCount(0);
});

test("expense supports partial payment and finance shows observed cash separately",async({page})=>{
  await createSale(page);
  await createExpense(page);
  await page.goto("/cash");
  const saleCard=page.locator("article").filter({hasText:"Cliente Caja QA"});
  await saleCard.getByLabel("Monto").fill("120000");
  await saleCard.getByLabel("Fecha").fill("2026-08-11");
  await saleCard.getByRole("button",{name:"Registrar recaudo"}).click();

  const expenseCard=page.locator("article").filter({hasText:"Servicio caja QA"});
  await expenseCard.getByLabel("Monto").fill("100000");
  await expenseCard.getByLabel("Fecha").fill("2026-08-11");
  await expenseCard.getByRole("button",{name:"Registrar pago"}).click();
  await expect(expenseCard).toContainText("Parcial");
  await expect(expenseCard).toContainText(/100[.]000/);
  await expect(expenseCard).toContainText(/85[.]000/);

  await page.goto("/finance");
  await page.getByRole("button",{name:"Día",exact:true}).click();
  await page.getByLabel("Fecha").fill("2026-08-11");
  const cash=page.getByLabel("Dinero real registrado");
  await expect(cash).toContainText(/120[.]000/);
  await expect(cash).toContainText(/100[.]000/);
  await expect(cash).toContainText(/20[.]000/);
  await expect(page.getByRole("note")).toContainText("no representa utilidad ni saldo bancario");
});
