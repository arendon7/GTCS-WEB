begin;

create extension if not exists pgtap with schema extensions;
select plan(32);

select ok(
  to_regprocedure('public.ops_create_scheduled_activity(uuid,uuid,timestamp with time zone,timestamp with time zone,uuid[],uuid,text)') is not null,
  'canonical schedule creation RPC exists'
);
select ok(
  to_regprocedure('public.ops_revise_scheduled_activity(uuid,uuid,timestamp with time zone,timestamp with time zone,uuid[],uuid,text,text)') is not null,
  'schedule revision RPC exists'
);
select ok(
  to_regprocedure('public.ops_record_schedule_deviation(uuid,text,text)') is not null,
  'schedule deviation RPC exists'
);
select has_column('public','scheduled_activities','planning_note','schedule stores planning notes');
select has_column('public','scheduled_activities','deviation_reason','schedule stores structured deviation reason');
select ok(
  exists (
    select 1 from pg_trigger
    where tgrelid='public.activity_templates'::regclass
      and tgname='activity_template_process_history_guard'
      and not tgisinternal
  ),
  'activity template process history guard is installed'
);

insert into auth.users(id,email,created_at,updated_at)
values
  ('d1000000-0000-4000-8000-000000000001','planning-director@greenatics.test',now(),now()),
  ('d1000000-0000-4000-8000-000000000002','planning-operator@greenatics.test',now(),now());

insert into public.plants(id,code,name,active)
values
  ('d2000000-0000-4000-8000-000000000001','PLAN-A','Planning Plant A',true),
  ('d2000000-0000-4000-8000-000000000002','PLAN-B','Planning Plant B',true);

insert into public.profiles(id,display_name)
values
  ('d1000000-0000-4000-8000-000000000001','Planning Director'),
  ('d1000000-0000-4000-8000-000000000002','Planning Operator');

insert into public.plant_memberships(user_id,plant_id,role)
values
  ('d1000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','director'),
  ('d1000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000001','operator');

insert into public.operational_processes(id,plant_id,code,name)
values
  ('d3000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','COMP','Compostaje'),
  ('d3000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000001','ASEO','Aseo'),
  ('d3000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000002','COMP','Compostaje B');

insert into public.activity_templates(
  id,plant_id,process_id,code,name,default_unit_code,requires_quantity,requires_equipment
) values
  ('d4000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001','VOLTEO','Volteo de pila','kg',true,true),
  ('d4000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000002','d3000000-0000-4000-8000-000000000003','VOLTEO','Volteo B','kg',true,false);

insert into public.employees(id,plant_id,display_name)
values
  ('d5000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','Trabajador A1'),
  ('d5000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000001','Trabajador A2'),
  ('d5000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000002','Trabajador B1');

insert into public.equipment(id,plant_id,code,name,status)
values
  ('d6000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','EQ-A1','Equipo A1','available'),
  ('d6000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000001','EQ-A2','Equipo A2','available'),
  ('d6000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000002','EQ-B1','Equipo B1','available');

insert into public.equipment_processes(equipment_id,process_id,plant_id)
values
  ('d6000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001'),
  ('d6000000-0000-4000-8000-000000000002','d3000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001'),
  ('d6000000-0000-4000-8000-000000000003','d3000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000002');

set local role authenticated;
set local request.jwt.claim.sub = 'd1000000-0000-4000-8000-000000000001';

select lives_ok(
  $$select public.ops_create_scheduled_activity(
    'd2000000-0000-4000-8000-000000000001'::uuid,
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 13:00+00'::timestamptz,
    '2026-09-01 14:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000001'::uuid],
    'd6000000-0000-4000-8000-000000000001'::uuid,
    'Base plan'
  )$$,
  'director creates one canonical schedule transactionally'
);

