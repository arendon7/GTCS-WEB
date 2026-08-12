begin;

create extension if not exists pgtap with schema extensions;
select plan(5);

select is(
  (select count(*) from public.plants where code in ('TAM','YAR')),
  2::bigint,
  'fresh migrations create both canonical pilot plants'
);

select is(
  (select name from public.plants where code='TAM'),
  'Támesis'::text,
  'TAM resolves to Támesis'
);

select is(
  (select name from public.plants where code='YAR'),
  'Yarumal'::text,
  'YAR resolves to Yarumal'
);

select ok(
  coalesce((select active from public.plants where code='TAM'), false),
  'Támesis starts active in a fresh environment'
);

select ok(
  coalesce((select active from public.plants where code='YAR'), false),
  'Yarumal starts active in a fresh environment'
);

select * from finish();
rollback;
