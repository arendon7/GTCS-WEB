import type { DashboardPeriod,PlantFilter } from "@/lib/analytics";
import { settlementMethodLabel,type SettlementRecord } from "@/lib/settlement-domain";

export type SettlementMethodMetric={method:string;label:string;amountCop:number;recordsCount:number};
export type SettlementAnalyticsEvent={id:string;at:string;plant:string;kind:"collection"|"payment";title:string;detail:string};
export type SettlementAnalytics={recordsCount:number;collectionsCount:number;paymentsCount:number;collectedCop:number;paidCop:number;netRegisteredCashFlowCop:number;byMethod:SettlementMethodMetric[];events:SettlementAnalyticsEvent[]};

function inPeriod(date:string,period:DashboardPeriod){return date>=period.startKey&&date<=period.endKey;}
export function buildSettlementAnalytics(input:{records:SettlementRecord[];period:DashboardPeriod;plantId:PlantFilter}):SettlementAnalytics{
  const rows=input.records.filter((item)=>(input.plantId==="all"||item.plantId===input.plantId)&&inPeriod(item.occurredOn,input.period));
  const collections=rows.filter((item)=>item.kind==="collection");
  const payments=rows.filter((item)=>item.kind==="payment");
  const collectedCop=collections.reduce((sum,item)=>sum+item.amountCop,0);
  const paidCop=payments.reduce((sum,item)=>sum+item.amountCop,0);
  const methods=new Map<string,{label:string;amountCop:number;recordsCount:number}>();
  for(const item of rows){const current=methods.get(item.method)??{label:settlementMethodLabel[item.method],amountCop:0,recordsCount:0};current.amountCop+=item.amountCop;current.recordsCount+=1;methods.set(item.method,current);}
  return {recordsCount:rows.length,collectionsCount:collections.length,paymentsCount:payments.length,collectedCop,paidCop,netRegisteredCashFlowCop:collectedCop-paidCop,byMethod:[...methods.entries()].map(([method,value])=>({method,...value})).sort((a,b)=>b.amountCop-a.amountCop),events:rows.map((item)=>({id:`settlement-${item.id}`,at:`${item.occurredOn}T12:00:00-05:00`,plant:item.plant,kind:item.kind,title:item.kind==="collection"?`Recaudo · ${item.counterparty}`:`Pago · ${item.counterparty}`,detail:`$${item.amountCop.toLocaleString("es-CO")} · ${settlementMethodLabel[item.method]}${item.reference?` · ${item.reference}`:""}`})).sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime())};
}

function cell(value:string|number){const text=String(value);return /[;"\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text;}
export function settlementAnalyticsCsvSection(a:SettlementAnalytics){return [["DINERO REAL REGISTRADO"],["Indicador","Valor COP"],["Recaudado",a.collectedCop.toFixed(0)],["Pagado",a.paidCop.toFixed(0)],["Flujo de caja registrado",a.netRegisteredCashFlowCop.toFixed(0)],["Movimientos",a.recordsCount],[],["MÉTODOS"],["Método","Monto COP","Movimientos"],...a.byMethod.map((x)=>[x.label,x.amountCop.toFixed(0),x.recordsCount])].map((row)=>row.map(cell).join(";")).join("\n");}
