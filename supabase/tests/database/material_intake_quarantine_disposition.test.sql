begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

select has_table('public','material_intake_lot_dispositions','quarantine disposition audit table exists');
select has_column('public','material_intake_lot_dispositions','decision','audit stores disposition decision');
select has_column('public','material_intake_lot_dispositions','reason','audit stores disposition reason');
select ok((select relrowsecurity from pg_class where oid='public.material_intake_lot_dispositions'::regclass),'disposition audit RLS is enabled');
select is((select count(*) from pg_policies where schemaname='public' and tablename='material_intake_lot_dispositions' and cmd in ('INSERT','UPDATE','DELETE')),0::bigint,'disposition audit writes are RPC-only');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_dispose_material_intake_lot'),1::bigint,'quarantine disposition RPC is installed');

insert into auth.users(id,email,created_at,updated_at) values
 ('f1000000-0000-4000-8000-000000000001','quarantine-technical-tam@greenatics.test',now(),now()),
 ('f1000000-0000-4000-8000-000000000002','quarantine-operator-tam@greenatics.test',now(),now()),
 ('f1000000-0000-4000-8000-000000000003','quarantine-technical-yar@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('f2000000-0000-4000-8000-000000000001','Q-TAM','Quarantine Támesis',true),
 ('f2000000-0000-4000-8000-000000000002','Q-YAR','Quarantine Yarumal',true);
insert into public.profiles(id,display_name) values
 ('f1000000-0000-4000-8000-000000000001','Technical TAM'),
 ('f1000000-0000-4000-8000-000000000002','Operator TAM'),
 ('f1000000-0000-4000-8000-000000000003','Technical YAR');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('f1000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','technical'),
 ('f1000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','operator'),
 ('f1000000-0000-4000-8000-000000000003','f2000000-0000-4000-8000-000000000002','technical');
insert into public.material_sources(id,plant_id,code,name,source_kind) values
 ('f3000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','SRC-TAM','Fuente TAM','generator'),
 ('f3000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000002','SRC-YAR','Fuente YAR','generator');
insert into public.material_types(id,plant_id,code,name) values
 ('f5000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','FORSU','FORSU TAM'),
 ('f5000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000002','FORSU','FORSU YAR');

set local role authenticated;
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_record_material_receipt_v2('f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000001','2026-08-16T13:00:00Z','2026-08-16T13:30:00Z',1000,900,100,30,'conditioned',null,null,'Conductor TAM','3000000000','TAM123','Pendiente revisión técnica')$$,'technical user creates a conditioned TAM reception');
select is((select status from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001'),'quarantined'::text,'conditioned TAM lot starts quarantined');

set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000003';
select lives_ok($$select public.ops_record_material_receipt_v2('f2000000-0000-4000-8000-000000000002','f3000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000002','2026-08-16T14:00:00Z','2026-08-16T14:30:00Z',800,750,50,10,'conditioned',null,null,'Conductor YAR','3000000001','YAR123','Pendiente revisión técnica')$$,'technical user creates a conditioned YAR reception');
select is((select status from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000002'),'quarantined'::text,'conditioned YAR lot starts quarantined');

set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000002';
select throws_like(
  $$select public.ops_dispose_material_intake_lot((select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001'),'release','Control conforme')$$,
  '%No tienes permiso para resolver cuarentenas%',
  'operator cannot resolve quarantine'
);

set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';
select lives_ok(
  $$select public.ops_dispose_material_intake_lot((select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001'),'release','Control de calidad conforme; lote apto para proceso')$$,
  'technical user releases TAM quarantine'
);
select is((select status from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001'),'available'::text,'released lot becomes available');
select is((select decision from public.material_intake_lot_dispositions where plant_id='f2000000-0000-4000-8000-000000000001'),'release'::text,'release decision is audited');
select is((select reason from public.material_intake_lot_dispositions where plant_id='f2000000-0000-4000-8000-000000000001'),'Control de calidad conforme; lote apto para proceso'::text,'release reason is audited');
select is((select decided_by from public.material_intake_lot_dispositions where plant_id='f2000000-0000-4000-8000-000000000001'),'f1000000-0000-4000-8000-000000000001'::uuid,'release actor is audited');
select throws_like(
  $$select public.ops_dispose_material_intake_lot((select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001'),'reject','Cambio de criterio')$$,
  '%Solo un lote en cuarentena%',
  'resolved lot cannot be disposed twice'
);
select throws_like(
  $$select public.ops_dispose_material_intake_lot((select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000002'),'release','Intento cruzado')$$,
  '%No tienes permiso para resolver cuarentenas%',
  'technical user cannot resolve another plant quarantine'
);
select throws_like(
  $$select public.ops_dispose_material_intake_lot((select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000002'),'reject','   ')$$,
  '%Registra el motivo%',
  'blank disposition reason is rejected before mutation'
);

set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000003';
select lives_ok(
  $$select public.ops_dispose_material_intake_lot((select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000002'),'reject','Contaminación no conforme; salida del flujo de aprovechamiento')$$,
  'technical user finally rejects YAR quarantine'
);
select is((select status from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000002'),'rejected'::text,'finally rejected lot receives explicit terminal status');
select is((select available_mass_kg from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000002'),750::numeric,'final rejection preserves physical unconsumed mass for traceability');
select is((select decision from public.material_intake_lot_dispositions where plant_id='f2000000-0000-4000-8000-000000000002'),'reject'::text,'final rejection decision is audited');
select is((select resulting_status from public.material_intake_lot_dispositions where plant_id='f2000000-0000-4000-8000-000000000002'),'rejected'::text,'audit records terminal rejected status');
select is((select count(*) from public.material_intake_lot_dispositions),2::bigint,'exactly one immutable disposition exists per resolved lot');

select * from finish();
rollback;
