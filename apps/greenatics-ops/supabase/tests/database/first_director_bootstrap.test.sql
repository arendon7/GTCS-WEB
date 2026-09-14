begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

select ok(has_function_privilege('service_role', 'public.admin_bootstrap_first_director(uuid,text,text[])', 'EXECUTE'), 'service role can execute bootstrap');
select ok(not has_function_privilege('authenticated', 'public.admin_bootstrap_first_director(uuid,text,text[])', 'EXECUTE'), 'authenticated cannot execute bootstrap');
select ok(not has_function_privilege('anon', 'public.admin_bootstrap_first_director(uuid,text,text[])', 'EXECUTE'), 'anon cannot execute bootstrap');

insert into auth.users(id,email,created_at,updated_at)
values
  ('cccccccc-0000-4000-8000-000000000001','first@example.invalid',now(),now()),
  ('cccccccc-0000-4000-8000-000000000002','second@example.invalid',now(),now());

insert into public.plants(id,code,name,active)
values
  ('dddddddd-0000-4000-8000-000000000001','BOOT-A','Bootstrap Plant A',true),
  ('dddddddd-0000-4000-8000-000000000002','BOOT-B','Bootstrap Plant B',true);

set local role service_role;

select throws_ok(
  $$select * from public.admin_bootstrap_first_director('cccccccc-0000-4000-8000-000000000001'::uuid,'Bootstrap Director',array['BOOT-A','BOOT-MISSING']::text[])$$,
  'P0001',
  'No se encontraron todas las plantas activas solicitadas.',
  'missing plant is rejected'
);
select is((select count(*) from public.profiles where id='cccccccc-0000-4000-8000-000000000001'::uuid),0::bigint,'failed bootstrap leaves no profile');

select lives_ok(
  $$select * from public.admin_bootstrap_first_director('cccccccc-0000-4000-8000-000000000001'::uuid,'Bootstrap Director',array['BOOT-A','BOOT-B']::text[])$$,
  'first bootstrap succeeds'
);
select is((select display_name from public.profiles where id='cccccccc-0000-4000-8000-000000000001'::uuid),'Bootstrap Director'::text,'profile is persisted');
select is((select count(*) from public.plant_memberships where user_id='cccccccc-0000-4000-8000-000000000001'::uuid and role='director' and active),2::bigint,'all requested memberships are persisted');

select throws_ok(
  $$select * from public.admin_bootstrap_first_director('cccccccc-0000-4000-8000-000000000002'::uuid,'Second Director',array['BOOT-A']::text[])$$,
  'P0001',
  'Ya existe un director activo.',
  'second bootstrap is rejected'
);

select * from finish();
rollback;
