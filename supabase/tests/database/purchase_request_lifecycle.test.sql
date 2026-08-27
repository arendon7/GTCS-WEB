begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

select ok(
  to_regprocedure('public.decide_purchase_request(uuid,text,text,text)') is not null,
  'purchase-request decision RPC exists'
);
select ok(
  to_regprocedure('public.fulfill_purchase_request(uuid,text,text,numeric,date,text,text)') is not null,
  'purchase-request fulfillment RPC exists'
);
select ok(
  has_function_privilege('authenticated','public.decide_purchase_request(uuid,text,text,text)','EXECUTE'),
  'authenticated can execute the governed decision RPC'
);
select ok(
  has_function_privilege('authenticated','public.fulfill_purchase_request(uuid,text,text,numeric,date,text,text)','EXECUTE'),
  'authenticated can execute the governed fulfillment RPC'
);

insert into auth.users(id,email,created_at,updated_at) values
 ('b1000000-0000-4000-8000-000000000001','purchase-lifecycle-operator-a@greenatics.test',now(),now()),
 ('b1000000-0000-4000-8000-000000000002','purchase-lifecycle-supervisor-a@greenatics.test',now(),now()),
 ('b1000000-0000-4000-8000-000000000003','purchase-lifecycle-supervisor-b@greenatics.test',now(),now());

insert into public.plants(id,code,name,active) values
 ('b2000000-0000-4000-8000-000000000001','PLC-A','Purchase Lifecycle A',true),
 ('b2000000-0000-4000-8000-000000000002','PLC-B','Purchase Lifecycle B',true);

insert into public.profiles(id,display_name) values
 ('b1000000-0000-4000-8000-000000000001','Purchase Lifecycle Operator A'),
 ('b1000000-0000-4000-8000-000000000002','Purchase Lifecycle Supervisor A'),
 ('b1000000-0000-4000-8000-000000000003','Purchase Lifecycle Supervisor B');

insert into public.plant_memberships(user_id,plant_id,role) values
 ('b1000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001','operator'),
 ('b1000000-0000-4000-8000-000000000002','b2000000-0000-4000-8000-000000000001','supervisor'),
 ('b1000000-0000-4000-8000-000000000003','b2000000-0000-4000-8000-000000000002','supervisor');

insert into public.purchase_requests(
  id,plant_id,requested_by_name,category,concept,justification,estimated_amount_cop,status,created_by
) values (
  'b4000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'Operador lifecycle',
  'maintenance',
  'Rodamiento lifecycle QA',
  'Necesidad operacional controlada',
  200000,
  'submitted',
  'b1000000-0000-4000-8000-000000000001'
);

insert into public.purchase_request_events(
  request_id,event_kind,actor_name,actor_user_id,note
) values (
  'b4000000-0000-4000-8000-000000000001',
  'submitted',
  'Operador lifecycle',
  'b1000000-0000-4000-8000-000000000001',
  'Fixture de lifecycle'
);

set local role authenticated;
set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000001';

select throws_ok(
  $$select public.decide_purchase_request('b4000000-0000-4000-8000-000000000001','approved','Operador A',null)$$,
  'Sin permiso para decidir esta solicitud',
  'operator cannot approve its own plant purchase request'
);
select throws_ok(
  $$select public.fulfill_purchase_request('b4000000-0000-4000-8000-000000000001','Operador A','Proveedor QA',185000,'2026-08-27','FV-PLC-001',null)$$,
  'Sin permiso para cerrar esta solicitud',
  'operator cannot fulfill its own plant purchase request'
);

set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000003';

select throws_ok(
  $$select public.decide_purchase_request('b4000000-0000-4000-8000-000000000001','approved','Supervisor B',null)$$,
  'Sin permiso para decidir esta solicitud',
  'supervisor cannot decide a request from another plant'
);
select throws_ok(
  $$select public.fulfill_purchase_request('b4000000-0000-4000-8000-000000000001','Supervisor B','Proveedor QA',185000,'2026-08-27','FV-PLC-001',null)$$,
  'Sin permiso para cerrar esta solicitud',
  'supervisor cannot fulfill a request from another plant'
);

set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000002';

