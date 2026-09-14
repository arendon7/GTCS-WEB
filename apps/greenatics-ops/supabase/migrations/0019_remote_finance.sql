-- CORE-003 · remote financial operations.
-- Economic facts stay separated: purchase/expense != payment; sale != collection.

create or replace function public.ops_record_operational_expense(
  target_plant uuid,
  expense_record_type text,
  supplier_name text,
  expense_category text,
  expense_concept text,
  expense_amount_cop numeric,
  expense_document_date date,
  expense_document_ref text default null,
  target_equipment uuid default null,
  expense_process_ref text default null,
  expense_evidence_ref text default null,
  expense_note text default null
)
returns table(id uuid,supplier_id uuid)
language plpgsql
security definer
set search_path=''
as $$
declare
  supplier_uuid uuid;
  expense_uuid uuid;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'Sin permiso para registrar compras o gastos en esta planta';
  end if;
  if expense_record_type not in ('purchase','expense') then raise exception 'Tipo de registro económico inválido'; end if;
  if btrim(coalesce(supplier_name,''))='' then raise exception 'Indica el proveedor'; end if;
  if expense_category not in ('input','maintenance','services','transport','operations','administration','other') then raise exception 'Categoría de gasto inválida'; end if;
  if btrim(coalesce(expense_concept,''))='' then raise exception 'Describe el concepto de la compra o gasto'; end if;
  if expense_amount_cop is null or expense_amount_cop<=0 then raise exception 'El monto COP debe ser mayor que cero'; end if;
  if expense_document_date is null then raise exception 'Indica la fecha del documento'; end if;

  if target_equipment is not null and not exists (
    select 1 from public.equipment e where e.id=target_equipment and e.plant_id=target_plant
  ) then raise exception 'El equipo relacionado no pertenece a la planta'; end if;

  insert into public.suppliers(name,created_by)
  values(btrim(supplier_name),auth.uid())
  on conflict (normalized_key) do update set name=public.suppliers.name
  returning public.suppliers.id into supplier_uuid;

  insert into public.operational_expenses(
    plant_id,record_type,supplier_id,category,concept,amount_cop,document_date,document_ref,
    equipment_id,process_ref,evidence_ref,note,created_by
  ) values (
    target_plant,expense_record_type,supplier_uuid,expense_category,btrim(expense_concept),expense_amount_cop,
    expense_document_date,nullif(btrim(coalesce(expense_document_ref,'')),''),target_equipment,
    nullif(btrim(coalesce(expense_process_ref,'')),''),nullif(btrim(coalesce(expense_evidence_ref,'')),''),
    nullif(btrim(coalesce(expense_note,'')),''),auth.uid()
  ) returning public.operational_expenses.id into expense_uuid;

  return query select expense_uuid,supplier_uuid;
end;
$$;

revoke all on function public.ops_record_operational_expense(uuid,text,text,text,text,numeric,date,text,uuid,text,text,text) from public,anon;
grant execute on function public.ops_record_operational_expense(uuid,text,text,text,text,numeric,date,text,uuid,text,text,text) to authenticated;
