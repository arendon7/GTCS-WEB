begin;
create extension if not exists pgtap with schema extensions;
select plan(39);

select ok(
  to_regprocedure('public.ops_record_operational_expense(uuid,text,text,text,text,numeric,date,text,uuid,text,text,text)') is not null,
  'governed operational-expense RPC exists'
);
select ok(has_function_privilege('authenticated','public.ops_record_operational_expense(uuid,text,text,text,text,numeric,date,text,uuid,text,text,text)','EXECUTE'),'authenticated can execute governed operational-expense RPC');
select ok(has_table_privilege('authenticated','public.operational_expenses','SELECT'),'authenticated retains operational-expense read access through RLS');
select ok(not has_table_privilege('authenticated','public.operational_expenses','INSERT'),'authenticated cannot insert operational expenses directly');
select ok(not has_table_privilege('authenticated','public.operational_expenses','UPDATE'),'authenticated cannot update operational expenses directly');
select ok(not has_table_privilege('authenticated','public.operational_expenses','DELETE'),'authenticated cannot delete operational expenses directly');
select ok(has_table_privilege('authenticated','public.suppliers','SELECT'),'authenticated retains supplier read access');
select ok(not has_table_privilege('authenticated','public.suppliers','INSERT'),'authenticated cannot create suppliers directly');
select ok(not has_table_privilege('authenticated','public.suppliers','UPDATE'),'authenticated cannot update suppliers directly');
select ok(not has_table_privilege('authenticated','public.suppliers','DELETE'),'authenticated cannot delete suppliers directly');
select is((select count(*) from pg_policies where schemaname='public' and tablename='operational_expenses' and policyname='operational_expenses_insert'),0::bigint,'legacy direct expense insert policy is absent');
select is((select count(*) from pg_policies where schemaname='public' and tablename='suppliers' and policyname='suppliers_member_insert'),0::bigint,'legacy direct supplier insert policy is absent');

