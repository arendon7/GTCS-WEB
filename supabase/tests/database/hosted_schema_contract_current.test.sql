begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select ok(
  to_regprocedure('public.admin_hosted_schema_contract()') is not null,
  'hosted schema contract RPC exists'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    cross join lateral pg_catalog.aclexplode(coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))) acl
    join pg_catalog.pg_roles r on r.oid = acl.grantee
    where n.nspname = 'public'
      and p.proname = 'admin_hosted_schema_contract'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) = ''
      and r.rolname = 'service_role'
      and acl.privilege_type = 'EXECUTE'
  ),
  'service_role can execute hosted schema contract'
);
select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    cross join lateral pg_catalog.aclexplode(coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))) acl
    join pg_catalog.pg_roles r on r.oid = acl.grantee
    where n.nspname = 'public'
      and p.proname = 'admin_hosted_schema_contract'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) = ''
      and r.rolname = 'authenticated'
      and acl.privilege_type = 'EXECUTE'
  ),
  'authenticated cannot execute hosted schema contract'
);
select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    cross join lateral pg_catalog.aclexplode(coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))) acl
    join pg_catalog.pg_roles r on r.oid = acl.grantee
    where n.nspname = 'public'
      and p.proname = 'admin_hosted_schema_contract'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) = ''
      and r.rolname = 'anon'
      and acl.privilege_type = 'EXECUTE'
  ),
  'anon cannot execute hosted schema contract'
);
select is(
  (select schema_contract from public.admin_hosted_schema_contract()),
  '0051'::text,
  'hosted schema contract reports the canonical 0051 migration head'
);
select cmp_ok(
  (select public_table_count from public.admin_hosted_schema_contract()),
  '>',
  0::bigint,
  'hosted schema contract observes public tables'
);
select is(
  (select rls_enabled_table_count from public.admin_hosted_schema_contract()),
  (select public_table_count from public.admin_hosted_schema_contract()),
  'every public table remains protected by RLS'
);
select is(
  (select count(*) from public.admin_hosted_schema_contract()),
  1::bigint,
  'hosted schema contract returns exactly one readiness row'
);

select * from finish();
rollback;
