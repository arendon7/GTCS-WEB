begin;
create extension if not exists pgtap with schema extensions;
select plan(53);

select has_table('public','compost_pile_intake_sources','compost has canonical physical intake sources');
select has_table('public','compost_events','compost operational event table exists');
select has_table('public','compost_event_workers','compost event workers table exists');
select has_table('public','compost_control_ranges','plant compost range table exists');
select has_column('public','compost_measurements','ambient_temperature_c','controls store ambient temperature');
select has_column('public','compost_measurements','temperature_avg_c','controls store computed average temperature');
select has_column('public','compost_measurements','temperature_range_status','controls store temperature range evaluation');
select has_column('public','compost_measurements','humidity_range_status','controls store humidity range evaluation');
select ok((select relrowsecurity from pg_class where oid='public.compost_pile_intake_sources'::regclass),'physical compost sources use RLS');
select ok((select relrowsecurity from pg_class where oid='public.compost_events'::regclass),'compost events use RLS');
select ok((select relrowsecurity from pg_class where oid='public.compost_control_ranges'::regclass),'compost technical ranges use RLS');
select is((select count(*) from pg_policies where schemaname='public' and tablename='compost_piles' and cmd in ('INSERT','UPDATE','DELETE')),0::bigint,'pile writes are RPC-only');
select is((select count(*) from pg_policies where schemaname='public' and tablename='compost_measurements' and cmd in ('INSERT','UPDATE','DELETE')),0::bigint,'control writes are RPC-only');
select is((select count(*) from pg_policies where schemaname='public' and tablename='compost_events' and cmd in ('INSERT','UPDATE','DELETE')),0::bigint,'event writes are RPC-only');
select ok(not has_table_privilege('authenticated','public.compost_piles','INSERT'),'authenticated cannot insert piles directly');
select ok(not has_table_privilege('authenticated','public.compost_measurements','UPDATE'),'authenticated cannot update controls directly');
select ok(not has_table_privilege('authenticated','public.compost_events','INSERT'),'authenticated cannot insert events directly');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_create_compost_pile_v2'),1::bigint,'Compost 2.0 create RPC exists');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_record_compost_event_v2'),1::bigint,'Compost 2.0 event RPC exists');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_record_compost_measurement_v2'),1::bigint,'Compost 2.0 control RPC exists');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ops_configure_compost_control_range'),1::bigint,'Compost range configuration RPC exists');
select ok(not has_function_privilege('authenticated','public.ops_create_compost_pile(uuid,text,uuid[],numeric)','EXECUTE'),'legacy pile creation cannot bypass physical allocation');
select ok(not has_function_privilege('authenticated','public.ops_record_compost_measurement(uuid,numeric[],numeric,text)','EXECUTE'),'legacy controls cannot bypass ambient/range evaluation');

