alter table employees
  add column if not exists historical boolean not null default false;

alter table activities
  add column if not exists source_kind text not null default 'app',
  add column if not exists import_run_id uuid references import_runs(id) on delete restrict,
  add column if not exists source_row_ids text[],
  add column if not exists import_record_key text;

alter table activities
  drop constraint if exists activities_source_kind_check;
alter table activities
  add constraint activities_source_kind_check check (source_kind in ('app','historical'));

create unique index if not exists activities_import_record_key_uidx
  on activities(import_record_key)
  where import_record_key is not null;

alter table material_receipts
  drop constraint if exists material_receipts_acceptance_status_check;
alter table material_receipts
  add constraint material_receipts_acceptance_status_check
  check (acceptance_status in ('accepted','conditioned','rejected','unknown'));

alter table material_receipts
  add column if not exists source_kind text not null default 'app',
  add column if not exists time_precision text not null default 'datetime',
  add column if not exists import_run_id uuid references import_runs(id) on delete restrict,
  add column if not exists source_row_ids text[],
  add column if not exists import_record_key text;

alter table material_receipts
  drop constraint if exists material_receipts_source_kind_check;
alter table material_receipts
  add constraint material_receipts_source_kind_check check (source_kind in ('app','historical'));

alter table material_receipts
  drop constraint if exists material_receipts_time_precision_check;
alter table material_receipts
  add constraint material_receipts_time_precision_check check (time_precision in ('datetime','date_only'));

create unique index if not exists material_receipts_import_record_key_uidx
  on material_receipts(import_record_key)
  where import_record_key is not null;

comment on column activities.import_record_key is 'Deterministic idempotency key for canonical historical promotion.';
comment on column material_receipts.import_record_key is 'Deterministic idempotency key for canonical historical promotion.';
comment on column material_receipts.acceptance_status is 'unknown preserves historical uncertainty when the source did not record acceptance.';
