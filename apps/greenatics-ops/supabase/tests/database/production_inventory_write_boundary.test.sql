begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

select ok(has_table_privilege('authenticated','public.production_records','SELECT'),'authenticated retains production read access');
select ok(not has_table_privilege('authenticated','public.production_records','INSERT'),'authenticated cannot insert production directly');
select ok(not has_table_privilege('authenticated','public.production_records','UPDATE'),'authenticated cannot update production directly');
select ok(not has_table_privilege('authenticated','public.production_records','DELETE'),'authenticated cannot delete production directly');
select ok(has_table_privilege('authenticated','public.inventory_movements','SELECT'),'authenticated retains kardex read access');
select ok(not has_table_privilege('authenticated','public.inventory_movements','INSERT'),'authenticated cannot insert kardex movements directly');
select ok(not has_table_privilege('authenticated','public.inventory_movements','UPDATE'),'authenticated cannot update kardex movements directly');
select ok(not has_table_privilege('authenticated','public.inventory_movements','DELETE'),'authenticated cannot delete kardex movements directly');
select is((select count(*) from pg_policies where schemaname='public' and tablename='production_records' and policyname='production_operator_insert'),0::bigint,'legacy production direct-insert policy is removed');
select is((select count(*) from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='inventory_dispatch_insert'),0::bigint,'legacy dispatch direct-insert policy is removed');
select is((select count(*) from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='inventory_adjustment_insert'),0::bigint,'legacy adjustment direct-insert policy is removed');
select ok(has_function_privilege('authenticated','public.ops_adjust_inventory(uuid,uuid,text,text,numeric,text,uuid)','EXECUTE'),'authenticated can execute governed adjustment RPC');

insert into auth.users(id,email,created_at,updated_at) values
 ('c1000000-0000-4000-8000-000000000001','inventory-boundary-supervisor@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('c2000000-0000-4000-8000-000000000001','INV-BND','Inventory Boundary QA',true);
insert into public.profiles(id,display_name) values
 ('c1000000-0000-4000-8000-000000000001','Inventory Boundary Supervisor');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('c1000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','supervisor');
insert into public.inventory_products(id,name,unit,active) values
 ('c3000000-0000-4000-8000-000000000001','Producto Boundary QA','kg',true);

set local role authenticated;
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';

select lives_ok($$select * from public.ops_record_production(
 'c2000000-0000-4000-8000-000000000001',
 'c3000000-0000-4000-8000-000000000001',
 20,
 'Producción QA',
 null,
 'Lote para validar frontera RPC'
)$$,'production remains available through guarded RPC');
select is((select count(*) from public.production_records where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001'),1::bigint,'production RPC creates exactly one production record');
select is((select count(*) from public.inventory_movements where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001' and kind='production'),1::bigint,'production RPC still creates exactly one kardex entry');

select lives_ok($$select public.ops_dispatch_inventory(
 'c2000000-0000-4000-8000-000000000001',
 'c3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001' limit 1),
 5,
 'Despacho QA',
 'Salida por RPC',
 null
)$$,'dispatch remains available through guarded RPC');
select is((select count(*) from public.inventory_movements where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001' and kind='dispatch'),1::bigint,'dispatch RPC creates one append-only kardex movement');

select lives_ok($$select public.ops_adjust_inventory(
 'c2000000-0000-4000-8000-000000000001',
 'c3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001' limit 1),
 'adjustment_in',
 2,
 'Conteo físico: ajuste positivo QA',
 null
)$$,'supervisor can append a governed positive adjustment');
select is((select count(*) from public.inventory_movements where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001' and kind='adjustment_in'),1::bigint,'positive adjustment is recorded once');
select lives_ok($$select public.ops_adjust_inventory(
 'c2000000-0000-4000-8000-000000000001',
 'c3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001' limit 1),
 'adjustment_out',
 1,
 'Conteo físico: ajuste negativo QA',
 null
)$$,'supervisor can append a governed negative adjustment within available stock');
select is((select count(*) from public.inventory_movements where plant_id='c2000000-0000-4000-8000-000000000001' and product_id='c3000000-0000-4000-8000-000000000001' and kind='adjustment_out'),1::bigint,'negative adjustment is recorded once');

reset role;
select * from finish();
rollback;
