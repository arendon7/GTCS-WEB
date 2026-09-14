create table if not exists financial_settlements (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  kind text not null check (kind in ('collection','payment')),
  sale_id uuid references sales(id),
  expense_id uuid references operational_expenses(id),
  amount_cop numeric not null check (amount_cop > 0),
  occurred_on date not null,
  method text not null check (method in ('transfer','cash','card','other')),
  reference text,
  note text,
  created_by uuid references auth.users(id) default auth.uid(),
  recorded_at timestamptz not null default now(),
  check (
    (kind='collection' and sale_id is not null and expense_id is null) or
    (kind='payment' and expense_id is not null and sale_id is null)
  )
);

create index if not exists financial_settlements_plant_date_idx on financial_settlements(plant_id,occurred_on desc);
create index if not exists financial_settlements_sale_idx on financial_settlements(sale_id) where sale_id is not null;
create index if not exists financial_settlements_expense_idx on financial_settlements(expense_id) where expense_id is not null;

create or replace function private.record_sale_collection(
  p_sale_id uuid,
  p_amount_cop numeric,
  p_occurred_on date,
  p_method text,
  p_reference text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  source_sale public.sales;
  already numeric;
  movement_id uuid;
begin
  select * into source_sale from public.sales where id=p_sale_id for update;
  if source_sale.id is null then raise exception 'Venta no encontrada'; end if;
  if not private.has_plant_role(source_sale.plant_id,array['supervisor','admin','director']) then raise exception 'Sin permiso para registrar recaudo'; end if;
  if p_amount_cop is null or p_amount_cop<=0 then raise exception 'El monto debe ser mayor que cero'; end if;
  if p_method not in ('transfer','cash','card','other') then raise exception 'Método de recaudo inválido'; end if;
  select coalesce(sum(amount_cop),0) into already from public.financial_settlements where kind='collection' and sale_id=p_sale_id;
  if already>=source_sale.total_cop then raise exception 'La venta ya está saldada'; end if;
  if already+p_amount_cop>source_sale.total_cop then raise exception 'El recaudo excede el saldo pendiente'; end if;
  insert into public.financial_settlements(plant_id,kind,sale_id,amount_cop,occurred_on,method,reference,note,created_by)
  values(source_sale.plant_id,'collection',p_sale_id,p_amount_cop,p_occurred_on,p_method,nullif(btrim(coalesce(p_reference,'')),''),nullif(btrim(coalesce(p_note,'')),''),auth.uid()) returning id into movement_id;
  return movement_id;
end;
$$;

create or replace function private.record_expense_payment(
  p_expense_id uuid,
  p_amount_cop numeric,
  p_occurred_on date,
  p_method text,
  p_reference text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  source_expense public.operational_expenses;
  already numeric;
  movement_id uuid;
begin
  select * into source_expense from public.operational_expenses where id=p_expense_id for update;
  if source_expense.id is null then raise exception 'Compra/gasto no encontrado'; end if;
  if not private.has_plant_role(source_expense.plant_id,array['supervisor','admin','director']) then raise exception 'Sin permiso para registrar pago'; end if;
  if p_amount_cop is null or p_amount_cop<=0 then raise exception 'El monto debe ser mayor que cero'; end if;
  if p_method not in ('transfer','cash','card','other') then raise exception 'Método de pago inválido'; end if;
  select coalesce(sum(amount_cop),0) into already from public.financial_settlements where kind='payment' and expense_id=p_expense_id;
  if already>=source_expense.amount_cop then raise exception 'La compra/gasto ya está saldada'; end if;
  if already+p_amount_cop>source_expense.amount_cop then raise exception 'El pago excede el saldo pendiente'; end if;
  insert into public.financial_settlements(plant_id,kind,expense_id,amount_cop,occurred_on,method,reference,note,created_by)
  values(source_expense.plant_id,'payment',p_expense_id,p_amount_cop,p_occurred_on,p_method,nullif(btrim(coalesce(p_reference,'')),''),nullif(btrim(coalesce(p_note,'')),''),auth.uid()) returning id into movement_id;
  return movement_id;
end;
$$;

create or replace function public.record_sale_collection(p_sale_id uuid,p_amount_cop numeric,p_occurred_on date,p_method text,p_reference text default null,p_note text default null)
returns uuid language sql security invoker set search_path='' as $$
  select private.record_sale_collection(p_sale_id,p_amount_cop,p_occurred_on,p_method,p_reference,p_note);
$$;

create or replace function public.record_expense_payment(p_expense_id uuid,p_amount_cop numeric,p_occurred_on date,p_method text,p_reference text default null,p_note text default null)
returns uuid language sql security invoker set search_path='' as $$
  select private.record_expense_payment(p_expense_id,p_amount_cop,p_occurred_on,p_method,p_reference,p_note);
$$;

revoke all on function public.record_sale_collection(uuid,numeric,date,text,text,text) from public,anon;
revoke all on function public.record_expense_payment(uuid,numeric,date,text,text,text) from public,anon;
grant execute on function public.record_sale_collection(uuid,numeric,date,text,text,text) to authenticated;
grant execute on function public.record_expense_payment(uuid,numeric,date,text,text,text) to authenticated;

alter table financial_settlements enable row level security;
create policy "financial_settlements_member_select" on financial_settlements for select to authenticated using ((select private.has_plant_access(plant_id)));

-- No direct INSERT/UPDATE/DELETE policies: money movements are created only by guarded RPCs.
-- Locking the immutable source sale/expense serializes partial settlements and prevents concurrent over-settlement.
-- Collection minus payment is observed registered cash flow, never profit or bank balance.