select is(
  (select process_id from public.scheduled_activities where planning_note='Base plan'),
  'd3000000-0000-4000-8000-000000000001'::uuid,
  'canonical process is derived from the activity template'
);
select is(
  (select title from public.scheduled_activities where planning_note='Base plan'),
  'Volteo de pila'::text,
  'legacy title remains populated from canonical template for compatibility'
);
select is(
  (select count(*) from public.scheduled_activity_workers saw join public.scheduled_activities s on s.id=saw.scheduled_activity_id where s.planning_note='Base plan'),
  1::bigint,
  'planned workers are stored once in the assignment table'
);
select is(
  (select equipment_id from public.scheduled_activities where planning_note='Base plan'),
  'd6000000-0000-4000-8000-000000000001'::uuid,
  'canonical equipment assignment is stored'
);

set local request.jwt.claim.sub = 'd1000000-0000-4000-8000-000000000002';
select throws_ok(
  $$select public.ops_create_scheduled_activity(
    'd2000000-0000-4000-8000-000000000001'::uuid,
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 18:00+00'::timestamptz,
    '2026-09-01 19:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000002'::uuid],
    'd6000000-0000-4000-8000-000000000002'::uuid,
    'Operator attempt'
  )$$,
  'P0001',
  'No tienes permiso para programar actividades en esta planta.',
  'operator cannot create the plant schedule'
);

set local request.jwt.claim.sub = 'd1000000-0000-4000-8000-000000000001';
select throws_ok(
  $$select public.ops_create_scheduled_activity(
    'd2000000-0000-4000-8000-000000000001'::uuid,
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 18:00+00'::timestamptz,
    '2026-09-01 19:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000003'::uuid],
    'd6000000-0000-4000-8000-000000000002'::uuid,
    'Cross plant worker'
  )$$,
  'P0001',
  'Uno o más trabajadores no pertenecen a la planta o están inactivos.',
  'cross-plant worker assignment is rejected'
);
select throws_ok(
  $$select public.ops_create_scheduled_activity(
    'd2000000-0000-4000-8000-000000000001'::uuid,
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 13:30+00'::timestamptz,
    '2026-09-01 14:30+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000001'::uuid],
    'd6000000-0000-4000-8000-000000000002'::uuid,
    'Worker overlap'
  )$$,
  'P0001',
  'Uno o más trabajadores ya tienen otra actividad programada en ese horario.',
  'worker overlap is rejected'
);
select throws_ok(
  $$select public.ops_create_scheduled_activity(
    'd2000000-0000-4000-8000-000000000001'::uuid,
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 13:30+00'::timestamptz,
    '2026-09-01 14:30+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000002'::uuid],
    'd6000000-0000-4000-8000-000000000001'::uuid,
    'Equipment overlap'
  )$$,
  'P0001',
  'El equipo ya está asignado a otra actividad programada en ese horario.',
  'equipment overlap is rejected'
);
select throws_ok(
  $$select public.ops_create_scheduled_activity(
    'd2000000-0000-4000-8000-000000000001'::uuid,
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 17:00+00'::timestamptz,
    '2026-09-01 16:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000002'::uuid],
    'd6000000-0000-4000-8000-000000000002'::uuid,
    'Invalid window'
  )$$,
  'P0001',
  'La hora final programada debe ser posterior al inicio.',
  'invalid planning window is rejected'
);

select lives_ok(
  $$select public.ops_create_scheduled_activity(
    'd2000000-0000-4000-8000-000000000001'::uuid,
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 14:00+00'::timestamptz,
    '2026-09-01 15:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000001'::uuid],
    'd6000000-0000-4000-8000-000000000001'::uuid,
    'Adjacent plan'
  )$$,
  'half-open planning windows allow adjacent reservations'
);

