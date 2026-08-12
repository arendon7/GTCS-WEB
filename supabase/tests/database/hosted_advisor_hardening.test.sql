begin;

create extension if not exists pgtap with schema extensions;
select plan(17);

select is(
  (select count(*) from pg_policies where schemaname='public' and tablename='inventory_movements' and cmd='INSERT'),
  1::bigint,
  'inventory movements has one permissive INSERT policy'
);
select policies_are('public','inventory_movements',array['inventory_movements_insert','inventory_movements_member_select']::text[],'inventory policies are canonical after hardening');

select has_index('public','activities','activities_plant_idx','activities plant FK is indexed');
select has_index('public','activities','activities_import_run_idx','activities import provenance FK is indexed');
select has_index('public','employees','employees_plant_idx','employees plant FK is indexed');
select has_index('public','incidents','incidents_plant_idx','incidents plant FK is indexed');
select has_index('public','incidents','incidents_equipment_idx','incidents equipment FK is indexed');
select has_index('public','maintenance_tickets','maintenance_tickets_plant_idx','maintenance plant FK is indexed');
select has_index('public','material_receipts','material_receipts_import_run_idx','receipt provenance FK is indexed');
select has_index('public','production_records','production_records_product_idx','production product FK is indexed');
select has_index('public','production_records','production_records_source_pile_idx','production source pile FK is indexed');
select has_index('public','sales','sales_product_idx','sales product FK is indexed');
select has_index('public','scheduled_activities','scheduled_activities_plant_idx','scheduled activity plant FK is indexed');
select has_index('public','supply_receipts','supply_receipts_plant_supply_idx','supply receipt plant+supply FKs are indexed');
select has_index('public','supply_movements','supply_movements_supply_idx','supply movement supply FK is indexed');

select ok(
  position('kind = ''dispatch''' in (select with_check from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='inventory_movements_insert')) > 0,
  'combined policy preserves dispatch branch'
);
select ok(
  position('adjustment_in' in (select with_check from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='inventory_movements_insert')) > 0,
  'combined policy preserves adjustment branch'
);

select finish();
rollback;
