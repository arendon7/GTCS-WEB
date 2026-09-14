import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const publicDir = path.join(root, "public");
const outputDir = path.join(publicDir, "downloads");
const guideDir = path.join(publicDir, "guides");

const colors = {
  ink: "#073f32",
  green: "#0b7351",
  lime: "#b7d638",
  mint: "#e6f2e7",
  cream: "#f6f3e9",
  sand: "#e9dfcb",
  orange: "#e67b3d",
  violet: "#6d5aa8",
  blue: "#3f7da1",
  coral: "#ce5a4b",
  muted: "#59766c",
};

const assetCache = new Map();
async function asset(relativePath) {
  if (!assetCache.has(relativePath)) {
    const absolute = path.join(publicDir, relativePath);
    const buffer = await fs.readFile(absolute);
    const ext = path.extname(relativePath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/webp";
    assetCache.set(relativePath, `data:${mime};base64,${buffer.toString("base64")}`);
  }
  return assetCache.get(relativePath);
}

const text = (value) => value;
const img = (src, alt, className = "") => `<img class="${className}" src="${src}" alt="${alt}" />`;
const logo = (src) => `<img class="brand-logo" src="${src}" alt="Greenatics y Wondergreen" />`;

const stageData = {
  prepara: { number: "01", name: "PREPARA", label: "Suelo, sustrato y raíz", color: "#1b8061", formula: "COMPOST", image: null },
  crece: { number: "02", name: "CRECE", label: "Brotación y crecimiento vegetativo", color: colors.orange, formula: "2GROW · 15-3-3", image: "products/wondergreen-2grow.webp" },
  equilibra: { number: "03", name: "EQUILIBRA", label: "Mantenimiento de una planta estable", color: colors.violet, formula: "2BALANCE · 7-7-7", image: "products/wondergreen-2balance.webp" },
  florece: { number: "04", name: "FLORECE", label: "Transición reproductiva y floración", color: colors.blue, formula: "2BLOOM · 3-8-3", image: "products/wondergreen-2bloom.webp" },
  fructifica: { number: "05", name: "FRUCTIFICA", label: "Cuajado, desarrollo y llenado", color: colors.coral, formula: "2FRUIT · 3-3-8", image: "products/wondergreen-2fruit.webp" },
};

function baseCss() {
  return `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ddd; color: ${colors.ink}; font-family: Arial, Helvetica, sans-serif; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; padding: 16mm 17mm 15mm; background: ${colors.cream}; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .page.dark { background: ${colors.ink}; color: white; }
    .page.green { background: ${colors.green}; color: white; }
    .page.sand { background: ${colors.sand}; }
    .brand-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(7,63,50,.22); padding-bottom: 7px; }
    .dark .brand-bar, .green .brand-bar { border-color: rgba(255,255,255,.25); }
    .brand-logo { width: 52mm; height: auto; object-fit: contain; object-position: left center; }
    .edition { text-transform: uppercase; font-size: 7.5pt; letter-spacing: 1.25px; font-weight: 700; color: ${colors.muted}; }
    .dark .edition, .green .edition { color: #c7ddd1; }
    h1, h2, h3, p { margin-top: 0; }
    h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; }
    h1 { font-size: 35pt; line-height: .98; letter-spacing: -1px; margin-bottom: 7mm; }
    h2 { font-size: 25pt; line-height: 1.02; letter-spacing: -.6px; margin-bottom: 4mm; }
    h3 { font-size: 15pt; line-height: 1.08; margin-bottom: 2.5mm; }
    p { font-size: 10.5pt; line-height: 1.42; color: ${colors.muted}; }
    .dark p, .green p { color: #d5e5dd; }
    .eyebrow { display: inline-block; margin: 12mm 0 3mm; font-size: 8pt; text-transform: uppercase; letter-spacing: 1.7px; font-weight: 800; color: ${colors.green}; }
    .dark .eyebrow, .green .eyebrow { color: ${colors.lime}; }
    .rule { width: 22mm; height: 1.5mm; background: ${colors.lime}; margin: 4mm 0 6mm; }
    .footer { position: absolute; left: 17mm; right: 17mm; bottom: 7mm; display: flex; justify-content: space-between; gap: 8px; font-size: 7.5pt; color: ${colors.muted}; letter-spacing: .2px; }
    .dark .footer, .green .footer { color: #b8d0c5; }
    .page-no { font-weight: 800; }
    .hero-title { max-width: 168mm; }
    .hero-lead { max-width: 139mm; font-size: 13pt; line-height: 1.35; color: ${colors.ink}; }
    .dark .hero-lead, .green .hero-lead { color: #edf6ef; }
    .stage-rail { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2.5mm; margin-top: 8mm; }
    .stage-pill { min-height: 29mm; padding: 4mm; border-radius: 4mm; color: white; display: flex; flex-direction: column; justify-content: space-between; }
    .stage-pill small { font-size: 7pt; font-weight: 800; letter-spacing: 1px; opacity: .8; }
    .stage-pill strong { font-family: Georgia, serif; font-size: 12.5pt; }
    .cover-visual { height: 92mm; margin-top: 10mm; display: grid; grid-template-columns: 1.07fr .93fr; gap: 5mm; }
    .cover-panel { border-radius: 6mm; overflow: hidden; position: relative; background: ${colors.mint}; }
    .cover-panel img { width: 100%; height: 100%; object-fit: cover; }
    .cover-panel.tall img { object-fit: cover; object-position: 50% 6%; }
    .cover-panel-caption { position: absolute; left: 5mm; right: 5mm; bottom: 5mm; padding: 3mm 3.5mm; background: rgba(7,63,50,.88); color: white; border-radius: 3mm; font-size: 8pt; font-weight: 700; }
    .cover-stamp { position: absolute; right: 13mm; top: 39mm; width: 29mm; height: 29mm; display: grid; place-items: center; border-radius: 50%; background: ${colors.lime}; color: ${colors.ink}; text-align: center; font-family: Georgia, serif; font-size: 10pt; line-height: 1.0; transform: rotate(7deg); }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; align-items: start; }
    .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
    .card { padding: 5mm; border-radius: 4mm; background: white; border: 1px solid #ccdcd1; }
    .card.soft { background: ${colors.mint}; border-color: transparent; }
    .card.dark { background: #0d5946; border-color: rgba(255,255,255,.18); color: white; }
    .card h3 { margin-bottom: 2mm; }
    .card p { font-size: 9.4pt; margin-bottom: 0; }
    .number { display: block; font-family: Georgia, serif; font-size: 26pt; line-height: 1; color: ${colors.green}; margin-bottom: 4mm; }
    .dark .number { color: ${colors.lime}; }
    .checklist { margin: 0; padding: 0; list-style: none; }
    .checklist li { position: relative; padding: 3mm 0 3mm 8mm; border-bottom: 1px solid #cfdfd5; font-size: 10pt; line-height: 1.35; }
    .checklist li::before { content: '✓'; position: absolute; left: 0; top: 2.5mm; width: 5mm; height: 5mm; border-radius: 50%; display: grid; place-items: center; background: ${colors.lime}; color: ${colors.ink}; font-size: 8pt; font-weight: 900; }
    .photo { width: 100%; height: 72mm; object-fit: cover; border-radius: 5mm; display: block; }
    .product-art { width: 100%; height: 88mm; object-fit: cover; object-position: center top; border-radius: 4mm; display: block; background: white; }
    .product-art.tall { height: 116mm; object-fit: contain; }
    .callout { padding: 5mm; border-left: 2mm solid ${colors.lime}; background: white; border-radius: 0 4mm 4mm 0; }
    .callout strong { display: block; font-family: Georgia, serif; font-size: 14pt; margin-bottom: 2mm; }
    .callout p { margin-bottom: 0; }
    .quote { font-family: Georgia, serif; font-size: 19pt; line-height: 1.1; color: ${colors.green}; }
    .dark .quote, .green .quote { color: white; }
    .label { text-transform: uppercase; font-size: 7.5pt; letter-spacing: 1.3px; font-weight: 800; color: ${colors.green}; }
    .dark .label, .green .label { color: ${colors.lime}; }
    .mini-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    .mini-table th { text-align: left; background: ${colors.ink}; color: white; padding: 3mm; font-size: 8pt; text-transform: uppercase; letter-spacing: .6px; }
    .mini-table td { padding: 3mm; border-bottom: 1px solid #c8d8cc; vertical-align: top; line-height: 1.3; }
    .mini-table tr:nth-child(even) td { background: #edf5ee; }
    .guide-cover { display: grid; grid-template-columns: .93fr 1.07fr; gap: 7mm; align-items: center; height: 207mm; }
    .guide-cover .hero-art { height: 166mm; border-radius: 7mm; object-fit: cover; object-position: center top; }
    .form-line { height: 11mm; border-bottom: 1px solid #9eb5a8; margin-bottom: 3mm; }
    .route-box { display: flex; gap: 3mm; align-items: center; padding: 4mm; border-radius: 4mm; background: ${colors.ink}; color: white; }
    .route-box strong { font-family: Georgia, serif; font-size: 14pt; }
    .route-box span { font-size: 8.5pt; color: #d4e8dd; }
    .big-stage { display: grid; grid-template-columns: 1.06fr .94fr; gap: 7mm; align-items: stretch; min-height: 151mm; }
    .big-stage .visual { border-radius: 7mm; overflow: hidden; background: white; }
    .big-stage .visual img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
    .big-stage .visual img.product-art { object-fit: contain; object-position: center center; padding: 4mm; }
    .big-stage .stage-copy { padding: 5mm 0; }
    .stage-number { font-family: Georgia, serif; color: ${colors.green}; font-size: 48pt; line-height: .8; }
    .stage-copy h2 { margin-top: 4mm; }
    .stage-copy .formula { font-weight: 800; color: ${colors.green}; font-size: 9pt; letter-spacing: 1px; }
    .stage-copy ul { margin: 5mm 0 0; padding-left: 5mm; font-size: 10pt; line-height: 1.5; }
    .stage-copy li { margin-bottom: 2.4mm; }
    .small-note { font-size: 8.5pt; line-height: 1.35; color: ${colors.muted}; }
    .dark .small-note, .green .small-note { color: #c7ddd2; }
  `;
}

function shell({ body, title, pageNumber, total, theme = "" }) {
  return `<section class="page ${theme}">${body}<div class="footer"><span>Wondergreen · Greenatics · ${title}</span><span class="page-no">${String(pageNumber).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span></div></section>`;
}

function bar(brand) {
  return `<div class="brand-bar">${logo(brand)}<span class="edition">Guía práctica · edición pública 2026</span></div>`;
}

function stagePills(stages = Object.values(stageData)) {
  return `<div class="stage-rail">${stages.map((stage) => `<div class="stage-pill" style="background:${stage.color}"><small>${stage.number}</small><strong>${stage.name}</strong></div>`).join("")}</div>`;
}

async function buildMaster(assets, brand) {
  const pages = [];
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 1, total: 10, theme: "dark", body: `${bar(brand)}<div class="guide-cover"><div><span class="eyebrow">Wondergreen · Casa & Jardín</span><h1>La planta no pide adivinanzas. Pide lectura.</h1><div class="rule"></div><p class="hero-lead">Una guía visual para pasar de la observación a una decisión responsable: prepara el sustrato, reconoce la etapa, acompaña el proceso y revisa antes de repetir.</p><div class="quote">Una planta bien atendida se entiende antes de intervenir.</div></div>${img(assets.system, "Mapa visual de las etapas Wondergreen", "hero-art")}</div>${stagePills()}<div class="cover-stamp">5<br/>ETAPAS<br/>1 LÓGICA</div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 2, total: 10, body: `${bar(brand)}<span class="eyebrow">01 · La lógica Wondergreen</span><h2>El sistema se lee como una secuencia, no como una mezcla.</h2><p class="hero-lead">La pregunta no es "¿qué producto tengo?" sino "¿qué está pasando con mi planta y en qué etapa se encuentra?".</p><div class="three-col" style="margin-top:10mm"><div class="card"><span class="number">01</span><h3>Observa</h3><p>Lee hojas, brotes, flores, frutos, humedad, drenaje y vigor general antes de tocar el sustrato.</p></div><div class="card"><span class="number">02</span><h3>Identifica</h3><p>Separa una etapa reconocible de una señal de estrés. Una hoja amarilla no es una receta automática.</p></div><div class="card"><span class="number">03</span><h3>Actúa y revisa</h3><p>Elige la línea que corresponde, aplica según etiqueta vigente y observa la respuesta antes de repetir.</p></div></div><div class="callout" style="margin-top:10mm"><strong>La mejor decisión también puede ser esperar.</strong><p>Si hay encharcamiento, pudrición, marchitez severa, plaga visible o un síntoma que no entiendes, el primer paso es revisar agua, raíces y sanidad.</p></div>${stagePills()}` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 3, total: 10, theme: "sand", body: `${bar(brand)}<span class="eyebrow">02 · Antes de nutrir</span><h2>El semáforo evita confundir estrés con hambre.</h2><div class="two-col" style="margin-top:8mm"><div>${img(assets.stress, "Ilustración que diferencia estrés hídrico de una deficiencia", "photo")}<p class="small-note" style="margin-top:3mm">La apariencia puede contar historias distintas. Primero revisa el contexto.</p></div><div><div class="card soft" style="border-left:4px solid #3c9c5c;margin-bottom:4mm"><span class="label">Verde · evaluar</span><h3>La planta está activa</h3><p>Hay drenaje funcional, humedad adecuada, crecimiento visible y una etapa que puedes describir.</p></div><div class="card soft" style="border-left:4px solid #d3a532;margin-bottom:4mm"><span class="label">Amarillo · confirmar</span><h3>Hay una duda abierta</h3><p>Hubo trasplante reciente, el sustrato está muy seco o aparecen síntomas que se parecen entre sí.</p></div><div class="card soft" style="border-left:4px solid #c95a4e"><span class="label">Rojo · detener</span><h3>No empieces fertilizando</h3><p>Hay encharcamiento, raíces comprometidas, marchitez severa o daño sanitario evidente.</p></div></div></div><div class="callout" style="margin-top:8mm"><strong>La nutrición acompaña. No corrige por sí sola un problema de agua, raíz, luz o sanidad.</strong><p>Cuando la causa todavía no está clara, documenta con una foto, registra el riego y busca diagnóstico antes de aumentar insumos.</p></div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 4, total: 10, body: `${bar(brand)}<span class="eyebrow">03 · PREPARA</span><h2>Antes de pensar en crecimiento, construye un lugar donde la raíz pueda trabajar.</h2><div class="two-col" style="margin-top:7mm"><div><div class="card soft"><span class="label">COMPOST · base del sistema</span><h3>Materia orgánica y acondicionamiento</h3><p>PREPARA pone el suelo primero: estructura, materia orgánica, humedad y drenaje son parte de la decisión nutricional.</p><ul class="checklist"><li>Revisa que el contenedor tenga salida de agua.</li><li>Observa si el sustrato se compacta o repele el agua.</li><li>Inspecciona raíces y cuello antes de mover la planta.</li><li>Trasplanta con estabilidad; no fuerces una planta recién estresada.</li></ul></div></div><div>${img(assets.pots, "Guía visual de tamaños de matera", "photo")}<p class="small-note" style="margin-top:3mm">S, M, L y XL ayudan a conversar sobre tamaño. No reemplazan una tabla de dosis validada.</p></div></div><div class="route-box" style="margin-top:8mm"><strong>PREPARA</strong><span>El suelo y el contenedor son parte del sistema, no un detalle previo.</span></div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 5, total: 10, theme: "sand", body: `${bar(brand)}<span class="eyebrow">04 · CRECE + EQUILIBRA</span><h2>Dos momentos para la planta vegetativa.</h2><p>La diferencia no está solo en la fórmula. Está en leer si la planta está construyendo tejido nuevo o sosteniendo un estado estable.</p><div class="two-col" style="margin-top:7mm"><div class="card"><span class="label" style="color:${colors.orange}">02 · CRECE · 2GROW 15-3-3</span>${img(assets.grow, "Arte técnico Wondergreen 2Grow", "product-art")}<h3 style="margin-top:3mm">Brotación y crecimiento vegetativo</h3><p>Acompaña una planta activa que está emitiendo hojas, tallos o brotes. No es un botón de recuperación universal.</p></div><div class="card"><span class="label" style="color:${colors.violet}">03 · EQUILIBRA · 2BALANCE 7-7-7</span>${img(assets.balance, "Arte técnico Wondergreen 2Balance", "product-art")}<h3 style="margin-top:3mm">Mantenimiento con balance</h3><p>Cuando la planta está estable, la prioridad puede ser sostenerla sin empujarla innecesariamente.</p></div></div><div class="callout" style="margin-top:7mm"><strong>Pregunta clave</strong><p>¿Veo crecimiento activo o estoy intentando compensar un problema que todavía no he diagnosticado?</p></div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 6, total: 10, body: `${bar(brand)}<span class="eyebrow">05 · FLORECE + FRUCTIFICA</span><h2>Cuando cambia el propósito de la planta, cambia la conversación.</h2><div class="two-col" style="margin-top:7mm"><div class="card"><span class="label" style="color:${colors.blue}">04 · FLORECE · 2BLOOM 3-8-3</span>${img(assets.bloom, "Arte técnico Wondergreen 2Bloom", "product-art")}<h3 style="margin-top:3mm">Transición y floración</h3><p>Acompaña una transición reproductiva reconocible. La floración también depende de especie, luz, edad, clima, agua y sanidad.</p></div><div class="card"><span class="label" style="color:${colors.coral}">05 · FRUCTIFICA · 2FRUIT 3-3-8</span>${img(assets.fruit, "Arte técnico Wondergreen 2Fruit", "product-art")}<h3 style="margin-top:3mm">Cuajado, desarrollo y llenado</h3><p>Se orienta a la etapa productiva dentro de un manejo completo. No sustituye polinización, sanidad ni manejo de carga.</p></div></div><div class="route-box" style="margin-top:7mm"><strong>La etapa manda</strong><span>Una línea puede estar bien orientada y aun así requerir que revises primero ambiente, agua o raíces.</span></div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 7, total: 10, theme: "green", body: `${bar(brand)}<span class="eyebrow">06 · Aplicar sin improvisar</span><h2>El cuidado es una secuencia de control.</h2><div class="three-col" style="margin-top:10mm"><div class="card dark"><span class="number">01</span><h3>HUMEDECE</h3><p>Trabaja con humedad adecuada y drenaje funcional. Evita intervenir una planta encharcada o severamente estresada.</p></div><div class="card dark"><span class="number">02</span><h3>DOSIFICA</h3><p>Usa la dosis de la etiqueta vigente y la recomendación técnica aplicable. Nunca reemplaces una medida validada por una aproximación a ojo.</p></div><div class="card dark"><span class="number">03</span><h3>DISTRIBUYE</h3><p>Coloca el producto alrededor de la zona radicular. Evita acumularlo contra el tallo y respeta el método indicado.</p></div></div><div class="card dark" style="margin-top:8mm"><span class="number">04</span><h3>REVISA</h3><p>Registra fecha, etapa, estado del sustrato, producto utilizado y respuesta observada. El siguiente paso se decide con esa evidencia.</p></div><div class="quote" style="margin-top:13mm">Más producto no es más cuidado. Más lectura sí.</div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 8, total: 10, body: `${bar(brand)}<span class="eyebrow">07 · La ficha de tu planta</span><h2>Convierte la observación en una conversación útil.</h2><p>Antes de consultar o volver a aplicar, registra lo que puedas. Un buen dato vale más que una suposición rápida.</p><div class="two-col" style="margin-top:7mm"><div class="card"><span class="label">Ficha rápida</span><p style="margin-top:5mm">Planta / especie</p><div class="form-line"></div><p>Fecha de observación</p><div class="form-line"></div><p>Etapa que identifico</p><div class="form-line"></div><p>Último riego / trasplante</p><div class="form-line"></div></div><div class="card soft"><span class="label">Lo que veo</span><p style="margin-top:5mm">Hojas nuevas, flores o frutos</p><div class="form-line"></div><p>Humedad y drenaje</p><div class="form-line"></div><p>Señales de plaga o raíz</p><div class="form-line"></div><p>Qué quiero confirmar</p><div class="form-line"></div></div></div><div class="callout" style="margin-top:8mm"><strong>Foto útil = contexto útil.</strong><p>Incluye la planta completa, una hoja con síntomas, la superficie del sustrato y el contenedor. Evita diagnosticar por una sola hoja aislada.</p></div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 9, total: 10, theme: "sand", body: `${bar(brand)}<span class="eyebrow">08 · Kits como rutas</span><h2>Un kit reúne posibilidades. La planta decide la entrada.</h2><div class="two-col" style="margin-top:7mm"><div>${img(assets.kit, "Arte del Kit Casa Completa Wondergreen", "photo")}<p class="small-note" style="margin-top:3mm">Las composiciones domésticas se presentan como propuestas de pre-lanzamiento; no son una autorización para aplicar todo a la vez.</p></div><div><table class="mini-table"><thead><tr><th>Ruta</th><th>Cuándo tiene sentido</th></tr></thead><tbody><tr><td><strong>Plantas Verdes</strong></td><td>Follaje activo o planta estable.</td></tr><tr><td><strong>Plantas con Flor</strong></td><td>Transición reconocible, después de revisar luz y sanidad.</td></tr><tr><td><strong>Mi Huerta</strong></td><td>Secuencia de sustrato, crecimiento, flor y fruto.</td></tr><tr><td><strong>Casa Completa</strong></td><td>Colecciones con plantas en momentos distintos.</td></tr></tbody></table><div class="callout" style="margin-top:8mm"><strong>Disponibilidad doméstica en validación.</strong><p>Presentaciones, dosificador, dosis, empaque, etiqueta, PVP, stock y checkout se habilitan únicamente después de cerrar la validación correspondiente.</p></div></div></div>` }));
  pages.push(shell({ title: "Casa & Jardín", pageNumber: 10, total: 10, theme: "dark", body: `${bar(brand)}<div style="padding-top:21mm;max-width:155mm"><span class="eyebrow">09 · Cierre</span><h1>Cuida mejor cuando puedes explicar por qué.</h1><div class="rule"></div><p class="hero-lead">Wondergreen Casa & Jardín organiza la decisión alrededor de una idea simple: observar primero, intervenir con intención y revisar la respuesta.</p><div class="two-col" style="margin-top:11mm"><div class="card dark"><span class="label">Siguiente paso</span><h3>Si ya reconoces la etapa</h3><p>Consulta la ficha del producto y la etiqueta vigente antes de aplicar.</p></div><div class="card dark"><span class="label">Siguiente paso</span><h3>Si todavía hay una duda</h3><p>Usa el orientador, registra el contexto y evita convertir el síntoma en una receta.</p></div></div><div class="route-box" style="margin-top:11mm;background:${colors.lime};color:${colors.ink}"><strong>greenatics.co/casa-jardin</strong><span style="color:${colors.ink}">Productos, kits, guías y diagnóstico en un mismo lugar.</span></div><p class="small-note" style="margin-top:18mm">Documento público reconstruido para navegación y consulta. La etiqueta vigente y la recomendación técnica aplicable prevalecen sobre cualquier resumen editorial.</p></div>` }));
  return pages.join("\n");
}

async function buildStages(assets, brand) {
  const pages = [];
  pages.push(shell({ title: "Guía rápida de etapas", pageNumber: 1, total: 7, theme: "dark", body: `${bar(brand)}<div class="guide-cover"><div><span class="eyebrow">Referencia rápida · Wondergreen</span><h1>Primero reconoce el momento. Después elige la línea.</h1><div class="rule"></div><p class="hero-lead">Una lámina de consulta para ubicar cada planta dentro del sistema Casa & Jardín sin convertir una etapa en una receta automática.</p><div class="quote">La etapa es una hipótesis que se confirma observando.</div></div>${img(assets.system, "Infografía del sistema de etapas Wondergreen", "hero-art")}</div>${stagePills()}` }));
  pages.push(shell({ title: "Guía rápida de etapas", pageNumber: 2, total: 7, body: `${bar(brand)}<span class="eyebrow">Cómo leer esta guía</span><h2>Una ruta de cinco preguntas.</h2><div class="three-col" style="margin-top:9mm"><div class="card"><span class="number">01</span><h3>¿El sustrato está bien?</h3><p>Si no hay drenaje, humedad razonable o estabilidad, vuelve a PREPARA.</p></div><div class="card"><span class="number">02</span><h3>¿Hay crecimiento activo?</h3><p>Brotes y tejido nuevo pueden orientar a CRECE, siempre que la planta esté sana.</p></div><div class="card"><span class="number">03</span><h3>¿Está estable?</h3><p>Si mantiene vigor sin una transición clara, EQUILIBRA puede ser el lenguaje adecuado.</p></div></div><div class="two-col" style="margin-top:6mm"><div class="card soft"><span class="number">04</span><h3>¿Aparecen flores?</h3><p>La transición reproductiva se observa junto con luz, edad, especie y sanidad. Ahí aparece FLORECE.</p></div><div class="card soft"><span class="number">05</span><h3>¿Hay fruto en desarrollo?</h3><p>Cuajado, desarrollo y llenado orientan a FRUCTIFICA dentro de un manejo integral.</p></div></div><div class="callout" style="margin-top:9mm"><strong>Si la respuesta no es clara, no fuerces la etapa.</strong><p>La guía ayuda a ordenar la observación; no sustituye la etiqueta ni el diagnóstico.</p></div>` }));
  for (const key of ["prepara", "crece", "equilibra", "florece", "fructifica"]) {
    const stage = stageData[key];
    const stageAsset = { prepara: assets.pots, crece: assets.grow, equilibra: assets.balance, florece: assets.bloom, fructifica: assets.fruit }[key];
    const visual = stage.image ? img(stageAsset, `Arte técnico Wondergreen ${stage.formula}`, "product-art tall") : img(assets.pots, "Ilustración de tamaños de matera para preparar el sustrato", "product-art");
    const bullets = {
      prepara: ["Contenedor con drenaje", "Sustrato que recibe y libera agua", "Raíces y cuello sin daño evidente", "Estabilidad antes de nutrir"],
      crece: ["Brotes o hojas nuevas", "Planta activa, no severamente estresada", "Revisar agua y luz antes de intervenir", "Acompañar, no empujar a ciegas"],
      equilibra: ["Vigor sostenido", "Sin transición reproductiva evidente", "Mantenimiento proporcional", "Evitar aplicaciones por rutina"],
      florece: ["Transición reproductiva observable", "Luz y ambiente compatibles", "Sanidad y riego bajo control", "No prometer floración automática"],
      fructifica: ["Cuajado o fruto en desarrollo", "Polinización y sanidad consideradas", "Manejo de carga y agua", "No prometer rendimiento o calibre"],
    }[key];
    pages.push(shell({ title: "Guía rápida de etapas", pageNumber: pages.length + 1, total: 7, theme: key === "prepara" ? "sand" : "", body: `${bar(brand)}<div class="big-stage"><div class="visual">${visual}</div><div class="stage-copy"><span class="stage-number">${stage.number}</span><span class="eyebrow" style="margin-top:8mm">${stage.label}</span><h2>${stage.name}</h2><p class="formula">${stage.formula}</p><ul>${bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul><div class="callout" style="margin-top:9mm"><strong>Pregunta para confirmar</strong><p>${key === "prepara" ? "¿El problema está en la raíz o en el sustrato antes que en la nutrición?" : key === "crece" ? "¿Veo crecimiento activo o una respuesta de estrés?" : key === "equilibra" ? "¿La planta está estable o simplemente no sé qué le pasa?" : key === "florece" ? "¿La planta está en transición o solo tiene una flor aislada?" : "¿Hay una etapa productiva real y un manejo que la sostenga?"}</p></div></div></div>` }));
  }
  return pages.join("\n");
}

async function buildTransplant(assets, brand) {
  const pages = [];
  pages.push(shell({ title: "Guía de trasplante", pageNumber: 1, total: 7, theme: "dark", body: `${bar(brand)}<div class="guide-cover"><div><span class="eyebrow">Guía práctica · estabilidad primero</span><h1>Trasplantar no es solo cambiar de matera.</h1><div class="rule"></div><p class="hero-lead">Es darle a la raíz un nuevo espacio, agua que pueda circular y tiempo para volver a establecerse.</p><div class="quote">Primero raíz, drenaje y estabilidad. Después, etapa y nutrición.</div></div>${img(assets.pots, "Guía visual de tamaños de matera", "hero-art")}</div><div class="route-box" style="margin-top:8mm"><strong>ANTES · DURANTE · DESPUÉS</strong><span>Una secuencia corta para reducir errores frecuentes.</span></div>` }));
  pages.push(shell({ title: "Guía de trasplante", pageNumber: 2, total: 7, body: `${bar(brand)}<span class="eyebrow">01 · Antes de mover</span><h2>Un trasplante comienza con una decisión, no con una pala.</h2><div class="two-col" style="margin-top:9mm"><div class="card soft"><span class="label">Sí conviene revisar</span><ul class="checklist"><li>Raíces compactadas, expuestas o saliendo del contenedor.</li><li>Drenaje insuficiente o sustrato que permanece saturado.</li><li>Contenedor pequeño para el tamaño actual de la planta.</li><li>Momento de clima y luz que permita observar la adaptación.</li></ul></div><div class="card"><span class="label">Conviene esperar si</span><ul class="checklist"><li>La planta está marchita de forma severa.</li><li>Hay pudrición, plaga o daño sanitario sin atender.</li><li>El sustrato está completamente seco o encharcado.</li><li>No puedes asegurar un contenedor estable y con salida de agua.</li></ul></div></div><div class="callout" style="margin-top:10mm"><strong>El tamaño siguiente no debe ser un salto desproporcionado.</strong><p>Una matera más grande no compensa un sustrato sin estructura ni mejora automáticamente el establecimiento.</p></div>` }));
  pages.push(shell({ title: "Guía de trasplante", pageNumber: 3, total: 7, theme: "sand", body: `${bar(brand)}<span class="eyebrow">02 · Contenedor y sustrato</span><h2>El agua necesita entrar, circular y salir.</h2><div class="two-col" style="margin-top:7mm"><div>${img(assets.pots, "Tamaños S, M, L y XL para conversar sobre contenedores", "photo")}<p class="small-note" style="margin-top:3mm">La clasificación de tamaño orienta la conversación; no define por sí sola una dosis.</p></div><div><div class="card"><span class="label">Chequeo de drenaje</span><h3 style="margin-top:3mm">Tres señales útiles</h3><ul class="checklist"><li>Hay orificios funcionales y no están obstruidos.</li><li>El sustrato no forma una masa compacta impermeable.</li><li>El agua no queda acumulada en el plato.</li></ul></div><div class="card soft" style="margin-top:5mm"><span class="label">Evita</span><p style="margin-top:3mm">Tapar la salida, compactar con fuerza o dejar la raíz permanentemente saturada.</p></div></div></div>` }));
  pages.push(shell({ title: "Guía de trasplante", pageNumber: 4, total: 7, body: `${bar(brand)}<span class="eyebrow">03 · Durante el trasplante</span><h2>Menos manipulación. Más cuidado con la estructura.</h2><div class="three-col" style="margin-top:10mm"><div class="card"><span class="number">01</span><h3>Prepara</h3><p>Ten listo el contenedor, el sustrato y el espacio antes de exponer las raíces.</p></div><div class="card"><span class="number">02</span><h3>Conserva</h3><p>Evita romper innecesariamente el pan de raíces o retirar sustrato sano sin motivo.</p></div><div class="card"><span class="number">03</span><h3>Estabiliza</h3><p>Deja la planta firme, con el cuello a una altura adecuada y sin enterrar el tallo.</p></div></div><div class="card soft" style="margin-top:8mm"><span class="label">Secuencia de trabajo</span><table class="mini-table" style="margin-top:4mm"><tbody><tr><td><strong>1. Ubica</strong></td><td>Elige luz y temperatura compatibles con la recuperación.</td></tr><tr><td><strong>2. Acomoda</strong></td><td>Distribuye el sustrato sin bolsas de aire grandes ni compactación excesiva.</td></tr><tr><td><strong>3. Riega con criterio</strong></td><td>Humedece de manera uniforme y confirma que el excedente pueda salir.</td></tr></tbody></table></div>` }));
  pages.push(shell({ title: "Guía de trasplante", pageNumber: 5, total: 7, theme: "green", body: `${bar(brand)}<span class="eyebrow">04 · Después</span><h2>La recuperación también necesita observación.</h2><div class="two-col" style="margin-top:9mm"><div class="card dark"><span class="number">24-72 h</span><h3>Observa el contexto</h3><p>Revisa turgencia, humedad, drenaje, exposición y estabilidad. No conviertas un cambio normal de adaptación en una receta.</p></div><div class="card dark"><span class="number">1 registro</span><h3>Documenta la respuesta</h3><p>Fecha, contenedor, sustrato, riego y fotos comparables. La memoria de la planta mejora la siguiente decisión.</p></div></div><div class="quote" style="margin-top:16mm">Una planta recién trasplantada no necesita que la persigas. Necesita condiciones estables.</div><div class="callout" style="margin-top:13mm"><strong>¿Y la nutrición?</strong><p>Primero confirma establecimiento. Luego identifica la etapa. Las dosis y frecuencias deben venir de etiqueta y recomendación técnica aplicable.</p></div>` }));
  pages.push(shell({ title: "Guía de trasplante", pageNumber: 6, total: 7, body: `${bar(brand)}<span class="eyebrow">05 · Lo que no debes normalizar</span><h2>Cuando el problema es otro, fertilizar puede distraer.</h2><div class="two-col" style="margin-top:7mm"><div>${img(assets.stress, "Ilustración de planta con estrés y exceso de agua", "photo")}</div><div><div class="card" style="border-left:4px solid #c95a4e"><span class="label">Detén la aplicación y revisa</span><ul class="checklist"><li>Encharcamiento persistente.</li><li>Olor, raíces blandas o pudrición.</li><li>Marchitez que avanza rápidamente.</li><li>Plagas o lesiones visibles.</li></ul></div><div class="card soft" style="margin-top:5mm"><h3>No todo amarillamiento es deficiencia.</h3><p>Agua, raíces, luz, temperatura, plagas y enfermedades pueden producir señales parecidas. El contexto es parte del diagnóstico.</p></div></div></div>` }));
  pages.push(shell({ title: "Guía de trasplante", pageNumber: 7, total: 7, theme: "dark", body: `${bar(brand)}<span class="eyebrow">06 · Lista de salida</span><h1>Trasplante terminado. Observación activada.</h1><div class="rule"></div><div class="card dark" style="margin-top:9mm"><ul class="checklist"><li>El contenedor tiene drenaje funcional.</li><li>La planta quedó firme y el cuello no está enterrado.</li><li>El sustrato quedó húmedo, no saturado.</li><li>La ubicación permite observar luz y respuesta.</li><li>La siguiente intervención tendrá una razón escrita.</li></ul></div><div class="route-box" style="margin-top:11mm;background:${colors.lime};color:${colors.ink}"><strong>greenatics.co/casa-jardin</strong><span style="color:${colors.ink}">Más guías, productos por etapa y orientador.</span></div><p class="small-note" style="margin-top:18mm">El kit Trasplanta & Arranca permanece fuera del catálogo hasta cerrar su componente radicular/bioinsumo. La guía educativa sí está disponible.</p>` }));
  return pages.join("\n");
}

async function buildHuerta(assets, brand) {
  const pages = [];
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 1, total: 8, theme: "dark", body: `${bar(brand)}<div class="guide-cover"><div><span class="eyebrow">Wondergreen · huerta doméstica</span><h1>Una huerta no se resuelve en un solo día.</h1><div class="rule"></div><p class="hero-lead">Se construye leyendo el sustrato, acompañando el crecimiento y respetando el momento en que aparecen flores y frutos.</p><div class="quote">Del sustrato al fruto, una etapa a la vez.</div></div>${img(assets.system, "Sistema visual de etapas para Mi Huerta", "hero-art")}</div><div class="stage-rail"><div class="stage-pill" style="background:${colors.ink}"><small>01</small><strong>PREPARA</strong></div><div class="stage-pill" style="background:${colors.orange}"><small>02</small><strong>CRECE</strong></div><div class="stage-pill" style="background:${colors.blue}"><small>03</small><strong>FLORECE</strong></div><div class="stage-pill" style="background:${colors.coral}"><small>04</small><strong>FRUCTIFICA</strong></div></div>` }));
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 2, total: 8, body: `${bar(brand)}<span class="eyebrow">01 · La ruta de la huerta</span><h2>El orden importa porque cada etapa tiene una pregunta distinta.</h2><table class="mini-table" style="margin-top:9mm"><thead><tr><th>Etapa</th><th>Qué observas</th><th>Qué decides</th></tr></thead><tbody><tr><td><strong>PREPARA</strong></td><td>Sustrato, contenedor, drenaje y raíces.</td><td>Crear condiciones estables.</td></tr><tr><td><strong>CRECE</strong></td><td>Brotes, hojas y tejido nuevo.</td><td>Acompañar vigor vegetativo.</td></tr><tr><td><strong>FLORECE</strong></td><td>Transición, botones y flores.</td><td>Revisar ambiente y acompañar el cambio.</td></tr><tr><td><strong>FRUCTIFICA</strong></td><td>Cuajado, fruto y llenado.</td><td>Sostener manejo productivo integral.</td></tr></tbody></table><div class="callout" style="margin-top:10mm"><strong>La misma huerta puede tener plantas en etapas diferentes.</strong><p>Por eso un kit reúne líneas, pero la aplicación se decide planta por planta.</p></div>` }));
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 3, total: 8, theme: "sand", body: `${bar(brand)}<span class="eyebrow">02 · PREPARA</span><h2>El primer cultivo es un sustrato que respira.</h2><div class="two-col" style="margin-top:8mm"><div>${img(assets.pots, "Tamaños de matera para planear una huerta", "photo")}</div><div><div class="card"><span class="label">Antes de sembrar o trasplantar</span><ul class="checklist"><li>Elige un contenedor proporcional y con drenaje.</li><li>Usa un sustrato que pueda mojarse sin quedar saturado.</li><li>Deja espacio para riego y crecimiento radicular.</li><li>Registra qué especie y qué fecha estás iniciando.</li></ul></div><p class="small-note" style="margin-top:5mm">COMPOST pertenece a la base del sistema; no reemplaza automáticamente la estrategia nutricional de cada cultivo.</p></div></div>` }));
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 4, total: 8, body: `${bar(brand)}<span class="eyebrow">03 · CRECE</span><h2>El crecimiento se acompaña con ritmo, no con exceso.</h2><div class="two-col" style="margin-top:8mm"><div class="card"><span class="label" style="color:${colors.orange}">CRECE · 2GROW 15-3-3</span>${img(assets.grow, "Arte técnico Wondergreen 2Grow", "product-art tall")}</div><div><p class="quote">Brotes nuevos son una señal. No son una autorización para aplicar a ciegas.</p><ul class="checklist" style="margin-top:6mm"><li>Confirma luz y agua antes de atribuir el crecimiento a nutrición.</li><li>Observa color, tamaño y consistencia de las hojas.</li><li>Compara fotos de la misma planta, no de plantas distintas.</li><li>Aplica solo con etiqueta y recomendación vigentes.</li></ul></div></div>` }));
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 5, total: 8, theme: "sand", body: `${bar(brand)}<span class="eyebrow">04 · FLORECE</span><h2>La floración empieza con una transición que puedes describir.</h2><div class="two-col" style="margin-top:8mm"><div><div class="card soft"><span class="label" style="color:${colors.blue}">FLORECE · 2BLOOM 3-8-3</span><h3 style="margin-top:3mm">Acompaña el cambio de propósito</h3><p>La planta deja de concentrarse solo en tejido vegetativo y entra en una fase reproductiva. Lee también especie, fotoperiodo, temperatura, agua y sanidad.</p></div><div class="callout" style="margin-top:6mm"><strong>No es una promesa automática.</strong><p>La nutrición puede acompañar una etapa; no puede sustituir las condiciones que la hacen posible.</p></div></div>${img(assets.bloom, "Arte técnico Wondergreen 2Bloom", "product-art tall")}</div>` }));
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 6, total: 8, body: `${bar(brand)}<span class="eyebrow">05 · FRUCTIFICA</span><h2>El fruto reúne todo lo que ocurrió antes.</h2><div class="two-col" style="margin-top:8mm"><div>${img(assets.fruit, "Arte técnico Wondergreen 2Fruit", "product-art tall")}</div><div><div class="card"><span class="label" style="color:${colors.coral}">FRUCTIFICA · 2FRUIT 3-3-8</span><h3 style="margin-top:3mm">Cuajado, desarrollo y llenado</h3><p>En esta etapa importan polinización, carga, agua, luz, sanidad y manejo del cultivo. La línea se lee dentro de ese conjunto.</p><ul class="checklist"><li>Observa si hay fruto cuajado, no solo flor.</li><li>Revisa uniformidad de riego y estado de raíces.</li><li>Registra cambios antes de repetir una aplicación.</li></ul></div></div></div>` }));
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 7, total: 8, theme: "green", body: `${bar(brand)}<span class="eyebrow">06 · Bitácora de huerta</span><h2>Lo que registras hoy mejora la cosecha de decisiones de mañana.</h2><div class="two-col" style="margin-top:9mm"><div class="card dark"><span class="label">Registro semanal</span><p style="margin-top:5mm">Fecha / cultivo</p><div class="form-line"></div><p>Etapa observada</p><div class="form-line"></div><p>Riego y drenaje</p><div class="form-line"></div><p>Qué cambió</p><div class="form-line"></div></div><div class="card dark"><span class="label">Preguntas para revisar</span><ul class="checklist" style="margin-top:5mm"><li>¿Hay hojas, flores o frutos nuevos?</li><li>¿El sustrato se seca de manera razonable?</li><li>¿Hay señales de plaga o raíz?</li><li>¿La intervención anterior tuvo una respuesta observable?</li></ul></div></div><div class="quote" style="margin-top:15mm">La bitácora transforma intuiciones en aprendizaje.</div>` }));
  pages.push(shell({ title: "Guía Mi Huerta", pageNumber: 8, total: 8, theme: "dark", body: `${bar(brand)}<span class="eyebrow">07 · Cierre</span><h1>Una huerta por etapas. Una decisión mejor informada.</h1><div class="rule"></div><p class="hero-lead">Usa esta guía para ordenar observaciones, no para reemplazar etiqueta, análisis o recomendación técnica. Una buena huerta se construye con continuidad y ajustes razonados.</p><div class="route-box" style="margin-top:12mm;background:${colors.lime};color:${colors.ink}"><strong>greenatics.co/casa-jardin</strong><span style="color:${colors.ink}">Productos, kits, guías y orientador.</span></div><p class="small-note" style="margin-top:18mm">Las presentaciones domésticas de los kits permanecen en validación comercial, técnica y regulatoria antes de habilitar compra o dosis universales.</p>` }));
  return pages.join("\n");
}

async function createPdf(browser, filename, title, body) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${baseCss()}</style></head><body>${body}</body></html>`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts?.ready);
  await page.pdf({ path: path.join(outputDir, filename), format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.close();
}

const main = async () => {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(guideDir, { recursive: true });
  const assets = {
    brand: await asset("brand/greenatics-horizontal.webp"),
    system: await asset("products/wondergreen-system-stages.webp"),
    grow: await asset("products/wondergreen-2grow.webp"),
    balance: await asset("products/wondergreen-2balance.webp"),
    bloom: await asset("products/wondergreen-2bloom.webp"),
    fruit: await asset("products/wondergreen-2fruit.webp"),
    pots: await asset("guides/home-garden-pot-sizes.webp"),
    stress: await asset("guides/home-garden-not-all-stress.webp"),
    kit: await asset("kits/kit-casa-completa.webp"),
  };
  const browser = await chromium.launch({ headless: true });
  try {
    await createPdf(browser, "guia-casa-jardin.pdf", "Guía Wondergreen Casa & Jardín", await buildMaster(assets, assets.brand));
    await createPdf(browser, "guia-rapida-etapas.pdf", "Guía rápida de etapas Wondergreen", await buildStages(assets, assets.brand));
    await createPdf(browser, "guia-trasplante.pdf", "Guía de trasplante Wondergreen", await buildTransplant(assets, assets.brand));
    await createPdf(browser, "guia-mi-huerta.pdf", "Guía Mi Huerta Wondergreen", await buildHuerta(assets, assets.brand));
  } finally {
    await browser.close();
  }
  console.log("Generated 4 Casa & Jardín PDFs");
};

main().catch((error) => { console.error(error); process.exitCode = 1; });
