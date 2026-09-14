begin;
create extension if not exists pgtap with schema extensions;
select plan(26);

select has_table('public','inventory_stock_threshold_revisions','inventory threshold revision ledger exists');
select ok(has_table_privilege('authenticated','public.inventory_stock_threshold_revisions','SELECT'),'authenticated retains threshold read access through RLS');
select ok(not has_table_privilege('authenticated','public.inventory_stock_threshold_revisions','INSERT'),'authenticated cannot insert threshold revisions directly');
select ok(not has_table_privilege('authenticated','public.inventory_stock_threshold_revisions','UPDATE'),'authenticated cannot update threshold revisions directly');
select ok(not has_table_privilege('authenticated','public.inventory_stock_threshold_revisions','DELETE'),'authenticated cannot delete threshold revisions directly');
select ok(has_function_privilege('authenticated','public.ops_set_inventory_stock_threshold(uuid,uuid,numeric,text)','EXECUTE'),'authenticated can execute governed threshold RPC');

insert into auth.users(id,email,created_at,updated_at) values
 ('f1000000-0000-4000-8000-000000000001','threshold-technical@greenatics.test',now(),now()),
 ('f1000000-0000-4000-8000-000000000002','threshold-supervisor@greenatics.test',now(),now()),
 ('f1000000-0000-4000-8000-000000000003','threshold-admin-other@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('f2000000-0000-4000-8000-000000000001','THR-A','Threshold Plant A',true),
 ('f2000000-0000-4000-8000-000000000002','THR-B','Threshold Plant B',true);
insert into public.profiles(id,display_name) values
 ('f1000000-0000-4000-8000-000000000001','Threshold Technical'),
 ('f1000000-0000-4000-8000-000000000002','Threshold Supervisor'),
 ('f1000000-0000-4000-8000-000000000003','Threshold Admin Other');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('f1000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','technical'),
 ('f1000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','supervisor'),
 ('f1000000-0000-4000-8000-000000000003','f2000000-0000-4000-8000-000000000002','admin');
insert into public.inventory_products(id,name,unit,active) values
 ('f3000000-0000-4000-8000-000000000001','Producto Umbral QA','kg',true);

set local role authenticated;
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';

select lives_ok($$select public.ops_set_inventory_stock_threshold(
 'f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001',100,'Stock mínimo inicial QA'
)$$,'technical can append a threshold policy revision');
select is((select count(*) from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001'),1::bigint,'first threshold revision is stored once');
select is((select minimum_quantity from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001'),100::numeric,'first revision preserves configured minimum');
select is((select note from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001'),'Stock mínimo inicial QA','threshold revision preserves rationale');

select lives_ok($$select public.ops_set_inventory_stock_threshold(
 'f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001',80,'Ajuste técnico del mínimo'
)$$,'technical can append a second revision without rewriting history');
select is((select count(*) from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001'),2::bigint,'second threshold creates a second row');
select is((select minimum_quantity from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001' order by revision_no desc limit 1),80::numeric,'latest revision exposes the new minimum');
select is((select minimum_quantity from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001' order by revision_no asc limit 1),100::numeric,'earlier threshold history remains unchanged');

select lives_ok($$select public.ops_set_inventory_stock_threshold(
 'f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001',null,'Umbral retirado hasta nueva validación técnica'
)$$,'technical can explicitly clear a threshold with a new revision');
select is((select count(*) from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001'),3::bigint,'clearing threshold remains append-only');
select is((select minimum_quantity from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001' order by revision_no desc limit 1),null::numeric,'latest NULL means unconfigured rather than zero');
select is((select count(*) from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000001' and minimum_quantity is not null),2::bigint,'clearing current policy does not rewrite prior configured thresholds');

select throws_ok($$select public.ops_set_inventory_stock_threshold(
 'f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001',0,'Cero inválido'
)$$,'El umbral debe ser mayor que cero o quedar vacío para desactivarlo.','zero cannot masquerade as a configured threshold');
select throws_ok($$select public.ops_set_inventory_stock_threshold(
 'f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001',50,'   '
)$$,'Registra el motivo o criterio del umbral.','threshold revisions require explicit rationale');

set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000002';
select throws_ok($$select public.ops_set_inventory_stock_threshold(
 'f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001',60,'Intento supervisor'
)$$,'No tienes permiso para definir umbrales de inventario en esta planta.','supervisor cannot define technical inventory policy');

set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000003';
select lives_ok($$select public.ops_set_inventory_stock_threshold(
 'f2000000-0000-4000-8000-000000000002','f3000000-0000-4000-8000-000000000001',50,'Mínimo planta B'
)$$,'admin can define policy in another authorized plant');
select is((select count(*) from public.inventory_stock_threshold_revisions where plant_id='f2000000-0000-4000-8000-000000000002'),1::bigint,'second plant stores an independent threshold history');

set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.inventory_stock_threshold_revisions),3::bigint,'RLS hides threshold history from plants without membership');
select is((select count(distinct product_id) from public.inventory_stock_threshold_revisions),1::bigint,'visible threshold history remains tied to the intended product');
select is((select max(revision_no) > min(revision_no) from public.inventory_stock_threshold_revisions),true,'revision sequence provides deterministic latest-policy ordering');

reset role;
select * from finish();
rollback;
