create table if not exists material_receipts (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  generator text not null,
  route text not null,
  waste_type text not null check (waste_type in ('FORSU','PODA','GALLINAZA','MATERIA_PRIMA','OTRO')),
  net_weight_kg numeric not null check (net_weight_kg > 0),
  rejection_kg numeric not null default 0 check (rejection_kg >= 0 and rejection_kg <= net_weight_kg),
  acceptance_status text not null default 'accepted' check (acceptance_status in ('accepted','conditioned','rejected')),
  observation text,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  lot_code text not null unique,
  created_at timestamptz not null default now(),
  check (ended_at >= started_at)
);

create index if not exists material_receipts_plant_ended_idx on material_receipts (plant_id, ended_at desc);
