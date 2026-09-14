begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

select ok(not has_function_privilege('anon','private.purchase_request_submitted_event()','EXECUTE'),'anon cannot execute purchase request trigger function directly');
select ok(not has_function_privilege('authenticated','private.purchase_request_submitted_event()','EXECUTE'),'authenticated cannot execute purchase request trigger function directly');
select ok(not has_function_privilege('service_role','private.purchase_request_submitted_event()','EXECUTE'),'service_role cannot execute purchase request trigger function directly');
select ok(not has_function_privilege('anon','private.supply_receipt_to_movement()','EXECUTE'),'anon cannot execute supply receipt trigger function directly');
select ok(not has_function_privilege('authenticated','private.supply_receipt_to_movement()','EXECUTE'),'authenticated cannot execute supply receipt trigger function directly');
select ok(not has_function_privilege('service_role','private.supply_receipt_to_movement()','EXECUTE'),'service_role cannot execute supply receipt trigger function directly');

select is(
  (select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='purchase_requests' and t.tgname='purchase_request_submitted_event_trigger' and not t.tgisinternal and t.tgenabled='O'),
  1::bigint,
  'purchase request submitted trigger remains enabled'
);
select is(
  (select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='supply_receipts' and t.tgname='supply_receipt_to_movement_trigger' and not t.tgisinternal and t.tgenabled='O'),
  1::bigint,
  'supply receipt movement trigger remains enabled'
);

insert into auth.users(id,email,created_at,updated_at)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','trigger-acl-ci@greenatics.test',now(),now());

insert into public.profiles(id,display_name)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','Trigger ACL CI');

insert into public.plant_memberships(user_id,plant_id,role)
select 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid,id,'operator'
from public.plants
where code='TAM';

set local role authenticated;
set local request.jwt.claim.sub = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

select lives_ok(
  $$select public.ops_submit_purchase_request(
      (select id from public.plants where code='TAM'),
      'Operador Trigger CI',
      null,
      'input',
      'Solicitud trigger CI',
      'Validar trigger endurecido',
      150000,
      null,
      null,
      null,
      null
    )$$,
  'governed purchase request still fires submitted trigger after trigger EXECUTE revoke'
);

select is(
  (select count(*) from public.purchase_request_events e join public.purchase_requests r on r.id=e.request_id where r.concept='Solicitud trigger CI' and e.event_kind='submitted'),
  1::bigint,
  'purchase request trigger still creates its submitted event through the governed RPC'
);

select lives_ok(
  $$select * from public.record_supply_receipt(
      (select id from public.plants where code='TAM'),
      'Insumo Trigger CI','input','kg',25,'2026-08-12'::date,
      'Proveedor Trigger CI',null,'TRIGGER-ACL-REM',null,'Validar trigger endurecido'
    )$$,
  'authenticated supply receipt still fires inventory movement trigger after EXECUTE revoke'
);

select is(
  (select count(*) from public.supply_movements m join public.supply_receipts r on r.id=m.reference_id where r.document_ref='TRIGGER-ACL-REM' and m.kind='receipt' and m.quantity=25),
  1::bigint,
  'supply receipt trigger still creates the physical receipt movement'
);

select finish();
rollback;
