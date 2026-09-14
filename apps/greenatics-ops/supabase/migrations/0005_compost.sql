create table if not exists compost_piles (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  code text not null unique,
  location text not null,
  status text not null default 'active' check (status in ('active','maturing','closed')),
  initial_weight_kg numeric not null check (initial_weight_kg > 0),
  started_at timestamptz not null default now(),
  maturation_started_at timestamptz,
  closed_at timestamptz,
  final_weight_kg numeric check (final_weight_kg is null or final_weight_kg > 0),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  check (maturation_started_at is null or maturation_started_at >= started_at),
  check (closed_at is null or closed_at >= started_at),
  check (status <> 'maturing' or maturation_started_at is not null),
  check (status <> 'closed' or (maturation_started_at is not null and closed_at is not null and final_weight_kg is not null))
);

create table if not exists compost_pile_sources (
  pile_id uuid not null references compost_piles(id) on delete cascade,
  material_receipt_id uuid not null references material_receipts(id),
  primary key (pile_id, material_receipt_id)
);

create table if not exists compost_measurements (
  id uuid primary key default gen_random_uuid(),
  pile_id uuid not null references compost_piles(id) on delete cascade,
  temperature_points_c numeric[] not null,
  humidity_pct numeric,
  notes text,
  recorded_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  check (cardinality(temperature_points_c) between 3 and 5),
  check (humidity_pct is null or (humidity_pct >= 0 and humidity_pct <= 100))
);

create index if not exists compost_piles_plant_status_idx on compost_piles(plant_id, status);
create index if not exists compost_measurements_pile_recorded_idx on compost_measurements(pile_id, recorded_at desc);

alter table compost_piles enable row level security;
alter table compost_pile_sources enable row level security;
alter table compost_measurements enable row level security;

create policy "compost_piles_member_select" on compost_piles for select to authenticated
using ((select private.has_plant_access(plant_id)));
create policy "compost_piles_operator_insert" on compost_piles for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));
create policy "compost_piles_operator_update" on compost_piles for update to authenticated
using ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));

create policy "compost_sources_member_select" on compost_pile_sources for select to authenticated
using (exists (select 1 from public.compost_piles p where p.id = pile_id and (select private.has_plant_access(p.plant_id))));
create policy "compost_sources_operator_insert" on compost_pile_sources for insert to authenticated
with check (exists (select 1 from public.compost_piles p where p.id = pile_id and (select private.has_plant_role(p.plant_id, array['operator','supervisor','technical','admin','director']))));

create policy "compost_measurements_member_select" on compost_measurements for select to authenticated
using (exists (select 1 from public.compost_piles p where p.id = pile_id and (select private.has_plant_access(p.plant_id))));
create policy "compost_measurements_operator_insert" on compost_measurements for insert to authenticated
with check (exists (select 1 from public.compost_piles p where p.id = pile_id and (select private.has_plant_role(p.plant_id, array['operator','supervisor','technical','admin','director']))));

-- No automatic good/bad thresholds are encoded until technical ranges are validated.
-- No DELETE policies: operational corrections remain auditable.
