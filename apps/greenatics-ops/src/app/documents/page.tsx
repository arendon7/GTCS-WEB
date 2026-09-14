import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getOpsServerAccess } from "@/lib/ops-server-access";
import {
  normalizeSharePointRelativeFolder,
  parseSharePointGraphRuntimeConfig,
  type SharePointDirectoryListing,
} from "@/lib/sharepoint/graph-readonly";
import { getSharePointGraphRuntimeClient } from "@/lib/sharepoint/runtime-client";
import type { SharePointDocumentReference } from "@/lib/document-source-contract";

export const dynamic = "force-dynamic";

type DocumentsSearchParams = Promise<{ folder?: string | string[] }>;

function formattedDate(value?: string) {
  if (!value) return "Sin fecha de modificación";
  try {
    return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "Fecha no disponible";
  }
}

function folderHref(relativePath: string) {
  return relativePath ? `/documents?folder=${encodeURIComponent(relativePath)}` : "/documents";
}

function parseRequestedFolder(value: string | string[] | undefined) {
  if (Array.isArray(value)) return { ok: false as const };
  try {
    return { ok: true as const, value: normalizeSharePointRelativeFolder(value || "") };
  } catch {
    return { ok: false as const };
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

function InvalidFolder() {
  return (
    <section className="panel mx-auto max-w-4xl" role="alert">
      <p className="eyebrow">Documentos · SharePoint</p>
      <h1 className="text-3xl">Ruta documental no válida</h1>
      <p className="lede mt-3">La carpeta solicitada no pertenece a una ruta relativa navegable dentro de la raíz documental autorizada. SharePoint no fue consultado.</p>
      <a className="button secondary mt-5 inline-flex" href="/documents">Volver a la raíz documental</a>
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

function Breadcrumbs({ relativeFolder }: { relativeFolder: string }) {
  const segments = relativeFolder ? relativeFolder.split("/") : [];
  return (
    <nav aria-label="Ruta documental" className="mt-5 flex flex-wrap items-center gap-2 text-sm">
      <a className="font-semibold text-[var(--green-dark)] underline-offset-4 hover:underline" href="/documents">Raíz</a>
      {segments.map((segment, index) => {
        const currentPath = segments.slice(0, index + 1).join("/");
        const isCurrent = index === segments.length - 1;
        return (
          <span className="flex items-center gap-2" key={currentPath}>
            <span aria-hidden="true" className="text-[var(--muted)]">/</span>
            {isCurrent ? <span aria-current="page" className="font-semibold">{segment}</span> : <a className="text-[var(--green-dark)] underline-offset-4 hover:underline" href={folderHref(currentPath)}>{segment}</a>}
          </span>
        );
      })}
    </nav>
  );
}

function DocumentCards({ documents }: { documents: readonly SharePointDocumentReference[] }) {
  if (!documents.length) return null;
  return (
    <section className="grid gap-3" aria-labelledby="document-files-heading">
      <h2 className="text-xl font-bold" id="document-files-heading">Archivos</h2>
      {documents.map((document) => (
        <article className="panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={`${document.driveId}:${document.itemId}`}>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-bold">{document.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{document.mimeType || "Tipo de archivo no informado"} · {formattedDate(document.modifiedAt)}</p>
          </div>
          <a className="button secondary shrink-0" href={document.webUrl} target="_blank" rel="noopener noreferrer">Abrir en SharePoint</a>
        </article>
      ))}
    </section>
  );
}

function DirectoryView({ listing }: { listing: SharePointDirectoryListing }) {
  const total = listing.folders.length + listing.documents.length;
  return (
    <section className="mx-auto grid max-w-5xl gap-5">
      <header className="panel">
        <p className="eyebrow">Documentos · SharePoint</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl">Centro documental</h1><p className="lede mt-2">Navegación de solo lectura dentro de la raíz documental autorizada.</p></div>
          <span className="rounded-full bg-[var(--green-soft)] px-4 py-2 text-sm font-bold text-[var(--green-dark)]">{listing.folders.length} carpeta{listing.folders.length === 1 ? "" : "s"} · {listing.documents.length} archivo{listing.documents.length === 1 ? "" : "s"}</span>
        </div>
        <Breadcrumbs relativeFolder={listing.relativeFolder} />
      </header>

      {listing.folders.length > 0 ? (
        <section className="grid gap-3" aria-labelledby="document-folders-heading">
          <h2 className="text-xl font-bold" id="document-folders-heading">Carpetas</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {listing.folders.map((folder) => (
              <a className="panel block transition-transform hover:-translate-y-0.5" href={folderHref(folder.relativePath)} key={folder.relativePath}>
                <span className="eyebrow">Carpeta</span>
                <h3 className="mt-1 break-words text-lg font-bold">{folder.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{folder.childCount === undefined ? "Contenido no informado por SharePoint" : `${folder.childCount} elemento${folder.childCount === 1 ? "" : "s"}`}</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <DocumentCards documents={listing.documents} />

      {total === 0 ? (
        <section className="panel"><h2 className="text-xl">Carpeta vacía</h2><p className="mt-2 text-sm text-[var(--muted)]">La conexión respondió correctamente y esta carpeta no contiene archivos ni subcarpetas directas.</p></section>
      ) : null}

      <p className="text-xs text-[var(--muted)]">GREENATICS OPS conserva únicamente referencias y metadata documental. Los archivos permanecen en SharePoint; esta vista no descarga, modifica, mueve ni elimina binarios.</p>
    </section>
  );
}

export default async function DocumentsPage({ searchParams }: { searchParams: DocumentsSearchParams }) {
  const access = await getOpsServerAccess();
  if (!access.ok) {
    switch (access.reason) {
      case "configuration":
      case "session":
        redirect("/login?next=%2Fdocuments");
      case "membership":
        return <AppShell><AccessProblem reason="membership" /></AppShell>;
      case "backend":
        return <AppShell><AccessProblem reason="backend" /></AppShell>;
    }
  }

  const params = await searchParams;
  const requestedFolder = parseRequestedFolder(params.folder);
  if (!requestedFolder.ok) return <AppShell><InvalidFolder /></AppShell>;

  const config = parseSharePointGraphRuntimeConfig(process.env);
  if (!config.ok) return <AppShell><PendingIntegration /></AppShell>;

  let listing: SharePointDirectoryListing;
  try {
    listing = await getSharePointGraphRuntimeClient().listDirectory(requestedFolder.value);
  } catch {
    return <AppShell><RemoteProblem /></AppShell>;
  }

  return <AppShell><DirectoryView listing={listing} /></AppShell>;
}
