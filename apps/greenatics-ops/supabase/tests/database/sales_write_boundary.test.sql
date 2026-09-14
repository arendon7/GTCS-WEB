begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

select ok(
  to_regprocedure('public.ops_record_sale(uuid,text,uuid,text,numeric,numeric,text)') is not null,
  'governed sale RPC exists'
);
select ok(has_function_privilege('authenticated','public.ops_record_sale(uuid,text,uuid,text,numeric,numeric,text)','EXECUTE'),'authenticated can execute governed sale RPC');
select ok(has_table_privilege('authenticated','public.sales','SELECT'),'authenticated retains sales read access through RLS');
select ok(not has_table_privilege('authenticated','public.sales','INSERT'),'authenticated cannot insert sales directly');
select ok(not has_table_privilege('authenticated','public.sales','UPDATE'),'authenticated cannot update sales directly');
select ok(not has_table_privilege('authenticated','public.sales','DELETE'),'authenticated cannot delete sales directly');
select ok(has_table_privilege('authenticated','public.customers','SELECT'),'authenticated retains customer read access');
select ok(not has_table_privilege('authenticated','public.customers','INSERT'),'authenticated cannot create customers directly');
select ok(not has_table_privilege('authenticated','public.customers','UPDATE'),'authenticated cannot update customers directly');
select ok(not has_table_privilege('authenticated','public.customers','DELETE'),'authenticated cannot delete customers directly');
select is((select count(*) from pg_policies where schemaname='public' and tablename='sales' and policyname='sales_operator_insert'),0::bigint,'legacy direct sales insert policy is absent');
select is((select count(*) from pg_policies where schemaname='public' and tablename='customers' and policyname='customers_member_insert'),0::bigint,'legacy direct customer insert policy is absent');

