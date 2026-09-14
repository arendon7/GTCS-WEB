create or replace function private.normalize_supply_name(value text)
returns text
language sql
immutable
set search_path=''
as $$
  select btrim(regexp_replace(regexp_replace(lower(translate(btrim(value),'ÁÉÍÓÚÜÑáéíóúüñ','AEIOUUNaeiouun')),'[^a-z0-9 ]+','','g'),'[[:space:]]+',' ','g'));
$$;

create table if not exists supplies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name)<>''),
  normalized_key text generated always as (private.normalize_supply_name(name)) stored,
  category text not null check (category in ('raw_material','input','spare_part','packaging','consumable','other')),
  unit text not null check (unit in ('kg','L','unidades')),
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create unique index if not exists supplies_normalized_unit_uidx on supplies(normalized_key,unit);

create table if not exists supply_receipts (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  supply_id uuid not null references supplies(id),
  quantity numeric not null check (quantity>0),
  lot_code text not null unique,
  received_on date not null,
  supplier_name text,
  expense_id uuid references operational_expenses(id),
  document_ref text,
  evidence_ref text,
  note text,
  created_by uuid references auth.users(id) default auth.uid(),
  recorded_at timestamptz not null default now()
);

create table if not exists supply_movements (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  supply_id uuid not null references supplies(id),
  lot_code text not null,
  kind text not null check (kind in ('receipt','consumption','adjustment_in','adjustment_out')),
  quantity numeric not null check (quantity>0),
  occurred_on date not null,
  reference_id uuid,
  destination text,
  equipment_id uuid references equipment(id),
  process_ref text,
  note text,
  created_by uuid references auth.users(id) default auth.uid(),
  recorded_at timestamptz not null default now()
);
create index if not exists supply_movements_stock_idx on supply_movements(plant_id,supply_id,lot_code,occurred_on);
create index if not exists supply_receipts_expense_idx on supply_receipts(expense_id) where expense_id is not null;

create or replace function private.supply_receipt_to_movement()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.supply_movements(plant_id,supply_id,lot_code,kind,quantity,occurred_on,reference_id,note,created_by,recorded_at)
  values(new.plant_id,new.supply_id,new.lot_code,'receipt',new.quantity,new.received_on,new.id,new.note,new.created_by,new.recorded_at);
  return new;
end;
$$;
drop trigger if exists supply_receipt_to_movement_trigger on supply_receipts;
create trigger supply_receipt_to_movement_trigger after insert on supply_receipts for each row execute function private.supply_receipt_to_movement();

create or replace function private.record_supply_receipt(
  p_plant_id uuid,
  p_supply_name text,
  p_category text,
  p_unit text,
  p_quantity numeric,
  p_received_on date,
  p_supplier_name text default null,
  p_expense_id uuid default null,
  p_document_ref text default null,
  p_evidence_ref text default null,
  p_note text default null
)
returns public.supply_receipts
language plpgsql
security definer
set search_path=''
as $$
declare
  supply_uuid uuid;
  source_expense public.operational_expenses;
  receipt public.supply_receipts;
  code text;
