create or replace function private.normalize_customer_name(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        lower(translate(btrim(value), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
        '[^a-z0-9 ]+',
        '',
        'g'
      ),
      '[[:space:]]+',
      ' ',
      'g'
    )
  );
$$;

create or replace function private.normalize_supplier_name(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        lower(translate(btrim(value), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
        '[^a-z0-9 ]+',
        '',
        'g'
      ),
      '[[:space:]]+',
      ' ',
      'g'
    )
  );
$$;

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  normalized_key text generated always as (private.normalize_supplier_name(name)) stored,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create unique index if not exists suppliers_normalized_key_uidx on suppliers(normalized_key);

create table if not exists operational_expenses (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  record_type text not null check (record_type in ('purchase','expense')),
  supplier_id uuid not null references suppliers(id),
  category text not null check (category in ('input','maintenance','services','transport','operations','administration','other')),
  concept text not null check (btrim(concept) <> ''),
  amount_cop numeric not null check (amount_cop > 0),
  document_date date not null,
  document_ref text,
  equipment_id uuid references equipment(id),
  process_ref text,
  evidence_ref text,
  note text,
  recorded_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists operational_expenses_plant_date_idx on operational_expenses(plant_id, document_date desc);
create index if not exists operational_expenses_supplier_date_idx on operational_expenses(supplier_id, document_date desc);
create index if not exists operational_expenses_category_date_idx on operational_expenses(category, document_date desc);
create index if not exists operational_expenses_equipment_idx on operational_expenses(equipment_id) where equipment_id is not null;

revoke all on function private.normalize_customer_name(text) from public;
revoke all on function private.normalize_supplier_name(text) from public;
grant execute on function private.normalize_customer_name(text) to authenticated;
grant execute on function private.normalize_supplier_name(text) to authenticated;

alter table suppliers enable row level security;
alter table operational_expenses enable row level security;

create policy "suppliers_member_select" on suppliers for select to authenticated
using (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active
));

create policy "suppliers_member_insert" on suppliers for insert to authenticated
with check (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active
));

create policy "operational_expenses_member_select" on operational_expenses for select to authenticated
using ((select private.has_plant_access(plant_id)));

create policy "operational_expenses_insert" on operational_expenses for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));

-- No UPDATE/DELETE policies in this MVP.
-- Customer and supplier normalizers intentionally match the TypeScript adapters: punctuation is removed,
-- whitespace is collapsed and accents/case are ignored, so S.A.S. and SAS resolve to the same key.
-- A registered purchase/expense is an operational economic record, not proof of payment.
-- It does not create inventory movements, maintenance tickets, cash movements or production cost allocation.
-- Future corrections must use explicit reversal/adjustment transactions to preserve auditability.
