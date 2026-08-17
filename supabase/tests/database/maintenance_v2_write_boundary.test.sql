begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

select ok(has_table_privilege('authenticated','public.maintenance_tickets','SELECT'),'authenticated retains maintenance ticket read access');
select ok(not has_table_privilege('authenticated','public.maintenance_tickets','INSERT'),'authenticated cannot insert maintenance tickets directly');
select ok(not has_table_privilege('authenticated','public.maintenance_tickets','UPDATE'),'authenticated cannot update maintenance tickets directly');
select ok(not has_table_privilege('authenticated','public.maintenance_tickets','DELETE'),'authenticated cannot delete maintenance tickets directly');
select is((select count(*) from pg_policies where schemaname='public' and tablename='maintenance_tickets' and policyname='maintenance_operator_insert'),0::bigint,'legacy direct insert policy is removed');
select is((select count(*) from pg_policies where schemaname='public' and tablename='maintenance_tickets' and policyname='maintenance_repair_update'),0::bigint,'legacy direct update policy is removed');

insert into auth.users(id,email,created_at,updated_at) values
 ('b1000000-0000-4000-8000-000000000001','mnt-boundary-operator@greenatics.test',now(),now()),
 ('b1000000-0000-4000-8000-000000000002','mnt-boundary-tech@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('b2000000-0000-4000-8000-000000000001','MNT-BND','Maintenance Boundary QA',true);
insert into public.profiles(id,display_name) values
 ('b1000000-0000-4000-8000-000000000001','Boundary Operator'),
 ('b1000000-0000-4000-8000-000000000002','Boundary Technician');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('b1000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001','operator'),
 ('b1000000-0000-4000-8000-000000000002','b2000000-0000-4000-8000-000000000001','maintenance');
insert into public.equipment(id,plant_id,code,name,status,area) values
 ('b3000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001','BND-01','Equipo Boundary','available','QA');

set local role authenticated;
set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_report_equipment_failure_v2(
 'b3000000-0000-4000-8000-000000000001','mechanical',now()-interval '20 minutes','medium',
 'Falla boundary','Falla registrada por RPC',array['evidencia://boundary-falla'])
)$$,'operator can still report a failure through the guarded RPC');
select is((select status from public.equipment where id='b3000000-0000-4000-8000-000000000001'),'stopped'::text,'RPC report still applies the atomic equipment transition');

set local request.jwt.claim.sub='b1000000-0000-4000-8000-000000000002';
select lives_ok($$select public.ops_start_equipment_repair_v2(
 (select id from public.maintenance_tickets where equipment_id='b3000000-0000-4000-8000-000000000001'),
 now()-interval '10 minutes'
)$$,'maintenance role can still start repair through the guarded RPC');

reset role;
select * from finish();
rollback;
