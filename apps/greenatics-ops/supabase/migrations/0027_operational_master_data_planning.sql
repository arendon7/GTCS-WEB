-- Wave 2A.1 · Operational master data and planning foundation.
-- Additive by design: legacy text fields remain readable until curated reconciliation.

create table if not exists public.measurement_units (
  code text primary key,
  name text not null,
  symbol text not null,
  category text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (nullif(btrim(code),'') is not null),
  check (nullif(btrim(name),'') is not null),
  check (nullif(btrim(symbol),'') is not null),
  check (category in ('mass','volume','count'))
);

insert into public.measurement_units(code,name,symbol,category)
values
  ('kg','Kilogramo','kg','mass'),
  ('t','Tonelada','t','mass'),
  ('L','Litro','L','volume'),
  ('unidades','Unidades','un','count'),
  ('m3','Metro cúbico','m³','volume')
on conflict (code) do nothing;

create table if not exists public.operational_processes (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  code text not null,
  name text not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (plant_id,code),
  unique (id,plant_id),
  check (nullif(btrim(code),'') is not null),
  check (nullif(btrim(name),'') is not null)
);

insert into public.operational_processes(plant_id,code,name)
select p.id,seed.code,seed.name
from public.plants p
cross join (values
  ('RECEPCION','Recepción'),
  ('ACONDICIONAMIENTO','Acondicionamiento'),
  ('COMPOSTAJE','Compostaje'),
  ('BIODIGESTION','Biodigestión'),
  ('PRODUCCION','Producción'),
  ('MANTENIMIENTO','Mantenimiento'),
  ('ASEO','Aseo'),
  ('LOGISTICA','Logística'),
  ('OTRO','Otro')
) as seed(code,name)
where p.active
on conflict (plant_id,code) do nothing;

create table if not exists public.activity_templates (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  process_id uuid not null,
  code text not null,
  name text not null,
  default_unit_code text references public.measurement_units(code) on delete restrict,
  requires_quantity boolean not null default false,
  requires_lot boolean not null default false,
  requires_equipment boolean not null default false,
  allows_unplanned boolean not null default true,
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (plant_id,code),
  unique (id,plant_id),
  foreign key (process_id,plant_id) references public.operational_processes(id,plant_id) on delete restrict,
  check (nullif(btrim(code),'') is not null),
  check (nullif(btrim(name),'') is not null)
);

create table if not exists public.material_sources (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  code text not null,
  name text not null,
  source_kind text not null default 'generator' check (source_kind in ('generator','supplier','internal','other')),
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (plant_id,code),
  check (nullif(btrim(code),'') is not null),
  check (nullif(btrim(name),'') is not null)
);

create table if not exists public.collection_routes (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  code text not null,
  name text not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (plant_id,code),
  check (nullif(btrim(code),'') is not null),
  check (nullif(btrim(name),'') is not null)
);

create table if not exists public.material_types (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  code text not null,
  name text not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (plant_id,code),
  check (nullif(btrim(code),'') is not null),
  check (nullif(btrim(name),'') is not null)
);

insert into public.material_types(plant_id,code,name)
select p.id,seed.code,seed.name
from public.plants p
cross join (values
  ('FORSU','FORSU'),
  ('PODA','Poda'),
  ('GALLINAZA','Gallinaza'),
  ('MATERIA_PRIMA','Materia prima'),
  ('OTRO','Otro')
) as seed(code,name)
where p.active
on conflict (plant_id,code) do nothing;

-- Composite keys allow the database to enforce that planning references remain in one plant.
create unique index if not exists equipment_id_plant_uidx on public.equipment(id,plant_id);
create unique index if not exists employees_id_plant_uidx on public.employees(id,plant_id);
create unique index if not exists scheduled_activities_id_plant_uidx on public.scheduled_activities(id,plant_id);

create table if not exists public.equipment_processes (
  equipment_id uuid not null,
  process_id uuid not null,
  plant_id uuid not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (equipment_id,process_id),
  foreign key (equipment_id,plant_id) references public.equipment(id,plant_id) on delete cascade,
  foreign key (process_id,plant_id) references public.operational_processes(id,plant_id) on delete cascade
);

create table if not exists public.scheduled_activity_workers (
  scheduled_activity_id uuid not null,
  employee_id uuid not null,
  plant_id uuid not null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (scheduled_activity_id,employee_id),
  foreign key (scheduled_activity_id,plant_id) references public.scheduled_activities(id,plant_id) on delete cascade,
  foreign key (employee_id,plant_id) references public.employees(id,plant_id) on delete restrict
);

alter table public.scheduled_activities
  add column if not exists process_id uuid,
  add column if not exists activity_template_id uuid,
  add column if not exists equipment_id uuid,
  add column if not exists rescheduled_from_id uuid references public.scheduled_activities(id) on delete restrict,
  add column if not exists reschedule_reason text,
  add column if not exists rescheduled_at timestamptz,
  add column if not exists rescheduled_by uuid references auth.users(id);

