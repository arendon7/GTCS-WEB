begin;

create extension if not exists pgtap with schema extensions;
select plan(7);

select is(
  (select count(*) from pg_policies where schemaname='public' and tablename='scheduled_activities' and cmd='INSERT'),
  0::bigint,
  'scheduled activities expose no direct authenticated INSERT policy'
);
select is(
  (select count(*) from pg_policies where schemaname='public' and tablename='scheduled_activities' and cmd='UPDATE'),
  0::bigint,
  'scheduled activities expose no direct authenticated UPDATE policy'
);
select is(
  (select count(*) from pg_policies where schemaname='public' and tablename='scheduled_activity_workers' and cmd='INSERT'),
  0::bigint,
  'planned workers expose no direct authenticated INSERT policy'
);

insert into auth.users(id,email,created_at,updated_at)
values ('e1000000-0000-4000-8000-000000000001','boundary-director@greenatics.test',now(),now());
insert into public.plants(id,code,name,active)
values ('e2000000-0000-4000-8000-000000000001','BOUNDARY','Boundary Plant',true);
insert into public.profiles(id,display_name)
values ('e1000000-0000-4000-8000-000000000001','Boundary Director');
insert into public.plant_memberships(user_id,plant_id,role)
values ('e1000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','director');
insert into public.operational_processes(id,plant_id,code,name)
values ('e3000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','ASEO','Aseo');
insert into public.activity_templates(id,plant_id,process_id,code,name,requires_equipment)
values ('e4000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','e3000000-0000-4000-8000-000000000001','ASEO_GENERAL','Aseo general',false);
insert into public.employees(id,plant_id,display_name)
values ('e5000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','Operario Boundary');

set local role authenticated;
set local request.jwt.claim.sub = 'e1000000-0000-4000-8000-000000000001';

select throws_ok(
  $$insert into public.scheduled_activities(plant_id,title,process,planned_start,planned_end,status,process_id,activity_template_id)
    values (
      'e2000000-0000-4000-8000-000000000001'::uuid,'Direct bypass','Aseo',
      '2026-09-02 13:00+00'::timestamptz,'2026-09-02 14:00+00'::timestamptz,'planned',
      'e3000000-0000-4000-8000-000000000001'::uuid,'e4000000-0000-4000-8000-000000000001'::uuid
    )$$,
  '42501',
  'new row violates row-level security policy for table "scheduled_activities"',
  'planner cannot bypass the planning RPC with a direct insert'
);

select lives_ok(
  $$select public.ops_create_scheduled_activity(
    'e2000000-0000-4000-8000-000000000001'::uuid,
    'e4000000-0000-4000-8000-000000000001'::uuid,
    '2026-09-02 13:00+00'::timestamptz,
    '2026-09-02 14:00+00'::timestamptz,
    array['e5000000-0000-4000-8000-000000000001'::uuid],
    null,
    'Canonical RPC'
  )$$,
  'planner can still create schedules through the canonical RPC'
);

select is_empty(
  $$update public.scheduled_activities
    set planned_start='2026-09-02 15:00+00'::timestamptz,
        planned_end='2026-09-02 16:00+00'::timestamptz
    where planning_note='Canonical RPC'
    returning id$$,
  'planner direct UPDATE sees no mutable schedule rows'
);

select is(
  (select planned_start from public.scheduled_activities where planning_note='Canonical RPC'),
  '2026-09-02 13:00+00'::timestamptz,
  'canonical schedule remains unchanged after a direct update attempt'
);

select * from finish();
rollback;