insert into auth.users(id,email,created_at,updated_at) values
 ('b1000000-0000-4000-8000-000000000001','sales-operator-a@greenatics.test',now(),now()),
 ('b1000000-0000-4000-8000-000000000002','sales-operator-b@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('b2000000-0000-4000-8000-000000000001','SAL-A','Sales Plant A',true),
 ('b2000000-0000-4000-8000-000000000002','SAL-B','Sales Plant B',true);
insert into public.profiles(id,display_name) values
 ('b1000000-0000-4000-8000-000000000001','Sales Operator A'),
 ('b1000000-0000-4000-8000-000000000002','Sales Operator B');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('b1000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001','operator'),
 ('b1000000-0000-4000-8000-000000000002','b2000000-0000-4000-8000-000000000002','operator');
insert into public.inventory_products(id,name,unit,active,created_by) values
 ('b3000000-0000-4000-8000-000000000001','Producto venta QA','kg',true,'b1000000-0000-4000-8000-000000000001');
insert into public.inventory_movements(plant_id,product_id,lot_code,kind,quantity,occurred_at,created_by,note) values
 ('b2000000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000001','LOTE-SAL-A','production',100,'2026-08-17T12:00:00Z','b1000000-0000-4000-8000-000000000001','Stock fixture A'),
 ('b2000000-0000-4000-8000-000000000002','b3000000-0000-4000-8000-000000000001','LOTE-SAL-B','production',50,'2026-08-17T12:00:00Z','b1000000-0000-4000-8000-000000000002','Stock fixture B');

set local role authenticated;
set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000001';

select is((select auth.uid()),'b1000000-0000-4000-8000-000000000001'::uuid,'fixture exposes authenticated sales subject');
select lives_ok($$select * from public.ops_record_sale(
  'b2000000-0000-4000-8000-000000000001',
  '  Cliente Venta QA  ',
  'b3000000-0000-4000-8000-000000000001',
  'LOTE-SAL-A',
  25,
  2000,
  '  despacho QA  '
)$$,'authorized operator can record a governed sale');
select is((select count(*) from public.sales where plant_id='b2000000-0000-4000-8000-000000000001'),1::bigint,'RPC stores exactly one sale in the authorized plant');
select is((select count(*) from public.customers where normalized_key=private.normalize_customer_name('Cliente Venta QA')),1::bigint,'RPC resolves exactly one normalized customer');
select is((select name from public.customers where normalized_key=private.normalize_customer_name('Cliente Venta QA')),'Cliente Venta QA','customer name is normalized at the governed boundary');
select is((select count(*) from public.inventory_movements m join public.sales s on s.id=m.reference_id where s.plant_id='b2000000-0000-4000-8000-000000000001' and m.kind='dispatch'),1::bigint,'sale creates exactly one linked inventory dispatch');
select is((select m.quantity from public.inventory_movements m join public.sales s on s.id=m.reference_id where s.plant_id='b2000000-0000-4000-8000-000000000001' and m.kind='dispatch'),25::numeric,'linked dispatch preserves sold quantity');
select is((select m.destination from public.inventory_movements m join public.sales s on s.id=m.reference_id where s.plant_id='b2000000-0000-4000-8000-000000000001' and m.kind='dispatch'),'Cliente Venta QA','linked dispatch preserves customer destination');
select is((select created_by from public.sales where plant_id='b2000000-0000-4000-8000-000000000001'),'b1000000-0000-4000-8000-000000000001'::uuid,'sale preserves authenticated creator provenance');
select is((select m.created_by from public.inventory_movements m join public.sales s on s.id=m.reference_id where s.plant_id='b2000000-0000-4000-8000-000000000001' and m.kind='dispatch'),'b1000000-0000-4000-8000-000000000001'::uuid,'dispatch preserves the same authenticated provenance');
select is((select sum(case when kind in ('production','adjustment_in') then quantity else -quantity end) from public.inventory_movements where plant_id='b2000000-0000-4000-8000-000000000001' and product_id='b3000000-0000-4000-8000-000000000001' and lot_code='LOTE-SAL-A'),75::numeric,'governed sale reduces only the exact lot stock');

select throws_ok($$select * from public.ops_record_sale(
  'b2000000-0000-4000-8000-000000000001','Cliente Venta QA','b3000000-0000-4000-8000-000000000001','LOTE-SAL-A',80,2000,null
)$$,'23514','Stock insuficiente para lote LOTE-SAL-A. Disponible 75, solicitado 80','oversell is rejected by the inventory guard');
select is((select count(*) from public.sales where plant_id='b2000000-0000-4000-8000-000000000001'),1::bigint,'failed oversell leaves no partial sale');
select is((select count(*) from public.inventory_movements m join public.sales s on s.id=m.reference_id where s.plant_id='b2000000-0000-4000-8000-000000000001' and m.kind='dispatch'),1::bigint,'failed oversell leaves no partial dispatch');
select throws_ok($$select * from public.ops_record_sale(
  'b2000000-0000-4000-8000-000000000002','Cliente cruzado','b3000000-0000-4000-8000-000000000001','LOTE-SAL-B',5,2000,null
)$$,'No tienes permiso para registrar ventas en esta planta.','operator cannot sell from another plant');

set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000002';
select lives_ok($$select * from public.ops_record_sale(
  'b2000000-0000-4000-8000-000000000002','Cliente Planta B','b3000000-0000-4000-8000-000000000001','LOTE-SAL-B',10,3000,null
)$$,'second plant can record its own governed sale');

set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.sales),1::bigint,'RLS keeps another plant sale invisible to the first operator');

reset role;
select is((select count(*) from public.sales where plant_id in ('b2000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000002')),2::bigint,'both governed sales are physically stored outside RLS');
select is((select created_by from public.sales where plant_id='b2000000-0000-4000-8000-000000000001'),'b1000000-0000-4000-8000-000000000001'::uuid,'sale provenance is physically stored outside RLS');
select is((select m.created_by from public.inventory_movements m join public.sales s on s.id=m.reference_id where s.plant_id='b2000000-0000-4000-8000-000000000001' and m.kind='dispatch'),'b1000000-0000-4000-8000-000000000001'::uuid,'dispatch provenance is physically stored outside RLS');

select * from finish();
rollback;