insert into auth.users(id,email,created_at,updated_at) values
 ('f1000000-0000-4000-8000-000000000001','compost-operator@greenatics.test',now(),now()),
 ('f1000000-0000-4000-8000-000000000002','compost-admin@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values ('f2000000-0000-4000-8000-000000000001','C2-TAM','Compost QA Támesis',true);
insert into public.profiles(id,display_name) values
 ('f1000000-0000-4000-8000-000000000001','Compost Operator'),
 ('f1000000-0000-4000-8000-000000000002','Compost Admin');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('f1000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','operator'),
 ('f1000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','admin');
insert into public.material_sources(id,plant_id,code,name,source_kind) values ('f3000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','C2_SRC','Origen Compost QA','generator');
insert into public.material_types(id,plant_id,code,name) values ('f4000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','FORSU','FORSU Compost QA');
insert into public.employees(id,plant_id,code,display_name,active,provisional) values ('f5000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','C2_OP_01','Operario Compost QA',true,false);
insert into public.operational_processes(id,plant_id,code,name,active) values ('f6000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','COMPOSTAJE','Compostaje',true);
insert into public.activity_templates(id,plant_id,process_id,code,name,default_unit_code,allows_unplanned,active) values
 ('f7000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','f6000000-0000-4000-8000-000000000001','CONFORMACION_PILAS','Conformación de pilas','kg',true,true),
 ('f7000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','f6000000-0000-4000-8000-000000000001','VOLTEO_COMPOSTAJE','Volteo de compostaje',null,true,true);

set local role authenticated;
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_record_material_receipt_v2('f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001','f4000000-0000-4000-8000-000000000001',now()-interval '2 hours',now()-interval '110 minutes',1000,1000,0,0,'accepted')$$,'operator creates a physical reception lot for compost');
select lives_ok($$select public.ops_create_compost_pile_v2(
 'f2000000-0000-4000-8000-000000000001'::uuid,'Zona QA',
 array[(select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001')]::uuid[],array[600::numeric],
 now()-interval '90 minutes',now()-interval '70 minutes',8::numeric,
 array['f5000000-0000-4000-8000-000000000001'::uuid],'Conformación controlada QA')$$,'operator forms pile from physical lot atomically');
select is((select initial_weight_kg from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001'),600::numeric,'pile initial mass equals physical allocations');
select is((select allocated_mass_kg from public.compost_pile_intake_sources where plant_id='f2000000-0000-4000-8000-000000000001'),600::numeric,'physical allocation is persisted');
select is((select available_mass_kg from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001'),400::numeric,'formation decrements physical lot availability');
select is((select status from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001'),'in_process'::text,'partially consumed lot remains in process');
select is((select count(*) from public.compost_events where plant_id='f2000000-0000-4000-8000-000000000001' and event_type='formation'),1::bigint,'formation is recorded as one operational event');
select is((select count(*) from public.compost_event_workers where plant_id='f2000000-0000-4000-8000-000000000001'),1::bigint,'formation records its worker');
select is((select volume_m3 from public.compost_events where plant_id='f2000000-0000-4000-8000-000000000001' and event_type='formation'),8::numeric,'formation stores operated volume');
select throws_like($$select public.ops_create_compost_pile_v2(
 'f2000000-0000-4000-8000-000000000001'::uuid,'Zona QA 2',
 array[(select id from public.material_intake_lots where plant_id='f2000000-0000-4000-8000-000000000001')]::uuid[],array[500::numeric],
 now()-interval '60 minutes',now()-interval '50 minutes',5::numeric,
 array['f5000000-0000-4000-8000-000000000001'::uuid],null)$$,'%supera la masa disponible%','over-allocation is rejected');
select lives_ok($$select public.ops_record_compost_event_v2(
 (select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001'),'turning',
 now()-interval '45 minutes',now()-interval '35 minutes',7.5,
 array['f5000000-0000-4000-8000-000000000001'::uuid],'Primer volteo QA')$$,'operator records a turning event');
select is((select count(*) from public.compost_events where plant_id='f2000000-0000-4000-8000-000000000001' and event_type='turning'),1::bigint,'turning event is persisted');
select lives_ok($$select public.ops_record_compost_measurement_v2(
 (select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001'),array[54,55,56]::numeric[],21,52,'Control sin rango',now()-interval '25 minutes')$$,'operator records ambient-aware control without configured thresholds');
select is((select temperature_avg_c from public.compost_measurements where pile_id=(select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001') order by recorded_at desc limit 1),55::numeric,'average temperature is computed server-side');
select is((select ambient_temperature_c from public.compost_measurements where pile_id=(select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001') order by recorded_at desc limit 1),21::numeric,'ambient temperature is persisted');
select is((select temperature_range_status from public.compost_measurements where pile_id=(select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001') order by recorded_at desc limit 1),'not_configured'::text,'no technical verdict is invented before range configuration');
select throws_like($$select public.ops_configure_compost_control_range('f2000000-0000-4000-8000-000000000001',50,60,40,60,true)$$,'%Solo dirección, administración o el rol técnico%','operator cannot configure technical ranges');
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000002';
select lives_ok($$select public.ops_configure_compost_control_range('f2000000-0000-4000-8000-000000000001',50,60,40,60,true)$$,'admin can configure validated plant ranges');
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.ops_record_compost_measurement_v2(
 (select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001'),array[64,65,66]::numeric[],22,55,'Control evaluado',now()-interval '10 minutes')$$,'operator records control after technical range configuration');
select is((select temperature_range_status from public.compost_measurements where pile_id=(select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001') order by recorded_at desc limit 1),'out_of_range'::text,'temperature outside configured range is flagged');
select is((select humidity_range_status from public.compost_measurements where pile_id=(select id from public.compost_piles where plant_id='f2000000-0000-4000-8000-000000000001') order by recorded_at desc limit 1),'within_range'::text,'humidity inside configured range is recognized');
select is((select active from public.compost_control_ranges where plant_id='f2000000-0000-4000-8000-000000000001'),true,'configured plant range remains active');
select is((select count(*) from public.compost_control_ranges r join public.plants p on p.id=r.plant_id where p.code in ('TAM','YAR')),0::bigint,'migration seeds no unvalidated technical ranges for real plants');
select is((select sum(allocated_mass_kg) from public.compost_pile_intake_sources where plant_id='f2000000-0000-4000-8000-000000000001' and allocation_confirmed),600::numeric,'confirmed source mass is auditable from pile traceability');
select ok(has_function_privilege('authenticated','public.ops_start_compost_maturation(uuid)','EXECUTE'),'existing maturation transition remains available');
select ok(has_function_privilege('authenticated','public.ops_close_compost_pile(uuid,numeric)','EXECUTE'),'existing transactional close remains available');
select is((select count(*) from pg_policies where schemaname='public' and tablename='compost_control_ranges' and cmd in ('INSERT','UPDATE','DELETE')),0::bigint,'technical range writes are RPC-only');
select ok(not has_table_privilege('authenticated','public.compost_control_ranges','UPDATE'),'authenticated cannot update ranges directly');
select is((select count(*) from public.compost_pile_sources cps join public.compost_piles p on p.id=cps.pile_id where p.plant_id='f2000000-0000-4000-8000-000000000001'),1::bigint,'legacy receipt source link is retained for compatibility');
select is((select allocation_confirmed from public.compost_pile_intake_sources where plant_id='f2000000-0000-4000-8000-000000000001'),true,'new pile source allocation is explicitly confirmed');

select * from finish();
rollback;
