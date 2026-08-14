begin;

create extension if not exists pgtap with schema extensions;
select plan(31);

select is(
  private.normalize_operational_label('  Biodigestión / UASB_01  '),
  'biodigestion uasb 01'::text,
  'operational normalization removes accents and punctuation without fuzzy matching'
);

select is(
  (select count(*) from pg_policies
    where schemaname='public'
      and tablename='legacy_operational_mapping_decisions'
      and cmd in ('INSERT','UPDATE','DELETE')),
  0::bigint,
  'mapping decisions expose no direct mutation policies'
);

insert into auth.users(id,email,created_at,updated_at) values
  ('f1000000-0000-4000-8000-000000000001','reconcile-director@greenatics.test',now(),now()),
  ('f1000000-0000-4000-8000-000000000002','reconcile-operator@greenatics.test',now(),now());

insert into public.plants(id,code,name,active) values
  ('f2000000-0000-4000-8000-000000000001','REC-A','Reconciliation A',true),
  ('f2000000-0000-4000-8000-000000000002','REC-B','Reconciliation B',true);

insert into public.plant_memberships(user_id,plant_id,role) values
  ('f1000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','director'),
  ('f1000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','operator');

insert into public.operational_processes(id,plant_id,code,name) values
  ('f3000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','ASEO','Aseo'),
  ('f3000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','COMPOSTAJE','Compostaje'),
  ('f3000000-0000-4000-8000-000000000003','f2000000-0000-4000-8000-000000000002','ASEO','Aseo');

insert into public.activity_templates(id,plant_id,process_id,code,name) values
  ('f4000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001','ASEO_GENERAL','Aseo General'),
  ('f4000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000001','MOLIENDA_A','Molienda'),
  ('f4000000-0000-4000-8000-000000000003','f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000002','MOLIENDA_B','Molienda'),
  ('f4000000-0000-4000-8000-000000000004','f2000000-0000-4000-8000-000000000001','f3000000-0000-4000-8000-000000000002','VOLTEO','Volteo'),
  ('f4000000-0000-4000-8000-000000000005','f2000000-0000-4000-8000-000000000002','f3000000-0000-4000-8000-000000000003','ASEO_GENERAL','Aseo General');

insert into public.equipment(id,plant_id,code,name,status) values
  ('f6000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','MOLINO_1','Molino 1','available'),
  ('f6000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000002','MOLINO_1','Molino 1','available');

insert into public.activities(id,plant_id,title,process,started_at,ended_at,equipment_ref) values
  ('fa000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','Aseo General','ASEO','2026-08-01 13:00+00','2026-08-01 14:00+00','Molino 1'),
  ('fa000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','Aseo generl','ASEO','2026-08-01 14:00+00','2026-08-01 15:00+00',null),
  ('fa000000-0000-4000-8000-000000000003','f2000000-0000-4000-8000-000000000001','Molienda','Compostaje','2026-08-01 15:00+00','2026-08-01 16:00+00',null),
  ('fa000000-0000-4000-8000-000000000004','f2000000-0000-4000-8000-000000000001','Recepcion residuos','Recepcion antigua','2026-08-01 16:00+00','2026-08-01 17:00+00',null);

insert into public.scheduled_activities(id,plant_id,title,process,planned_start,planned_end,status,equipment_ref) values
  ('fb000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','Volteo','ASEO','2026-08-02 13:00+00','2026-08-02 14:00+00','planned',null),
  ('fb000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','Aseo General','ASEO','2026-08-02 14:00+00','2026-08-02 15:00+00','planned','Molino 1');

set local role authenticated;
set local request.jwt.claim.sub = 'f1000000-0000-4000-8000-000000000001';

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'process'
  ) where normalized_value='aseo'),
  'exact'::text,
  'process names resolve only by normalized exact match'
);

select is(
  (select target_id from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'activity'
  ) where normalized_value='aseo general'),
  'f4000000-0000-4000-8000-000000000001'::uuid,
  'activity exact match resolves to the canonical template'
);

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'activity'
  ) where normalized_value='molienda'),
  'unmapped'::text,
  'ambiguous exact names remain unmapped'
);

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'activity'
  ) where normalized_value='aseo generl'),
  'unmapped'::text,
  'near or fuzzy text is never auto-promoted'
);

select is(
  (select target_id from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'equipment'
  ) where normalized_value='molino 1'),
  'f6000000-0000-4000-8000-000000000001'::uuid,
  'equipment code/name resolves exactly within the same plant'
);

set local request.jwt.claim.sub = 'f1000000-0000-4000-8000-000000000002';
select throws_ok(
  $$select public.ops_curate_legacy_operational_mapping(
    'f2000000-0000-4000-8000-000000000001'::uuid,
    'activity','Aseo generl','f4000000-0000-4000-8000-000000000001'::uuid
  )$$,
  'P0001',
  'Solo administración o dirección puede curar equivalencias legacy.',
  'operator cannot curate legacy mappings'
);

set local request.jwt.claim.sub = 'f1000000-0000-4000-8000-000000000001';
select throws_ok(
  $$select public.ops_curate_legacy_operational_mapping(
    'f2000000-0000-4000-8000-000000000001'::uuid,
    'activity','Aseo generl','f4000000-0000-4000-8000-000000000005'::uuid
  )$$,
  'P0001',
  'La plantilla canónica no pertenece a la planta.',
  'curation rejects a canonical target from another plant'
);

