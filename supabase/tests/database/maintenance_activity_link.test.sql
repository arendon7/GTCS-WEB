begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

select has_column('public','maintenance_tickets','repair_activity_id','maintenance ticket stores canonical repair activity link');
select is((select count(*) from pg_constraint where conrelid='public.maintenance_tickets'::regclass and conname='maintenance_tickets_repair_activity_plant_fk'),1::bigint,'repair activity link is constrained to the same plant');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='maintenance_tickets' and indexname='maintenance_tickets_repair_activity_uidx'),1::bigint,'one canonical repair activity can belong to only one ticket');
select ok(not has_function_privilege('authenticated','private.insert_maintenance_repair_activity(uuid,uuid,timestamptz,timestamptz,uuid[],text,text,text)','EXECUTE'),'authenticated cannot bypass maintenance activity bridge');

insert into auth.users(id,email,created_at,updated_at) values
 ('c1000000-0000-4000-8000-000000000001','mnt-link-operator@greenatics.test',now(),now()),
 ('c1000000-0000-4000-8000-000000000002','mnt-link-tech@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('c2000000-0000-4000-8000-000000000001','MNT-LINK','Maintenance Link QA',true);
insert into public.profiles(id,display_name) values
 ('c1000000-0000-4000-8000-000000000001','Link Operator'),
 ('c1000000-0000-4000-8000-000000000002','Link Technician');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('c1000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','operator'),
 ('c1000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000001','maintenance');
insert into public.employees(id,plant_id,display_name,active) values
 ('c3000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','Técnico mantenimiento QA',true);
insert into public.operational_processes(id,plant_id,code,name,active) values
 ('c4000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','MANTENIMIENTO','Mantenimiento',true);
insert into public.activity_templates(id,plant_id,process_id,code,name,allows_unplanned,active) values
 ('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','MANTENIMIENTO_HERRAMIENTAS_EQUIPOS','Mantenimiento de herramientas o equipos',true,true);
insert into public.equipment(id,plant_id,code,name,status,area) values
 ('c6000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','MNT-LINK-01','Equipo vínculo 1','available','QA'),
 ('c6000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000001','MNT-LINK-02','Equipo vínculo 2','available','QA');

set local role authenticated;
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_report_equipment_failure_v2('c6000000-0000-4000-8000-000000000001','mechanical',now()-interval '3 hours','high','Falla vínculo','Equipo detenido',array[]::text[])$$,'operator reports first failure');
select lives_ok($$select public.ops_report_equipment_failure_v2('c6000000-0000-4000-8000-000000000002','electrical',now()-interval '150 minutes','medium','Falla solape','Segundo equipo detenido',array[]::text[])$$,'operator reports second failure');

set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000002';
select lives_ok($$select public.ops_start_equipment_repair_v2((select id from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000001'),now()-interval '2 hours')$$,'maintenance starts first repair');
select lives_ok($$select public.ops_close_equipment_repair_v2(
 (select id from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000001'),
 now()-interval '1 hour','Desgaste','Cambio y prueba',array['c3000000-0000-4000-8000-000000000001'::uuid],
 array[]::uuid[],array[]::text[],array[]::numeric[],array[]::text[]
)$$,'maintenance closes first repair with canonical workers');
select ok((select repair_activity_id is not null from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000001'),'closed repair stores canonical activity id');
select is((select count(*) from public.activities a join public.maintenance_tickets t on t.repair_activity_id=a.id where t.equipment_id='c6000000-0000-4000-8000-000000000001'),1::bigint,'repair creates exactly one canonical activity');
select is((select p.code from public.activities a join public.operational_processes p on p.id=a.process_id join public.maintenance_tickets t on t.repair_activity_id=a.id where t.equipment_id='c6000000-0000-4000-8000-000000000001'),'MANTENIMIENTO'::text,'canonical repair uses maintenance process');
select is((select at.code from public.activities a join public.activity_templates at on at.id=a.activity_template_id join public.maintenance_tickets t on t.repair_activity_id=a.id where t.equipment_id='c6000000-0000-4000-8000-000000000001'),'MANTENIMIENTO_HERRAMIENTAS_EQUIPOS'::text,'canonical repair uses real maintenance template');
select ok((select a.started_at=t.repair_started_at and a.ended_at=t.closed_at from public.activities a join public.maintenance_tickets t on t.repair_activity_id=a.id where t.equipment_id='c6000000-0000-4000-8000-000000000001'),'canonical activity preserves exact repair interval');
select is((select count(*) from public.activity_workers aw join public.maintenance_tickets t on t.repair_activity_id=aw.activity_id where t.equipment_id='c6000000-0000-4000-8000-000000000001' and aw.employee_id='c3000000-0000-4000-8000-000000000001'),1::bigint,'canonical activity carries selected maintenance worker');
select ok((select activity_comment like '%Causa: Desgaste%' and activity_comment like '%Acción: Cambio y prueba%' from public.activities a join public.maintenance_tickets t on t.repair_activity_id=a.id where t.equipment_id='c6000000-0000-4000-8000-000000000001'),'canonical activity carries maintenance cause and action context');

select lives_ok($$select public.ops_start_equipment_repair_v2((select id from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000002'),now()-interval '90 minutes')$$,'maintenance starts second repair');
select throws_like($$select public.ops_close_equipment_repair_v2(
 (select id from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000002'),
 now()-interval '30 minutes','Cable','Ajuste',array['c3000000-0000-4000-8000-000000000001'::uuid],
 array[]::uuid[],array[]::text[],array[]::numeric[],array[]::text[]
)$$,'%ya tienen otra actividad real en ese horario%','overlapping canonical worker blocks maintenance close');
select ok((select status='repairing' and repair_activity_id is null from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000002'),'failed close leaves ticket repairing and unlinked atomically');
select is((select status from public.equipment where id='c6000000-0000-4000-8000-000000000002'),'maintenance'::text,'failed close keeps equipment in maintenance');

reset role;
select * from finish();
rollback;