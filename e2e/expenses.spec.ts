import { test,expect,type Page } from "@playwright/test";

async function createExpense(page:Page,input:{plant?:"Támesis"|"Yarumal";type?:"Compra"|"Gasto";supplier:string;category:string;concept:string;amount:string;date?:string;documentRef?:string}){
  await page.goto("/expenses/new");
  if(input.type)await page.getByLabel("Tipo").selectOption({label:input.type});
  if(input.plant)await page.getByLabel("Planta").selectOption({label:input.plant});
  await page.getByLabel("Proveedor").fill(input.supplier);
  await page.getByLabel("Categoría").selectOption({label:input.category});
  await page.getByLabel("Concepto").fill(input.concept);
  await page.getByLabel("Monto COP").fill(input.amount);
  await page.getByLabel("Fecha del documento").fill(input.date??"2026-08-11");
  if(input.documentRef)await page.getByLabel(/Referencia documento/).fill(input.documentRef);
  await page.getByRole("button",{name:"Guardar compra o gasto"}).click();
  await expect(page).toHaveURL(/\/expenses$/);
}

test("records operational purchase without implying payment",async({page})=>{
  await createExpense(page,{supplier:"Ferretería Industrial S.A.S.",category:"Repuesto / mantenimiento",concept:"Rodamiento molino",amount:"185000",documentRef:"FV-1024"});
  await expect(page.getByRole("heading",{name:"Compras y gastos"})).toBeVisible();
  await expect(page.getByText("Rodamiento molino")).toBeVisible();
  await expect(page.getByText("Ferretería Industrial S.A.S.")).toBeVisible();
  await expect(page.getByText(/185[.]000/).first()).toBeVisible();
  await expect(page.getByText("pago no modelado")).toBeVisible();
  await expect(page.getByText("FV-1024")).toBeVisible();
  await expect(page.getByText("Compra").first()).toBeVisible();
});

test("filters append-only expense ledger by plant and category",async({page})=>{
  await createExpense(page,{supplier:"Ferretería Industrial S.A.S.",category:"Repuesto / mantenimiento",concept:"Rodamiento molino",amount:"185000"});
  await createExpense(page,{plant:"Yarumal",type:"Gasto",supplier:"Transportes del Norte",category:"Transporte / logística",concept:"Flete planta",amount:"65000"});

  const indicators=page.getByLabel("Indicadores de compras y gastos");
  await expect(indicators).toContainText(/250[.]000/);
  await expect(indicators).toContainText("2");

  await page.getByLabel("Planta").selectOption({label:"Yarumal"});
  await expect(page.getByText("Flete planta")).toBeVisible();
  await expect(page.getByText("Rodamiento molino")).toHaveCount(0);
  await expect(indicators).toContainText(/65[.]000/);

  await page.getByLabel("Planta").selectOption({label:"Todas"});
  await page.getByLabel("Categoría").selectOption({label:"Repuesto / mantenimiento"});
  await expect(page.getByText("Rodamiento molino")).toBeVisible();
  await expect(page.getByText("Flete planta")).toHaveCount(0);
  await expect(indicators).toContainText(/185[.]000/);
});
