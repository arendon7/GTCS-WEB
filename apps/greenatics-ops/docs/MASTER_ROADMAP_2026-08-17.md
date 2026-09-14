# GREENATICS WEB PLATFORM · MASTER ROADMAP

Fecha de corte: 2026-08-17
Repositorio canónico: `arendon7/GTCS-WEB`
Rama de integración: `develop`
Rama de producción: `main`

## 1. Objetivo de esta etapa

Pasar de una plataforma con muchos módulos ya construidos a una plataforma operable, pilotable y publicable con un release train claro.

La prioridad inmediata no es abrir más dominios. Es consolidar:

1. gobernanza de ramas y releases;
2. estabilidad de GREENATICS OPS;
3. piloto real Támesis + Yarumal;
4. cierre de Web Pública V1;
5. publicación controlada a producción.

## 2. Arquitectura vigente

Una sola plataforma técnica con dos superficies separadas:

- Web pública: `/` y rutas públicas aprobadas.
- GREENATICS OPS: `/app` y rutas operacionales autenticadas.

Regla: compartir repositorio e infraestructura no implica compartir UX, navegación, permisos ni acceso a datos internos.

## 3. Estado maestro por frente

| Frente | Estado | Nivel | Próximo cierre |
|---|---|---:|---|
| Arquitectura dual Public + OPS | VALIDADO | 100% | mantener contrato |
| Supabase + RLS + Auth | AVANZADO | 85% | smoke real por roles |
| Usuarios / administración | AVANZADO | 80% | piloto usuarios reales |
| Maestros operacionales | AVANZADO | 85% | validar datos de planta |
| Planeación / calendario | AVANZADO | 80% | plan vs real real |
| Actividades V2 | AVANZADO | 85% | prueba operario end-to-end |
| Recepción V2 | AVANZADO | 80% | prueba diaria de planta |
| Compostaje V2 | AVANZADO | 80% | trazabilidad lote real |
| Mantenimiento V2 | AVANZADO | 80% | incidencia → cierre real |
| Producción | FUNCIONAL | 70% | integración con inventario |
| Inventario producto | FUNCIONAL | 70% | conciliación de movimientos |
| Insumos | FUNCIONAL | 70% | mínimos + consumos |
| Ventas / comercial | FUNCIONAL | 65% | flujo real y métricas |
| Gastos / finanzas / caja | FUNCIONAL | 65% | conciliación y permisos |
| Compras | FUNCIONAL | 65% | aprobación y recepción |
| Dashboard Dirección | AVANZADO | 75% | datos reales y alertas |
| Documentos / SharePoint | PARCIAL | 55% | lectura gobernada + fuentes |
| Importación histórica | AVANZADO | 70% | reconciliación auditada |
| Web pública corporativa | AVANZADO | 85% | QA editorial y visual |
| Wondergreen | AVANZADO | 85% | assets canónicos + conversión |
| Biblioteca / conocimiento | AVANZADO | 85% | recursos finales descargables |
| SEO / metadata / sitemap | AVANZADO | 90% | auditoría pre-release |
| Pipeline de producción | REQUIERE CONSOLIDACIÓN | 60% | reconciliar `main` / `develop` |

Los porcentajes son indicadores de madurez operativa, no cobertura de líneas de código.

## 4. Secuencia ejecutable

### FASE R0 · Consolidación de release

Objetivo: recuperar un camino seguro `feature -> develop -> release -> main`.

Bloqueantes:

- `main` y `develop` están divergidos.
- `main` conserva dispatchers de infraestructura del piloto que no deben fusionarse junto con la web legacy.
- `develop` contiene la arquitectura y producto actuales.

Acciones:

- [x] identificar divergencia;
- [x] clasificar la mayor parte de `main` legacy como no fusionable en bloque;
- [x] identificar `hosted-pilot-production-refresh.yml` como infraestructura recuperable;
- [ ] recuperar únicamente infraestructura vigente y compatible;
- [ ] crear release candidate desde `develop`;
- [ ] ejecutar quality + E2E crítico + backend preflight + RLS smoke;
- [ ] promover release candidate a `main` sin reintroducir web legacy;
- [ ] establecer desde ese punto `main` como descendiente de la línea canónica.

Exit criteria:

- `main` deja de contener una historia paralela funcionalmente relevante.
- Todo release nuevo proviene de `develop`.
- No se requieren merges ciegos entre historias antiguas.

### FASE R1 · Pilot Readiness OPS

Objetivo: demostrar un ciclo operacional completo con datos reales.

Orden obligatorio:

1. autenticación y rol;
2. planta y maestros;
3. programación;
4. actividad de Hoy;
5. recepción;
6. actividad técnica;
7. compost / mantenimiento según caso;
8. producción e inventario;
9. dashboard;
10. reconstrucción histórica del día.

Pruebas mínimas por rol:

#### Director

- acceso a TAM + YAR;
- calendario y programación;
- maestros autorizados;
- dashboards;
- administración según RBAC.

#### Responsable de planta

- acceso únicamente a planta autorizada;
- registro diario;
- ejecución de actividades;
- recepción;
- incidencias;
- consulta de inventario y mantenimiento pertinente.

#### Administrador

- usuarios;
- catálogos autorizados;
- auditoría y soporte de operación.

Exit criteria:

- un día operacional puede registrarse de principio a fin sin Excel paralelo;
- plan vs real se reconstruye desde datos canónicos;
- ninguna vista depende de mock data en modo piloto;
- RLS impide lectura/escritura fuera de permisos.

