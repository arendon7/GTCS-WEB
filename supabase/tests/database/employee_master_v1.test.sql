begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

select has_column('public','employees','code','worker master has stable code');
select has_column('public','employees','provisional','worker master identifies provisional seed records');
select has_column('public','employees','updated_at','worker master records updates');
select is((select count(*) from public.employees e join public.plants p on p.id=e.plant_id where p.code='TAM' and e.code like 'TAM_OP_%'),3::bigint,'Támesis receives three neutral initial workers');
select is((select count(*) from public.employees e join public.plants p on p.id=e.plant_id where p.code='YAR' and e.code like 'YAR_OP_%'),3::bigint,'Yarumal receives three neutral initial workers');
select is((select count(*) from public.employees e join public.plants p on p.id=e.plant_id where p.code in ('TAM','YAR') and e.provisional),6::bigint,'all six initial workers are explicitly provisional');
select is((select count(*) from pg_policies where schemaname='public' and tablename='employees' and cmd in ('INSERT','UPDATE','DELETE')),0::bigint,'employee writes have no direct RLS policies');
select ok(not has_table_privilege('authenticated','public.employees','INSERT'),'authenticated cannot insert employees directly');
select ok(not has_table_privilege('authenticated','public.employees','UPDATE'),'authenticated cannot update employees directly');
select ok(not has_table_privilege('authenticated','public.employees','DELETE'),'authenticated cannot delete employees directly');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_admin_create_employee'),1::bigint,'worker create RPC exists');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_admin_update_employee'),1::bigint,'worker update RPC exists');

insert into auth.users(id,email,created_at,updated_at) values
 ('e1000000-0000-4000-8000-000000000001','worker-admin@greenatics.test',now(),now()),
 ('e1000000-0000-4000-8000-000000000002','worker-operator@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values ('e2000000-0000-4000-8000-000000000001','WKR-TAM','Worker QA Plant',true);
insert into public.profiles(id,display_name) values
 ('e1000000-0000-4000-8000-000000000001','Worker Admin'),
 ('e1000000-0000-4000-8000-000000000002','Worker Operator');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('e1000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','admin'),
 ('e1000000-0000-4000-8000-000000000002','e2000000-0000-4000-8000-000000000001','operator');

set local role authenticated;
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_admin_create_employee('e2000000-0000-4000-8000-000000000001'::uuid,'wkr 01','Trabajador QA')$$,'admin can create a plant worker');
select is((select code from public.employees where plant_id='e2000000-0000-4000-8000-000000000001' and display_name='Trabajador QA'),'WKR_01'::text,'worker code is normalized canonically');
select is((select provisional from public.employees where plant_id='e2000000-0000-4000-8000-000000000001' and code='WKR_01'),false,'admin-created workers are confirmed, not provisional');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000002';
select throws_like($$select public.ops_admin_create_employee('e2000000-0000-4000-8000-000000000001'::uuid,'WKR_02','No autorizado')$$,'%Solo un administrador o director puede crear trabajadores%','operator cannot create workers');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_admin_update_employee((select id from public.employees where plant_id='e2000000-0000-4000-8000-000000000001' and code='WKR_01'),'WKR_01','Trabajador QA actualizado',false)$$,'admin can rename and retire a worker without assignments');
select is((select display_name from public.employees where plant_id='e2000000-0000-4000-8000-000000000001' and code='WKR_01'),'Trabajador QA actualizado'::text,'worker rename is persisted');
select is((select active from public.employees where plant_id='e2000000-0000-4000-8000-000000000001' and code='WKR_01'),false,'retiring a worker deactivates rather than deletes it');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000002';
select throws_like($$select public.ops_admin_update_employee((select id from public.employees where plant_id='e2000000-0000-4000-8000-000000000001' and code='WKR_01'),'WKR_01','Intento operador',true)$$,'%Solo un administrador o director puede modificar trabajadores%','operator cannot reactivate or edit workers');
reset role;
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_admin_delete_employee'),0::bigint,'worker master intentionally exposes no hard-delete RPC');

select * from finish();
rollback;
