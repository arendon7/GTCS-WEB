import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getOpsServerAccess } from "@/lib/ops-server-access";
import { parseSharePointGraphRuntimeConfig } from "@/lib/sharepoint/graph-readonly";
import { getSharePointGraphRuntimeClient } from "@/lib/sharepoint/runtime-client";
import type { SharePointDocumentReference } from "@/lib/document-source-contract";

export const dynamic = "force-dynamic";

function formattedDate(value?: string) {
  if (!value) return "Sin fecha de modificación";
  try {
    return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "Fecha no disponible";
  }
}

function PendingIntegration() {
  return (
    <section className="panel mx-auto max-w-5xl">
      <p className="eyebrow">Documentos · SharePoint</p>
      <h1 className="text-3xl">Centro documental</h1>
      <p className="lede mt-3">La superficie documental está lista, pero este entorno todavía no tiene la conexión Microsoft Graph completa.</p>
      <div className="mt-6 rounded-2xl bg-[var(--amber-soft)] p-5 text-sm text-[var(--amber)]" role="status">
        <strong>Integración pendiente de activación.</strong>
        <span className="mt-2 block">No se muestran documentos ficticios como si fueran información real. La operación diaria de GREENATICS OPS continúa en su fuente transaccional independiente.</span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-[var(--line)] p-4"><strong className="block">1 · Entra</strong><span className="mt-1 block text-sm text-[var(--muted)]">App Registration y permiso de lectura seleccionado.</span></article>
        <article className="rounded-2xl border border-[var(--line)] p-4"><strong className="block">2 · Runtime</strong><span className="mt-1 block text-sm text-[var(--muted)]">Credenciales e identificadores solo del lado servidor.</span></article>
        <article className="rounded-2xl border border-[var(--line)] p-4"><strong className="block">3 · Smoke</strong><span className="mt-1 block text-sm text-[var(--muted)]">Confirmar sitio permitido y rechazo de sitios no asignados.</span></article>
      </div>
    </section>
  );
}

function AccessProblem({ reason }: { reason: "membership" | "backend" }) {
  const membership = reason === "membership";
  return (
    <section className="panel mx-auto max-w-3xl" role="alert">
      <p className="eyebrow">Centro documental</p>
      <h1 className="text-3xl">{membership ? "Acceso documental no habilitado" : "No fue posible validar el acceso"}</h1>
      <p className="lede mt-3">
        {membership
          ? "Tu sesión existe, pero no tiene una membresía activa sobre una planta activa. SharePoint no se consulta en este estado."
          : "No se pudo comprobar tu membresía operacional. Por seguridad, SharePoint no se consulta mientras esa validación esté incompleta."}
      </p>
    </section>
  );
}

function RemoteProblem() {
  return (
    <section className="panel mx-auto max-w-4xl" role="alert">
      <p className="eyebrow">Documentos · SharePoint</p>
      <h1 className="text-3xl">Repositorio documental temporalmente no disponible</h1>
      <p className="lede mt-3">La consulta documental falló de forma cerrada. No se muestran resultados parciales y la operación transaccional de GREENATICS OPS no se reemplaza por este repositorio.</p>
      <p className="mt-5 rounded-2xl bg-[var(--red-soft)] p-4 text-sm font-semibold text-[var(--red)]">Reintenta más tarde o revisa la configuración server-side de Microsoft Graph.</p>
    </section>
  );
}

function DocumentList({ documents }: { documents: readonly SharePointDocumentReference[] }) {
  return (
    <section className="mx-auto grid max-w-5xl gap-5">
      <header className="panel">
        <p className="eyebrow">Documentos · SharePoint</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl">Centro documental</h1><p className="lede mt-2">Referencias de solo lectura al repositorio documental autorizado.</p></div>
          <span className="rounded-full bg-[var(--green-soft)] px-4 py-2 text-sm font-bold text-[var(--green-dark)]">{documents.length} documento{documents.length === 1 ? "" : "s"}</span>
        </div>
      </header>

      {documents.length === 0 ? (
        <section className="panel"><h2 className="text-xl">No hay archivos en esta carpeta</h2><p className="mt-2 text-sm text-[var(--muted)]">La conexión respondió correctamente, pero la raíz documental configurada no contiene archivos directos.</p></section>
      ) : (
        <div className="grid gap-3">
          {documents.map((document) => (
            <article className="panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={`${document.driveId}:${document.itemId}`}>
              <div className="min-w-0">
                <h2 className="break-words text-lg font-bold">{document.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{document.mimeType || "Tipo de archivo no informado"} · {formattedDate(document.modifiedAt)}</p>
              </div>
              <a className="button secondary shrink-0" href={document.webUrl} target="_blank" rel="noopener noreferrer">Abrir en SharePoint</a>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">GREENATICS OPS conserva únicamente referencias documentales. Los archivos permanecen en SharePoint y esta vista no descarga ni modifica binarios.</p>
    </section>
  );
}

export default async function DocumentsPage() {
  const access = await getOpsServerAccess();
  if (!access.ok && (access.reason === "configuration" || access.reason === "session")) {
    redirect("/login?next=%2Fdocuments");
  }

  if (!access.ok) return <AppShell><AccessProblem reason={access.reason} /></AppShell>;

  const config = parseSharePointGraphRuntimeConfig(process.env);
  if (!config.ok) return <AppShell><PendingIntegration /></AppShell>;

  let documents: readonly SharePointDocumentReference[];
  try {
    documents = await getSharePointGraphRuntimeClient().listDocuments();
  } catch {
    return <AppShell><RemoteProblem /></AppShell>;
  }

  return <AppShell><DocumentList documents={documents} /></AppShell>;
}
