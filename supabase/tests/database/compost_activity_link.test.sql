begin;
create extension if not exists pgtap with schema extensions;
select plan(26);

select has_column('public','compost_events','activity_id','compost events expose canonical activity link');
select is((
  select count(*) from pg_constraint c
  where c.conrelid='public.compost_events'::regclass
    and c.conname='compost_events_activity_plant_fk'
    and c.contype='f'
),1::bigint,'compost activity link is protected by a foreign key');
select is((
  select count(*) from pg_indexes
  where schemaname='public' and tablename='compost_events' and indexname='compost_events_activity_uidx'
),1::bigint,'one canonical activity can belong to at most one compost event');
select is((
  select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='insert_compost_activity'
),1::bigint,'private compost activity bridge exists');
select ok(not has_function_privilege(
  'authenticated',
  'private.insert_compost_activity(uuid,text,text,timestamptz,timestamptz,numeric,text,uuid[],text)',
  'EXECUTE'
),'authenticated clients cannot call the internal activity bridge directly');

insert into auth.users(id,email,created_at,updated_at) values
 ('a9100000-0000-4000-8000-000000000001','compost-link-operator@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('a9200000-0000-4000-8000-000000000001','TAM-C3','Compost Activity QA',true);
insert into public.profiles(id,display_name) values
 ('a9100000-0000-4000-8000-000000000001','Compost Link Operator');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('a9100000-0000-4000-8000-000000000001','a9200000-0000-4000-8000-000000000001','operator');
insert into public.employees(id,plant_id,code,display_name,active,provisional) values
 ('a9300000-0000-4000-8000-000000000001','a9200000-0000-4000-8000-000000000001','C3_OP_01','Operario Compost Link',true,false);
insert into public.material_sources(id,plant_id,code,name,source_kind) values
 ('a9400000-0000-4000-8000-000000000001','a9200000-0000-4000-8000-000000000001','C3_SRC','Origen Compost Link','generator');
insert into public.material_types(id,plant_id,code,name) values
 ('a9500000-0000-4000-8000-000000000001','a9200000-0000-4000-8000-000000000001','FORSU','FORSU Compost Link');
insert into public.operational_processes(id,plant_id,code,name,active) values
 ('a9600000-0000-4000-8000-000000000001','a9200000-0000-4000-8000-000000000001','COMPOSTAJE','Compostaje',true);
insert into public.activity_templates(id,plant_id,process_id,code,name,default_unit_code,allows_unplanned,active) values
 ('a9700000-0000-4000-8000-000000000001','a9200000-0000-4000-8000-000000000001','a9600000-0000-4000-8000-000000000001','CONFORMACION_PILAS','Conformación de pilas','kg',true,true),
 ('a9700000-0000-4000-8000-000000000002','a9200000-0000-4000-8000-000000000001','a9600000-0000-4000-8000-000000000001','VOLTEO_COMPOSTAJE','Volteo de compostaje',null,true,true);

set local role authenticated;
set local request.jwt.claim.sub='a9100000-0000-4000-8000-000000000001';

select lives_ok($$select public.ops_record_material_receipt_v2(
 'a9200000-0000-4000-8000-000000000001','a9400000-0000-4000-8000-000000000001','a9500000-0000-4000-8000-000000000001',
 now()-interval '2 hours',now()-interval '110 minutes',1000,1000,0,0,'accepted'
)$$,'operator creates source material for linked compost activity');

select lives_ok($$select public.ops_create_compost_pile_v2(
 'a9200000-0000-4000-8000-000000000001','Zona C3',
 array[(select id from public.material_intake_lots where plant_id='a9200000-0000-4000-8000-000000000001')]::uuid[],array[600::numeric],
 now()-interval '90 minutes',now()-interval '70 minutes',8::numeric,
 array['a9300000-0000-4000-8000-000000000001'::uuid],'Conformación integrada a bitácora'
)$$,'pile formation creates compost event and activity atomically');
select ok((select activity_id is not null from public.compost_events where plant_id='a9200000-0000-4000-8000-000000000001' and event_type='formation'),'formation event has canonical activity id');
select is((select count(*) from public.activities where plant_id='a9200000-0000-4000-8000-000000000001'),1::bigint,'formation creates exactly one canonical activity');
select is((select quantity from public.activities where plant_id='a9200000-0000-4000-8000-000000000001'),600::numeric,'formation activity records allocated material mass');
select is((select unit from public.activities where plant_id='a9200000-0000-4000-8000-000000000001'),'kg'::text,'formation activity uses mass unit');
select is((select t.code from public.activities a join public.activity_templates t on t.id=a.activity_template_id where a.plant_id='a9200000-0000-4000-8000-000000000001'),'CONFORMACION_PILAS'::text,'formation activity resolves canonical template');
select is((
  select count(*)
  from public.compost_events ce
  join public.compost_event_workers cew on cew.event_id=ce.id
  join public.activity_workers aw on aw.activity_id=ce.activity_id and aw.employee_id=cew.employee_id
  where ce.plant_id='a9200000-0000-4000-8000-000000000001' and ce.event_type='formation'
),1::bigint,'compost event and activity share the same worker');

select throws_like($$select public.ops_record_compost_event_v2(
 (select id from public.compost_piles where plant_id='a9200000-0000-4000-8000-000000000001'),'turning',
 now()-interval '85 minutes',now()-interval '75 minutes',7::numeric,
 array['a9300000-0000-4000-8000-000000000001'::uuid],'Solapamiento inválido'
)$$,'%otra actividad real en ese horario%','compost reuses canonical worker-overlap protection');

select lives_ok($$select public.ops_record_compost_event_v2(
 (select id from public.compost_piles where plant_id='a9200000-0000-4000-8000-000000000001'),'turning',
 now()-interval '60 minutes',now()-interval '50 minutes',7.5::numeric,
 array['a9300000-0000-4000-8000-000000000001'::uuid],'Volteo integrado a bitácora'
)$$,'turning creates a linked canonical activity');
select ok((select activity_id is not null from public.compost_events where plant_id='a9200000-0000-4000-8000-000000000001' and event_type='turning'),'turning event has canonical activity id');
select is((select a.quantity from public.compost_events ce join public.activities a on a.id=ce.activity_id where ce.plant_id='a9200000-0000-4000-8000-000000000001' and ce.event_type='turning'),7.5::numeric,'turning activity records operated volume');
select is((select a.unit from public.compost_events ce join public.activities a on a.id=ce.activity_id where ce.plant_id='a9200000-0000-4000-8000-000000000001' and ce.event_type='turning'),'m3'::text,'turning activity uses cubic metre unit');
select is((select t.code from public.compost_events ce join public.activities a on a.id=ce.activity_id join public.activity_templates t on t.id=a.activity_template_id where ce.plant_id='a9200000-0000-4000-8000-000000000001' and ce.event_type='turning'),'VOLTEO_COMPOSTAJE'::text,'turning activity resolves canonical template');

select lives_ok($$select public.ops_record_compost_event_v2(
 (select id from public.compost_piles where plant_id='a9200000-0000-4000-8000-000000000001'),'hydration',
 now()-interval '40 minutes',now()-interval '30 minutes',null,
 array['a9300000-0000-4000-8000-000000000001'::uuid],'Hidratación sin plantilla específica en esta planta QA'
)$$,'hydration still creates canonical process activity without inventing a template');
select ok((select activity_id is not null from public.compost_events where plant_id='a9200000-0000-4000-8000-000000000001' and event_type='hydration'),'hydration event has canonical activity id');
select is((select a.activity_template_id from public.compost_events ce join public.activities a on a.id=ce.activity_id where ce.plant_id='a9200000-0000-4000-8000-000000000001' and ce.event_type='hydration'),null::uuid,'missing plant template remains explicitly null');
select is((select a.title from public.compost_events ce join public.activities a on a.id=ce.activity_id where ce.plant_id='a9200000-0000-4000-8000-000000000001' and ce.event_type='hydration'),'Hidratación de pila'::text,'hydration uses controlled fallback title');
select is((select count(*) from public.compost_events where plant_id='a9200000-0000-4000-8000-000000000001' and activity_id is null),0::bigint,'all new Compost V2 events are activity-linked');
select is((select count(*) from public.activities where plant_id='a9200000-0000-4000-8000-000000000001'),3::bigint,'three successful compost events produce exactly three activities');
select is((select count(*) from public.compost_events where plant_id='a9200000-0000-4000-8000-000000000001'),3::bigint,'failed overlap created no partial compost event');

select * from finish();
rollback;
