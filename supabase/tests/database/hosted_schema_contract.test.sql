begin;

create extension if not exists pgtap with schema extensions;
select plan(8);

select ok(
  to_regprocedure('public.admin_hosted_schema_contract()') is not null,
  'hosted schema contract RPC exists'
);
select ok(
  not has_function_privilege('anon','public.admin_hosted_schema_contract()','EXECUTE'),
  'anon cannot execute hosted schema contract'
);
select ok(
  not has_function_privilege('authenticated','public.admin_hosted_schema_contract()','EXECUTE'),
  'authenticated cannot execute hosted schema contract'
);
select ok(
  has_function_privilege('service_role','public.admin_hosted_schema_contract()','EXECUTE'),
  'service_role can execute hosted schema contract'
);
select is(
  (select schema_contract from public.admin_hosted_schema_contract()),
  '0026',
  'hosted schema contract reports its canonical version'
);
select ok(
  (select public_table_count > 0 and public_table_count = rls_enabled_table_count from public.admin_hosted_schema_contract()),
  'every public table in the hosted contract has RLS enabled'
);
select is(
  (select array_to_string(pilot_plant_codes, ',') from public.admin_hosted_schema_contract()),
  'TAM,YAR',
  'hosted schema contract exposes the canonical pilot plants'
);
select is(
  (select active_directors from public.admin_hosted_schema_contract()),
  0::bigint,
  'fresh database starts without an active director'
);

select finish();
rollback;
