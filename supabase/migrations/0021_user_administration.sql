-- CORE-004 · hosted pilot user administration.
-- Auth user creation remains server-side via Supabase Auth Admin API.
-- These RPCs atomically manage application profile + plant memberships using the caller JWT.

create or replace function private.can_manage_plant(target_plant uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists (
    select 1
    from public.plant_memberships pm
    where pm.user_id=(select auth.uid())
      and pm.plant_id=target_plant
      and pm.active
      and pm.role in ('admin','director')
  );
$$;

create or replace function private.is_plant_director(target_plant uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists (
    select 1
    from public.plant_memberships pm
    where pm.user_id=(select auth.uid())
      and pm.plant_id=target_plant
      and pm.active
      and pm.role='director'
  );
$$;

create or replace function public.admin_set_user_memberships(
  target_user uuid,
  target_display_name text,
  assignments jsonb
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  assignment jsonb;
  target_plant uuid;
  target_role text;
  target_active boolean;
  assignment_count integer;
begin
  if (select auth.uid()) is null then raise exception 'Sesión requerida.'; end if;
  if target_user is null then raise exception 'Usuario objetivo requerido.'; end if;
  if not exists(select 1 from auth.users u where u.id=target_user) then raise exception 'Usuario de Auth no encontrado.'; end if;
  if nullif(btrim(target_display_name),'') is null then raise exception 'Nombre visible requerido.'; end if;
  if jsonb_typeof(coalesce(assignments,'[]'::jsonb))<>'array' then raise exception 'Asignaciones inválidas.'; end if;

  assignment_count:=jsonb_array_length(coalesce(assignments,'[]'::jsonb));
  if assignment_count=0 then raise exception 'Selecciona al menos una membresía.'; end if;
  if assignment_count>20 then raise exception 'Demasiadas membresías en una sola operación.'; end if;

  for assignment in select value from jsonb_array_elements(assignments)
  loop
    begin
      target_plant:=(assignment->>'plantId')::uuid;
    exception when others then
      raise exception 'Plant ID inválido.';
    end;
    target_role:=assignment->>'role';
    target_active:=coalesce((assignment->>'active')::boolean,true);

    if target_role not in ('operator','supervisor','technical','maintenance','admin','director') then
      raise exception 'Rol de planta inválido.';
    end if;
    if not private.can_manage_plant(target_plant) then
      raise exception 'No tienes permiso para administrar una de las plantas solicitadas.';
    end if;
    if target_role='director' and not private.is_plant_director(target_plant) then
      raise exception 'Solo un director puede asignar el rol director.';
    end if;
  end loop;

  insert into public.profiles(id,display_name,active)
  values(target_user,btrim(target_display_name),true)
  on conflict(id) do update set display_name=excluded.display_name,active=true;

  for assignment in select value from jsonb_array_elements(assignments)
  loop
    target_plant:=(assignment->>'plantId')::uuid;
    target_role:=assignment->>'role';
    target_active:=coalesce((assignment->>'active')::boolean,true);
    insert into public.plant_memberships(user_id,plant_id,role,active)
    values(target_user,target_plant,target_role,target_active)
    on conflict(user_id,plant_id)
    do update set role=excluded.role,active=excluded.active;
  end loop;
end;
$$;

create or replace function public.admin_memberships_for_managed_plants()
returns table(user_id uuid,display_name text,plant_id uuid,plant_name text,role text,active boolean)
language sql
stable
security definer
set search_path=''
as $$
  select pm.user_id,p.display_name,pm.plant_id,pl.name,pm.role,pm.active
  from public.plant_memberships pm
  join public.profiles p on p.id=pm.user_id
  join public.plants pl on pl.id=pm.plant_id
  where private.can_manage_plant(pm.plant_id)
  order by p.display_name,pl.name;
$$;

revoke all on function private.can_manage_plant(uuid) from public;
revoke all on function private.is_plant_director(uuid) from public;
revoke all on function public.admin_set_user_memberships(uuid,text,jsonb) from public,anon;
revoke all on function public.admin_memberships_for_managed_plants() from public,anon;

grant execute on function public.admin_set_user_memberships(uuid,text,jsonb) to authenticated;
grant execute on function public.admin_memberships_for_managed_plants() to authenticated;
