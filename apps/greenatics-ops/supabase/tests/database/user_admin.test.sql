begin;

create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users(id,email,created_at,updated_at)
values
  ('aaaaaaaa-0000-4000-8000-000000000001','director-admin-test@greenatics.test',now(),now()),
  ('aaaaaaaa-0000-4000-8000-000000000002','admin-admin-test@greenatics.test',now(),now()),
  ('aaaaaaaa-0000-4000-8000-000000000003','target-admin-test@greenatics.test',now(),now()),
  ('aaaaaaaa-0000-4000-8000-000000000004','outsider-admin-test@greenatics.test',now(),now());

insert into public.plants(id,code,name,active)
values
  ('bbbbbbbb-0000-4000-8000-000000000001','ADM-TAM','Admin Test Támesis',true),
  ('bbbbbbbb-0000-4000-8000-000000000002','ADM-YAR','Admin Test Yarumal',true);

insert into public.profiles(id,display_name)
values
  ('aaaaaaaa-0000-4000-8000-000000000001','Director Test'),
  ('aaaaaaaa-0000-4000-8000-000000000002','Admin Test'),
  ('aaaaaaaa-0000-4000-8000-000000000003','Target Test'),
  ('aaaaaaaa-0000-4000-8000-000000000004','Outsider Test');

insert into public.plant_memberships(user_id,plant_id,role,active)
values
  ('aaaaaaaa-0000-4000-8000-000000000001','bbbbbbbb-0000-4000-8000-000000000001','director',true),
  ('aaaaaaaa-0000-4000-8000-000000000002','bbbbbbbb-0000-4000-8000-000000000001','admin',true),
  ('aaaaaaaa-0000-4000-8000-000000000004','bbbbbbbb-0000-4000-8000-000000000002','operator',true);

set local role authenticated;
set local request.jwt.claim.sub='aaaaaaaa-0000-4000-8000-000000000001';

select lives_ok(
  $$select public.admin_set_user_memberships(
    'aaaaaaaa-0000-4000-8000-000000000003'::uuid,
    'Target Updated',
    '[{"plantId":"bbbbbbbb-0000-4000-8000-000000000001","role":"supervisor","active":true}]'::jsonb
  )$$,
  'director can assign a membership in a managed plant'
);

select is(
  (select role from public.plant_memberships where user_id='aaaaaaaa-0000-4000-8000-000000000003'::uuid and plant_id='bbbbbbbb-0000-4000-8000-000000000001'::uuid),
  'supervisor'::text,
  'membership role is persisted'
);

select is(
  (select display_name from public.admin_memberships_for_managed_plants()
   where user_id='aaaaaaaa-0000-4000-8000-000000000003'::uuid
     and plant_id='bbbbbbbb-0000-4000-8000-000000000001'::uuid),
  'Target Updated'::text,
  'profile display name is persisted atomically and exposed through the authorized admin RPC'
);

select lives_ok(
  $$select public.admin_set_user_memberships(
    'aaaaaaaa-0000-4000-8000-000000000003'::uuid,
    'Target Updated',
    '[{"plantId":"bbbbbbbb-0000-4000-8000-000000000001","role":"director","active":true}]'::jsonb
  )$$,
  'director can assign another director in their plant'
);

set local request.jwt.claim.sub='aaaaaaaa-0000-4000-8000-000000000002';

select throws_ok(
  $$select public.admin_set_user_memberships(
    'aaaaaaaa-0000-4000-8000-000000000003'::uuid,
    'Target Updated',
    '[{"plantId":"bbbbbbbb-0000-4000-8000-000000000001","role":"director","active":true}]'::jsonb
  )$$,
  'P0001',
  'Solo un director puede asignar el rol director.',
  'admin cannot escalate another user to director'
);

select throws_ok(
  $$select public.admin_set_user_memberships(
    'aaaaaaaa-0000-4000-8000-000000000003'::uuid,
    'Target Updated',
    '[{"plantId":"bbbbbbbb-0000-4000-8000-000000000002","role":"operator","active":true}]'::jsonb
  )$$,
  'P0001',
  'No tienes permiso para administrar una de las plantas solicitadas.',
  'manager cannot assign access to an unmanaged plant'
);

select throws_ok(
  $$select public.admin_set_user_memberships(
    'aaaaaaaa-0000-4000-8000-000000000003'::uuid,
    'Target Updated',
    '[{"plantId":"bbbbbbbb-0000-4000-8000-000000000001","role":"operator"},{"plantId":"bbbbbbbb-0000-4000-8000-000000000001","role":"operator"}]'::jsonb
  )$$,
  'P0001',
  'Una planta no puede aparecer dos veces.',
  'RPC rejects duplicate plant assignments'
);

set local request.jwt.claim.sub='aaaaaaaa-0000-4000-8000-000000000004';
select is(
  (select count(*) from public.admin_memberships_for_managed_plants()),
  0::bigint,
  'non-manager cannot enumerate managed memberships'
);

select * from finish();
rollback;
