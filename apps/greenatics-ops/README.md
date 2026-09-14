# GREENATICS OPS

Sistema interno de operación, trazabilidad y gestión de GREENATICS.

## Principio central

La aplicación no es un dashboard con formularios anexos. Es el sistema operativo de la planta:

**Planificar → Ejecutar → Registrar → Revisar → Analizar**

El dashboard es una consecuencia automática de la operación.

## Estado funcional

El flujo actual ya incluye operación diaria, calendario/actividades, recepciones y lotes, mantenimiento, compostaje, producción, inventario, ventas, compras/gastos, solicitudes, caja/liquidaciones, analítica e importación histórica.

`MVP-014` añadió recepción física, lotes y kardex de insumos comprados sin confundir cantidad física con compra o pago.

`CORE-003` está migrando el núcleo operativo desde persistencia aislada por navegador a Supabase multiusuario con sesión, RLS y acceso por planta.

## Modos de datos

### `local`
Modo predeterminado para desarrollo, QA y demos. Los cambios quedan en `localStorage` del navegador.

### `supabase`
Modo transaccional remoto. No existe fallback silencioso a local: si falla sesión, autorización o persistencia, la app muestra el error.

## Probar en Mac — modo local

Requiere Node.js 24.

```bash
git clone https://github.com/arendon7/GTCS-WEB.git
cd GTCS-WEB
git switch develop
npm install
npm run dev
```

Abrir `http://localhost:3000`.

Para validar antes de usar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## Activar Supabase

Copiar el archivo de entorno:

```bash
cp .env.example .env.local
```

Configurar únicamente:

```env
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Después:

1. ejecutar las migraciones `supabase/migrations` en orden;
2. crear el usuario en Supabase Auth;
3. crear su fila activa en `profiles`;
4. asignar al menos una `plant_memberships` activa;
5. iniciar la app y entrar por `/login`.

Nunca colocar `service_role` ni secretos privilegiados en variables `NEXT_PUBLIC_*`.

## Reglas de producto

- Registrar cada dato una sola vez.
- Derivar automáticamente duración, mes, horas-hombre, cumplimiento, rendimientos y alertas.
- Una actividad puede tener varios trabajadores.
- Los comentarios no sustituyen entidades estructuradas como fallas, paradas o mantenimientos.
- El operario debe poder registrar la mayoría de acciones en pocos toques.
- Dirección debe poder entender el estado del día rápidamente.
- Los históricos nunca se destruyen para simplificar la vista actual.
- SharePoint permanece como fuente documental e histórica; la app es el sistema transaccional operativo.

El desarrollo activo vive en `develop`; `main` se reserva para versiones integradas y aprobadas.
