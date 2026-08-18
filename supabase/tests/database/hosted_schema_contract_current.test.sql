begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select ok(
  to_regprocedure('public.admin_hosted_schema_contract()') is not null,
  'hosted schema contract RPC exists'
);
select ok(
  has_function_privilege('service_role','public.admin_hosted_schema_contract()','EXECUTE'),
  'service_role can execute hosted schema contract'
);
select ok(
  not has_function_privilege('authenticated','public.admin_hosted_schema_contract()','EXECUTE'),
  'authenticated cannot execute hosted schema contract'
);
select ok(
  not has_function_privilege('anon','public.admin_hosted_schema_contract()','EXECUTE'),
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
