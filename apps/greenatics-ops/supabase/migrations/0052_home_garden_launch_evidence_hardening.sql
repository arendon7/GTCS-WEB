-- B2C-READINESS-002 · harden evidence boundaries without rewriting the append-only ledger.
-- Product Truth remains canonical in code and cannot be authored through the operational registry.

-- Fail closed if a hosted environment already contains evidence that should never have lived in this ledger.
do $$
begin
  if exists (
    select 1
    from public.home_garden_launch_evidence_revisions
    where evidence_kind='product-truth'
  ) then
    raise exception 'Existen revisiones product-truth en el ledger B2C; reconcílialas antes de aplicar el hardening.';
  end if;
end;
$$;

alter table public.home_garden_launch_evidence_revisions
  drop constraint if exists home_garden_launch_evidence_revisions_evidence_kind_check;

alter table public.home_garden_launch_evidence_revisions
  add constraint home_garden_launch_evidence_revisions_evidence_kind_check
  check (evidence_kind in (
    'laboratory-report',
    'regulatory-registration',
    'approved-label',
    'sku-master',
    'dose-validation',
    'cost-model',
    'fulfillment-record',
    'public-asset'
  ));

alter table public.home_garden_launch_evidence_revisions
  add constraint home_garden_launch_evidence_revisions_complete_verified_check
  check (not complete_for_gate or disposition='verified');

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
  technical_kind boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'Sesión requerida.';
  end if;

  if target_evidence_kind='product-truth' then
    raise exception 'Product Truth se gobierna en código y no se administra desde este registro.';
  end if;
  if target_evidence_kind is null or target_evidence_kind not in (
    'laboratory-report','regulatory-registration','approved-label','sku-master',
    'dose-validation','cost-model','fulfillment-record','public-asset'
  ) then
    raise exception 'Tipo de evidencia inválido.';
  end if;

  technical_kind := target_evidence_kind in (
    'laboratory-report','regulatory-registration','approved-label','dose-validation'
  );
  if technical_kind then
    if not private.has_company_role(array['technical','admin','director']) then
      raise exception 'No tienes permiso para administrar evidencia técnica de lanzamiento.';
    end if;
  elsif not private.has_company_role(array['admin','director']) then
    raise exception 'Este tipo de evidencia requiere rol admin o director.';
  end if;

  if clean_candidate is null or clean_candidate !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or length(clean_candidate)>120 then
    raise exception 'Candidate ID inválido.';
  end if;
  if target_disposition is null or target_disposition not in ('draft','verified','rejected','superseded') then
    raise exception 'Estado de evidencia inválido.';
  end if;
  if coalesce(evidence_complete_for_gate,false) and target_disposition<>'verified' then
    raise exception 'Solo evidencia verificada puede declararse completa para un gate.';
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

comment on function public.admin_append_home_garden_launch_evidence(text,text,text,text,text,date,boolean,boolean,boolean,text) is
'Appends governed B2C launch evidence. Product Truth is excluded; technical evidence may be authored by technical/admin/director, while SKU, cost, fulfillment and public-asset evidence require admin/director. Only verified evidence may be complete_for_gate.';