### FASE R2 · Núcleo operacional V1

Objetivo: estabilizar los seis dominios que alimentan la operación diaria.

#### 2.1 Planeación + actividades

- plantillas canónicas;
- asignación trabajador/equipo;
- reprogramación trazable;
- ejecución no programada gobernada;
- motivo de desviación;
- horas-hombre derivables.

#### 2.2 Recepción

- fuente;
- ruta;
- material;
- cantidades y rechazo;
- evidencia/incidencia;
- trazabilidad a planta y fecha.

#### 2.3 Compostaje

- lote;
- estado;
- controles;
- movimientos;
- entradas/salidas;
- vínculo con actividades.

#### 2.4 Mantenimiento

- equipo;
- falla/incidencia;
- prioridad;
- intervención;
- tiempo fuera de servicio;
- cierre verificable.

#### 2.5 Producción + inventario

- producción por referencia;
- movimientos de inventario;
- despacho;
- conciliación de stock;
- trazabilidad de origen.

#### 2.6 Dashboard

- recibido;
- rechazo;
- procesado;
- producción;
- cumplimiento de plan;
- horas-hombre;
- mantenimiento abierto;
- inventario crítico;
- alertas de calidad del dato.

Exit criteria:

- datos de los dominios se relacionan y concilian;
- dashboards no requieren reconstrucción manual;
- pruebas E2E cubren happy path y permisos críticos.

### FASE R3 · Backoffice y control

Después de estabilizar R2:

- ventas;
- compras;
- gastos;
- caja;
- finanzas;
- insumos;
- documentos;
- flujos de aprobación.

Regla: no aumentar complejidad financiera antes de asegurar que los movimientos operativos base son confiables.

### FASE R4 · Web Pública V1 definitiva

Objetivo: convertir la web actual en la superficie pública oficial de GREENATICS.

Checklist:

- Home;
- Soluciones;
- Proyectos;
- Impacto;
- Nosotros;
- Contacto;
- Wondergreen;
- productos;
- cultivos;
- Biblioteca;
- guías y manuales;
- CTA y rutas de conversión;
- assets canónicos;
- Product Truth / Brand Lock;
- responsive;
- accesibilidad;
- SEO técnico;
- performance;
- evidencia y fuentes.

Principio: no publicar claims, cifras o impacto que no tengan fuente, fecha, estado y aprobación.

### FASE R5 · Datos históricos e integraciones

- importación Excel gobernada;
- reconciliación de históricos;
- SharePoint read-only donde sea necesario;
- migración de fuente de verdad a OPS;
- documentos con procedencia;
- contrato de publicación interna → pública.

Exit criteria:

SharePoint y Excel dejan de ser fuentes paralelas de la operación nueva.

### FASE R6 · Evolución V2

Solo después del piloto estable:

- alertas automáticas;
- notificaciones;
- aprobaciones avanzadas;
- calidad de dato;
- KPIs predictivos;
- publicación gobernada de indicadores;
- PWA / experiencia móvil;
- automatización de reportes;
- capacidades asistidas por IA donde exista dato confiable.

## 5. Dependencias críticas

```text
R0 Release governance
  -> R1 Pilot readiness
      -> R2 Operational core
          -> R3 Backoffice

R0
  -> R4 Public Web release

R2
  -> R5 Historical + integrations
      -> R6 Automation / intelligence
```

Web pública puede continuar editorialmente en paralelo con R1-R2, pero su promoción a producción depende de R0.

## 6. Política de ramas desde este punto

- `feature/*`, `fix/*`, `chore/*`: cambios aislados.
- PR obligatorio hacia `develop`.
- `develop`: única rama de integración.
- `release/*`: congelación de candidato cuando se prepara producción.
- `main`: producción; no desarrollo directo.

No volver a mantener dos implementaciones completas de la web en `main` y `develop`.

## 7. Quality gates

Antes de integrar a `develop`:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Para cambios funcionales críticos:

```bash
npm run test:e2e
```

Para piloto hosted:

```bash
npm run pilot:backend-preflight -- --plants TAM,YAR
npm run pilot:rls-smoke
```

Y preflight del deployment cuando aplique.

## 8. Orden de ejecución inmediato

### Sprint de consolidación actual

1. preservar `develop@bad111b` como baseline verde;
2. recuperar workflow seguro de producción compatible;
3. documentar reconciliación `main`/`develop`;
4. revisar PRs abiertos obsoletos;
5. crear release candidate canónico;
6. probar auth + RLS + usuarios reales;
7. ejecutar flujo Director;
8. ejecutar flujo Támesis;
9. ejecutar flujo Yarumal;
10. corregir hallazgos del piloto antes de abrir nuevas Waves.

## 9. Regla para futuras decisiones

Cuando aparezca una nueva idea se clasifica primero como:

- BLOQUEANTE DEL PILOTO;
- MEJORA V1;
- BACKOFFICE;
- WEB PÚBLICA;
- INTEGRACIÓN;
- V2.

Solo los bloqueantes del piloto interrumpen R0-R2.

## 10. Definición de éxito V1

GREENATICS V1 está lista cuando:

- la web pública explica y convierte correctamente;
- OPS permite ejecutar y reconstruir la operación real;
- Támesis y Yarumal operan con roles separados;
- Supabase es la fuente canónica de operación nueva;
- plan vs real es confiable;
- dashboards salen del dato registrado;
- los releases son repetibles y auditables;
- `main` representa producción y no una implementación paralela antigua.
