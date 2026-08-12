begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

select has_table('public','plant_memberships','plant memberships schema exists');
select has_table('public','activities','activities schema exists');
select has_table('public','operational_expenses','operational expenses schema exists');
select has_table('public','supply_movements','physical supply ledger exists');
select ok((select relrowsecurity from pg_class where oid='public.plants'::regclass),'plants RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.operational_expenses'::regclass),'expenses RLS is enabled');

insert into auth.users(id,email,created_at,updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','director-ci@greenatics.test',now(),now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','operator-ci@greenatics.test',now(),now());

insert into public.plants(id,code,name,active)
values
  ('11111111-1111-4111-8111-111111111111','CI-TAM','CI Támesis',true),
  ('22222222-2222-4222-8222-222222222222','CI-YAR','CI Yarumal',true);

insert into public.profiles(id,display_name)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Director CI'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Operador CI');

insert into public.plant_memberships(user_id,plant_id,role)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','director'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','operator');

insert into public.employees(id,plant_id,display_name)
values
  ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Trabajador CI'),
  ('44444444-4444-4444-8444-444444444444','22222222-2222-4222-8222-222222222222','Trabajador otra planta');

set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select results_eq(
  $$select code from public.plants where code like 'CI-%' order by code$$,
  $$values ('CI-TAM'::text)$$,
  'RLS only exposes the authenticated user plant'
);

select lives_ok(
  $$select public.ops_create_unplanned_activity(
    '11111111-1111-4111-8111-111111111111'::uuid,
    'Actividad CI','Operación',
    array['33333333-3333-4333-8333-333333333333'::uuid],
    null
  )$$,
  'authorized user can create an activity in their plant'
);

select is(
  (select count(*) from public.activities where title='Actividad CI'),
  1::bigint,
  'authorized activity is persisted once'
);

select throws_ok(
  $$select public.ops_create_unplanned_activity(
    '11111111-1111-4111-8111-111111111111'::uuid,
    'Actividad CI duplicada','Operación',
    array['33333333-3333-4333-8333-333333333333'::uuid],
    null
  )$$,
  'P0001',
  'Uno o más trabajadores ya están en otra actividad en curso.',
  'a worker cannot be active in two concurrent activities'
);

select throws_ok(
  $$select public.ops_create_unplanned_activity(
    '22222222-2222-4222-8222-222222222222'::uuid,
    'Actividad ajena','Operación',
    array['44444444-4444-4444-8444-444444444444'::uuid],
    null
  )$$,
  'P0001',
  'No tienes permiso para registrar actividades en esta planta.',
  'a user cannot create activities in an unauthorized plant'
);

select lives_ok(
  $$select * from public.ops_record_operational_expense(
    '11111111-1111-4111-8111-111111111111'::uuid,
    'purchase','Proveedor CI','input','Compra melaza CI',185000,'2026-08-11'::date,
    'CI-FV-1',null,null,null,null
  )$$,
  'a financial purchase can be recorded without physical stock'
);

select is(
  (select count(*) from public.supply_movements),
  0::bigint,
  'recording or paying a purchase does not create physical stock'
);

select lives_ok(
  $$select * from public.record_supply_receipt(
    '11111111-1111-4111-8111-111111111111'::uuid,
    'Melaza CI','input','kg',60,'2026-08-11'::date,'Proveedor CI',
    (select id from public.operational_expenses where concept='Compra melaza CI' limit 1),
    'CI-REM-1',null,null
  )$$,
  'measured physical receipt can link to a real purchase'
);

select is(
  (select coalesce(sum(case when kind='receipt' then quantity else -quantity end),0) from public.supply_movements),
  60::numeric,
  'physical stock is created by the measured receipt'
);

select lives_ok(
  $$select public.consume_supply(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (select supply_id from public.supply_receipts where document_ref='CI-REM-1' limit 1),
    (select lot_code from public.supply_receipts where document_ref='CI-REM-1' limit 1),
    30,'2026-08-11'::date,'Formulación CI',null,null,null
  )$$,
  'physical consumption can reduce an exact lot'
);

select is(
  (select coalesce(sum(case when kind in ('receipt','adjustment_in') then quantity else -quantity end),0) from public.supply_movements),
  30::numeric,
  'exact lot stock reflects receipt minus consumption'
);

select throws_ok(
  $$select public.consume_supply(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (select supply_id from public.supply_receipts where document_ref='CI-REM-1' limit 1),
    (select lot_code from public.supply_receipts where document_ref='CI-REM-1' limit 1),
    31,'2026-08-11'::date,'Sobreconsumo CI',null,null,null
  )$$,
  'P0001',
  'Stock insuficiente en el lote',
  'physical ledger blocks negative stock'
);

select * from finish();
rollback;
