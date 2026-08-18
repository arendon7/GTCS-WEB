begin;
create extension if not exists pgtap with schema extensions;
select plan(40);

select ok(to_regprocedure('public.record_supply_receipt(uuid,text,text,text,numeric,date,text,uuid,text,text,text)') is not null,'governed supply receipt RPC exists');
select ok(to_regprocedure('public.consume_supply(uuid,uuid,text,numeric,date,text,uuid,text,text)') is not null,'governed supply consumption RPC exists');
select ok(has_function_privilege('authenticated','public.record_supply_receipt(uuid,text,text,text,numeric,date,text,uuid,text,text,text)','EXECUTE'),'authenticated can execute supply receipt RPC');
select ok(has_function_privilege('authenticated','public.consume_supply(uuid,uuid,text,numeric,date,text,uuid,text,text)','EXECUTE'),'authenticated can execute supply consumption RPC');
select ok(has_table_privilege('authenticated','public.supplies','SELECT'),'authenticated retains supply-master read access');
select ok(not has_table_privilege('authenticated','public.supplies','INSERT'),'authenticated cannot insert supply masters directly');
select ok(not has_table_privilege('authenticated','public.supplies','UPDATE'),'authenticated cannot update supply masters directly');
select ok(not has_table_privilege('authenticated','public.supplies','DELETE'),'authenticated cannot delete supply masters directly');
select ok(has_table_privilege('authenticated','public.supply_receipts','SELECT'),'authenticated retains supply-receipt read access through RLS');
select ok(not has_table_privilege('authenticated','public.supply_receipts','INSERT'),'authenticated cannot insert supply receipts directly');
select ok(not has_table_privilege('authenticated','public.supply_receipts','UPDATE'),'authenticated cannot update supply receipts directly');
select ok(not has_table_privilege('authenticated','public.supply_receipts','DELETE'),'authenticated cannot delete supply receipts directly');
select ok(has_table_privilege('authenticated','public.supply_movements','SELECT'),'authenticated retains supply-kardex read access through RLS');
select ok(not has_table_privilege('authenticated','public.supply_movements','INSERT'),'authenticated cannot insert supply movements directly');
select ok(not has_table_privilege('authenticated','public.supply_movements','UPDATE'),'authenticated cannot update supply movements directly');
select ok(not has_table_privilege('authenticated','public.supply_movements','DELETE'),'authenticated cannot delete supply movements directly');
select is((select count(*) from pg_policies where schemaname='public' and tablename='supplies' and lower(cmd)='insert'),0::bigint,'supply master has no direct INSERT policy');
select is((select count(*) from pg_policies where schemaname='public' and tablename='supply_receipts' and lower(cmd)='insert'),0::bigint,'supply receipts have no direct INSERT policy');
select is((select count(*) from pg_policies where schemaname='public' and tablename='supply_movements' and lower(cmd)='insert'),0::bigint,'supply kardex has no direct INSERT policy');

