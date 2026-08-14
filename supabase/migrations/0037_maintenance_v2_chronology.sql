-- Mantenimiento 2.0 chronology reconciliation.
-- V2 uses failed_at as the actual occurrence time independently from report/open time.
-- Remove only legacy checks that incorrectly compare repair/close timestamps to opened_at.
-- The V2 checks failed_at -> repair_started_at -> closed_at remain authoritative.

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.maintenance_tickets'::regclass
      and c.contype = 'c'
      and c.conname not in (
        'maintenance_tickets_repair_after_failure_check',
        'maintenance_tickets_close_after_repair_check',
        'maintenance_tickets_failed_at_check'
      )
      and (
        (
          pg_get_constraintdef(c.oid) ilike '%repair_started_at%'
          and pg_get_constraintdef(c.oid) ilike '%opened_at%'
          and pg_get_constraintdef(c.oid) not ilike '%closed_at%'
        )
        or (
          pg_get_constraintdef(c.oid) ilike '%closed_at%'
          and pg_get_constraintdef(c.oid) ilike '%opened_at%'
          and pg_get_constraintdef(c.oid) not ilike '%repair_started_at%'
        )
      )
  loop
    execute format(
      'alter table public.maintenance_tickets drop constraint %I',
      constraint_name
    );
  end loop;
end
$$;
