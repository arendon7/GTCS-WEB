create table if not exists purchase_requests (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  requested_by_name text not null check (btrim(requested_by_name) <> ''),
  requested_at timestamptz not null default now(),
  needed_by date,
  category text not null check (category in ('input','maintenance','services','transport','operations','administration','other')),
  concept text not null check (btrim(concept) <> ''),
  justification text not null check (btrim(justification) <> ''),
  estimated_amount_cop numeric not null check (estimated_amount_cop > 0),
  suggested_supplier text,
  equipment_id uuid references equipment(id),
  process_ref text,
  evidence_ref text,
  status text not null default 'submitted' check (status in ('submitted','approved','rejected','fulfilled')),
  expense_id uuid,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  check ((status = 'fulfilled' and expense_id is not null) or (status <> 'fulfilled' and expense_id is null))
);

create table if not exists purchase_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references purchase_requests(id),
  event_kind text not null check (event_kind in ('submitted','approved','rejected','fulfilled')),
  actor_name text not null check (btrim(actor_name) <> ''),
  actor_user_id uuid references auth.users(id) default auth.uid(),
  note text,
  expense_id uuid references operational_expenses(id),
  actual_amount_cop numeric check (actual_amount_cop is null or actual_amount_cop > 0),
  occurred_at timestamptz not null default now()
);

alter table operational_expenses
  add column if not exists purchase_request_id uuid references purchase_requests(id);

create unique index if not exists operational_expenses_purchase_request_uidx
  on operational_expenses(purchase_request_id)
  where purchase_request_id is not null;

alter table purchase_requests
  add constraint purchase_requests_expense_fk
  foreign key (expense_id) references operational_expenses(id);

create index if not exists purchase_requests_plant_status_idx on purchase_requests(plant_id,status,requested_at desc);
create index if not exists purchase_request_events_request_idx on purchase_request_events(request_id,occurred_at desc);

create or replace function private.purchase_request_submitted_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.purchase_request_events(request_id,event_kind,actor_name,actor_user_id,note,occurred_at)
  values(new.id,'submitted',new.requested_by_name,new.created_by,new.justification,new.requested_at);
  return new;
end;
$$;

drop trigger if exists purchase_request_submitted_event_trigger on purchase_requests;
create trigger purchase_request_submitted_event_trigger
after insert on purchase_requests
for each row execute function private.purchase_request_submitted_event();

create or replace function private.transition_purchase_request(
  p_request_id uuid,
  p_to_status text,
  p_actor_name text,
  p_note text default null
)
returns public.purchase_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_request public.purchase_requests;
begin
  select * into current_request
  from public.purchase_requests
  where id = p_request_id
  for update;

  if current_request.id is null then raise exception 'Solicitud no encontrada'; end if;
  if not private.has_plant_role(current_request.plant_id,array['supervisor','admin','director']) then raise exception 'Sin permiso para decidir esta solicitud'; end if;
  if btrim(coalesce(p_actor_name,'')) = '' then raise exception 'Indica el responsable de la decisión'; end if;
  if current_request.status <> 'submitted' or p_to_status not in ('approved','rejected') then raise exception 'Transición de solicitud no permitida'; end if;
  if p_to_status = 'rejected' and btrim(coalesce(p_note,'')) = '' then raise exception 'Indica la razón del rechazo'; end if;

  update public.purchase_requests set status = p_to_status where id = p_request_id returning * into current_request;
  insert into public.purchase_request_events(request_id,event_kind,actor_name,actor_user_id,note)
  values(p_request_id,p_to_status,btrim(p_actor_name),auth.uid(),nullif(btrim(coalesce(p_note,'')),''));
  return current_request;
end;
$$;

