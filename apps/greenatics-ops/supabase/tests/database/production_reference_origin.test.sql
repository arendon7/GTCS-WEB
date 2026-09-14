begin;
create extension if not exists pgtap with schema extensions;
select plan(31);

select has_column('public','inventory_products','reference_code','product master exposes governed reference code');
select has_column('public','production_records','product_reference_code','production snapshots product reference');
select has_column('public','production_records','origin_kind','production exposes structured origin kind');
select ok(not has_table_privilege('authenticated','public.inventory_products','INSERT'),'authenticated cannot insert product master directly');
select ok(not has_table_privilege('authenticated','public.inventory_products','UPDATE'),'authenticated cannot update product master directly');
select ok(not has_table_privilege('authenticated','public.inventory_products','DELETE'),'authenticated cannot delete product master directly');
select ok(has_function_privilege('authenticated','public.ops_create_inventory_product(text,text,text)','EXECUTE'),'authenticated can call governed product creation RPC');
select ok(has_function_privilege('authenticated','public.ops_set_inventory_product_reference(uuid,text)','EXECUTE'),'authenticated can call governed product reference RPC');

insert into auth.users(id,email,created_at,updated_at) values
 ('e1000000-0000-4000-8000-000000000001','production-reference-admin@greenatics.test',now(),now()),
 ('e1000000-0000-4000-8000-000000000002','production-reference-operator@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('e2000000-0000-4000-8000-000000000001','REF-TAM','Production Reference QA',true);
insert into public.profiles(id,display_name) values
 ('e1000000-0000-4000-8000-000000000001','Production Reference Admin'),
 ('e1000000-0000-4000-8000-000000000002','Production Reference Operator');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('e1000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','admin'),
 ('e1000000-0000-4000-8000-000000000002','e2000000-0000-4000-8000-000000000001','operator');
insert into public.compost_piles(
 id,plant_id,code,location,status,initial_weight_kg,started_at,maturation_started_at,closed_at,final_weight_kg
) values (
 'e4000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','PILE-REF-QA','Zona QA','closed',100,
 now()-interval '10 days',now()-interval '5 days',now()-interval '1 day',70
);

set local role authenticated;
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';

select lives_ok($$select public.ops_create_inventory_product('Producto Referencia QA','kg','WG-REF-A')$$,'admin can create a product with an explicit reference');
select is((select count(*) from public.inventory_products where name='Producto Referencia QA' and unit='kg'),1::bigint,'governed product creation writes exactly one row');
select is((select reference_code from public.inventory_products where name='Producto Referencia QA' and unit='kg'),'WG-REF-A','master stores the user-supplied reference exactly');
select throws_ok($$select public.ops_create_inventory_product('Otro Producto QA','L','wg-ref-a')$$,'Ya existe un producto con esa referencia.','reference codes are unique case-insensitively');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000002';
select throws_ok($$select public.ops_create_inventory_product('Producto Operador QA','kg','OP-REF')$$,'No tienes permiso para administrar el maestro de productos.','operator cannot create product master data');
select throws_ok($$select public.ops_set_inventory_product_reference((select id from public.inventory_products where name='Producto Referencia QA'),'OP-REF')$$,'No tienes permiso para administrar el maestro de productos.','operator cannot mutate product references');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select lives_ok($$select * from public.ops_record_production(
 'e2000000-0000-4000-8000-000000000001',
 (select id from public.inventory_products where name='Producto Referencia QA' and unit='kg'),
 20,'Formulación QA',null,'Origen por proceso'
)$$,'production without pile remains valid process-origin production');
select is((select origin_kind from public.production_records where plant_id='e2000000-0000-4000-8000-000000000001' order by created_at asc limit 1),'process','production without pile is classified as process origin');
select is((select product_reference_code from public.production_records where plant_id='e2000000-0000-4000-8000-000000000001' order by created_at asc limit 1),'WG-REF-A','production freezes the product reference valid at creation');
select is((select count(*) from public.inventory_movements where plant_id='e2000000-0000-4000-8000-000000000001' and kind='production'),1::bigint,'reference snapshot does not alter the one-to-one production kardex entry');

select lives_ok($$select public.ops_set_inventory_product_reference(
 (select id from public.inventory_products where name='Producto Referencia QA' and unit='kg'),'WG-REF-B'
)$$,'admin can change the current product reference');
select is((select reference_code from public.inventory_products where name='Producto Referencia QA' and unit='kg'),'WG-REF-B','master exposes the new current reference');
select is((select product_reference_code from public.production_records where plant_id='e2000000-0000-4000-8000-000000000001' order by created_at asc limit 1),'WG-REF-A','changing master reference does not rewrite historical production snapshot');

select lives_ok($$select * from public.ops_record_production(
 'e2000000-0000-4000-8000-000000000001',
 (select id from public.inventory_products where name='Producto Referencia QA' and unit='kg'),
 12,'Empaque QA',null,'Nueva referencia vigente'
)$$,'new production remains available after reference change');
select is((select count(*) from public.production_records where plant_id='e2000000-0000-4000-8000-000000000001' and product_reference_code='WG-REF-B'),1::bigint,'new production snapshots the new current reference');

select lives_ok($$select * from public.ops_record_production(
 'e2000000-0000-4000-8000-000000000001',
 (select id from public.inventory_products where name='Producto Referencia QA' and unit='kg'),
 7,'Acondicionamiento QA','e4000000-0000-4000-8000-000000000001','Origen explícito por pila'
)$$,'production can link an explicit closed pile without inferring its mass');
select is((select origin_kind from public.production_records where source_pile_id='e4000000-0000-4000-8000-000000000001'),'compost_pile','explicit pile relation is structured as compost_pile origin');
select is((select source_pile_id from public.production_records where source_pile_id='e4000000-0000-4000-8000-000000000001'),'e4000000-0000-4000-8000-000000000001'::uuid,'production preserves the explicit source pile relation');
select is((select quantity from public.production_records where source_pile_id='e4000000-0000-4000-8000-000000000001'),7::numeric,'linked pile final weight is not copied into finished production quantity');
select is((select product_reference_code from public.production_records where source_pile_id='e4000000-0000-4000-8000-000000000001'),'WG-REF-B','pile-origin production also snapshots current product reference');

select lives_ok($$select public.ops_set_inventory_product_reference(
 (select id from public.inventory_products where name='Producto Referencia QA' and unit='kg'),null
)$$,'admin can clear a current reference when canonical data is not available');
select is((select reference_code from public.inventory_products where name='Producto Referencia QA' and unit='kg'),null::text,'clearing current reference stores unknown rather than inventing a code');
select is((select count(*) from public.production_records where plant_id='e2000000-0000-4000-8000-000000000001' and product_reference_code is not null),3::bigint,'clearing current reference does not rewrite any historical snapshots');

reset role;
select * from finish();
rollback;