select lives_ok(
  $$select public.decide_purchase_request('b4000000-0000-4000-8000-000000000001','approved','Supervisor A','Compra autorizada')$$,
  'authorized supervisor can approve its plant purchase request'
);
select is(
  (select status from public.purchase_requests where id='b4000000-0000-4000-8000-000000000001'),
  'approved',
  'approved request persists approved status'
);
select is(
  (select count(*) from public.purchase_request_events where request_id='b4000000-0000-4000-8000-000000000001' and event_kind='approved'),
  1::bigint,
  'approval creates exactly one approved event'
);
select is(
  (select actor_user_id from public.purchase_request_events where request_id='b4000000-0000-4000-8000-000000000001' and event_kind='approved'),
  'b1000000-0000-4000-8000-000000000002'::uuid,
  'approval preserves authenticated supervisor provenance'
);

select lives_ok(
  $$select public.fulfill_purchase_request('b4000000-0000-4000-8000-000000000001','Supervisor A','Ferretería Lifecycle S.A.S.',185000,'2026-08-27','FV-PLC-001','Monto real verificado')$$,
  'authorized supervisor can fulfill an approved request'
);
select is(
  (select status from public.purchase_requests where id='b4000000-0000-4000-8000-000000000001'),
  'fulfilled',
  'fulfilled request persists fulfilled status'
);
select ok(
  (select expense_id is not null from public.purchase_requests where id='b4000000-0000-4000-8000-000000000001'),
  'fulfilled request links the real expense id'
);
select is(
  (select count(*) from public.operational_expenses where purchase_request_id='b4000000-0000-4000-8000-000000000001'),
  1::bigint,
  'fulfillment creates exactly one operational expense'
);
select is(
  (select amount_cop from public.operational_expenses where purchase_request_id='b4000000-0000-4000-8000-000000000001'),
  185000::numeric,
  'operational expense stores the explicit actual amount'
);
select is(
  (select estimated_amount_cop from public.purchase_requests where id='b4000000-0000-4000-8000-000000000001'),
  200000::numeric,
  'fulfillment does not overwrite or substitute the original estimate'
);
select is(
  (select document_ref from public.operational_expenses where purchase_request_id='b4000000-0000-4000-8000-000000000001'),
  'FV-PLC-001',
  'real expense preserves the fulfillment support reference'
);
select is(
  (select count(*) from public.purchase_request_events where request_id='b4000000-0000-4000-8000-000000000001' and event_kind='fulfilled'),
  1::bigint,
  'fulfillment creates exactly one fulfilled event'
);
select is(
  (select actual_amount_cop from public.purchase_request_events where request_id='b4000000-0000-4000-8000-000000000001' and event_kind='fulfilled'),
  185000::numeric,
  'fulfilled event records the exact actual amount'
);
select is(
  (select actor_user_id from public.purchase_request_events where request_id='b4000000-0000-4000-8000-000000000001' and event_kind='fulfilled'),
  'b1000000-0000-4000-8000-000000000002'::uuid,
  'fulfilled event preserves authenticated supervisor provenance'
);
select is(
  (select expense_id from public.purchase_request_events where request_id='b4000000-0000-4000-8000-000000000001' and event_kind='fulfilled'),
  (select expense_id from public.purchase_requests where id='b4000000-0000-4000-8000-000000000001'),
  'request and fulfilled event point to the same expense'
);

select throws_ok(
  $$select public.fulfill_purchase_request('b4000000-0000-4000-8000-000000000001','Supervisor A','Ferretería Lifecycle S.A.S.',190000,'2026-08-27','FV-PLC-002','Segundo intento')$$,
  'Solo una solicitud aprobada puede convertirse en compra real',
  'a fulfilled request cannot be fulfilled a second time'
);
select is(
  (select count(*) from public.operational_expenses where purchase_request_id='b4000000-0000-4000-8000-000000000001'),
  1::bigint,
  'second fulfillment attempt does not create another expense'
);
select is(
  (select count(*) from public.purchase_request_events where request_id='b4000000-0000-4000-8000-000000000001' and event_kind='fulfilled'),
  1::bigint,
  'second fulfillment attempt does not create another fulfilled event'
);
select is(
  (select amount_cop from public.operational_expenses where purchase_request_id='b4000000-0000-4000-8000-000000000001'),
  185000::numeric,
  'second fulfillment attempt cannot mutate the original actual amount'
);

select * from finish();
rollback;
