-- Wave 2A.3 hardening · authenticated planning writes must go through the transactional RPCs.
-- service_role keeps its normal RLS bypass for controlled administration/imports.

drop policy if exists "scheduled_planner_insert" on public.scheduled_activities;
drop policy if exists "scheduled_planner_update" on public.scheduled_activities;
drop policy if exists "scheduled_activity_workers_planner_insert" on public.scheduled_activity_workers;

comment on table public.scheduled_activities is
  'Operational plan. Authenticated mutations are performed through canonical planning/start/finish RPCs so overlap and revision invariants cannot be bypassed.';
comment on table public.scheduled_activity_workers is
  'Planned worker assignments. Authenticated writes are atomic through planning RPCs; actual execution remains activity_workers.';
