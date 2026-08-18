begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

select has_column('public','maintenance_tickets','repair_activity_id','maintenance ticket exposes canonical repair activity link');
select ok(exists(
  select 1 from pg_constraint c
  where c.conrelid='public.maintenance_tickets'::regclass
    and c.conname='maintenance_tickets_repair_activity_plant_fk'
),'repair activity link has same-plant FK');
select ok(exists(
  select 1 from pg_indexes
  where schemaname='public' and tablename='maintenance_tickets'
    and indexname='maintenance_tickets_repair_activity_uidx'
),'repair activity link is unique when present');
select ok(to_regprocedure('private.insert_maintenance_repair_activity(uuid,uuid[],timestamp with time zone,text,text)') is not null,'private maintenance activity bridge exists');
select ok(not has_function_privilege('authenticated','private.insert_maintenance_repair_activity(uuid,uuid[],timestamp with time zone,text,text)','EXECUTE'),'authenticated cannot execute private maintenance bridge');
select ok(has_function_privilege('authenticated','public.ops_close_equipment_repair_v2(uuid,timestamp with time zone,text,text,uuid[],text[],numeric[],text[],uuid[])','EXECUTE'),'authenticated can execute worker-aware repair close');
select ok(not has_function_privilege('authenticated','public.ops_close_equipment_repair_v2(uuid,timestamp with time zone,text,text,uuid[],text[],numeric[],text[])','EXECUTE'),'legacy repair close overload cannot bypass workers');

insert into auth.users(id,email,created_at,updated_at) values
 ('c1000000-0000-4000-8000-000000000001','mnt-link-tech@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('c2000000-0000-4000-8000-000000000001','MNT-LNK','Maintenance Link QA',true);
insert into public.profiles(id,display_name) values
 ('c1000000-0000-4000-8000-000000000001','Maintenance Link Technician');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('c1000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','maintenance');
insert into public.operational_processes(id,plant_id,code,name,active) values
 ('c3000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','MANTENIMIENTO','Mantenimiento',true);
insert into public.activity_templates(id,plant_id,process_id,code,name,allows_unplanned,active) values
 ('c4000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000001','MANTENIMIENTO_HERRAMIENTAS_EQUIPOS','Mantenimiento de herramientas o equipos',true,true);
insert into public.employees(id,plant_id,code,full_name,active) values
 ('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','MNT-01','Técnico QA',true),
 ('c5000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000001','MNT-02','Auxiliar QA',true);
insert into public.equipment(id,plant_id,code,name,status,area) values
 ('c6000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','MNT-EQ-01','Equipo mantenimiento QA','available','QA');

set local role authenticated;
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';

select lives_ok($$select public.ops_report_equipment_failure_v2(
 'c6000000-0000-4000-8000-000000000001','mechanical',now()-interval '60 minutes','high',
 'Falla enlace','Equipo detenido',array['evidencia://falla'])
$$,'failure can be reported');
select lives_ok($$select public.ops_start_equipment_repair_v2(
 (select id from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000001'),
 now()-interval '45 minutes'
)$$,'repair can start');
select throws_ok($$select public.ops_close_equipment_repair_v2(
 (select id from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000001'),
 now()-interval '10 minutes','Causa','Acción','{}'::uuid[],'{}'::text[],'{}'::numeric[],array['evidencia://repair'],'{}'::uuid[]
)$$,'Selecciona al menos un trabajador para cerrar la reparación.','repair close requires actual workers');

select lives_ok($$select public.ops_close_equipment_repair_v2(
 (select id from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000001'),
 now()-interval '10 minutes','Rodamiento desgastado','Cambio y ajuste','{}'::uuid[],'{}'::text[],'{}'::numeric[],array['evidencia://repair'],array['c5000000-0000-4000-8000-000000000001']::uuid[]
)$$,'repair closes atomically with worker-aware activity');
select is((select status from public.maintenance_tickets where equipment_id='c6000000-0000-4000-8000-000000000001'),'closed'::text,'ticket closes');
select is((select status from public.equipment where id='c6000000-0000-4000-8000-000000000001'),'available'::text,'equipment returns available');
select is((select count(*) from public.activities where plant_id='c2000000-0000-4000-8000-000000000001'),1::bigint,'exactly one canonical repair activity is created');
select is((select count(*) from public.activity_workers aw join public.activities a on a.id=aw.activity_id where a.plant_id='c2000000-0000-4000-8000-000000000001'),1::bigint,'repair worker is canonical in activity_workers');
select is((select a.equipment_id from public.activities a where a.plant_id='c2000000-0000-4000-8000-000000000001'),'c6000000-0000-4000-8000-000000000001'::uuid,'canonical activity links the repaired equipment');
select is((select t.repair_activity_id from public.maintenance_tickets t where t.equipment_id='c6000000-0000-4000-8000-000000000001'),(select a.id from public.activities a where a.plant_id='c2000000-0000-4000-8000-000000000001'),'ticket links exactly that canonical activity');

reset role;
insert into public.equipment(id,plant_id,code,name,status,area) values
 ('c6000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000001','MNT-EQ-02','Equipo overlap QA','maintenance','QA');
insert into public.maintenance_tickets(id,equipment_id,plant_id,severity,failure_type,title,description,status,failed_at,opened_at,repair_started_at,created_by)
values('c7000000-0000-4000-8000-000000000002','c6000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000001','medium','mechanical','Overlap','Overlap','repairing',now()-interval '40 minutes',now()-interval '39 minutes',now()-interval '30 minutes','c1000000-0000-4000-8000-000000000001');
insert into public.activities(id,plant_id,title,process,started_at,ended_at,process_id,source_kind)
values('c8000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','Otra actividad','Mantenimiento',now()-interval '25 minutes',now()-interval '5 minutes','c3000000-0000-4000-8000-000000000001','app');
insert into public.activity_workers(activity_id,employee_id) values
 ('c8000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000002');
set local role authenticated;
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';
select throws_like($$select public.ops_close_equipment_repair_v2(
 'c7000000-0000-4000-8000-000000000002',now(),'Causa','Acción','{}'::uuid[],'{}'::text[],'{}'::numeric[],'{}'::text[],array['c5000000-0000-4000-8000-000000000002']::uuid[]
)$$,'%otra actividad real%','worker overlap blocks maintenance close');
select is((select status from public.maintenance_tickets where id='c7000000-0000-4000-8000-000000000002'),'repairing'::text,'failed close leaves ticket repairing');
select is((select repair_activity_id from public.maintenance_tickets where id='c7000000-0000-4000-8000-000000000002'),null::uuid,'failed close leaves no activity link');

reset role;
select * from finish();
rollback;
