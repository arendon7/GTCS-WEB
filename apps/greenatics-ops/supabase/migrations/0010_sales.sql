create or replace function private.normalize_customer_name(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      lower(translate(btrim(value), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  normalized_key text generated always as (private.normalize_customer_name(name)) stored,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create unique index if not exists customers_normalized_key_uidx on customers(normalized_key);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  customer_id uuid not null references customers(id),
  product_id uuid not null references inventory_products(id),
  lot_code text not null,
  quantity numeric not null check (quantity > 0),
  unit_price_cop numeric not null check (unit_price_cop > 0),
  total_cop numeric generated always as (quantity * unit_price_cop) stored,
  sold_at timestamptz not null default now(),
  note text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists sales_plant_sold_idx on sales(plant_id, sold_at desc);
create index if not exists sales_customer_sold_idx on sales(customer_id, sold_at desc);
create index if not exists sales_product_lot_idx on sales(plant_id, product_id, lot_code);

create or replace function private.sale_to_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_name text;
begin
  select c.name into customer_name
  from public.customers c
  where c.id = new.customer_id;

  if customer_name is null then
    raise exception 'Cliente % no existe', new.customer_id using errcode = '23503';
  end if;

  insert into public.inventory_movements (
    plant_id,
    product_id,
    lot_code,
    kind,
    quantity,
    reference_id,
    destination,
    note,
    occurred_at,
    created_by
  ) values (
    new.plant_id,
    new.product_id,
    new.lot_code,
    'dispatch',
    new.quantity,
    new.id,
    customer_name,
    new.note,
    new.sold_at,
    new.created_by
  );

  return new;
end;
$$;

revoke all on function private.normalize_customer_name(text) from public;
revoke all on function private.sale_to_inventory() from public;
grant execute on function private.normalize_customer_name(text) to authenticated;

drop trigger if exists sale_inventory_dispatch on sales;
create trigger sale_inventory_dispatch
after insert on sales
for each row execute function private.sale_to_inventory();

alter table customers enable row level security;
alter table sales enable row level security;

create policy "customers_member_select" on customers for select to authenticated
using (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active
));

create policy "customers_member_insert" on customers for insert to authenticated
with check (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active
));

create policy "sales_member_select" on sales for select to authenticated
using ((select private.has_plant_access(plant_id)));

create policy "sales_operator_insert" on sales for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));

-- No UPDATE/DELETE policies in the operational MVP.
-- Commercial corrections will be explicit reversal/adjustment transactions, preserving auditability.
-- The AFTER INSERT trigger is atomic with the sale: if the inventory outflow guard raises for insufficient stock,
-- the sale insert is rolled back by PostgreSQL in the same transaction.
