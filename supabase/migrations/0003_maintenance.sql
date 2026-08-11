create table if not exists maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id),
  plant_id uuid not null references plants(id),
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','repairing','closed')),
  opened_at timestamptz not null default now(),
  repair_started_at timestamptz,
  closed_at timestamptz,
  cause text,
  resolution text,
  created_at timestamptz not null default now(),
  check (repair_started_at is null or repair_started_at >= opened_at),
  check (closed_at is null or closed_at >= opened_at),
  check (status <> 'closed' or (repair_started_at is not null and closed_at is not null))
);

create index if not exists maintenance_tickets_equipment_opened_idx on maintenance_tickets (equipment_id, opened_at desc);
create index if not exists maintenance_tickets_status_idx on maintenance_tickets (status) where status <> 'closed';
create unique index if not exists maintenance_tickets_one_active_per_equipment_idx on maintenance_tickets (equipment_id) where status <> 'closed';
