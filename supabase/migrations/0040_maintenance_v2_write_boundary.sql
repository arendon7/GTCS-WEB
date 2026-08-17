-- R2.4A · Maintenance V2 write boundary.
-- Maintenance lifecycle mutations are owned by the audited SECURITY DEFINER RPCs.
-- Authenticated clients retain plant-scoped read access but cannot bypass lifecycle,
-- chronology, evidence, spare-part or equipment-status invariants with direct DML.

drop policy if exists "maintenance_operator_insert" on public.maintenance_tickets;
drop policy if exists "maintenance_repair_update" on public.maintenance_tickets;

revoke insert, update, delete on table public.maintenance_tickets from authenticated;

-- Keep the explicit read boundary. This is intentionally idempotent because the policy
-- originates in 0004_auth_rls.sql and remains the canonical plant-scoped read contract.
grant select on table public.maintenance_tickets to authenticated;

comment on table public.maintenance_tickets is
'Maintenance lifecycle ledger. Authenticated clients read through plant RLS; writes are RPC-only through ops_report_equipment_failure_v2, ops_start_equipment_repair_v2 and ops_close_equipment_repair_v2.';