begin
  if not private.has_plant_role(p_plant_id,array['operator','supervisor','technical','admin','director']) then raise exception 'Sin permiso para registrar recepción'; end if;
  if btrim(coalesce(p_supply_name,''))='' then raise exception 'Indica el insumo recibido'; end if;
  if p_category not in ('raw_material','input','spare_part','packaging','consumable','other') then raise exception 'Categoría de insumo inválida'; end if;
  if p_unit not in ('kg','L','unidades') then raise exception 'Unidad de insumo inválida'; end if;
  if p_quantity is null or p_quantity<=0 then raise exception 'La cantidad recibida debe ser mayor que cero'; end if;
  if p_expense_id is not null then
    select * into source_expense from public.operational_expenses where id=p_expense_id;
    if source_expense.id is null then raise exception 'La compra/gasto enlazado no existe'; end if;
    if source_expense.plant_id<>p_plant_id then raise exception 'La compra/gasto pertenece a otra planta'; end if;
    if source_expense.record_type<>'purchase' then raise exception 'Solo una compra real puede enlazarse a recepción física'; end if;
  end if;

  insert into public.supplies(name,category,unit,created_by)
  values(btrim(p_supply_name),p_category,p_unit,auth.uid())
  on conflict (normalized_key,unit) do update set name=public.supplies.name
  returning id into supply_uuid;

  if exists(select 1 from public.supplies where id=supply_uuid and category<>p_category) then raise exception 'El insumo ya existe con otra categoría'; end if;
  code := 'SUP-'||to_char(p_received_on,'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.supply_receipts(plant_id,supply_id,quantity,lot_code,received_on,supplier_name,expense_id,document_ref,evidence_ref,note,created_by)
  values(p_plant_id,supply_uuid,p_quantity,code,p_received_on,nullif(btrim(coalesce(p_supplier_name,'')),''),p_expense_id,nullif(btrim(coalesce(p_document_ref,'')),''),nullif(btrim(coalesce(p_evidence_ref,'')),''),nullif(btrim(coalesce(p_note,'')),''),auth.uid())
  returning * into receipt;
  return receipt;
end;
$$;

create or replace function private.consume_supply(
  p_plant_id uuid,
  p_supply_id uuid,
  p_lot_code text,
  p_quantity numeric,
  p_occurred_on date,
  p_destination text,
  p_equipment_id uuid default null,
  p_process_ref text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  available numeric;
  movement_id uuid;
begin
  if not private.has_plant_role(p_plant_id,array['operator','supervisor','technical','admin','director']) then raise exception 'Sin permiso para registrar consumo'; end if;
  if p_quantity is null or p_quantity<=0 then raise exception 'La cantidad consumida debe ser mayor que cero'; end if;
  if btrim(coalesce(p_destination,''))='' then raise exception 'Indica el destino o uso'; end if;

  perform pg_advisory_xact_lock(hashtext(p_plant_id::text||'|'||p_supply_id::text||'|'||p_lot_code));
  if not exists(select 1 from public.supply_movements where plant_id=p_plant_id and supply_id=p_supply_id and lot_code=p_lot_code) then raise exception 'Lote de insumo no encontrado'; end if;
  select coalesce(sum(case when kind in ('receipt','adjustment_in') then quantity else -quantity end),0)
    into available from public.supply_movements where plant_id=p_plant_id and supply_id=p_supply_id and lot_code=p_lot_code;
  if p_quantity>available then raise exception 'Stock insuficiente en el lote'; end if;
  insert into public.supply_movements(plant_id,supply_id,lot_code,kind,quantity,occurred_on,destination,equipment_id,process_ref,note,created_by)
  values(p_plant_id,p_supply_id,p_lot_code,'consumption',p_quantity,p_occurred_on,btrim(p_destination),p_equipment_id,nullif(btrim(coalesce(p_process_ref,'')),''),nullif(btrim(coalesce(p_note,'')),''),auth.uid()) returning id into movement_id;
  return movement_id;
end;
$$;

create or replace function public.record_supply_receipt(p_plant_id uuid,p_supply_name text,p_category text,p_unit text,p_quantity numeric,p_received_on date,p_supplier_name text default null,p_expense_id uuid default null,p_document_ref text default null,p_evidence_ref text default null,p_note text default null)
returns public.supply_receipts language sql security invoker set search_path='' as $$ select private.record_supply_receipt(p_plant_id,p_supply_name,p_category,p_unit,p_quantity,p_received_on,p_supplier_name,p_expense_id,p_document_ref,p_evidence_ref,p_note); $$;
create or replace function public.consume_supply(p_plant_id uuid,p_supply_id uuid,p_lot_code text,p_quantity numeric,p_occurred_on date,p_destination text,p_equipment_id uuid default null,p_process_ref text default null,p_note text default null)
returns uuid language sql security invoker set search_path='' as $$ select private.consume_supply(p_plant_id,p_supply_id,p_lot_code,p_quantity,p_occurred_on,p_destination,p_equipment_id,p_process_ref,p_note); $$;

revoke all on function public.record_supply_receipt(uuid,text,text,text,numeric,date,text,uuid,text,text,text) from public,anon;
revoke all on function public.consume_supply(uuid,uuid,text,numeric,date,text,uuid,text,text) from public,anon;
grant execute on function public.record_supply_receipt(uuid,text,text,text,numeric,date,text,uuid,text,text,text) to authenticated;
grant execute on function public.consume_supply(uuid,uuid,text,numeric,date,text,uuid,text,text) to authenticated;

alter table supplies enable row level security;
alter table supply_receipts enable row level security;
alter table supply_movements enable row level security;
create policy "supplies_member_select" on supplies for select to authenticated using (exists(select 1 from public.plant_memberships pm where pm.user_id=(select auth.uid()) and pm.active));
create policy "supply_receipts_member_select" on supply_receipts for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "supply_movements_member_select" on supply_movements for select to authenticated using ((select private.has_plant_access(plant_id)));

-- No direct insert/update/delete policies for receipts or movements: guarded RPCs own physical stock changes.
-- Financial purchase/payment never creates stock. Only measured receipt creates an entry movement.
-- Consumption is serialized per plant+supply+lot and cannot make the physical ledger negative.
-- Physical consumption does not assign monetary production cost automatically.
