create table if not exists import_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_hash text not null unique,
  status text not null default 'dry_run' check (status in ('dry_run','promoted','failed')),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  promoted_at timestamptz
);

create table if not exists import_source_rows (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references import_runs(id) on delete restrict,
  source_row_id text not null,
  row_kind text not null check (row_kind in ('receipt','log')),
  status text not null check (status in ('valid','warning','quarantined','duplicate')),
  raw jsonb not null,
  normalized jsonb,
  created_at timestamptz not null default now(),
  unique (run_id, row_kind, source_row_id)
);

create table if not exists import_issues (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references import_runs(id) on delete restrict,
  source_row_id text not null,
  code text not null,
  field_name text not null,
  severity text not null check (severity in ('warning','error')),
  source_value jsonb,
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists import_source_rows_run_idx on import_source_rows(run_id);
create index if not exists import_source_rows_status_idx on import_source_rows(run_id, status);
create index if not exists import_issues_run_idx on import_issues(run_id);

create or replace function private.has_import_role()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.plant_memberships pm
    where pm.user_id = (select auth.uid())
      and pm.active
      and pm.role = any(array['admin','director'])
  );
$$;

revoke all on function private.has_import_role() from public;
grant execute on function private.has_import_role() to authenticated;

alter table import_runs enable row level security;
alter table import_source_rows enable row level security;
alter table import_issues enable row level security;

create policy "import_runs_admin_select" on import_runs for select to authenticated
using ((select private.has_import_role()));
create policy "import_runs_admin_insert" on import_runs for insert to authenticated
with check ((select private.has_import_role()));
create policy "import_runs_admin_update" on import_runs for update to authenticated
using ((select private.has_import_role()))
with check ((select private.has_import_role()));

create policy "import_rows_admin_select" on import_source_rows for select to authenticated
using ((select private.has_import_role()));
create policy "import_rows_admin_insert" on import_source_rows for insert to authenticated
with check ((select private.has_import_role()));

create policy "import_issues_admin_select" on import_issues for select to authenticated
using ((select private.has_import_role()));
create policy "import_issues_admin_insert" on import_issues for insert to authenticated
with check ((select private.has_import_role()));

-- Deliberately no UPDATE or DELETE policy on raw source rows/issues.
-- Human correction is modeled as a later decision/promotion record; source evidence is immutable.