insert into auth.users(id,email,created_at,updated_at) values
 ('c1000000-0000-4000-8000-000000000001','expense-supervisor-a@greenatics.test',now(),now()),
 ('c1000000-0000-4000-8000-000000000002','expense-operator-b@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('c2000000-0000-4000-8000-000000000001','EXP-A','Expense Plant A',true),
 ('c2000000-0000-4000-8000-000000000002','EXP-B','Expense Plant B',true);
insert into public.profiles(id,display_name) values
 ('c1000000-0000-4000-8000-000000000001','Expense Supervisor A'),
 ('c1000000-0000-4000-8000-000000000002','Expense Operator B');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('c1000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','supervisor'),
 ('c1000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','operator');
insert into public.equipment(id,plant_id,code,name,status) values
 ('c3000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','EXP-EQ-A','Equipo gasto A','available'),
 ('c3000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','EXP-EQ-B','Equipo gasto B','available');

set local role authenticated;
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';

select is((select auth.uid()),'c1000000-0000-4000-8000-000000000001'::uuid,'fixture exposes authenticated expense subject');
select lives_ok($$select * from public.ops_record_operational_expense(
  'c2000000-0000-4000-8000-000000000001',
  'expense',
  '  Proveedor Gasto QA  ',
  'maintenance',
  '  Mantenimiento preventivo QA  ',
  50000,
  '2026-08-18'::date,
  'DOC-EXP-001',
  'c3000000-0000-4000-8000-000000000001',
  'compostaje',
  'evidencia/gasto-001',
  '  gasto gobernado  '
)$$,'authorized member can record a standalone governed expense');
select is((select count(*) from public.operational_expenses where plant_id='c2000000-0000-4000-8000-000000000001' and concept='Mantenimiento preventivo QA'),1::bigint,'RPC stores exactly one standalone expense');
select is((select count(*) from public.suppliers where normalized_key=private.normalize_supplier_name('Proveedor Gasto QA')),1::bigint,'RPC resolves exactly one normalized supplier');
select is((select name from public.suppliers where normalized_key=private.normalize_supplier_name('Proveedor Gasto QA')),'Proveedor Gasto QA','supplier name is normalized at the governed boundary');
select is((select created_by from public.operational_expenses where concept='Mantenimiento preventivo QA'),'c1000000-0000-4000-8000-000000000001'::uuid,'standalone expense preserves authenticated provenance');
select is((select created_by from public.suppliers where normalized_key=private.normalize_supplier_name('Proveedor Gasto QA')),'c1000000-0000-4000-8000-000000000001'::uuid,'supplier provenance is preserved');
select is((select record_type from public.operational_expenses where concept='Mantenimiento preventivo QA'),'expense','standalone economic fact preserves explicit record type');
select is((select purchase_request_id from public.operational_expenses where concept='Mantenimiento preventivo QA'),null::uuid,'standalone expense is not falsely linked to a purchase request');

select throws_ok($$select * from public.ops_record_operational_expense(
  'c2000000-0000-4000-8000-000000000001','expense','Proveedor Gasto QA','operations','Monto inválido',0,'2026-08-18'::date,null,null,null,null,null
)$$,'El monto COP debe ser mayor que cero','non-positive standalone expense is rejected');
select throws_ok($$select * from public.ops_record_operational_expense(
  'c2000000-0000-4000-8000-000000000001','expense','Proveedor Gasto QA','maintenance','Equipo cruzado',1000,'2026-08-18'::date,null,'c3000000-0000-4000-8000-000000000002',null,null,null
)$$,'El equipo relacionado no pertenece a la planta','expense cannot reference equipment from another plant');
select throws_ok($$select * from public.ops_record_operational_expense(
  'c2000000-0000-4000-8000-000000000002','expense','Proveedor Gasto QA','operations','Planta cruzada',1000,'2026-08-18'::date,null,null,null,null,null,null
)$$,'Sin permiso para registrar compras o gastos en esta planta','member cannot record an expense in another plant');

select lives_ok($$select public.ops_submit_purchase_request(
  'c2000000-0000-4000-8000-000000000001',
  'Supervisor A',
  '2026-08-25'::date,
  'input',
  'Compra aprobada QA',
  'Necesidad operativa QA',
  90000,
  'Proveedor sugerido QA',
  null,
  'operaciones',
  'evidencia/solicitud-qa'
)$$,'same supervisor can submit a governed purchase request');
select lives_ok($$select public.decide_purchase_request(
  (select id from public.purchase_requests where concept='Compra aprobada QA'),
  'approved',
  'Supervisor A',
  'Aprobada para prueba R3.3'
)$$,'approved-request transition remains functional after expense DML closure');
select lives_ok($$select public.fulfill_purchase_request(
  (select id from public.purchase_requests where concept='Compra aprobada QA'),
  'Supervisor A',
  'Proveedor Real QA',
  120000,
  '2026-08-18'::date,
  'FAC-REAL-001',
  'Cierre real QA'
)$$,'approved request can still create its real expense atomically');
select is((select status from public.purchase_requests where concept='Compra aprobada QA'),'fulfilled','fulfilled request reaches canonical fulfilled state');
select ok((select expense_id is not null from public.purchase_requests where concept='Compra aprobada QA'),'fulfilled request stores the created expense id');
select is((select count(*) from public.operational_expenses e join public.purchase_requests r on r.id=e.purchase_request_id where r.concept='Compra aprobada QA'),1::bigint,'fulfillment creates exactly one linked operational expense');
select is((select e.amount_cop from public.operational_expenses e join public.purchase_requests r on r.id=e.purchase_request_id where r.concept='Compra aprobada QA'),120000::numeric,'fulfillment stores explicit actual amount rather than the estimate');
select is((select e.purchase_request_id from public.operational_expenses e join public.purchase_requests r on r.id=e.purchase_request_id where r.concept='Compra aprobada QA'),(select id from public.purchase_requests where concept='Compra aprobada QA'),'expense points back to the fulfilled request');
select is((select count(*) from public.purchase_request_events e join public.purchase_requests r on r.id=e.request_id where r.concept='Compra aprobada QA' and e.event_kind='fulfilled'),1::bigint,'fulfillment creates exactly one canonical fulfilled event');
select is((select e.actual_amount_cop from public.purchase_request_events e join public.purchase_requests r on r.id=e.request_id where r.concept='Compra aprobada QA' and e.event_kind='fulfilled'),120000::numeric,'fulfilled event freezes the same actual amount');
select is((select e.created_by from public.operational_expenses e join public.purchase_requests r on r.id=e.purchase_request_id where r.concept='Compra aprobada QA'),'c1000000-0000-4000-8000-000000000001'::uuid,'fulfilled expense preserves authenticated provenance');
select is((select e.actor_user_id from public.purchase_request_events e join public.purchase_requests r on r.id=e.request_id where r.concept='Compra aprobada QA' and e.event_kind='fulfilled'),'c1000000-0000-4000-8000-000000000001'::uuid,'fulfilled event preserves authenticated actor provenance');

set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000002';
select lives_ok($$select * from public.ops_record_operational_expense(
  'c2000000-0000-4000-8000-000000000002','purchase','Proveedor Planta B','input','Compra planta B',30000,'2026-08-18'::date,'DOC-B-001',null,null,null,null
)$$,'second plant can record its own governed economic fact');

set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.operational_expenses where plant_id in ('c2000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000002')),2::bigint,'RLS keeps the other plant expense invisible to the first supervisor');

reset role;
select is((select count(*) from public.operational_expenses where plant_id in ('c2000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000002')),3::bigint,'all three governed economic facts are physically stored outside RLS');

select * from finish();
rollback;
