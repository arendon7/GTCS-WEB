import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacidad.module.css";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales",
  description: "Información sobre los datos que se usan al navegar y contactar a Greenatics.",
  alternates: { canonical: "/legal/privacidad/" },
};

const sections = [
  ["responsable", "Responsable y contacto"],
  ["datos", "Qué datos se usan y para qué"],
  ["navegador", "Datos guardados en tu navegador"],
  ["terceros", "WhatsApp, correo y servicios externos"],
  ["derechos", "Tus derechos y cómo ejercerlos"],
] as const;

export default function PrivacidadPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <h1>Tu información, explicada con claridad.</h1>
          <p className={styles.intro}>
            Esta política describe qué ocurre cuando navegas por el sitio, preparas una solicitud o pruebas una demostración local.
          </p>
          <p className={styles.status}>
            Versión candidata del 5 de noviembre de 2026. Su vigencia queda pendiente de revisión jurídica y confirmación de los datos legales del responsable.
          </p>
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <nav className={styles.contents} aria-label="Contenido de la política">
          <p>En esta página</p>
          <ul>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
        </nav>

        <article className={styles.article}>
          <section id="responsable" aria-labelledby="responsable-title">
            <h2 id="responsable-title">Responsable y contacto</h2>
            <p><strong>GREENATICS S.A.S.</strong> es el responsable indicado para las solicitudes relacionadas con este sitio.</p>
            <p>Para consultas sobre datos personales o para ejercer tus derechos, escribe a <a href="mailto:contacto@greenatics.com.co">contacto@greenatics.com.co</a> o llama al <a href="tel:+573003078822">+57 300 307 8822</a>. El NIT y el domicilio legal deben confirmarse antes de aprobar la versión definitiva de esta política.</p>
          </section>

          <section id="datos" aria-labelledby="datos-title">
            <h2 id="datos-title">Qué datos se usan y para qué</h2>
            <p>Si preparas una solicitud de contacto, puedes incluir nombre, entidad, correo, teléfono, ubicación, escala del proyecto y el detalle de tu consulta. Estos datos sirven para entender el contexto, responderte y continuar la conversación comercial o técnica que solicites.</p>
            <p>Antes de preparar el mensaje, el formulario solicita tu autorización para tratar esos datos con el fin de responder y dar seguimiento a la solicitud; la manifestación se incorpora al texto que puedes revisar. El sitio no conserva una constancia separada de la casilla, no envía los campos a un servidor propio ni crea automáticamente un caso. Si abres WhatsApp, el sitio pasa la dirección y el texto prellenado a ese servicio; si preparas un correo, abre un borrador en la aplicación configurada. Greenatics recibe los datos y la manifestación si decides enviar el mensaje.</p>
            <p>Incluye solo la información necesaria para tu consulta. No envíes contraseñas, datos bancarios, información de salud ni documentos de identidad por estos formularios.</p>
          </section>

          <section id="navegador" aria-labelledby="navegador-title">
            <h2 id="navegador-title">Datos guardados en tu navegador</h2>
            <p>Algunas herramientas usan el almacenamiento del navegador para conservar una demostración o permitirte continuar un borrador. Estos datos permanecen en tu dispositivo y no llegan a Greenatics por el solo hecho de guardarse.</p>
            <ul className={styles.dataList}>
              <li><strong>Borrador de contacto:</strong> los campos se guardan en la sesión de esa pestaña para recuperarlos durante la navegación. Puedes eliminarlos con “Borrar borrador local” en el formulario o cerrar la sesión del navegador.</li>
              <li><strong>Selección del cotizador Wondergreen:</strong> la lista de productos y kits se conserva en la sesión de esa pestaña para que puedas retomarla si vuelves desde Contacto. No incluye nombre ni datos de contacto. Puedes vaciarla desde el resumen del cotizador o borrar los datos del sitio; no se envía a Greenatics por el solo hecho de guardarse.</li>
              <li><strong>Traspaso desde herramientas:</strong> el resumen puede recuperarse en Contacto durante 30 minutos. Después deja de aceptarse. Si no continúas a Contacto, puede permanecer en el almacenamiento de sesión hasta que termine la sesión de la pestaña o borres los datos del sitio; al abrir Contacto, se retira cuando el sitio intenta consumirlo.</li>
              <li><strong>Planificador agrícola:</strong> guarda el cultivo elegido y las etapas asignadas por mes en el almacenamiento local hasta que borres el plan o los datos del sitio desde tu navegador. No registra tu nombre ni contacto.</li>
              <li><strong>Directorio de usuarios de muestra:</strong> conserva en este navegador las entradas de demostración hasta que restablezcas la muestra o borres los datos del sitio. Usa únicamente nombres y correos ficticios; no introduzcas datos de personas reales.</li>
            </ul>
            <p>En el código de la aplicación revisado para esta versión no encontramos cookies de publicidad o analítica. La configuración del alojamiento, la red de distribución y otros servicios de infraestructura aún debe revisarse para confirmar si instalan cookies técnicas.</p>
          </section>

          <section id="terceros" aria-labelledby="terceros-title">
            <h2 id="terceros-title">WhatsApp, correo y servicios externos</h2>
            <p>WhatsApp y tu proveedor de correo procesan la información que les entregas conforme a sus propios términos y políticas. También puedes elegir abrir enlaces a servicios externos, como el agendamiento o la tienda de Croper; al hacerlo, aplican las prácticas del proveedor correspondiente.</p>
            <p>La página de GREENATICS Red puede consultar la disponibilidad de un entorno externo si ese entorno se configura para la versión que estás visitando. Esa consulta técnica no incluye los campos del formulario, pero el servicio externo puede recibir datos de conexión como la dirección IP y la información básica del navegador.</p>
          </section>

          <section id="derechos" aria-labelledby="derechos-title">
            <h2 id="derechos-title">Tus derechos y cómo ejercerlos</h2>
            <p>Puedes solicitar acceso a tus datos, conocer su uso, actualizarlos o corregirlos, pedir prueba de la autorización, solicitar su supresión o revocar la autorización cuando proceda, y presentar una queja ante la Superintendencia de Industria y Comercio después de agotar la consulta o reclamo ante el responsable.</p>
            <p>Envía tu solicitud a <a href="mailto:contacto@greenatics.com.co">contacto@greenatics.com.co</a>. Indica el derecho que quieres ejercer y los datos mínimos que permitan entender y tramitar la solicitud. GREENATICS responderá dentro de los plazos legales aplicables: las consultas se atienden en un máximo de 10 días hábiles, prorrogables hasta por 5 más, y los reclamos en 15 días hábiles, prorrogables hasta por 8 más, con aviso de la razón y el nuevo plazo.</p>
            <p>La supresión o revocatoria puede estar limitada cuando exista un deber legal o contractual de conservar la información. La evaluación se hará según el caso y la norma aplicable.</p>
          </section>

          <aside className={styles.contact} aria-label="Canal de privacidad">
            <div><h2>¿Necesitas hacer una solicitud?</h2><p>Escribe al canal general e indica “Protección de datos personales” en el asunto.</p></div>
            <a href="mailto:contacto@greenatics.com.co?subject=Protecci%C3%B3n%20de%20datos%20personales">Contactar a Greenatics <span aria-hidden="true">↗</span></a>
          </aside>

          <footer className={styles.footer}>
            <p>Marco de referencia: Ley 1581 de 2012 y normas reglamentarias aplicables. El texto definitivo requiere confirmación del responsable, sus canales y los procedimientos internos.</p>
            <Link href="/">Volver al inicio <span aria-hidden="true">→</span></Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
