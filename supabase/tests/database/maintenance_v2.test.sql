begin;
create extension if not exists pgtap with schema extensions;
select plan(38);

select has_column('public','maintenance_tickets','failure_type','maintenance stores structured failure type');
select has_column('public','maintenance_tickets','failed_at','maintenance stores actual failure occurrence time');
select has_table('public','maintenance_ticket_evidence','maintenance evidence table exists');
select ok((select relrowsecurity from pg_class where oid='public.maintenance_ticket_evidence'::regclass),'maintenance evidence uses RLS');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_report_equipment_failure_v2'),1::bigint,'failure report RPC exists');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_start_equipment_repair_v2'),1::bigint,'repair start RPC exists');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_close_equipment_repair_v2'),1::bigint,'repair close RPC exists');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_equipment_maintenance_metrics'),1::bigint,'maintenance metrics RPC exists');
select ok(not has_table_privilege('authenticated','public.maintenance_ticket_evidence','INSERT'),'authenticated cannot insert evidence directly');

insert into auth.users(id,email,created_at,updated_at) values
 ('a1000000-0000-4000-8000-000000000001','mnt-operator@greenatics.test',now(),now()),
 ('a1000000-0000-4000-8000-000000000002','mnt-maintenance@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values ('a2000000-0000-4000-8000-000000000001','MNT-QA','Maintenance QA Plant',true);
insert into public.profiles(id,display_name) values
 ('a1000000-0000-4000-8000-000000000001','Maintenance QA Operator'),
 ('a1000000-0000-4000-8000-000000000002','Maintenance QA Technician');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','operator'),
 ('a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000001','maintenance');
insert into public.equipment(id,plant_id,code,name,status,area) values
 ('a3000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','MNT-01','Equipo QA','available','Proceso QA'),
 ('a3000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000001','MNT-02','Equipo sin programación','available','Proceso QA');
insert into public.scheduled_activities(id,plant_id,title,planned_start,planned_end,status,equipment_id) values
 ('a4000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','Uso programado QA',now()-interval '4 hours',now(),'planned','a3000000-0000-4000-8000-000000000001');
insert into public.supplies(id,name,category,unit,active) values
 ('a5000000-0000-4000-8000-000000000001','Rodamiento QA','spare_part','unidades',true);
insert into public.supply_movements(id,plant_id,supply_id,lot_code,kind,quantity,occurred_on,destination,recorded_at) values
 ('a6000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a5000000-0000-4000-8000-000000000001','LOT-MNT-QA','receipt',5,current_date,'Bodega QA',now());

set local role authenticated;
set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_report_equipment_failure_v2('a3000000-0000-4000-8000-000000000001','mechanical',now()-interval '3 hours','high','Rodamiento bloqueado','Equipo detenido por bloqueo',array['evidencia://falla-qa'])$$,'operator can report a structured failure');
select is((select status from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),'open'::text,'new failure ticket is open');
select is((select failure_type from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),'mechanical'::text,'failure type is persisted');
select is((select status from public.equipment where id='a3000000-0000-4000-8000-000000000001'),'stopped'::text,'report atomically stops equipment');
select is((select count(*) from public.maintenance_ticket_evidence where plant_id='a2000000-0000-4000-8000-000000000001' and stage='failure'),1::bigint,'failure evidence is persisted');
select throws_like($$select public.ops_report_equipment_failure_v2('a3000000-0000-4000-8000-000000000001','electrical',now()-interval '1 hour','medium','Segundo reporte','No debe abrirse',array[]::text[])$$,'%ya tiene una falla activa%','second active failure is rejected');
select throws_like($$select public.ops_start_equipment_repair_v2((select id from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),now()-interval '2 hours')$$,'%No tienes permiso para iniciar reparaciones%','operator cannot start repair');

