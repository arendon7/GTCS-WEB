# GREENATICS OPS

Sistema interno de operación, trazabilidad y gestión de GREENATICS.

## Principio central

La aplicación no es un dashboard con formularios anexos. Es el sistema operativo de la planta:

**Planificar → Ejecutar → Registrar → Revisar → Analizar**

El dashboard es una consecuencia automática de la operación.

## MVP

1. Inicio / Hoy
2. Calendario
3. Actividades
4. Recepciones
5. Compostaje básico
6. Equipos y mantenimiento
7. Alertas
8. Dashboard día / semana / mes / histórico
9. Importación de históricos
10. Integración documental con SharePoint

## Reglas de producto

- Registrar cada dato una sola vez.
- Derivar automáticamente duración, mes, horas-hombre, cumplimiento, rendimientos y alertas.
- Una actividad puede tener varios trabajadores.
- Los comentarios no sustituyen entidades estructuradas como fallas, paradas o mantenimientos.
- El operario debe poder registrar la mayoría de acciones en pocos toques.
- Dirección debe poder entender el estado del día en menos de 15 segundos.
- Los históricos nunca se destruyen para simplificar la vista actual.
- SharePoint permanece como fuente documental e histórica; la app será el sistema transaccional operativo.

El desarrollo activo vive en `develop`; `main` se reserva para versiones integradas y aprobadas.
