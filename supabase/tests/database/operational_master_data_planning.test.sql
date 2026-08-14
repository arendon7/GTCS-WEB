begin;

create extension if not exists pgtap with schema extensions;
select plan(26);

select has_table('public','measurement_units','measurement unit master exists');
select has_table('public','operational_processes','operational process master exists');
select has_table('public','activity_templates','activity template master exists');
select has_table('public','material_sources','material source master exists');
select has_table('public','collection_routes','collection route master exists');
select has_table('public','material_types','material type master exists');
select has_table('public','equipment_processes','equipment-process assignment exists');
select has_table('public','scheduled_activity_workers','planned worker assignment exists');

select has_column('public','scheduled_activities','process_id','scheduled activity has canonical process FK');
select has_column('public','scheduled_activities','activity_template_id','scheduled activity has template FK');
select has_column('public','scheduled_activities','equipment_id','scheduled activity has canonical equipment FK');
select has_column('public','scheduled_activities','rescheduled_from_id','scheduled activity supports revision chains');
select has_column('public','activities','process_id','actual activity has canonical process FK');
select has_column('public','activities','activity_template_id','actual activity has template FK');
select has_column('public','activities','equipment_id','actual activity has canonical equipment FK');

select is(
  (select count(*) from public.measurement_units where code in ('kg','t','L','unidades','m3')),
  5::bigint,
  'canonical operational units are seeded'
);

select is(
  (select count(*) from public.operational_processes p join public.plants pl on pl.id=p.plant_id where pl.code='TAM'),
  9::bigint,
  'Támesis receives the initial process taxonomy'
);

select is(
  (select count(*) from public.operational_processes p join public.plants pl on pl.id=p.plant_id where pl.code='YAR'),
  9::bigint,
  'Yarumal receives the initial process taxonomy'
);

select ok((select relrowsecurity from pg_class where oid='public.operational_processes'::regclass),'process master RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.activity_templates'::regclass),'activity template RLS is enabled');

select is(
  (select count(*) from pg_policies where schemaname='public' and tablename in ('operational_processes','activity_templates','material_sources','collection_routes','material_types','equipment_processes','scheduled_activity_workers') and cmd='DELETE'),
  0::bigint,
  'Wave 2A masters expose no direct DELETE policies'
);

insert into auth.users(id,email,created_at,updated_at)
values
  ('c1000000-0000-4000-8000-000000000001','wave2-director@greenatics.test',now(),now()),
  ('c1000000-0000-4000-8000-000000000002','wave2-operator@greenatics.test',now(),now());

insert into public.plants(id,code,name,active)
values
  ('c2000000-0000-4000-8000-000000000001','W2A-TAM','Wave 2A Támesis',true),
  ('c2000000-0000-4000-8000-000000000002','W2A-YAR','Wave 2A Yarumal',true);

insert into public.profiles(id,display_name)
values
  ('c1000000-0000-4000-8000-000000000001','Wave 2 Director'),
  ('c1000000-0000-4000-8000-000000000002','Wave 2 Operator');

insert into public.plant_memberships(user_id,plant_id,role)
values
  ('c1000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','director'),
  ('c1000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','operator');

insert into public.operational_processes(id,plant_id,code,name)
values
  ('c3000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','COMP','Compostaje W2A'),
  ('c3000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','COMP','Compostaje W2A YAR');

insert into public.activity_templates(id,plant_id,process_id,code,name,default_unit_code,requires_quantity)
values
  ('c4000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000001','VOLTEO','Volteo de pila','kg',true);

insert into public.employees(id,plant_id,display_name)
values
  ('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','Trabajador W2A TAM'),
  ('c5000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','Trabajador W2A YAR');

insert into public.equipment(id,plant_id,code,name,status)
values
  ('c6000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','EQ-W2A','Equipo W2A','available');

insert into public.scheduled_activities(
  id,plant_id,title,process,planned_start,planned_end,status,process_id,activity_template_id,equipment_id
) values (
  'c7000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000001',
  'Volteo de pila','Compostaje',
  '2026-08-14T13:00:00Z','2026-08-14T14:00:00Z','planned',
  'c3000000-0000-4000-8000-000000000001',
  'c4000000-0000-4000-8000-000000000001',
  'c6000000-0000-4000-8000-000000000001'
);

insert into public.scheduled_activity_workers(scheduled_activity_id,employee_id,plant_id)
values ('c7000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');

select is(
  (select plant_id from public.scheduled_activity_workers where scheduled_activity_id='c7000000-0000-4000-8000-000000000001'),
  'c2000000-0000-4000-8000-000000000001'::uuid,
  'planned worker assignment is plant-scoped'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conname='scheduled_process_same_plant_fk'
      and conrelid='public.scheduled_activities'::regclass
  ),
  'scheduled process has an explicit same-plant FK'
);

set local role authenticated;
set local request.jwt.claim.sub = 'c1000000-0000-4000-8000-000000000001';

select results_eq(
  $$select code from public.operational_processes where code='COMP' order by code$$,
  $$values ('COMP'::text)$$,
  'director only sees process masters from an authorized plant'
);

select lives_ok(
  $$insert into public.operational_processes(plant_id,code,name)
    values ('c2000000-0000-4000-8000-000000000001'::uuid,'ASEO-CI','Aseo CI')$$,
  'director can create a process master in an authorized plant'
);

set local request.jwt.claim.sub = 'c1000000-0000-4000-8000-000000000002';

select throws_ok(
  $$insert into public.operational_processes(plant_id,code,name)
    values ('c2000000-0000-4000-8000-000000000002'::uuid,'NO-AUT','No autorizado')$$,
  '42501',
  'new row violates row-level security policy for table "operational_processes"',
  'operator cannot administer process masters'
);

select results_eq(
  $$select code from public.operational_processes where code='COMP' order by code$$,
  $$values ('COMP'::text)$$,
  'operator sees only process masters from their own plant'
);

select * from finish();
rollback;
