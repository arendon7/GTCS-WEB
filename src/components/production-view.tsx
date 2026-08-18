"use client";

import Link from "next/link";
import { useCompostStore } from "@/components/compost-store";
import { useInventoryStore } from "@/components/inventory-store";

const dateFmt=new Intl.DateTimeFormat("es-CO",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Bogota"});

export function ProductionView(){
  const {productions}=useInventoryStore();
  const {piles}=useCompostStore();
  const pileCodes=new Map(piles.map((pile)=>[pile.id,pile.code]));
  return <>
    <header className="page-header"><div><p className="eyebrow">Producto terminado</p><h1>Producción</h1><p className="lede">Cada cierre es una medición independiente. La referencia vigente y el origen quedan congelados sin inferir transferencia de masa.</p></div><div className="header-actions"><Link className="button secondary" href="/inventory">Ver inventario</Link><Link className="button primary" href="/production/new">Registrar producción</Link></div></header>
    <section className="panel"><div className="section-head"><div><p className="eyebrow">Historial</p><h2>Producciones registradas</h2></div><span className="quiet">{productions.length} registros</span></div>
      {productions.length ? <div className="grid gap-3">{productions.map((record)=><article className="rounded-xl border border-[var(--line)] p-4" key={record.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="text-sm">{record.lotCode}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{record.productReferenceCode?`Ref. ${record.productReferenceCode} · `:"Ref. no definida · "}{record.productName} · {record.plant}</span></div><div className="text-right"><strong className="block text-lg">{record.quantity.toLocaleString("es-CO")} {record.unit}</strong><span className="text-[11px] text-[var(--muted)]">{dateFmt.format(new Date(record.completedAt))}</span></div></div><div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-3 text-xs sm:grid-cols-4"><div><span className="quiet">Proceso fuente</span><strong className="mt-1 block">{record.sourceProcess}</strong></div><div><span className="quiet">Origen estructurado</span><strong className="mt-1 block">{record.originKind==="compost_pile"?"Pila de compost":"Proceso declarado"}</strong></div><div><span className="quiet">Pila relacionada</span><strong className="mt-1 block">{record.sourcePileId?(pileCodes.get(record.sourcePileId)??record.sourcePileId):"No aplica"}</strong></div><div><span className="quiet">Efecto inventario</span><strong className="mt-1 block text-[var(--green)]">+ {record.quantity.toLocaleString("es-CO")} {record.unit}</strong></div></div>{record.note && <p className="mt-3 rounded-lg bg-[var(--surface-soft)] p-3 text-xs text-[var(--muted)]">{record.note}</p>}</article>)}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center"><strong className="block text-sm">Aún no hay producción terminada registrada</strong><p className="quiet mt-2">No inferimos producción desde recepciones ni desde el peso final de una pila.</p><Link className="button primary mt-4 inline-flex" href="/production/new">Registrar la primera</Link></div>}
    </section>
  </>;
}
