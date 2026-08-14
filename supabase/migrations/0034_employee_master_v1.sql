-- Wave 2B.3 · Maestro de trabajadores.
-- Workers are plant-scoped operational identities. Removal means deactivation, never hard deletion.

alter table public.employees
  add column if not exists code text,
  add column if not exists provisional boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists employees_plant_code_uidx on public.employees(plant_id,code);

alter table public.employees drop constraint if exists employees_code_check;
alter table public.employees add constraint employees_code_check
  check (code is null or (nullif(btrim(code),'') is not null and code ~ '^[A-Z0-9_]{2,60}$'));

-- Employee administration is intentionally narrower than the other operational masters.
drop policy if exists "employees_supervisor_insert" on public.employees;
drop policy if exists "employees_supervisor_update" on public.employees;
revoke insert,update,delete on public.employees from authenticated;
grant select on public.employees to authenticated;

-- Neutral provisional workers let the operational forms work immediately without inventing real people.
with seed(plant_code,code,name) as (values
  ('TAM','TAM_OP_01','Operario inicial Támesis 1'),
  ('TAM','TAM_OP_02','Operario inicial Támesis 2'),
  ('TAM','TAM_OP_03','Operario inicial Támesis 3'),
  ('YAR','YAR_OP_01','Operario inicial Yarumal 1'),
  ('YAR','YAR_OP_02','Operario inicial Yarumal 2'),
  ('YAR','YAR_OP_03','Operario inicial Yarumal 3')
)
insert into public.employees(plant_id,code,display_name,active,historical,provisional)
select p.id,s.code,s.name,true,false,true
from seed s
join public.plants p on p.code=s.plant_code and p.active
on conflict (plant_id,code) do nothing;

create or replace function public.ops_admin_create_employee(
  target_plant uuid,
  employee_code text,
  employee_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_code text;
  employee_id uuid;
begin
  if not private.has_plant_role(target_plant,array['admin','director']) then
    raise exception 'Solo un administrador o director puede crear trabajadores en esta planta.';
  end if;

  normalized_code := upper(regexp_replace(coalesce(btrim(employee_code),''),'[^A-Za-z0-9]+','_','g'));
  normalized_code := regexp_replace(normalized_code,'^_+|_+$','','g');
  if normalized_code !~ '^[A-Z0-9_]{2,60}$' then raise exception 'Define un código de trabajador válido.'; end if;
  if nullif(btrim(employee_name),'') is null then raise exception 'Define el nombre del trabajador.'; end if;
  if length(btrim(employee_name))>160 then raise exception 'El nombre del trabajador es demasiado largo.'; end if;
  if not exists(select 1 from public.plants p where p.id=target_plant and p.active) then raise exception 'La planta no existe o está inactiva.'; end if;

  insert into public.employees(plant_id,code,display_name,active,historical,provisional,updated_at)
  values(target_plant,normalized_code,btrim(employee_name),true,false,false,now())
  returning id into employee_id;
  return employee_id;
exception when unique_violation then
  raise exception 'Ya existe un trabajador con ese código en la planta.';
end;
$$;

create or replace function public.ops_admin_update_employee(
  target_employee uuid,
  employee_code text,
  employee_name text,
  employee_active boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_plant uuid;
  is_historical boolean;
  was_provisional boolean;
  current_name text;
  current_code text;
  normalized_code text;
begin
  select e.plant_id,e.historical,e.provisional,e.display_name,e.code
  into target_plant,is_historical,was_provisional,current_name,current_code
  from public.employees e
  where e.id=target_employee
  for update;
  if not found then raise exception 'Trabajador no encontrado.'; end if;
  if target_plant is null then raise exception 'El trabajador no tiene una planta operacional asignada.'; end if;
  if not private.has_plant_role(target_plant,array['admin','director']) then
    raise exception 'Solo un administrador o director puede modificar trabajadores en esta planta.';
  end if;
  if is_historical then raise exception 'Los trabajadores históricos importados no se editan desde el maestro operacional.'; end if;

  normalized_code := upper(regexp_replace(coalesce(btrim(employee_code),''),'[^A-Za-z0-9]+','_','g'));
  normalized_code := regexp_replace(normalized_code,'^_+|_+$','','g');
  if normalized_code !~ '^[A-Z0-9_]{2,60}$' then raise exception 'Define un código de trabajador válido.'; end if;
  if nullif(btrim(employee_name),'') is null then raise exception 'Define el nombre del trabajador.'; end if;
  if length(btrim(employee_name))>160 then raise exception 'El nombre del trabajador es demasiado largo.'; end if;

  if not employee_active then
    if exists(
      select 1 from public.activity_workers aw
      join public.activities a on a.id=aw.activity_id
      where aw.employee_id=target_employee and a.ended_at is null
    ) then raise exception 'No puedes retirar al trabajador mientras tenga una actividad en curso.'; end if;

    if exists(
      select 1 from public.scheduled_activity_workers sw
      join public.scheduled_activities sa on sa.id=sw.scheduled_activity_id
      where sw.employee_id=target_employee
        and sa.status in ('planned','delayed')
        and coalesce(sa.planned_end,sa.planned_start)>=now()
    ) then raise exception 'Reasigna primero las actividades futuras pendientes antes de retirar al trabajador.'; end if;
  end if;

  update public.employees
  set code=normalized_code,
      display_name=btrim(employee_name),
      active=employee_active,
      provisional=case
        when was_provisional and (btrim(employee_name) is distinct from current_name or normalized_code is distinct from current_code) then false
        else was_provisional
      end,
      updated_at=now()
  where id=target_employee;
exception when unique_violation then
  raise exception 'Ya existe un trabajador con ese código en la planta.';
end;
$$;

revoke all on function public.ops_admin_create_employee(uuid,text,text) from public,anon;
revoke all on function public.ops_admin_update_employee(uuid,text,text,boolean) from public,anon;
grant execute on function public.ops_admin_create_employee(uuid,text,text) to authenticated;
grant execute on function public.ops_admin_update_employee(uuid,text,text,boolean) to authenticated;

comment on column public.employees.code is 'Stable plant-scoped operational code. Historical imported employees may remain without code.';
comment on column public.employees.provisional is 'True only for neutral initial placeholders that should be replaced with a confirmed worker identity before pilot use.';
comment on function public.ops_admin_create_employee(uuid,text,text) is 'Admin/director-only worker creation. Direct authenticated table writes remain disabled.';
comment on function public.ops_admin_update_employee(uuid,text,text,boolean) is 'Admin/director-only worker rename/activate/deactivate; no hard deletion and no retirement with current/future assignments.';