set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000002';
select lives_ok($$select public.ops_start_equipment_repair_v2((select id from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),now()-interval '2 hours')$$,'maintenance role can start repair');
select is((select status from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),'repairing'::text,'ticket moves to repairing');
select is((select status from public.equipment where id='a3000000-0000-4000-8000-000000000001'),'maintenance'::text,'equipment moves to maintenance');
select throws_like($$select public.ops_close_equipment_repair_v2((select id from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),now()-interval '1 hour','Rodamiento fatigado','Cambio de rodamiento',array['a5000000-0000-4000-8000-000000000001'::uuid],array['LOT-MNT-QA'],array[6::numeric],array[]::text[])$$,'%Stock insuficiente%','close rolls back when spare stock is insufficient');
select is((select coalesce(sum(case when kind in ('receipt','adjustment_in') then quantity else -quantity end),0) from public.supply_movements where supply_id='a5000000-0000-4000-8000-000000000001' and lot_code='LOT-MNT-QA'),5::numeric,'failed close does not consume physical stock');
select lives_ok($$select public.ops_close_equipment_repair_v2((select id from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),now()-interval '1 hour','Rodamiento fatigado','Cambio de rodamiento y prueba funcional',array['a5000000-0000-4000-8000-000000000001'::uuid],array['LOT-MNT-QA'],array[2::numeric],array['evidencia://reparacion-qa'])$$,'repair closes atomically with physical spare consumption');
select is((select status from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),'closed'::text,'ticket closes after repair');
select is((select cause from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001'),'Rodamiento fatigado'::text,'root cause is persisted');
select is((select status from public.equipment where id='a3000000-0000-4000-8000-000000000001'),'available'::text,'closed repair returns equipment to available');
select is((select count(*) from public.supply_movements where reference_id=(select id from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001') and kind='consumption'),1::bigint,'spare consumption is linked to maintenance ticket');
select is((select coalesce(sum(case when kind in ('receipt','adjustment_in') then quantity else -quantity end),0) from public.supply_movements where supply_id='a5000000-0000-4000-8000-000000000001' and lot_code='LOT-MNT-QA'),3::numeric,'repair consumption decrements physical stock only');
select is((select count(*) from public.maintenance_ticket_evidence where plant_id='a2000000-0000-4000-8000-000000000001' and stage='repair'),1::bigint,'repair evidence is persisted');

select is((select planned_hours from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000001',now()-interval '4 hours',now())),4.00::numeric,'metrics derive four scheduled hours');
select is((select downtime_hours from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000001',now()-interval '4 hours',now())),2.00::numeric,'downtime derives from actual failure through closure');
select is((select unavailable_scheduled_hours from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000001',now()-interval '4 hours',now())),2.00::numeric,'scheduled unavailable time is derived from overlap');
select is((select availability_pct from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000001',now()-interval '4 hours',now())),50.00::numeric,'mechanical availability uses planned-hours denominator');
select is((select failure_count from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000001',now()-interval '4 hours',now())),1::bigint,'metrics count failures');
select is((select mttr_hours from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000001',now()-interval '4 hours',now())),1.00::numeric,'MTTR derives from repair start and close');
select ok((select availability_pct is null from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000002',now()-interval '4 hours',now())),'equipment without schedule has no invented availability percentage');
select is((select planned_hours from public.ops_equipment_maintenance_metrics('a3000000-0000-4000-8000-000000000002',now()-interval '4 hours',now())),0.00::numeric,'equipment without schedule reports zero planned hours');
select throws_like($$select public.ops_report_equipment_failure_v2('a3000000-0000-4000-8000-000000000002','unknown',now(),'low','QA','QA',array[]::text[])$$,'%Tipo de falla inválido%','invalid failure type is rejected');
select throws_like($$select public.ops_report_equipment_failure_v2('a3000000-0000-4000-8000-000000000002','other',now()+interval '1 hour','low','QA','QA',array[]::text[])$$,'%no puede estar en el futuro%','future failure time is rejected');
select is((select count(*) from public.maintenance_ticket_evidence where ticket_id=(select id from public.maintenance_tickets where equipment_id='a3000000-0000-4000-8000-000000000001')),2::bigint,'ticket consolidates failure and repair evidence');

reset role;
select * from finish();
rollback;
