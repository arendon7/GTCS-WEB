import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CasaJardinInteractive } from "@/components/casa-jardin-interactive";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Wondergreen Casa & Jardín | Plantas, huertas y suelo vivo",
  description: "Orientación y soluciones Wondergreen para plantas de interior, flores, jardines, viveros y huertas urbanas según etapa, estado y tamaño de maceta.",
  alternates: { canonical: "/casa-jardin/" },
  openGraph: {
    type: "website",
    siteName: "Greenatics",
    title: "Casa & Jardín | Wondergreen",
    description: "Kits, guías y productos Wondergreen para cuidar plantas, jardines y huertas por etapa y condición.",
    url: "/casa-jardin/",
    images: ["/products/wondergreen-casa-jardin-hero.png"],
  },
};

const spaces = [
  {
    title: "Plantas de interior",
    kicker: "Follaje y mantenimiento",
    copy: "Empieza por leer la condición de la planta, la humedad y el tamaño de la matera. Después decide si corresponde CRECE o EQUILIBRA.",
    image: "/kits/kit-plantas-verdes.png",
    alt: "Kit Wondergreen Plantas Verdes para plantas de follaje",
    tag: "CRECE · EQUILIBRA",
    href: "/casa-jardin/kits/plantas-verdes/",
    cta: "Ver ruta Plantas Verdes",
  },
  {
    title: "Flores y jardín",
    kicker: "Estabilidad y floración",
    copy: "Una planta ornamental no entra directamente por FLORECE: primero reconoce su estabilidad, la luz, el agua y la transición reproductiva.",
    image: "/kits/kit-plantas-con-flor.png",
    alt: "Kit Wondergreen Plantas con Flor para plantas ornamentales",
    tag: "EQUILIBRA · FLORECE",
    href: "/casa-jardin/kits/plantas-con-flor/",
    cta: "Ver ruta Plantas con Flor",
  },
  {
    title: "Huerta en casa",
    kicker: "Del sustrato al fruto",
    copy: "La huerta necesita una secuencia: prepara el sustrato, acompaña el crecimiento y cambia la lectura cuando aparecen floración y fruto.",
    image: "/kits/kit-mi-huerta.png",
    alt: "Kit Wondergreen Mi Huerta para acompañar el ciclo de una huerta doméstica",
    tag: "PREPARA · CRECE · FLORECE · FRUCTIFICA",
    href: "/casa-jardin/kits/mi-huerta/",
    cta: "Ver ruta Mi Huerta",
  },
] as const;

const decisionVisuals = [
  ["01 · Tamaño del recipiente", "La matera también cuenta.", "El volumen de sustrato, el drenaje y el tamaño de la planta cambian la conversación. Por eso el orientador registra la escala sin convertirla en una dosis automática.", "/guides/home-garden-pot-sizes.webp", "Cuatro tamaños de matera Wondergreen: pequeña, mediana, grande y extra grande."],
  ["02 · Condición de la planta", "No todo estrés necesita fertilizante.", "Una planta activa y una planta encharcada no deben entrar por la misma ruta. Primero revisa agua, drenaje, raíces y sanidad; después decide si corresponde nutrir.", "/guides/home-garden-not-all-stress.webp", "Comparación visual entre una planta activa y una planta estresada por exceso de agua."],
] as const;

const stages = [
  ["01", "Prepara", "Antes de nutrir, revisa suelo, sustrato, estructura, drenaje y estabilidad del trasplante."],
  ["02", "Crece", "Crecimiento, brotación y recuperación vegetativa cuando la planta está activa."],
  ["03", "Equilibra", "Mantenimiento y nutrición balanceada cuando la planta ya está estable."],
  ["04", "Florece", "Transición reproductiva, botones y floración, sin convertir la nutrición en una promesa."],
  ["05", "Fructifica", "Cuajado, desarrollo y llenado de fruto, sin prometer rendimiento, calibre o cosecha."],
] as const;

const guideCards = [
  ["Guía Casa & Jardín", "Método completo: observa, identifica, elige, aplica y revisa.", "/guides/home-garden-casa-jardin-cover.webp", "/downloads/guia-casa-jardin.pdf"],
  ["Guía rápida de etapas", "Identifica el momento de la planta antes de elegir una línea.", "/guides/home-garden-etapas-cover.webp", "/downloads/guia-rapida-etapas.pdf"],
  ["Guía de trasplante", "Drenaje, raíces y sustrato antes de decidir nutrición.", "/guides/home-garden-trasplante-cover.webp", "/downloads/guia-trasplante.pdf"],
  ["Guía Mi Huerta", "Una secuencia por etapas para huertas domésticas.", "/guides/home-garden-mi-huerta-cover.webp", "/downloads/guia-mi-huerta.pdf"],
] as const;

