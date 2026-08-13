-- CORE-004I · Hosted schema contract.
-- Gives the server-side pilot preflight one canonical, versioned read-only contract
-- without depending on Supabase migration-history timestamps or duplicate legacy rows.

create or replace function public.admin_hosted_schema_contract()
returns table(
  schema_contract text,
  public_table_count bigint,
  rls_enabled_table_count bigint,
  pilot_plant_codes text[],
  active_directors bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    '0026'::text as schema_contract,
    (
      select count(*)
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
    ) as public_table_count,
    (
      select count(*)
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relrowsecurity
    ) as rls_enabled_table_count,
    coalesce(
      (
        select array_agg(p.code order by p.code)
        from public.plants p
        where p.active
          and p.code in ('TAM', 'YAR')
      ),
      '{}'::text[]
    ) as pilot_plant_codes,
    (
      select count(distinct pm.user_id)
      from public.plant_memberships pm
      where pm.role = 'director'
        and pm.active
    ) as active_directors;
$$;

revoke all on function public.admin_hosted_schema_contract() from public;
revoke all on function public.admin_hosted_schema_contract() from anon;
revoke all on function public.admin_hosted_schema_contract() from authenticated;
grant execute on function public.admin_hosted_schema_contract() to service_role;
