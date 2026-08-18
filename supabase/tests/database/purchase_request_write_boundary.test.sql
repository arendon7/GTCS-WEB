begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

select ok(
  to_regprocedure('public.ops_submit_purchase_request(uuid,text,date,text,text,text,numeric,text,uuid,text,text)') is not null,
  'governed purchase-request submission RPC exists'
);
select ok(has_function_privilege('authenticated','public.ops_submit_purchase_request(uuid,text,date,text,text,text,numeric,text,uuid,text,text)','EXECUTE'),'authenticated can execute governed purchase-request RPC');
select ok(has_table_privilege('authenticated','public.purchase_requests','SELECT'),'authenticated retains purchase-request read access through RLS');
select ok(not has_table_privilege('authenticated','public.purchase_requests','INSERT'),'authenticated cannot insert purchase requests directly');
select ok(not has_table_privilege('authenticated','public.purchase_requests','UPDATE'),'authenticated cannot update purchase requests directly');
select ok(not has_table_privilege('authenticated','public.purchase_requests','DELETE'),'authenticated cannot delete purchase requests directly');
select ok(has_table_privilege('authenticated','public.purchase_request_events','SELECT'),'authenticated retains request-event read access through RLS');
select ok(not has_table_privilege('authenticated','public.purchase_request_events','INSERT'),'authenticated cannot insert request events directly');
select ok(not has_table_privilege('authenticated','public.purchase_request_events','UPDATE'),'authenticated cannot update request events directly');
select ok(not has_table_privilege('authenticated','public.purchase_request_events','DELETE'),'authenticated cannot delete request events directly');

insert into auth.users(id,email,created_at,updated_at) values
 ('a1000000-0000-4000-8000-000000000001','purchase-operator-a@greenatics.test',now(),now()),
 ('a1000000-0000-4000-8000-000000000002','purchase-operator-b@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('a2000000-0000-4000-8000-000000000001','PUR-A','Purchase Plant A',true),
 ('a2000000-0000-4000-8000-000000000002','PUR-B','Purchase Plant B',true);
insert into public.profiles(id,display_name) values
 ('a1000000-0000-4000-8000-000000000001','Purchase Operator A'),
 ('a1000000-0000-4000-8000-000000000002','Purchase Operator B');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','operator'),
 ('a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','operator');
insert into public.equipment(id,plant_id,code,name,status) values
 ('a3000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','EQ-A','Equipo planta A','available'),
 ('a3000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','EQ-B','Equipo planta B','available');

set local role authenticated;
set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000001';

select is((select auth.uid()),'a1000000-0000-4000-8000-000000000001'::uuid,'fixture exposes authenticated subject before RPC');
select is((select count(*) from auth.users where id='a1000000-0000-4000-8000-000000000001'),1::bigint,'authenticated fixture user exists before RPC');

select lives_ok($$select public.ops_submit_purchase_request(
  'a2000000-0000-4000-8000-000000000001',
  '  Operador A  ',
  '2026-08-25',
  'maintenance',
  '  Repuesto bomba  ',
  '  Cambio preventivo QA  ',
  125000,
  '  Proveedor sugerido  ',
  'a3000000-0000-4000-8000-000000000001',
  '  compostaje  ',
  '  evidencia/qa-001  '
)$$,'authorized operator can submit a governed request');
select is((select auth.uid()),'a1000000-0000-4000-8000-000000000001'::uuid,'authenticated subject remains stable after RPC');
select is((select count(*) from auth.users where id='a1000000-0000-4000-8000-000000000001'),1::bigint,'authenticated fixture user still exists after RPC');
select is((select count(*) from public.purchase_requests where plant_id='a2000000-0000-4000-8000-000000000001'),1::bigint,'RPC stores exactly one request');
select is((select status from public.purchase_requests where plant_id='a2000000-0000-4000-8000-000000000001'),'submitted','new request is always submitted');
select is((select requested_by_name from public.purchase_requests where plant_id='a2000000-0000-4000-8000-000000000001'),'Operador A','requester name is normalized at the write boundary');
select is((select concept from public.purchase_requests where plant_id='a2000000-0000-4000-8000-000000000001'),'Repuesto bomba','concept is normalized at the write boundary');
select is((select count(*) from public.purchase_request_events where event_kind='submitted'),1::bigint,'canonical submitted event is created exactly once');
select is((select actor_name from public.purchase_request_events where event_kind='submitted'),'Operador A','submitted event preserves normalized requester identity');
select is((select created_by from public.purchase_requests where plant_id='a2000000-0000-4000-8000-000000000001'),'a1000000-0000-4000-8000-000000000001'::uuid,'request preserves authenticated creator provenance');
select is((select actor_user_id from public.purchase_request_events where event_kind='submitted'),'a1000000-0000-4000-8000-000000000001'::uuid,'submitted event preserves the same authenticated actor provenance');

select throws_ok($$select public.ops_submit_purchase_request(
  'a2000000-0000-4000-8000-000000000001','Operador A',null,'operations','Monto inválido','Prueba',0,null,null,null,null
)$$,'El monto estimado debe ser mayor que cero.','non-positive estimate is rejected');
select throws_ok($$select public.ops_submit_purchase_request(
  'a2000000-0000-4000-8000-000000000001','Operador A',null,'maintenance','Equipo cruzado','Prueba',50000,null,'a3000000-0000-4000-8000-000000000002',null,null
)$$,'El equipo seleccionado no pertenece a la planta de la solicitud.','request cannot reference equipment from another plant');
select throws_ok($$select public.ops_submit_purchase_request(
  'a2000000-0000-4000-8000-000000000002','Operador A',null,'operations','Sin acceso','Prueba',50000,null,null,null,null
)$$,'No tienes permiso para solicitar compras en esta planta.','requester cannot submit into a plant without membership');

set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000002';
select lives_ok($$select public.ops_submit_purchase_request(
  'a2000000-0000-4000-8000-000000000002','Operador B',null,'operations','Solicitud B','Prueba planta B',75000,null,null,null,null
)$$,'second plant can create its own governed request');

set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.purchase_requests),1::bigint,'RLS keeps another plant request invisible to the first operator');

reset role;
select is((select created_by from public.purchase_requests where plant_id='a2000000-0000-4000-8000-000000000001'),'a1000000-0000-4000-8000-000000000001'::uuid,'request provenance is physically stored outside RLS');
select is((select actor_user_id from public.purchase_request_events pre join public.purchase_requests pr on pr.id=pre.request_id where pr.plant_id='a2000000-0000-4000-8000-000000000001' and pre.event_kind='submitted'),'a1000000-0000-4000-8000-000000000001'::uuid,'submitted-event provenance is physically stored outside RLS');
select * from finish();
rollback;
