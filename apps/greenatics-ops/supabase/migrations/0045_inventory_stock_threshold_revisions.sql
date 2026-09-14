-- R2.6B · Governed inventory criticality thresholds.
-- Thresholds are policy, not measured stock. They are append-only revisions per plant/product.
-- A NULL minimum explicitly clears the threshold; it never means zero and never classifies stock as healthy.

create table if not exists public.inventory_stock_threshold_revisions (
  id uuid primary key default gen_random_uuid(),
  revision_no bigint generated always as identity unique,
  plant_id uuid not null references public.plants(id) on delete restrict,
  product_id uuid not null references public.inventory_products(id) on delete restrict,
  minimum_quantity numeric,
  note text not null check (btrim(note) <> ''),
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  check (minimum_quantity is null or minimum_quantity > 0)
);

create index if not exists inventory_stock_threshold_revisions_lookup_idx
  on public.inventory_stock_threshold_revisions(plant_id,product_id,revision_no desc);

alter table public.inventory_stock_threshold_revisions enable row level security;

drop policy if exists "inventory_stock_threshold_revisions_member_select" on public.inventory_stock_threshold_revisions;
create policy "inventory_stock_threshold_revisions_member_select"
on public.inventory_stock_threshold_revisions
for select to authenticated
using ((select private.has_plant_access(plant_id)));

revoke insert, update, delete on table public.inventory_stock_threshold_revisions from authenticated;
grant select on table public.inventory_stock_threshold_revisions to authenticated;

create or replace function public.ops_set_inventory_stock_threshold(
  target_plant uuid,
  target_product uuid,
  threshold_minimum_quantity numeric,
  threshold_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  revision_id uuid;
  product_active boolean;
  clean_note text := nullif(btrim(threshold_note),'');
begin
  if not private.has_plant_role(target_plant,array['technical','admin','director']) then
    raise exception 'No tienes permiso para definir umbrales de inventario en esta planta.';
  end if;
  if clean_note is null then
    raise exception 'Registra el motivo o criterio del umbral.';
  end if;
  if length(clean_note) > 1000 then
    raise exception 'El motivo del umbral es demasiado largo.';
  end if;
  if threshold_minimum_quantity is not null and threshold_minimum_quantity <= 0 then
    raise exception 'El umbral debe ser mayor que cero o quedar vacío para desactivarlo.';
  end if;

  select p.active into product_active
  from public.inventory_products p
  where p.id=target_product;
  if product_active is null then raise exception 'Producto no encontrado.'; end if;
  if not product_active then raise exception 'Producto inactivo.'; end if;

  -- Serialize policy revisions for this exact plant/product pair.
  perform pg_advisory_xact_lock(hashtextextended('greenatics-stock-threshold:' || target_plant::text || ':' || target_product::text,0));

  insert into public.inventory_stock_threshold_revisions(
    plant_id,product_id,minimum_quantity,note,created_by
  ) values (
    target_plant,target_product,threshold_minimum_quantity,clean_note,auth.uid()
  ) returning id into revision_id;

  return revision_id;
end;
$$;

revoke all on function public.ops_set_inventory_stock_threshold(uuid,uuid,numeric,text) from public,anon;
grant execute on function public.ops_set_inventory_stock_threshold(uuid,uuid,numeric,text) to authenticated;

comment on table public.inventory_stock_threshold_revisions is
'Append-only policy history for minimum finished-goods stock by plant and product. The latest revision is current; NULL minimum means explicitly unconfigured.';
comment on column public.inventory_stock_threshold_revisions.minimum_quantity is
'Configured minimum in the product master unit. NULL explicitly clears the threshold; zero is not used as a sentinel.';
comment on function public.ops_set_inventory_stock_threshold(uuid,uuid,numeric,text) is
'Appends one governed threshold revision. Only technical/admin/director roles may define or clear inventory criticality policy.';
