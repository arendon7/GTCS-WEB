-- OPS incident resolution boundary.
-- Incidents remain append/open through the existing activity flow and are closed only through an audited RPC.

alter table public.incidents
  add column if not exists resolution_note text,
  add column if not exists closed_by uuid references auth.users(id);

do $$ begin
  alter table public.incidents
    add constraint incidents_resolution_note_length_check
    check (resolution_note is null or char_length(btrim(resolution_note)) between 3 and 500);
exception when duplicate_object then null;
end $$;

-- Direct table UPDATE is intentionally removed. Resolution now goes through the RPC below,
-- preserving the same role set while narrowing what may be changed.
drop policy if exists "incidents_maint_update" on public.incidents;

create or replace function public.ops_close_incident(
  target_incident uuid,
  resolution_note text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  incident public.incidents%rowtype;
  resolved_at timestamptz := now();
  clean_note text := nullif(btrim(resolution_note),'');
begin
  if clean_note is null or char_length(clean_note) < 3 then
    raise exception 'Describe brevemente cómo se resolvió el incidente.';
  end if;
  if char_length(clean_note) > 500 then
    raise exception 'La resolución no puede superar 500 caracteres.';
  end if;

  select * into incident
  from public.incidents
  where id=target_incident
  for update;

  if not found then
    raise exception 'Incidente no encontrado.';
  end if;

  if not private.has_plant_role(
    incident.plant_id,
    array['maintenance','supervisor','technical','admin','director']
  ) then
    raise exception 'No tienes permiso para resolver incidentes en esta planta.';
  end if;

  if incident.closed_at is not null then
    raise exception 'El incidente ya está cerrado.';
  end if;

  update public.incidents
  set closed_at=resolved_at,
      resolution_note=clean_note,
      closed_by=auth.uid()
  where id=incident.id;

  return resolved_at;
end;
$$;

revoke all on function public.ops_close_incident(uuid,text) from public,anon;
grant execute on function public.ops_close_incident(uuid,text) to authenticated;
