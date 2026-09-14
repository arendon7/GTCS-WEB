begin;
create extension if not exists pgtap with schema extensions;
select plan(26);

select has_table('public','inventory_reconciliations','inventory reconciliation ledger exists');
select ok(has_table_privilege('authenticated','public.inventory_reconciliations','SELECT'),'authenticated retains reconciliation read access');
select ok(not has_table_privilege('authenticated','public.inventory_reconciliations','INSERT'),'authenticated cannot insert reconciliation directly');
select ok(not has_table_privilege('authenticated','public.inventory_reconciliations','UPDATE'),'authenticated cannot update reconciliation directly');
select ok(not has_table_privilege('authenticated','public.inventory_reconciliations','DELETE'),'authenticated cannot delete reconciliation directly');
select ok(has_function_privilege('authenticated','public.ops_reconcile_inventory(uuid,uuid,text,numeric,text,text[])','EXECUTE'),'authenticated can execute governed reconciliation RPC');

insert into auth.users(id,email,created_at,updated_at) values
 ('d1000000-0000-4000-8000-000000000001','inventory-reconcile-supervisor@greenatics.test',now(),now()),
 ('d1000000-0000-4000-8000-000000000002','inventory-reconcile-operator@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('d2000000-0000-4000-8000-000000000001','INV-REC','Inventory Reconciliation QA',true);
insert into public.profiles(id,display_name) values
 ('d1000000-0000-4000-8000-000000000001','Inventory Reconciliation Supervisor'),
 ('d1000000-0000-4000-8000-000000000002','Inventory Reconciliation Operator');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('d1000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','supervisor'),
 ('d1000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000001','operator');
insert into public.inventory_products(id,name,unit,active) values
 ('d3000000-0000-4000-8000-000000000001','Producto Reconciliación QA','kg',true);

set local role authenticated;
set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';

select lives_ok($$select * from public.ops_record_production(
 'd2000000-0000-4000-8000-000000000001',
 'd3000000-0000-4000-8000-000000000001',
 20,
 'Producción conciliación QA',
 null,
 'Lote para conteo físico'
)$$,'production can seed a physical lot for reconciliation');
select is((select private.inventory_stock(
 'd2000000-0000-4000-8000-000000000001',
 'd3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1)
)),20::numeric,'initial ledger balance is 20');

select lives_ok($$select * from public.ops_reconcile_inventory(
 'd2000000-0000-4000-8000-000000000001',
 'd3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1),
 17,
 'Conteo físico con faltante',
 array['evidencia://conteo-1']
)$$,'downward physical reconciliation succeeds atomically');
select is((select count(*) from public.inventory_reconciliations where plant_id='d2000000-0000-4000-8000-000000000001'),1::bigint,'first reconciliation is stored once');
select is((select expected_quantity from public.inventory_reconciliations where plant_id='d2000000-0000-4000-8000-000000000001'),20::numeric,'reconciliation freezes expected quantity before adjustment');
select is((select counted_quantity from public.inventory_reconciliations where plant_id='d2000000-0000-4000-8000-000000000001'),17::numeric,'reconciliation freezes physical count');
select is((select difference_quantity from public.inventory_reconciliations where plant_id='d2000000-0000-4000-8000-000000000001'),(-3)::numeric,'reconciliation freezes negative difference');
select is((select count(*) from public.inventory_movements where plant_id='d2000000-0000-4000-8000-000000000001' and kind='adjustment_out'),1::bigint,'negative difference creates one adjustment out');
select is((select m.reference_id from public.inventory_movements m where m.plant_id='d2000000-0000-4000-8000-000000000001' and m.kind='adjustment_out'),(select r.id from public.inventory_reconciliations r where r.plant_id='d2000000-0000-4000-8000-000000000001'),'adjustment references its reconciliation');
select is((select private.inventory_stock(
 'd2000000-0000-4000-8000-000000000001',
 'd3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1)
)),17::numeric,'ledger balance equals physical count after downward reconciliation');

select lives_ok($$select * from public.ops_reconcile_inventory(
 'd2000000-0000-4000-8000-000000000001',
 'd3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1),
 22,
 'Conteo físico con sobrante',
 '{}'::text[]
)$$,'upward physical reconciliation succeeds atomically');
select is((select count(*) from public.inventory_movements where plant_id='d2000000-0000-4000-8000-000000000001' and kind='adjustment_in'),1::bigint,'positive difference creates one adjustment in');
select is((select private.inventory_stock(
 'd2000000-0000-4000-8000-000000000001',
 'd3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1)
)),22::numeric,'ledger balance equals physical count after upward reconciliation');

select lives_ok($$select * from public.ops_reconcile_inventory(
 'd2000000-0000-4000-8000-000000000001',
 'd3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1),
 22,
 'Conteo físico sin diferencia',
 '{}'::text[]
)$$,'zero-difference physical reconciliation is still auditable');
select is((select count(*) from public.inventory_reconciliations where plant_id='d2000000-0000-4000-8000-000000000001'),3::bigint,'all three physical counts are preserved');
select is((select count(*) from public.inventory_movements where plant_id='d2000000-0000-4000-8000-000000000001' and kind in ('adjustment_in','adjustment_out')),2::bigint,'zero-difference reconciliation creates no synthetic movement');
select is((select adjustment_movement_id from public.inventory_reconciliations where plant_id='d2000000-0000-4000-8000-000000000001' and difference_quantity=0),null::uuid,'zero-difference reconciliation has no adjustment movement');

set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000002';
select throws_ok($$select * from public.ops_reconcile_inventory(
 'd2000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1),22,'Intento operador','{}'::text[]
)$$,'No tienes permiso para conciliar inventario en esta planta.','operator cannot reconcile stock');

set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';
select throws_ok($$select * from public.ops_reconcile_inventory(
 'd2000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001',
 (select lot_code from public.production_records where plant_id='d2000000-0000-4000-8000-000000000001' limit 1),-1,'Conteo inválido','{}'::text[]
)$$,'El conteo físico no puede ser negativo.','negative physical count is rejected');
select throws_ok($$select * from public.ops_reconcile_inventory(
 'd2000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001',
 'LOTE-INEXISTENTE',22,'Lote inválido','{}'::text[]
)$$,'El lote seleccionado no existe para este producto y planta.','unknown physical lot is rejected');

reset role;
select * from finish();
rollback;
