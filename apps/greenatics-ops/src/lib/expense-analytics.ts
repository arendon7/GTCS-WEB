import type { DashboardPeriod, PlantFilter } from "@/lib/analytics";
import { expenseCategoryLabel, expenseRecordTypeLabel, totalRegisteredExpenseCop, type ExpenseCategory, type ExpenseRecordType, type OperationalExpenseRecord } from "@/lib/expense-domain";

export type ExpenseRanked={id:string;label:string;amountCop:number;recordsCount:number};
export type ExpenseTypeMetric={recordType:ExpenseRecordType;label:string;amountCop:number;recordsCount:number};
export type ExpenseAnalyticsEvent={id:string;at:string;plant:string;kind:"expense";title:string;detail:string};
export type ExpenseAnalytics={
  recordsCount:number;
  totalRegisteredCop:number;
  averageRecordCop:number;
  byRecordType:ExpenseTypeMetric[];
  categories:ExpenseRanked[];
  suppliers:ExpenseRanked[];
  events:ExpenseAnalyticsEvent[];
};

function inPeriod(documentDate:string,period:DashboardPeriod){return documentDate>=period.startKey&&documentDate<=period.endKey;}
function filterPlant(records:OperationalExpenseRecord[],plantId:PlantFilter){return plantId==="all"?records:records.filter((item)=>item.plantId===plantId);}

function ranked(records:OperationalExpenseRecord[],keyFor:(item:OperationalExpenseRecord)=>string,labelFor:(item:OperationalExpenseRecord)=>string){
  const map=new Map<string,{label:string;amountCop:number;recordsCount:number}>();
  for(const item of records){
    const id=keyFor(item);
    const current=map.get(id)??{label:labelFor(item),amountCop:0,recordsCount:0};
    current.amountCop+=item.amountCop;
    current.recordsCount+=1;
    map.set(id,current);
  }
  return [...map.entries()].map(([id,item]):ExpenseRanked=>({id,...item})).sort((a,b)=>b.amountCop-a.amountCop||a.label.localeCompare(b.label,"es"));
}

export function buildExpenseAnalytics(input:{records:OperationalExpenseRecord[];period:DashboardPeriod;plantId:PlantFilter}):ExpenseAnalytics{
  const records=filterPlant(input.records,input.plantId).filter((item)=>inPeriod(item.documentDate,input.period));
  const total=totalRegisteredExpenseCop(records);
  const byRecordType=(['purchase','expense'] as ExpenseRecordType[]).map((recordType)=>{
    const items=records.filter((item)=>item.recordType===recordType);
    return {recordType,label:expenseRecordTypeLabel[recordType],amountCop:totalRegisteredExpenseCop(items),recordsCount:items.length};
  }).filter((item)=>item.recordsCount>0);
  return {
    recordsCount:records.length,
    totalRegisteredCop:total,
    averageRecordCop:records.length?total/records.length:0,
    byRecordType,
    categories:ranked(records,(item)=>item.category,(item)=>expenseCategoryLabel[item.category as ExpenseCategory]),
    suppliers:ranked(records,(item)=>item.supplierId,(item)=>item.supplierName),
    events:records.map((item):ExpenseAnalyticsEvent=>({
      id:`expense-${item.id}`,
      at:`${item.documentDate}T12:00:00-05:00`,
      plant:item.plant,
      kind:"expense",
      title:`${expenseRecordTypeLabel[item.recordType]} · ${item.concept}`,
      detail:`${item.supplierName} · $${item.amountCop.toLocaleString("es-CO")} · ${expenseCategoryLabel[item.category]}`,
    })).sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime()),
  };
}

function csvCell(value:string|number){const text=String(value);return /[;"\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text;}
export function expenseAnalyticsCsvSection(analytics:ExpenseAnalytics){
  const rows:Array<Array<string|number>>=[
    ["COMPRAS Y GASTOS REGISTRADOS"],
    ["Indicador","Valor"],
    ["Registros",analytics.recordsCount],
    ["Monto registrado COP",analytics.totalRegisteredCop.toFixed(0)],
    ["Promedio por registro COP",analytics.averageRecordCop.toFixed(0)],
    [],
    ["TIPO"],["Tipo","Monto COP","Registros"],
    ...analytics.byRecordType.map((item)=>[item.label,item.amountCop.toFixed(0),item.recordsCount]),
    [],
    ["CATEGORÍAS"],["Categoría","Monto COP","Registros"],
    ...analytics.categories.map((item)=>[item.label,item.amountCop.toFixed(0),item.recordsCount]),
    [],
    ["PROVEEDORES"],["Proveedor","Monto COP","Registros"],
    ...analytics.suppliers.map((item)=>[item.label,item.amountCop.toFixed(0),item.recordsCount]),
  ];
  return rows.map((row)=>row.map(csvCell).join(";")).join("\n");
}
