-- CORE-003 · atomic commercial sale + exact-lot inventory dispatch.
-- The existing AFTER INSERT sales trigger creates the inventory outflow in the same transaction.

create or replace function public.ops_record_sale(
  target_plant uuid,
  customer_name text,
  target_product uuid,
  target_lot text,
  sale_quantity numeric,
  sale_unit_price_cop numeric,
  sale_note text default null
)
returns table(id uuid, movement_id uuid, customer_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_customer text;
  customer_key text;
  resolved_customer_id uuid;
  product_active boolean;
  sale_id uuid;
  inventory_movement_id uuid;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar ventas en esta planta.';
  end if;

  clean_customer := regexp_replace(btrim(customer_name),'\s+',' ','g');
  if nullif(clean_customer,'') is null then raise exception 'Indica el cliente de la venta.'; end if;
  if nullif(btrim(target_lot),'') is null then raise exception 'Selecciona un lote con stock.'; end if;
  if sale_quantity is null or sale_quantity <= 0 then raise exception 'La cantidad vendida debe ser mayor que cero.'; end if;
  if sale_unit_price_cop is null or sale_unit_price_cop <= 0 then raise exception 'El precio unitario debe ser mayor que cero.'; end if;

  select p.active into product_active from public.inventory_products p where p.id=target_product;
  if product_active is null then raise exception 'Producto no encontrado.'; end if;
  if not product_active then raise exception 'Producto inactivo.'; end if;

  customer_key := private.normalize_customer_name(clean_customer);
  select c.id into resolved_customer_id from public.customers c where c.normalized_key=customer_key;

  if resolved_customer_id is null then
    begin
      insert into public.customers(name,created_by)
      values(clean_customer,auth.uid())
      returning customers.id into resolved_customer_id;
    exception when unique_violation then
      select c.id into resolved_customer_id from public.customers c where c.normalized_key=customer_key;
    end;
  end if;

  if resolved_customer_id is null then raise exception 'No fue posible resolver el cliente de la venta.'; end if;

  insert into public.sales(
    plant_id,customer_id,product_id,lot_code,quantity,unit_price_cop,note,created_by
  ) values (
    target_plant,resolved_customer_id,target_product,btrim(target_lot),sale_quantity,sale_unit_price_cop,nullif(btrim(sale_note),''),auth.uid()
  ) returning sales.id into sale_id;

  -- sale_inventory_dispatch runs synchronously here. The inventory outflow guard
  -- rejects the whole transaction if this exact lot would become negative.
  select m.id into inventory_movement_id
  from public.inventory_movements m
  where m.reference_id=sale_id and m.kind='dispatch'
  order by m.occurred_at desc
  limit 1;

  if inventory_movement_id is null then
    raise exception 'La venta no generó su movimiento de inventario.';
  end if;

  return query select sale_id,inventory_movement_id,resolved_customer_id;
end;
$$;

revoke all on function public.ops_record_sale(uuid,text,uuid,text,numeric,numeric,text) from public,anon;
grant execute on function public.ops_record_sale(uuid,text,uuid,text,numeric,numeric,text) to authenticated;
