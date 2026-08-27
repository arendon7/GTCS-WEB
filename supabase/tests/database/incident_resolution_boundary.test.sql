begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

select has_function('public','ops_close_incident',array['uuid','text'],'incident resolution RPC exists');

insert into auth.users(id,email,created_at,updated_at)
values
  ('a1000000-0000-4000-8000-000000000001','incident-director@greenatics.test',now(),now()),
  ('a1000000-0000-4000-8000-000000000002','incident-operator@greenatics.test',now(),now());

insert into public.plants(id,code,name,active)
values
  ('b1000000-0000-4000-8000-000000000001','INC-A','Incidentes A',true),
  ('b1000000-0000-4000-8000-000000000002','INC-B','Incidentes B',true);

insert into public.profiles(id,display_name)
values
  ('a1000000-0000-4000-8000-000000000001','Director incidentes'),
  ('a1000000-0000-4000-8000-000000000002','Operador incidentes');

insert into public.plant_memberships(user_id,plant_id,role)
values
  ('a1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','director'),
  ('a1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000001','operator');

insert into public.incidents(id,plant_id,severity,title,description,opened_at)
values
  ('c1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','medium','Incidente propio','Pendiente de resolver',now()),
  ('c1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000001','low','Incidente operador','No debe cerrarlo operador',now()),
  ('c1000000-0000-4000-8000-000000000003','b1000000-0000-4000-8000-000000000002','high','Incidente ajeno','Otra planta',now());

set local role authenticated;
set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000001';

select lives_ok(
  $$select public.ops_close_incident(
    'c1000000-0000-4000-8000-000000000001'::uuid,
    'Se verificó la causa y la operación quedó normalizada.'
  )$$,
  'director can resolve an incident in an authorized plant'
);

select ok(
  (select closed_at is not null from public.incidents where id='c1000000-0000-4000-8000-000000000001'),
  'resolved incident records closed_at'
);

select is(
  (select resolution_note from public.incidents where id='c1000000-0000-4000-8000-000000000001'),
  'Se verificó la causa y la operación quedó normalizada.'::text,
  'resolution note is persisted'
);

select is(
  (select closed_by from public.incidents where id='c1000000-0000-4000-8000-000000000001'),
  'a1000000-0000-4000-8000-000000000001'::uuid,
  'resolver identity is persisted'
);

select throws_ok(
  $$select public.ops_close_incident(
    'c1000000-0000-4000-8000-000000000001'::uuid,
    'Segundo intento de cierre'
  )$$,
  'P0001',
  'El incidente ya está cerrado.',
  'a second resolution is rejected explicitly'
);

select throws_ok(
  $$select public.ops_close_incident(
    'c1000000-0000-4000-8000-000000000003'::uuid,
    'Intento sobre otra planta'
  )$$,
  'P0001',
  'No tienes permiso para resolver incidentes en esta planta.',
  'membership in another plant cannot resolve the incident'
);

set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000002';

select throws_ok(
  $$select public.ops_close_incident(
    'c1000000-0000-4000-8000-000000000002'::uuid,
    'Operador intenta cerrar el incidente'
  )$$,
  'P0001',
  'No tienes permiso para resolver incidentes en esta planta.',
  'operator cannot resolve incidents'
);

select throws_ok(
  $$select public.ops_close_incident(
    'c1000000-0000-4000-8000-000000000002'::uuid,
    'x'
  )$$,
  'P0001',
  'Describe brevemente cómo se resolvió el incidente.',
  'resolution requires a meaningful note'
);

select * from finish();
rollback;