select lives_ok(
  $$select public.ops_revise_scheduled_activity(
    (select id from public.scheduled_activities where planning_note='Base plan'),
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 15:00+00'::timestamptz,
    '2026-09-01 16:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000002'::uuid],
    'd6000000-0000-4000-8000-000000000002'::uuid,
    'Cambio de turno',
    'Revised plan'
  )$$,
  'reprogramming creates a successor instead of overwriting the plan'
);
select is(
  (select status from public.scheduled_activities where planning_note='Base plan'),
  'rescheduled'::text,
  'predecessor is preserved and marked rescheduled'
);
select is(
  (select reschedule_reason from public.scheduled_activities where planning_note='Revised plan'),
  'Cambio de turno'::text,
  'successor stores mandatory revision reason'
);
select is(
  (select saw.employee_id from public.scheduled_activity_workers saw join public.scheduled_activities s on s.id=saw.scheduled_activity_id where s.planning_note='Revised plan'),
  'd5000000-0000-4000-8000-000000000002'::uuid,
  'successor receives its own planned worker assignment'
);
select throws_ok(
  $$select public.ops_revise_scheduled_activity(
    (select id from public.scheduled_activities where planning_note='Base plan'),
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 16:00+00'::timestamptz,
    '2026-09-01 17:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000002'::uuid],
    'd6000000-0000-4000-8000-000000000002'::uuid,
    'Segundo cambio',
    'Should fail'
  )$$,
  'P0001',
  'Solo puedes revisar una actividad pendiente, retrasada u omitida.',
  'an obsolete predecessor cannot be revised again'
);

select lives_ok(
  $$select public.ops_record_schedule_deviation(
    (select id from public.scheduled_activities where planning_note='Adjacent plan'),
    'delayed',
    'Ingreso tardío del vehículo'
  )$$,
  'planner records a structured delay reason'
);
select is(
  (select deviation_reason from public.scheduled_activities where planning_note='Adjacent plan'),
  'Ingreso tardío del vehículo'::text,
  'delay reason remains on the schedule'
);

select lives_ok(
  $$select public.ops_start_scheduled_activity(
    (select id from public.scheduled_activities where planning_note='Revised plan'),
    '{}'::uuid[]
  )$$,
  'starting with an empty worker array uses the planned workers'
);
select is(
  (select a.activity_template_id from public.activities a join public.scheduled_activities s on s.id=a.scheduled_activity_id where s.planning_note='Revised plan'),
  'd4000000-0000-4000-8000-000000000001'::uuid,
  'execution inherits canonical activity template'
);
select is(
  (select a.process_id from public.activities a join public.scheduled_activities s on s.id=a.scheduled_activity_id where s.planning_note='Revised plan'),
  'd3000000-0000-4000-8000-000000000001'::uuid,
  'execution inherits canonical process'
);
select is(
  (select a.equipment_id from public.activities a join public.scheduled_activities s on s.id=a.scheduled_activity_id where s.planning_note='Revised plan'),
  'd6000000-0000-4000-8000-000000000002'::uuid,
  'execution inherits canonical equipment'
);
select is(
  (select aw.employee_id from public.activity_workers aw join public.activities a on a.id=aw.activity_id join public.scheduled_activities s on s.id=a.scheduled_activity_id where s.planning_note='Revised plan'),
  'd5000000-0000-4000-8000-000000000002'::uuid,
  'planned worker becomes the actual worker when no override is supplied'
);
select is(
  (select status from public.scheduled_activities where planning_note='Revised plan'),
  'running'::text,
  'starting the successor advances its own state to running'
);
select throws_ok(
  $$select public.ops_revise_scheduled_activity(
    (select id from public.scheduled_activities where planning_note='Revised plan'),
    'd4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-01 17:00+00'::timestamptz,
    '2026-09-01 18:00+00'::timestamptz,
    array['d5000000-0000-4000-8000-000000000002'::uuid],
    'd6000000-0000-4000-8000-000000000002'::uuid,
    'Cambio tardío',
    'Should not revise running'
  )$$,
  'P0001',
  'Solo puedes revisar una actividad pendiente, retrasada u omitida.',
  'running schedule cannot be rewritten'
);
select throws_ok(
  $$update public.activity_templates
    set process_id='d3000000-0000-4000-8000-000000000002'::uuid
    where id='d4000000-0000-4000-8000-000000000001'::uuid$$,
  'P0001',
  'No puedes cambiar el proceso de una plantilla que ya tiene historia operacional.',
  'used template cannot be moved to a different process'
);

select * from finish();
rollback;