const safetySignals = [
  ["Verde", "Puedes evaluar nutrición", "Planta activa, drenaje funcional, humedad adecuada y etapa reconocible.", "green"],
  ["Amarillo", "Confirma la causa", "Trasplante reciente, estrés, sustrato muy seco o síntomas que todavía no entiendes.", "yellow"],
  ["Rojo", "No empieces fertilizando", "Encharcamiento, pudrición, problema radicular, marchitez severa o daño sanitario evidente.", "red"],
] as const;

const kitCards = [
  {
    slug: "plantas-verdes",
    title: "Plantas Verdes",
    composition: "2GROW 15-3-3 · 500 g + 2BALANCE 7-7-7 · 500 g",
    intent: "Para acompañar crecimiento activo y mantenimiento de plantas de follaje.",
    claim: "Crece cuando lo necesita. Equilibra cuando está estable.",
    image: "/kits/kit-plantas-verdes.png",
    alt: "Kit Wondergreen Plantas Verdes con 2GROW y 2BALANCE",
  },
  {
    slug: "plantas-con-flor",
    title: "Plantas con Flor",
    composition: "2BALANCE 7-7-7 · 500 g + 2BLOOM 3-8-3 · 500 g",
    intent: "Para conversar sobre estabilidad, transición y floración sin recetas genéricas.",
    claim: "Si cambia a floración, cambia su nutrición.",
    image: "/kits/kit-plantas-con-flor.png",
    alt: "Kit Wondergreen Plantas con Flor con 2BALANCE y 2BLOOM",
  },
  {
    slug: "mi-huerta",
    title: "Mi Huerta",
    composition: "COMPOST 2 kg + CRECE / FLORECE / FRUCTIFICA · 500 g",
    intent: "Una ruta doméstica para preparar el sustrato y seguir el ciclo de la huerta.",
    claim: "Del sustrato al fruto.",
    image: "/kits/kit-mi-huerta.png",
    alt: "Kit Wondergreen Mi Huerta con compost y líneas por etapa",
  },
  {
    slug: "casa-completa",
    title: "Casa Completa",
    composition: "2GROW + 2BALANCE + 2BLOOM + 2FRUIT · 500 g",
    intent: "Cuatro líneas para leer la etapa de cada planta y no aplicar lo mismo a todo.",
    claim: "4 etapas. 1 sistema. Cero adivinanzas.",
    image: "/kits/kit-casa-completa.webp",
    alt: "Kit Wondergreen Casa Completa con cuatro líneas por etapa",
  },
  {
    slug: "casa-completa-xl",
    title: "Casa Completa XL",
    composition: "2GROW + 2BALANCE + 2BLOOM + 2FRUIT · 1 kg",
    intent: "Una propuesta de mayor volumen para colecciones, jardines y necesidades recurrentes.",
    claim: "Muchas plantas. Una sola lógica.",
    image: "/kits/kit-casa-completa-xl.png",
    alt: "Kit Wondergreen Casa Completa XL con las cuatro líneas por etapa",
  },
] as const;

const waysToStart = [
  { title: "Necesito orientación", copy: "Usa el diagnóstico guiado para organizar tipo de planta, etapa, estado y tamaño de maceta.", cta: "Hacer diagnóstico", href: "#diagnostico", secondaryCta: undefined, secondaryHref: undefined },
  { title: "Quiero aprender", copy: "Consulta las guías prácticas de trasplante, etapas, cuidado y huertas urbanas.", cta: "Abrir las guías", href: "/casa-jardin/guias/", secondaryCta: undefined, secondaryHref: undefined },
  { title: "Quiero comprar", copy: "Explora productos por etapa o elige un kit por uso; después podemos revisar disponibilidad, presentación y forma de entrega.", cta: "Ver productos por etapa", href: "/casa-jardin/productos/", secondaryCta: "Ver kits por uso", secondaryHref: "/casa-jardin/kits/" },
] as const;

