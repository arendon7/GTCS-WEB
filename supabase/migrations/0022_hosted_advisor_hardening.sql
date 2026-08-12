-- CORE-004C · Hosted Supabase advisor hardening.
-- Preserve inventory authorization semantics while avoiding duplicate permissive INSERT policies.

create index if not exists activities_plant_idx on public.activities(plant_id);
create index if not exists activities_import_run_idx on public.activities(import_run_id) where import_run_id is not null;
create index if not exists employees_plant_idx on public.employees(plant_id);
create index if not exists incidents_plant_idx on public.incidents(plant_id);
create index if not exists incidents_equipment_idx on public.incidents(equipment_id) where equipment_id is not null;
create index if not exists maintenance_tickets_plant_idx on public.maintenance_tickets(plant_id);
create index if not exists material_receipts_import_run_idx on public.material_receipts(import_run_id) where import_run_id is not null;
create index if not exists production_records_product_idx on public.production_records(product_id);
create index if not exists production_records_source_pile_idx on public.production_records(source_pile_id) where source_pile_id is not null;
create index if not exists sales_product_idx on public.sales(product_id);
create index if not exists scheduled_activities_plant_idx on public.scheduled_activities(plant_id);
create index if not exists supply_receipts_plant_supply_idx on public.supply_receipts(plant_id,supply_id);
create index if not exists supply_movements_supply_idx on public.supply_movements(supply_id);

drop policy if exists "inventory_dispatch_insert" on public.inventory_movements;
drop policy if exists "inventory_adjustment_insert" on public.inventory_movements;
drop policy if exists "inventory_movements_insert" on public.inventory_movements;

create policy "inventory_movements_insert"
on public.inventory_movements
for insert
to authenticated
with check (
  (
    kind = 'dispatch'
    and (select private.has_plant_role(plant_id,array['operator','supervisor','technical','admin','director']))
  )
  or
  (
    kind in ('adjustment_in','adjustment_out')
    and (select private.has_plant_role(plant_id,array['supervisor','technical','admin','director']))
  )
);

-- No unused indexes are removed here: a fresh hosted database has no representative workload yet.
-- SECURITY DEFINER RPCs remain unchanged; their role checks are an intentional transactional boundary.
