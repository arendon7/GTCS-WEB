begin;
create extension if not exists pgtap with schema extensions;
select plan(40);

select ok(
  to_regprocedure('public.record_sale_collection(uuid,numeric,date,text,text,text)') is not null,
  'governed sale-collection RPC exists'
);
select ok(
  to_regprocedure('public.record_expense_payment(uuid,numeric,date,text,text,text)') is not null,
  'governed expense-payment RPC exists'
);
select ok(has_function_privilege('authenticated','public.record_sale_collection(uuid,numeric,date,text,text,text)','EXECUTE'),'authenticated can execute sale-collection RPC');
select ok(has_function_privilege('authenticated','public.record_expense_payment(uuid,numeric,date,text,text,text)','EXECUTE'),'authenticated can execute expense-payment RPC');
select ok(has_table_privilege('authenticated','public.financial_settlements','SELECT'),'authenticated retains settlement read access through RLS');
select ok(not has_table_privilege('authenticated','public.financial_settlements','INSERT'),'authenticated cannot insert settlements directly');
select ok(not has_table_privilege('authenticated','public.financial_settlements','UPDATE'),'authenticated cannot update settlements directly');
select ok(not has_table_privilege('authenticated','public.financial_settlements','DELETE'),'authenticated cannot delete settlements directly');
select is((select count(*) from pg_policies where schemaname='public' and tablename='financial_settlements' and lower(cmd)='insert'),0::bigint,'settlement ledger has no direct INSERT policy');
select is((select count(*) from pg_policies where schemaname='public' and tablename='financial_settlements' and lower(cmd)='update'),0::bigint,'settlement ledger has no direct UPDATE policy');
select is((select count(*) from pg_policies where schemaname='public' and tablename='financial_settlements' and lower(cmd)='delete'),0::bigint,'settlement ledger has no direct DELETE policy');

