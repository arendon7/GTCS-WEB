-- B2C-READINESS-001 · governed Casa, Jardín y Vivero launch evidence ledger.
-- Evidence is company-level, append-only and private to authorized internal users.
-- Public pages must never query this table directly.

create or replace function private.has_company_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists (
    select 1
    from public.plant_memberships pm
    where pm.user_id=(select auth.uid())
      and pm.active
      and pm.role=any(allowed_roles)
  );
$$;

revoke all on function private.has_company_role(text[]) from public;
grant execute on function private.has_company_role(text[]) to authenticated;

create table if not exists public.home_garden_launch_evidence_revisions (
  id uuid primary key default gen_random_uuid(),
  revision_no bigint generated always as identity unique,
  candidate_id text not null,
  evidence_kind text not null check (evidence_kind in (
    'product-truth',
    'laboratory-report',
    'regulatory-registration',
    'approved-label',
    'sku-master',
    'dose-validation',
    'cost-model',
    'fulfillment-record',
    'public-asset'
  )),
  disposition text not null check (disposition in ('draft','verified','rejected','superseded')),
  title text not null,
  source_reference text not null,
  source_date date,
  same_reference boolean not null default false,
  same_presentation boolean not null default false,
  complete_for_gate boolean not null default false,
  note text not null,
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) default auth.uid(),
  check (candidate_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (length(candidate_id) <= 120),
  check (btrim(title) <> '' and length(title) <= 220),
  check (btrim(source_reference) <> '' and length(source_reference) <= 1500),
  check (btrim(note) <> '' and length(note) <= 2000),
  check (source_date is null or source_date <= current_date)
);

create index if not exists home_garden_launch_evidence_candidate_idx
  on public.home_garden_launch_evidence_revisions(candidate_id,evidence_kind,revision_no desc);

alter table public.home_garden_launch_evidence_revisions enable row level security;

drop policy if exists "home_garden_launch_evidence_internal_select" on public.home_garden_launch_evidence_revisions;
create policy "home_garden_launch_evidence_internal_select"
on public.home_garden_launch_evidence_revisions
for select to authenticated
using ((select private.has_company_role(array['technical','admin','director'])));

revoke insert, update, delete on table public.home_garden_launch_evidence_revisions from authenticated;
grant select on table public.home_garden_launch_evidence_revisions to authenticated;

create or replace function public.admin_append_home_garden_launch_evidence(
  target_candidate_id text,
  target_evidence_kind text,
  target_disposition text,
  evidence_title text,
  evidence_source_reference text,
  evidence_source_date date,
  evidence_same_reference boolean,
  evidence_same_presentation boolean,
  evidence_complete_for_gate boolean,
  evidence_note text
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  revision_id uuid;
  clean_candidate text := lower(btrim(target_candidate_id));
  clean_title text := nullif(btrim(evidence_title),'');
  clean_source text := nullif(btrim(evidence_source_reference),'');
  clean_note text := nullif(btrim(evidence_note),'');
begin
  if (select auth.uid()) is null then
    raise exception 'Sesión requerida.';
  end if;
  if not private.has_company_role(array['technical','admin','director']) then
    raise exception 'No tienes permiso para administrar evidencia de lanzamiento.';
  end if;
  if clean_candidate is null or clean_candidate !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or length(clean_candidate)>120 then
    raise exception 'Candidate ID inválido.';
  end if;
  if target_evidence_kind is null or target_evidence_kind not in (
    'product-truth','laboratory-report','regulatory-registration','approved-label','sku-master',
    'dose-validation','cost-model','fulfillment-record','public-asset'
  ) then
    raise exception 'Tipo de evidencia inválido.';
  end if;
  if target_disposition is null or target_disposition not in ('draft','verified','rejected','superseded') then
    raise exception 'Estado de evidencia inválido.';
  end if;
  if clean_title is null then raise exception 'Título de evidencia requerido.'; end if;
  if length(clean_title)>220 then raise exception 'Título de evidencia demasiado largo.'; end if;
  if clean_source is null then raise exception 'Referencia fuente requerida.'; end if;
  if length(clean_source)>1500 then raise exception 'Referencia fuente demasiado larga.'; end if;
  if clean_source ~* '([?&](access_token|token|sig|signature|key|code)=)' then
    raise exception 'No guardes enlaces firmados, tokens ni credenciales en la referencia fuente.';
  end if;
  if evidence_source_date is not null and evidence_source_date>current_date then
    raise exception 'La fecha de la evidencia no puede estar en el futuro.';
  end if;
  if clean_note is null then raise exception 'Registra el criterio de evaluación de la evidencia.'; end if;
  if length(clean_note)>2000 then raise exception 'La nota de evidencia es demasiado larga.'; end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'greenatics-home-garden-evidence:' || clean_candidate || ':' || target_evidence_kind,
    0
  ));

  insert into public.home_garden_launch_evidence_revisions(
    candidate_id,evidence_kind,disposition,title,source_reference,source_date,
    same_reference,same_presentation,complete_for_gate,note,created_by
  ) values (
    clean_candidate,target_evidence_kind,target_disposition,clean_title,clean_source,evidence_source_date,
    coalesce(evidence_same_reference,false),coalesce(evidence_same_presentation,false),coalesce(evidence_complete_for_gate,false),clean_note,auth.uid()
  ) returning id into revision_id;

  return revision_id;
end;
$$;

revoke all on function public.admin_append_home_garden_launch_evidence(text,text,text,text,text,date,boolean,boolean,boolean,text) from public,anon;
grant execute on function public.admin_append_home_garden_launch_evidence(text,text,text,text,text,date,boolean,boolean,boolean,text) to authenticated;

comment on table public.home_garden_launch_evidence_revisions is
'Append-only internal evidence history for Casa, Jardín y Vivero B2C launch candidates. The latest revision per candidate/evidence kind is current.';
comment on column public.home_garden_launch_evidence_revisions.source_reference is
'Internal source locator or document reference. Never expose through public pages and never store signed URLs, credentials or tokens.';
comment on function public.admin_append_home_garden_launch_evidence(text,text,text,text,text,date,boolean,boolean,boolean,text) is
'Appends one governed evidence revision. Technical/admin/director roles only; direct table mutation remains disabled.';
