-- Calcula tu Huella shares the Supabase project, never the OPS public data boundary.
create schema if not exists huella;

revoke all on schema huella from public;
revoke all on schema huella from anon, authenticated;
grant usage on schema huella to service_role;

alter default privileges in schema huella revoke all on tables from public;
alter default privileges in schema huella revoke all on tables from anon, authenticated;
alter default privileges in schema huella revoke all on sequences from public;
alter default privileges in schema huella revoke all on sequences from anon, authenticated;

comment on schema huella is 'Private persistence boundary for Calcula tu Huella. Never expose through the Supabase Data API.';