insert into auth.users(id,email,created_at,updated_at) values
 ('e1000000-0000-4000-8000-000000000001','supply-supervisor-a@greenatics.test',now(),now()),
 ('e1000000-0000-4000-8000-000000000002','supply-supervisor-b@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('e2000000-0000-4000-8000-000000000001','SUP-A','Supply Plant A',true),
 ('e2000000-0000-4000-8000-000000000002','SUP-B','Supply Plant B',true);
insert into public.profiles(id,display_name) values
 ('e1000000-0000-4000-8000-000000000001','Supply Supervisor A'),
 ('e1000000-0000-4000-8000-000000000002','Supply Supervisor B');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('e1000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','supervisor'),
 ('e1000000-0000-4000-8000-000000000002','e2000000-0000-4000-8000-000000000002','supervisor');
insert into public.suppliers(id,name,created_by) values
 ('e3000000-0000-4000-8000-000000000001','Proveedor Insumos QA','e1000000-0000-4000-8000-000000000001');
insert into public.operational_expenses(id,plant_id,record_type,supplier_id,category,concept,amount_cop,document_date,created_by) values
 ('e4000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','purchase','e3000000-0000-4000-8000-000000000001','input','Compra insumo A',500000,'2026-08-18','e1000000-0000-4000-8000-000000000001'),
 ('e4000000-0000-4000-8000-000000000002','e2000000-0000-4000-8000-000000000001','expense','e3000000-0000-4000-8000-000000000001','operations','Gasto no compra A',100000,'2026-08-18','e1000000-0000-4000-8000-000000000001'),
 ('e4000000-0000-4000-8000-000000000003','e2000000-0000-4000-8000-000000000002','purchase','e3000000-0000-4000-8000-000000000001','input','Compra insumo B',300000,'2026-08-18','e1000000-0000-4000-8000-000000000002');

set local role authenticated;
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select is((select auth.uid()),'e1000000-0000-4000-8000-000000000001'::uuid,'fixture exposes authenticated supply subject');
select lives_ok($$select public.record_supply_receipt('e2000000-0000-4000-8000-000000000001','Melaza QA','raw_material','kg',100,'2026-08-18'::date,'Proveedor Insumos QA','e4000000-0000-4000-8000-000000000001','FAC-SUP-1','EVID-SUP-1','Recepción medida')$$,'authorized supervisor can record measured physical receipt');
select is((select count(*) from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),1::bigint,'measured receipt creates exactly one receipt fact');
select is((select count(*) from public.supply_movements where plant_id='e2000000-0000-4000-8000-000000000001' and kind='receipt'),1::bigint,'measured receipt creates exactly one entry movement');
select is((select created_by from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),'e1000000-0000-4000-8000-000000000001'::uuid,'receipt preserves authenticated provenance');
select is((select created_by from public.supply_movements where plant_id='e2000000-0000-4000-8000-000000000001' and kind='receipt'),'e1000000-0000-4000-8000-000000000001'::uuid,'receipt movement preserves authenticated provenance');
select is((select expense_id from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),'e4000000-0000-4000-8000-000000000001'::uuid,'physical receipt preserves optional purchase linkage');
select is((select sum(case when kind in ('receipt','adjustment_in') then quantity else -quantity end) from public.supply_movements where plant_id='e2000000-0000-4000-8000-000000000001'),100::numeric,'physical stock starts from measured receipt quantity');
select lives_ok($$select public.consume_supply('e2000000-0000-4000-8000-000000000001',(select supply_id from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),(select lot_code from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),25,'2026-08-18'::date,'Compostaje',null,'PROC-QA','Consumo medido')$$,'authorized supervisor can consume measured stock');
select is((select count(*) from public.supply_movements where plant_id='e2000000-0000-4000-8000-000000000001' and kind='consumption'),1::bigint,'consumption creates exactly one kardex fact');
select is((select sum(case when kind in ('receipt','adjustment_in') then quantity else -quantity end) from public.supply_movements where plant_id='e2000000-0000-4000-8000-000000000001'),75::numeric,'consumption derives remaining stock without overwriting a balance');
select throws_ok($$select public.consume_supply('e2000000-0000-4000-8000-000000000001',(select supply_id from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),(select lot_code from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),80,'2026-08-18'::date,'Compostaje',null,null,null)$$,'Stock insuficiente en el lote','over-consumption is rejected');
select is((select count(*) from public.supply_movements where plant_id='e2000000-0000-4000-8000-000000000001' and kind='consumption'),1::bigint,'failed over-consumption creates no partial movement');
select throws_ok($$select public.record_supply_receipt('e2000000-0000-4000-8000-000000000001','Empaque inválido','packaging','unidades',10,'2026-08-18'::date,null,'e4000000-0000-4000-8000-000000000002',null,null,null)$$,'Solo una compra real puede enlazarse a recepción física','non-purchase expense cannot masquerade as physical purchase receipt');
select is((select count(*) from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),1::bigint,'rejected non-purchase linkage creates no receipt');
select throws_ok($$select public.record_supply_receipt('e2000000-0000-4000-8000-000000000001','Empaque cruzado','packaging','unidades',10,'2026-08-18'::date,null,'e4000000-0000-4000-8000-000000000003',null,null,null)$$,'La compra/gasto pertenece a otra planta','receipt cannot link a purchase from another plant');
select is((select count(*) from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),1::bigint,'rejected cross-plant purchase linkage creates no receipt');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000002';
select throws_ok($$select public.consume_supply('e2000000-0000-4000-8000-000000000001',(select supply_id from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),(select lot_code from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000001'),1,'2026-08-18'::date,'Uso indebido',null,null,null)$$,'Sin permiso para registrar consumo','second plant cannot consume first-plant stock');
select lives_ok($$select public.record_supply_receipt('e2000000-0000-4000-8000-000000000002','Melaza QA','raw_material','kg',50,'2026-08-18'::date,'Proveedor Insumos QA','e4000000-0000-4000-8000-000000000003',null,null,null)$$,'second plant can record its own measured receipt');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.supply_receipts where plant_id='e2000000-0000-4000-8000-000000000002'),0::bigint,'RLS hides second-plant supply receipts');
reset role;
select is((select count(*) from public.supply_receipts where plant_id in ('e2000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000002')),2::bigint,'all governed physical receipts are stored outside RLS');

select * from finish();
rollback;
