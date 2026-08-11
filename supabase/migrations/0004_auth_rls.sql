create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

do $$ begin
  alter table equipment add column if not exists area text;
  alter table scheduled_activities add column if not exists created_by uuid references auth.users(id) default auth.uid();
  alter table activities add column if not exists created_by uuid references auth.users(id) default auth.uid();
  alter table incidents add column if not exists created_by uuid references auth.users(id) default auth.uid();
  alter table material_receipts add column if not exists created_by uuid references auth.users(id) default auth.uid();
  alter table maintenance_tickets add column if not exists created_by uuid references auth.users(id) default auth.uid();
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists plant_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references plants(id) on delete cascade,
  role text not null check (role in ('operator','supervisor','technical','maintenance','admin','director')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, plant_id)
);

create index if not exists plant_memberships_user_idx on plant_memberships(user_id) where active;
create index if not exists plant_memberships_plant_idx on plant_memberships(plant_id) where active;

create or replace function private.has_plant_access(target_plant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.plant_memberships pm
    where pm.user_id = (select auth.uid())
      and pm.plant_id = target_plant
      and pm.active
  );
$$;

create or replace function private.has_plant_role(target_plant uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.plant_memberships pm
    where pm.user_id = (select auth.uid())
      and pm.plant_id = target_plant
      and pm.active
      and pm.role = any(allowed_roles)
  );
$$;

revoke all on function private.has_plant_access(uuid) from public;
revoke all on function private.has_plant_role(uuid, text[]) from public;
grant execute on function private.has_plant_access(uuid) to authenticated;
grant execute on function private.has_plant_role(uuid, text[]) to authenticated;

alter table profiles enable row level security;
alter table plant_memberships enable row level security;
alter table plants enable row level security;
alter table employees enable row level security;
alter table scheduled_activities enable row level security;
alter table activities enable row level security;
alter table activity_workers enable row level security;
alter table equipment enable row level security;
alter table incidents enable row level security;
alter table material_receipts enable row level security;
alter table maintenance_tickets enable row level security;

create policy "profiles_self_select" on profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_self_update" on profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "memberships_read_visible" on plant_memberships for select to authenticated
using (user_id = (select auth.uid()) or (select private.has_plant_role(plant_id, array['admin','director'])));
create policy "memberships_admin_insert" on plant_memberships for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['admin','director'])));
create policy "memberships_admin_update" on plant_memberships for update to authenticated
using ((select private.has_plant_role(plant_id, array['admin','director'])))
with check ((select private.has_plant_role(plant_id, array['admin','director'])));

create policy "plants_member_select" on plants for select to authenticated using ((select private.has_plant_access(id)));
create policy "plants_admin_update" on plants for update to authenticated
using ((select private.has_plant_role(id, array['admin','director'])))
with check ((select private.has_plant_role(id, array['admin','director'])));

create policy "employees_member_select" on employees for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "employees_supervisor_write" on employees for all to authenticated
using ((select private.has_plant_role(plant_id, array['supervisor','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['supervisor','admin','director'])));

create policy "scheduled_member_select" on scheduled_activities for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "scheduled_planner_write" on scheduled_activities for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['supervisor','technical','admin','director'])));
create policy "scheduled_planner_update" on scheduled_activities for update to authenticated
using ((select private.has_plant_role(plant_id, array['supervisor','technical','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['supervisor','technical','admin','director'])));

create policy "activities_member_select" on activities for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "activities_operator_insert" on activities for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));
create policy "activities_operator_update" on activities for update to authenticated
using ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));

create policy "activity_workers_member_select" on activity_workers for select to authenticated
using (exists (select 1 from public.activities a where a.id = activity_id and (select private.has_plant_access(a.plant_id))));
create policy "activity_workers_operator_insert" on activity_workers for insert to authenticated
with check (exists (select 1 from public.activities a where a.id = activity_id and (select private.has_plant_role(a.plant_id, array['operator','supervisor','technical','admin','director']))));

create policy "equipment_member_select" on equipment for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "equipment_maintenance_update" on equipment for update to authenticated
using ((select private.has_plant_role(plant_id, array['maintenance','supervisor','technical','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['maintenance','supervisor','technical','admin','director'])));

create policy "incidents_member_select" on incidents for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "incidents_operator_insert" on incidents for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','maintenance','admin','director'])));
create policy "incidents_maint_update" on incidents for update to authenticated
using ((select private.has_plant_role(plant_id, array['maintenance','supervisor','technical','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['maintenance','supervisor','technical','admin','director'])));

create policy "receipts_member_select" on material_receipts for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "receipts_operator_insert" on material_receipts for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));
create policy "receipts_supervisor_update" on material_receipts for update to authenticated
using ((select private.has_plant_role(plant_id, array['supervisor','technical','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['supervisor','technical','admin','director'])));

create policy "maintenance_member_select" on maintenance_tickets for select to authenticated using ((select private.has_plant_access(plant_id)));
create policy "maintenance_operator_insert" on maintenance_tickets for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','maintenance','admin','director'])));
create policy "maintenance_repair_update" on maintenance_tickets for update to authenticated
using ((select private.has_plant_role(plant_id, array['maintenance','supervisor','technical','admin','director'])))
with check ((select private.has_plant_role(plant_id, array['maintenance','supervisor','technical','admin','director'])));

-- Deletes are intentionally not granted for operational records. Corrections should be auditable updates/versioned actions.
