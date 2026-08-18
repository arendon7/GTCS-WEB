-- R3.1 · Purchase-request write boundary.
-- Purchase requests are operational authorization records. Authenticated clients may read
-- requests through plant RLS, but new submissions must pass a governed RPC so the client
-- cannot bypass role, plant, equipment and submitted-state invariants with direct DML.

-- Close the legacy direct INSERT path.
drop policy if exists "purchase_requests_insert" on public.purchase_requests;

revoke insert, update, delete on table public.purchase_requests from authenticated;
revoke insert, update, delete on table public.purchase_request_events from authenticated;

grant select on table public.purchase_requests to authenticated;
grant select on table public.purchase_request_events to authenticated;

create or replace function public.ops_submit_purchase_request(
  target_plant uuid,
  requester_name text,
  needed_by_date date,
  request_category text,
  request_concept text,
  request_justification text,
  request_estimated_amount_cop numeric,
  request_suggested_supplier text default null,
  target_equipment uuid default null,
  request_process_ref text default null,
  request_evidence_ref text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id uuid;
begin
  if not private.has_plant_role(
    target_plant,
    array['operator','supervisor','technical','admin','director']
  ) then
    raise exception 'No tienes permiso para solicitar compras en esta planta.';
  end if;

  if nullif(btrim(requester_name),'') is null then
    raise exception 'Indica quién solicita la compra.';
  end if;
  if request_category is null or request_category not in (
    'input','maintenance','services','transport','operations','administration','other'
  ) then
    raise exception 'La categoría de la solicitud no es válida.';
  end if;
  if nullif(btrim(request_concept),'') is null then
    raise exception 'Indica el concepto de la solicitud.';
  end if;
  if nullif(btrim(request_justification),'') is null then
    raise exception 'Indica la justificación de la solicitud.';
  end if;
  if request_estimated_amount_cop is null or request_estimated_amount_cop <= 0 then
    raise exception 'El monto estimado debe ser mayor que cero.';
  end if;

  if target_equipment is not null and not exists (
    select 1
    from public.equipment e
    where e.id = target_equipment
      and e.plant_id = target_plant
  ) then
    raise exception 'El equipo seleccionado no pertenece a la planta de la solicitud.';
  end if;

  insert into public.purchase_requests(
    plant_id,
    requested_by_name,
    needed_by,
    category,
    concept,
    justification,
    estimated_amount_cop,
    suggested_supplier,
    equipment_id,
    process_ref,
    evidence_ref,
    status,
    created_by
  ) values (
    target_plant,
    btrim(requester_name),
    needed_by_date,
    request_category,
    btrim(request_concept),
    btrim(request_justification),
    request_estimated_amount_cop,
    nullif(btrim(coalesce(request_suggested_supplier,'')),''),
    target_equipment,
    nullif(btrim(coalesce(request_process_ref,'')),''),
    nullif(btrim(coalesce(request_evidence_ref,'')),''),
    'submitted',
    auth.uid()
  )
  returning id into request_id;

  -- The existing AFTER INSERT trigger records the canonical submitted event atomically.
  return request_id;
end;
$$;

revoke all on function public.ops_submit_purchase_request(uuid,text,date,text,text,text,numeric,text,uuid,text,text) from public, anon;
grant execute on function public.ops_submit_purchase_request(uuid,text,date,text,text,text,numeric,text,uuid,text,text) to authenticated;

comment on table public.purchase_requests is
'Purchase authorization ledger. Authenticated clients read through plant RLS; new submissions are RPC-only through ops_submit_purchase_request and decisions/fulfillment remain guarded RPC transitions.';
comment on function public.ops_submit_purchase_request(uuid,text,date,text,text,text,numeric,text,uuid,text,text) is
'Governed purchase-request submission. Enforces plant role, submitted initial state, positive estimate and same-plant equipment integrity; the submitted event is created atomically by the canonical trigger.';