create or replace function private.fulfill_purchase_request(
  p_request_id uuid,
  p_actor_name text,
  p_supplier_name text,
  p_actual_amount_cop numeric,
  p_document_date date,
  p_document_ref text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_request public.purchase_requests;
  supplier_uuid uuid;
  expense_uuid uuid;
begin
  select * into current_request
  from public.purchase_requests
  where id = p_request_id
  for update;

  if current_request.id is null then raise exception 'Solicitud no encontrada'; end if;
  if not private.has_plant_role(current_request.plant_id,array['supervisor','admin','director']) then raise exception 'Sin permiso para cerrar esta solicitud'; end if;
  if current_request.status <> 'approved' then raise exception 'Solo una solicitud aprobada puede convertirse en compra real'; end if;
  if btrim(coalesce(p_actor_name,'')) = '' then raise exception 'Indica el responsable del cierre'; end if;
  if btrim(coalesce(p_supplier_name,'')) = '' then raise exception 'Indica el proveedor real'; end if;
  if p_actual_amount_cop is null or p_actual_amount_cop <= 0 then raise exception 'El monto real debe ser mayor que cero'; end if;

  insert into public.suppliers(name,created_by)
  values(btrim(p_supplier_name),auth.uid())
  on conflict (normalized_key) do update set name = public.suppliers.name
  returning id into supplier_uuid;

  insert into public.operational_expenses(
    plant_id,record_type,supplier_id,category,concept,amount_cop,document_date,document_ref,
    equipment_id,process_ref,evidence_ref,purchase_request_id,note,created_by
  ) values (
    current_request.plant_id,'purchase',supplier_uuid,current_request.category,current_request.concept,p_actual_amount_cop,p_document_date,
    nullif(btrim(coalesce(p_document_ref,'')),''),current_request.equipment_id,current_request.process_ref,current_request.evidence_ref,
    current_request.id,nullif(btrim(coalesce(p_note,'')),''),auth.uid()
  ) returning id into expense_uuid;

  update public.purchase_requests
  set status='fulfilled',expense_id=expense_uuid
  where id=current_request.id;

  insert into public.purchase_request_events(request_id,event_kind,actor_name,actor_user_id,note,expense_id,actual_amount_cop)
  values(current_request.id,'fulfilled',btrim(p_actor_name),auth.uid(),nullif(btrim(coalesce(p_note,'')),''),expense_uuid,p_actual_amount_cop);

  return expense_uuid;
end;
$$;

create or replace function public.decide_purchase_request(
  p_request_id uuid,
  p_decision text,
  p_actor_name text,
  p_note text default null
)
returns public.purchase_requests
language sql
security invoker
set search_path = ''
as $$
  select private.transition_purchase_request(p_request_id,p_decision,p_actor_name,p_note);
$$;

create or replace function public.fulfill_purchase_request(
  p_request_id uuid,
  p_actor_name text,
  p_supplier_name text,
  p_actual_amount_cop numeric,
  p_document_date date,
  p_document_ref text default null,
  p_note text default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.fulfill_purchase_request(p_request_id,p_actor_name,p_supplier_name,p_actual_amount_cop,p_document_date,p_document_ref,p_note);
$$;

revoke all on function private.transition_purchase_request(uuid,text,text,text) from public;
revoke all on function private.fulfill_purchase_request(uuid,text,text,numeric,date,text,text) from public;
revoke all on function public.decide_purchase_request(uuid,text,text,text) from public, anon;
revoke all on function public.fulfill_purchase_request(uuid,text,text,numeric,date,text,text) from public, anon;
grant execute on function private.transition_purchase_request(uuid,text,text,text) to authenticated;
grant execute on function private.fulfill_purchase_request(uuid,text,text,numeric,date,text,text) to authenticated;
grant execute on function public.decide_purchase_request(uuid,text,text,text) to authenticated;
grant execute on function public.fulfill_purchase_request(uuid,text,text,numeric,date,text,text) to authenticated;

alter table purchase_requests enable row level security;
alter table purchase_request_events enable row level security;

create policy "purchase_requests_member_select" on purchase_requests for select to authenticated
using ((select private.has_plant_access(plant_id)));

create policy "purchase_requests_insert" on purchase_requests for insert to authenticated
with check ((select private.has_plant_role(plant_id,array['operator','supervisor','technical','admin','director'])) and status='submitted' and expense_id is null);

create policy "purchase_request_events_member_select" on purchase_request_events for select to authenticated
using (exists (
  select 1 from public.purchase_requests pr
  where pr.id=request_id and private.has_plant_access(pr.plant_id)
));

-- No direct UPDATE/DELETE policies. Decisions and fulfillment occur only through guarded RPCs.
-- Estimated request amount is never copied as actual spend; fulfillment requires an explicit actual amount.
-- Fulfillment creates the actual operational expense atomically and only then marks the request fulfilled.
-- Supplier creation/reuse is concurrency-safe through the normalized unique key.
-- No inventory movement is created by this workflow.
