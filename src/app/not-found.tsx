import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-5 py-20 text-center">
      <section>
        <Image className="mx-auto mb-6" src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" width={80} height={52} />
        <p className="eyebrow">404 · Greenatics</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">Esta ruta no existe o cambió.</h1>
        <p className="lede mx-auto mt-5 max-w-2xl">Puedes volver al sitio público, explorar Wondergreen o regresar a GREENATICS OPS.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="button primary" href="/">Volver al sitio</Link>
          <Link className="button secondary" href="/wondergreen">Explorar Wondergreen</Link>
          <a className="button secondary" href="/app">Ir a GREENATICS OPS</a>
        </div>
      </section>
    </main>
  );
}