select lives_ok(
  $$select public.ops_curate_legacy_operational_mapping(
    'f2000000-0000-4000-8000-000000000001'::uuid,
    'activity','Aseo generl','f4000000-0000-4000-8000-000000000001'::uuid
  )$$,
  'director can curate a legacy activity explicitly'
);

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'activity'
  ) where normalized_value='aseo generl'),
  'curated'::text,
  'curated decision overrides absence of an exact match'
);

select lives_ok(
  $$select public.ops_curate_legacy_operational_mapping(
    'f2000000-0000-4000-8000-000000000001'::uuid,
    'equipment','Molino 1',null
  )$$,
  'director can explicitly leave an exact-looking value unmapped'
);

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'equipment'
  ) where normalized_value='molino 1'),
  'unmapped'::text,
  'explicit unmapped decision suppresses automatic exact resolution'
);

select lives_ok(
  $$select public.ops_curate_legacy_operational_mapping(
    'f2000000-0000-4000-8000-000000000001'::uuid,
    'equipment','Molino 1','f6000000-0000-4000-8000-000000000001'::uuid
  )$$,
  'director can supersede a prior unmapped decision with a curated target'
);

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'equipment'
  ) where normalized_value='molino 1'),
  'curated'::text,
  'latest append-only curation decision wins'
);

select is(
  (select count(*) from public.legacy_operational_mapping_decisions
    where plant_id='f2000000-0000-4000-8000-000000000001'::uuid
      and field_kind='equipment'
      and normalized_value='molino 1'),
  2::bigint,
  'superseding a decision preserves both versions for audit'
);

select is(
  (select resolvable_rows from public.ops_legacy_operational_reconciliation_metrics(
    'f2000000-0000-4000-8000-000000000001'::uuid
  ) where field_kind='activity'),
  4::bigint,
  'metrics count exact and curated pending activity rows as resolvable'
);

select lives_ok(
  $$select * from public.ops_apply_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid
  )$$,
  'director can apply safe canonical FK backfill'
);

select is(
  (select process_id from public.activities where id='fa000000-0000-4000-8000-000000000001'::uuid),
  'f3000000-0000-4000-8000-000000000001'::uuid,
  'exact legacy process is backfilled on actual activity'
);

select is(
  (select activity_template_id from public.activities where id='fa000000-0000-4000-8000-000000000001'::uuid),
  'f4000000-0000-4000-8000-000000000001'::uuid,
  'exact legacy title is backfilled on actual activity'
);

select is(
  (select equipment_id from public.activities where id='fa000000-0000-4000-8000-000000000001'::uuid),
  'f6000000-0000-4000-8000-000000000001'::uuid,
  'curated equipment is backfilled on actual activity'
);

select is(
  (select activity_template_id from public.activities where id='fa000000-0000-4000-8000-000000000002'::uuid),
  'f4000000-0000-4000-8000-000000000001'::uuid,
  'explicit curation backfills a formerly fuzzy legacy title'
);

select is(
  (select process_id from public.scheduled_activities where id='fb000000-0000-4000-8000-000000000002'::uuid),
  'f3000000-0000-4000-8000-000000000001'::uuid,
  'reconciliation RPC can backfill schedule process despite direct UPDATE boundary'
);

select is(
  (select activity_template_id from public.scheduled_activities where id='fb000000-0000-4000-8000-000000000001'::uuid),
  null::uuid,
  'template is not forced when its process conflicts with an already reconciled process'
);

select is(
  (select template_process_conflicts from public.ops_apply_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid
  )),
  1,
  'apply service reports remaining process-template conflicts'
);

select is(
  (select process from public.activities where id='fa000000-0000-4000-8000-000000000001'::uuid),
  'ASEO'::text,
  'process legacy evidence is preserved after FK backfill'
);

select is(
  (select title from public.activities where id='fa000000-0000-4000-8000-000000000002'::uuid),
  'Aseo generl'::text,
  'title legacy evidence is preserved after curated FK backfill'
);

select is(
  (select equipment_ref from public.activities where id='fa000000-0000-4000-8000-000000000001'::uuid),
  'Molino 1'::text,
  'equipment legacy evidence is preserved after FK backfill'
);

select is(
  (select canonical_rows from public.ops_legacy_operational_reconciliation_metrics(
    'f2000000-0000-4000-8000-000000000001'::uuid
  ) where field_kind='process'),
  5::bigint,
  'coverage metrics reflect canonical process FKs after reconciliation'
);

set local request.jwt.claim.sub = 'f1000000-0000-4000-8000-000000000002';
select throws_ok(
  $$select * from public.ops_apply_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid
  )$$,
  'P0001',
  'Solo administración o dirección puede aplicar reconciliación legacy.',
  'operator cannot apply legacy reconciliation'
);

set local request.jwt.claim.sub = 'f1000000-0000-4000-8000-000000000001';
select throws_ok(
  $$select * from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000002'::uuid,null
  )$$,
  'P0001',
  'No tienes acceso a esta planta.',
  'reconciliation listing rejects cross-plant reads'
);

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'activity'
  ) where normalized_value='molienda'),
  'unmapped'::text,
  'ambiguous title remains pending after applying other mappings'
);

select is(
  (select resolution_method from public.ops_list_legacy_operational_reconciliation(
    'f2000000-0000-4000-8000-000000000001'::uuid,'process'
  ) where normalized_value='recepcion antigua'),
  'unmapped'::text,
  'unknown process remains pending and legacy text stays available for curation'
);

select * from finish();
rollback;