alter table public.scheduled_activities
  add constraint scheduled_process_same_plant_fk
    foreign key (process_id,plant_id) references public.operational_processes(id,plant_id) on delete restrict,
  add constraint scheduled_template_same_plant_fk
    foreign key (activity_template_id,plant_id) references public.activity_templates(id,plant_id) on delete restrict,
  add constraint scheduled_equipment_same_plant_fk
    foreign key (equipment_id,plant_id) references public.equipment(id,plant_id) on delete restrict;

create unique index if not exists scheduled_rescheduled_from_uidx
  on public.scheduled_activities(rescheduled_from_id)
  where rescheduled_from_id is not null;

alter table public.activities
  add column if not exists process_id uuid,
  add column if not exists activity_template_id uuid,
  add column if not exists equipment_id uuid;

alter table public.activities
  add constraint activities_process_same_plant_fk
    foreign key (process_id,plant_id) references public.operational_processes(id,plant_id) on delete restrict,
  add constraint activities_template_same_plant_fk
    foreign key (activity_template_id,plant_id) references public.activity_templates(id,plant_id) on delete restrict,
  add constraint activities_equipment_same_plant_fk
    foreign key (equipment_id,plant_id) references public.equipment(id,plant_id) on delete restrict;

create index if not exists operational_processes_plant_active_idx
  on public.operational_processes(plant_id,active);
create index if not exists activity_templates_plant_process_active_idx
  on public.activity_templates(plant_id,process_id,active);
create index if not exists material_sources_plant_active_idx
  on public.material_sources(plant_id,active);
create index if not exists collection_routes_plant_active_idx
  on public.collection_routes(plant_id,active);
create index if not exists material_types_plant_active_idx
  on public.material_types(plant_id,active);
create index if not exists scheduled_activity_workers_employee_idx
  on public.scheduled_activity_workers(employee_id);

alter table public.measurement_units enable row level security;
alter table public.operational_processes enable row level security;
alter table public.activity_templates enable row level security;
alter table public.material_sources enable row level security;
alter table public.collection_routes enable row level security;
alter table public.material_types enable row level security;
alter table public.equipment_processes enable row level security;
alter table public.scheduled_activity_workers enable row level security;

create policy "measurement_units_authenticated_select"
  on public.measurement_units for select to authenticated
  using (true);

create policy "operational_processes_member_select"
  on public.operational_processes for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "operational_processes_planner_insert"
  on public.operational_processes for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));
create policy "operational_processes_planner_update"
  on public.operational_processes for update to authenticated
  using ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])))
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));

create policy "activity_templates_member_select"
  on public.activity_templates for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "activity_templates_planner_insert"
  on public.activity_templates for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));
create policy "activity_templates_planner_update"
  on public.activity_templates for update to authenticated
  using ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])))
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));

create policy "material_sources_member_select"
  on public.material_sources for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "material_sources_planner_insert"
  on public.material_sources for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));
create policy "material_sources_planner_update"
  on public.material_sources for update to authenticated
  using ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])))
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));

create policy "collection_routes_member_select"
  on public.collection_routes for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "collection_routes_planner_insert"
  on public.collection_routes for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));
create policy "collection_routes_planner_update"
  on public.collection_routes for update to authenticated
  using ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])))
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));

create policy "material_types_member_select"
  on public.material_types for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "material_types_planner_insert"
  on public.material_types for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));
create policy "material_types_planner_update"
  on public.material_types for update to authenticated
  using ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])))
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));

create policy "equipment_processes_member_select"
  on public.equipment_processes for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "equipment_processes_manager_insert"
  on public.equipment_processes for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['maintenance','supervisor','technical','admin','director'])));
create policy "equipment_processes_manager_update"
  on public.equipment_processes for update to authenticated
  using ((select private.has_plant_role(plant_id,array['maintenance','supervisor','technical','admin','director'])))
  with check ((select private.has_plant_role(plant_id,array['maintenance','supervisor','technical','admin','director'])));

create policy "scheduled_activity_workers_member_select"
  on public.scheduled_activity_workers for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "scheduled_activity_workers_planner_insert"
  on public.scheduled_activity_workers for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));

comment on table public.operational_processes is 'Canonical operational process master scoped by plant.';
comment on table public.activity_templates is 'Canonical activity templates used by planning and later execution.';
comment on table public.scheduled_activity_workers is 'Planned workers; actual execution remains canonical in activity_workers.';
comment on column public.scheduled_activities.process is 'Legacy/fallback label retained during Wave 2A reconciliation.';
comment on column public.scheduled_activities.equipment_ref is 'Legacy/fallback equipment reference retained during Wave 2A reconciliation.';
comment on column public.activities.process is 'Legacy/fallback label retained during Wave 2A reconciliation.';
comment on column public.activities.equipment_ref is 'Legacy/fallback equipment reference retained during Wave 2A reconciliation.';
