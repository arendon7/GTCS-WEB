# ADR-0005 · Runtime stack

**Estado:** ACEPTADO

- Next.js 16 · App Router
- React 19
- TypeScript strict
- Tailwind CSS 4
- Supabase/PostgreSQL para datos transaccionales y Auth/RLS
- SharePoint para DMS e históricos/documentos
- Node 24 LTS para desarrollo/CI

Server Components por defecto; Client Components solo cuando la interacción lo requiera. El dominio vive separado de componentes visuales. RLS debe existir antes de conectar datos productivos.