export default function CasaJardinPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }]} />
      <section className="homegarden-v4-hero"><div className="container homegarden-v4-hero__grid"><div><span className="eyebrow eyebrow--light">Wondergreen Casa & Jardín</span><h1>Una ruta para cada planta, no una receta para todas.</h1><p className="lead">Casa & Jardín convierte el cuidado cotidiano en decisiones más claras: prepara el suelo, reconoce la etapa, revisa la condición y elige la línea que tiene sentido para ese momento.</p><div className="button-row"><Link className="button button--light" href="#diagnostico">Orientar mi planta</Link><Link className="button button--outline-light" href="/downloads/guia-casa-jardin.pdf" download>Descargar guía</Link></div><div className="homegarden-v4-hero__signals" aria-label="Lógica del sistema Wondergreen"><span>Suelo vivo</span><span>Etapas diferenciadas</span><span>Aplicación con criterio</span></div></div><figure><Image src="/products/wondergreen-casa-jardin-hero.png" alt="Sistema Wondergreen Casa y Jardín con plantas, productos y nutrición por etapas" fill priority sizes="(max-width: 850px) 100vw, 42vw" /><figcaption><strong>El sistema completo, leído por etapas.</strong><span>COMPOST prepara la base; cuatro líneas acompañan momentos diferentes del cultivo.</span></figcaption></figure></div></section>

      <section className="homegarden-v4-start"><div className="container"><nav className="homegarden-v4-jump" aria-label="Explorar Casa y Jardín"><span>Explorar esta ruta</span><a href="#espacios">Espacios</a><a href="#guias">Guías</a><a href="#etapas">Etapas</a><a href="#diagnostico">Diagnóstico</a><a href="/casa-jardin/kits/">Kits</a><a href="/casa-jardin/productos/">Productos</a></nav><div className="homegarden-v4-start__grid">{waysToStart.map(({ title, copy, cta, href, secondaryCta, secondaryHref }, index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p><div className="homegarden-v4-start__links"><Link href={href}>{cta} →</Link>{secondaryCta && secondaryHref ? <Link href={secondaryHref}>{secondaryCta} →</Link> : null}</div></article>)}</div></div></section>

      <section className="homegarden-v4-spaces" id="espacios"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Elige tu espacio</span><h2>El contexto cambia la pregunta que conviene hacer primero.</h2></div><p>Una matera, un jardín ornamental y una huerta no reciben la misma recomendación. Aquí puedes reconocer el punto de partida antes de entrar al orientador o revisar el catálogo.</p></div><div className="homegarden-v4-spaces__grid">{spaces.map(({ title, kicker, copy, image, alt, tag, href, cta }) => <article key={title}><figure><Image src={image} alt={alt} fill sizes="(max-width: 760px) 100vw, 31vw" /><figcaption>{tag}</figcaption></figure><div><span>{kicker}</span><h3>{title}</h3><p>{copy}</p><div className="homegarden-v4-spaces__links"><Link href={href}>{cta} <span aria-hidden="true">→</span></Link><Link href="#diagnostico">Orientar mi planta <span aria-hidden="true">↗</span></Link></div></div></article>)}</div></div></section>

      <section className="homegarden-v4-guides" id="guias" aria-labelledby="homegarden-guides-title"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Biblioteca para decidir</span><h2 id="homegarden-guides-title">Elige la guía según la decisión que tienes delante.</h2></div><p>No todas las preguntas son de fertilización. Aquí reunimos el material para observar, preparar, trasplantar, reconocer etapas y acompañar una huerta doméstica.</p></div><div className="homegarden-v4-guides__grid">{guideCards.map(([title, copy, image, pdf]) => <article key={title}><a className="homegarden-v4-guides__cover" href={pdf} download aria-label={`Descargar ${title}`}><Image src={image} alt={`Portada: ${title}`} fill sizes="(max-width: 760px) 100vw, 24vw" /></a><div><h3>{title}</h3><p>{copy}</p><a className="homegarden-v4-guides__link" href={pdf} download>Descargar guía <span aria-hidden="true">→</span></a></div></article>)}</div><div className="homegarden-v4-guides__note"><strong>La regla común</strong><p>Observa, identifica, elige, aplica y revisa. La etapa orienta la familia de producto; la etiqueta vigente o la recomendación técnica define dosis, frecuencia y vía de aplicación.</p></div></div></section>

      <section className="homegarden-v4-stages" id="etapas"><div className="container"><div className="homegarden-v4-stages__intro"><div><span className="eyebrow eyebrow--light">Una base + cuatro etapas</span><h2>La planta no necesita lo mismo durante todo su ciclo.</h2><p>Prepara el suelo y luego lee la etapa. El estado de salud y las condiciones de la maceta indican si es buen momento para aplicar una solución.</p></div><figure className="homegarden-v4-stages__visual"><Image src="/products/wondergreen-system-stages.webp" alt="Ficha visual del sistema Wondergreen por etapas" fill sizes="(max-width: 760px) 100vw, 30vw" /><figcaption>Ficha visual del sistema · referencia de líneas</figcaption></figure></div><ol>{stages.map(([number, title, copy]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}</ol></div></section>

      <section className="homegarden-v4-visual-notes" aria-labelledby="homegarden-visual-notes-title"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Dos comprobaciones antes de elegir</span><h2 id="homegarden-visual-notes-title">La imagen también puede ayudarte a decidir mejor.</h2></div><p>Estos artes educativos convierten dos variables que suelen pasar desapercibidas en preguntas concretas: cuánto sustrato tiene la planta y si realmente está en condiciones de recibir nutrición.</p></div><div className="homegarden-v4-visual-notes__grid">{decisionVisuals.map(([label, title, copy, image, alt]) => <article key={title}><figure><Image src={image} alt={alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></figure><div><span>{label}</span><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="homegarden-v4-safety" aria-labelledby="homegarden-safety-title"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Semáforo de decisión</span><h2 id="homegarden-safety-title">Si se ve mal, no empieces fertilizando.</h2></div><p>La nutrición no corrige por sí sola un problema de agua, drenaje, raíces, luz o sanidad. Primero identifica la causa y el nivel de riesgo.</p></div><div className="homegarden-v4-safety__grid">{safetySignals.map(([label, title, copy, tone]) => <article className={`homegarden-v4-safety__card homegarden-v4-safety__card--${tone}`} key={label}><span>{label}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="homegarden-v4-diagnostic" id="diagnostico"><div className="container"><header><span className="eyebrow">Orientador interactivo</span><h2>Organiza lo que observas antes de elegir una fórmula.</h2><p>Esta herramienta ofrece una orientación inicial. Si hay plagas, pudrición, encharcamiento o deterioro severo, primero corrige la causa o consulta una persona experta.</p></header><CasaJardinInteractive /></div></section>

      <section className="homegarden-v4-care"><div className="container homegarden-v4-care__grid"><div><span className="eyebrow">Una rutina que sí se puede sostener</span><h2>Aplicar es solo una parte del cuidado.</h2></div><ol><li><span>01</span><strong>Observar</strong><p>Luz, humedad, hojas nuevas, raíces visibles, drenaje y presencia de plagas.</p></li><li><span>02</span><strong>Confirmar antes de aplicar</strong><p>Revisa especie, tamaño de maceta, estado de la planta y las instrucciones de la etiqueta vigente.</p></li><li><span>03</span><strong>Registrar y revisar</strong><p>Anota la fecha, toma una fotografía y observa la respuesta antes de repetir.</p></li></ol></div></section>

      <section className="homegarden-v4-kits" id="kits" aria-labelledby="homegarden-kits-title"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Kits Wondergreen Casa & Jardín</span><h2 id="homegarden-kits-title">Empieza por una necesidad real y continúa por etapas.</h2></div><p>Estas composiciones ayudan a elegir una ruta de cuidado: cada kit reúne referencias con una función distinta y no implica aplicar todos sus productos al mismo tiempo. La presentación, disponibilidad, dosis y frecuencia se confirman según la planta, el volumen de sustrato y la etiqueta vigente.</p></div><div className="homegarden-v4-kits__grid">{kitCards.map(({ slug, title, composition, intent, claim, image, alt }, index) => <article className="homegarden-v4-kits__card homegarden-v4-kits__card--visual" key={title}><figure className="homegarden-v4-kits__visual"><Image src={image} alt={alt} fill sizes="(max-width: 760px) 100vw, 20vw" /><figcaption>Composición visual del kit</figcaption></figure><div className="homegarden-v4-kits__body"><span>0{index + 1} · Ruta de cuidado</span><h3>{title}</h3><p>{composition}</p><p className="homegarden-v4-kits__claim">{claim}</p><p className="homegarden-v4-kits__intent">{intent}</p><small>Consulta disponibilidad y orientación para tu espacio.</small><Link className="homegarden-v4-kits__link" href={`/casa-jardin/kits/${slug}/`}>Abrir ficha del kit <span aria-hidden="true">→</span></Link></div></article>)}</div><div className="homegarden-v4-kits__note"><strong>Una ruta también puede empezar con un trasplante</strong><p>Si la planta acaba de llegar, está recuperándose o necesita cambiar de sustrato, primero revisamos raíz, drenaje y humedad. Después definimos si corresponde una solución de inicio y cómo integrarla al cuidado.</p></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Casa, jardín o huerta</span><h2>Cuéntanos qué plantas tienes y te ayudamos a encontrar una ruta sencilla.</h2></div><Link className="button button--dark" href="/contacto/?interes=casa-jardin">Consultar Casa & Jardín</Link></div></section>
    </>
  );
}