insert into auth.users(id,email,created_at,updated_at) values
 ('d1000000-0000-4000-8000-000000000001','cash-supervisor-a@greenatics.test',now(),now()),
 ('d1000000-0000-4000-8000-000000000002','cash-supervisor-b@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('d2000000-0000-4000-8000-000000000001','CASH-A','Cash Plant A',true),
 ('d2000000-0000-4000-8000-000000000002','CASH-B','Cash Plant B',true);
insert into public.profiles(id,display_name) values
 ('d1000000-0000-4000-8000-000000000001','Cash Supervisor A'),
 ('d1000000-0000-4000-8000-000000000002','Cash Supervisor B');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('d1000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','supervisor'),
 ('d1000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000002','supervisor');

insert into public.inventory_products(id,name,unit) values
 ('d3000000-0000-4000-8000-000000000001','Producto Caja QA','kg');
insert into public.production_records(id,plant_id,product_id,quantity,lot_code,source_process,completed_at,created_by) values
 ('d3100000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001',100,'CASH-A-LOT','Caja QA','2026-08-18T08:00:00-05:00','d1000000-0000-4000-8000-000000000001'),
 ('d3100000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000002','d3000000-0000-4000-8000-000000000001',100,'CASH-B-LOT','Caja QA','2026-08-18T08:00:00-05:00','d1000000-0000-4000-8000-000000000002');
insert into public.customers(id,name,created_by) values
 ('d4000000-0000-4000-8000-000000000001','Cliente Caja A','d1000000-0000-4000-8000-000000000001'),
 ('d4000000-0000-4000-8000-000000000002','Cliente Caja B','d1000000-0000-4000-8000-000000000002');
insert into public.sales(id,plant_id,customer_id,product_id,lot_code,quantity,unit_price_cop,sold_at,created_by) values
 ('d5000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','d4000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001','CASH-A-LOT',50,2000,'2026-08-18T09:00:00-05:00','d1000000-0000-4000-8000-000000000001'),
 ('d5000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000002','d4000000-0000-4000-8000-000000000002','d3000000-0000-4000-8000-000000000001','CASH-B-LOT',25,2000,'2026-08-18T09:00:00-05:00','d1000000-0000-4000-8000-000000000002');
insert into public.suppliers(id,name,created_by) values
 ('d6000000-0000-4000-8000-000000000001','Proveedor Caja A','d1000000-0000-4000-8000-000000000001'),
 ('d6000000-0000-4000-8000-000000000002','Proveedor Caja B','d1000000-0000-4000-8000-000000000002');
insert into public.operational_expenses(id,plant_id,record_type,supplier_id,category,concept,amount_cop,document_date,created_by) values
 ('d7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','expense','d6000000-0000-4000-8000-000000000001','services','Servicio Caja A',80000,'2026-08-18','d1000000-0000-4000-8000-000000000001'),
 ('d7000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000002','expense','d6000000-0000-4000-8000-000000000002','services','Servicio Caja B',60000,'2026-08-18','d1000000-0000-4000-8000-000000000002');

set local role authenticated;
set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';

select is((select auth.uid()),'d1000000-0000-4000-8000-000000000001'::uuid,'fixture exposes authenticated cash subject');
select lives_ok($$select public.record_sale_collection('d5000000-0000-4000-8000-000000000001',40000,'2026-08-18'::date,'transfer','REC-A-1','Recaudo parcial')$$,'authorized supervisor can register a partial collection');
select lives_ok($$select public.record_expense_payment('d7000000-0000-4000-8000-000000000001',30000,'2026-08-18'::date,'transfer','PAG-A-1','Pago parcial')$$,'authorized supervisor can register a partial payment');
select is((select count(*) from public.financial_settlements where sale_id='d5000000-0000-4000-8000-000000000001'),1::bigint,'partial collection creates exactly one cash fact');
select is((select count(*) from public.financial_settlements where expense_id='d7000000-0000-4000-8000-000000000001'),1::bigint,'partial payment creates exactly one cash fact');
select is((select created_by from public.financial_settlements where sale_id='d5000000-0000-4000-8000-000000000001'),'d1000000-0000-4000-8000-000000000001'::uuid,'collection preserves authenticated provenance');
select is((select created_by from public.financial_settlements where expense_id='d7000000-0000-4000-8000-000000000001'),'d1000000-0000-4000-8000-000000000001'::uuid,'payment preserves authenticated provenance');
select is((select plant_id from public.financial_settlements where sale_id='d5000000-0000-4000-8000-000000000001'),'d2000000-0000-4000-8000-000000000001'::uuid,'collection inherits the source sale plant');
select is((select plant_id from public.financial_settlements where expense_id='d7000000-0000-4000-8000-000000000001'),'d2000000-0000-4000-8000-000000000001'::uuid,'payment inherits the source expense plant');
select is((select total_cop from public.sales where id='d5000000-0000-4000-8000-000000000001'),100000::numeric,'collection does not mutate source sale value');
select is((select amount_cop from public.operational_expenses where id='d7000000-0000-4000-8000-000000000001'),80000::numeric,'payment does not mutate source expense value');

select throws_ok($$select public.record_sale_collection('d5000000-0000-4000-8000-000000000001',70000,'2026-08-18'::date,'cash',null,null)$$,'El recaudo excede el saldo pendiente','over-collection is rejected');
select is((select count(*) from public.financial_settlements where sale_id='d5000000-0000-4000-8000-000000000001'),1::bigint,'failed over-collection creates no partial cash fact');
select throws_ok($$select public.record_expense_payment('d7000000-0000-4000-8000-000000000001',60000,'2026-08-18'::date,'cash',null,null)$$,'El pago excede el saldo pendiente','over-payment is rejected');
select is((select count(*) from public.financial_settlements where expense_id='d7000000-0000-4000-8000-000000000001'),1::bigint,'failed over-payment creates no partial cash fact');

select lives_ok($$select public.record_sale_collection('d5000000-0000-4000-8000-000000000001',60000,'2026-08-18'::date,'card','REC-A-2',null)$$,'remaining sale balance can be collected exactly');
select is((select sum(amount_cop) from public.financial_settlements where sale_id='d5000000-0000-4000-8000-000000000001'),100000::numeric,'collections sum exactly to source sale total');
select lives_ok($$select public.record_expense_payment('d7000000-0000-4000-8000-000000000001',50000,'2026-08-18'::date,'card','PAG-A-2',null)$$,'remaining expense balance can be paid exactly');
select is((select sum(amount_cop) from public.financial_settlements where expense_id='d7000000-0000-4000-8000-000000000001'),80000::numeric,'payments sum exactly to source expense total');
select throws_ok($$select public.record_sale_collection('d5000000-0000-4000-8000-000000000001',1,'2026-08-18'::date,'cash',null,null)$$,'La venta ya está saldada','fully collected sale rejects any further collection');
select throws_ok($$select public.record_expense_payment('d7000000-0000-4000-8000-000000000001',1,'2026-08-18'::date,'cash',null,null)$$,'La compra/gasto ya está saldada','fully paid expense rejects any further payment');
select throws_ok($$select public.record_sale_collection('d5000000-0000-4000-8000-000000000002',10000,'2026-08-18'::date,'cash',null,null)$$,'Sin permiso para registrar recaudo','collection cannot target another plant sale');
select throws_ok($$select public.record_expense_payment('d7000000-0000-4000-8000-000000000002',10000,'2026-08-18'::date,'cash',null,null)$$,'Sin permiso para registrar pago','payment cannot target another plant expense');

set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000002';
select lives_ok($$select public.record_sale_collection('d5000000-0000-4000-8000-000000000002',10000,'2026-08-18'::date,'cash','REC-B-1',null)$$,'second plant can record its own governed collection');

set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.financial_settlements where plant_id in ('d2000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000002')),4::bigint,'RLS exposes only first-plant settlements to first supervisor');
select is((select count(*) from public.financial_settlements where plant_id='d2000000-0000-4000-8000-000000000002'),0::bigint,'RLS hides second-plant cash facts');

reset role;
select is((select count(*) from public.financial_settlements where plant_id in ('d2000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000002')),5::bigint,'all governed cash facts are physically stored outside RLS');
select is((select count(*) from public.financial_settlements where kind='collection' and sale_id is not null and expense_id is null),3::bigint,'collection facts preserve exclusive sale linkage');
select is((select count(*) from public.financial_settlements where kind='payment' and expense_id is not null and sale_id is null),2::bigint,'payment facts preserve exclusive expense linkage');

select * from finish();
rollback;
