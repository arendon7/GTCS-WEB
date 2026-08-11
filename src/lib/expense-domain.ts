export type ExpenseRecordType = "purchase" | "expense";
export type ExpenseCategory = "input" | "maintenance" | "services" | "transport" | "operations" | "administration" | "other";

export const expenseRecordTypeLabel: Record<ExpenseRecordType,string> = {
  purchase:"Compra",
  expense:"Gasto",
};

export const expenseCategoryLabel: Record<ExpenseCategory,string> = {
  input:"Materia prima / insumo",
  maintenance:"Repuesto / mantenimiento",
  services:"Servicios",
  transport:"Transporte / logística",
  operations:"Operación general",
  administration:"Administración",
  other:"Otro",
};

export const expenseCategories = Object.keys(expenseCategoryLabel) as ExpenseCategory[];

export type SupplierRecord = {
  id:string;
  name:string;
  normalizedKey:string;
  createdAt:string;
};

export type OperationalExpenseRecord = {
  id:string;
  plantId:string;
  plant:string;
  recordType:ExpenseRecordType;
  supplierId:string;
  supplierName:string;
  category:ExpenseCategory;
  concept:string;
  amountCop:number;
  documentDate:string;
  documentRef?:string;
  equipmentId?:string;
  equipmentName?:string;
  processRef?:string;
  evidenceRef?:string;
  note?:string;
  recordedAt:string;
};

export type NewOperationalExpense = {
  plantId:string;
  recordType:ExpenseRecordType;
  supplierName:string;
  category:ExpenseCategory;
  concept:string;
  amountCop:number;
  documentDate:string;
  documentRef?:string;
  equipmentId?:string;
  equipmentName?:string;
  processRef?:string;
  evidenceRef?:string;
  note?:string;
};

export type ExpenseValidation = {ok:true} | {ok:false;error:string};

export function normalizeSupplierKey(value:string){
  return value
    .trim()
    .replace(/\s+/g," ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLocaleLowerCase("es-CO")
    .replace(/[^a-z0-9 ]+/g,"")
    .trim();
}

export function supplierIdFromKey(key:string){
  return `supplier-${key.replace(/\s+/g,"-")||"sin-nombre"}`;
}

export function validateOperationalExpense(input:NewOperationalExpense):ExpenseValidation{
  if(!input.plantId.trim()) return {ok:false,error:"Selecciona la planta."};
  if(!normalizeSupplierKey(input.supplierName)) return {ok:false,error:"Indica el proveedor."};
  if(!input.concept.trim()) return {ok:false,error:"Describe el concepto de la compra o gasto."};
  if(!Number.isFinite(input.amountCop)||input.amountCop<=0) return {ok:false,error:"El monto COP debe ser mayor que cero."};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.documentDate)) return {ok:false,error:"Indica una fecha de documento válida."};
  const [year,month,day]=input.documentDate.split("-").map(Number);
  const parsed=new Date(Date.UTC(year,month-1,day));
  if(parsed.getUTCFullYear()!==year||parsed.getUTCMonth()!==month-1||parsed.getUTCDate()!==day) return {ok:false,error:"Indica una fecha de documento válida."};
  if(!expenseCategories.includes(input.category)) return {ok:false,error:"Selecciona una categoría válida."};
  if(input.recordType!=="purchase"&&input.recordType!=="expense") return {ok:false,error:"Selecciona el tipo de registro."};
  return {ok:true};
}

export function totalRegisteredExpenseCop(records:OperationalExpenseRecord[]){
  return records.reduce((sum,item)=>sum+item.amountCop,0);
}
