-- CORE-004D · Atomic first-director bootstrap.
-- The initial privileged assignment is serialized and callable only with the server-side service role.

create or replace function public.admin_bootstrap_first_director(
  target_user uuid,
  target_display_name text,
  target_plant_codes text[]
)
returns table(plant_id uuid, plant_code text, plant_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_count integer;
  matched_count integer;
begin
  if target_user is null then
    raise exception 'El usuario objetivo es obligatorio.';
  end if;

  if target_display_name is null or length(btrim(target_display_name)) < 2 then
    raise exception 'El nombre visible debe tener al menos 2 caracteres.';
  end if;

  if target_plant_codes is null or cardinality(target_plant_codes) = 0 then
    raise exception 'Selecciona al menos una planta.';
  end if;

  if cardinality(target_plant_codes) > 20 then
    raise exception 'No se permiten más de 20 plantas en el bootstrap.';
  end if;

  if exists (
    select 1
    from unnest(target_plant_codes) as requested(code)
    where requested.code is null
       or btrim(requested.code) = ''
       or requested.code <> btrim(requested.code)
  ) then
    raise exception 'Los códigos de planta no pueden estar vacíos ni contener espacios externos.';
  end if;

  select count(distinct requested.code)
  into requested_count
  from unnest(target_plant_codes) as requested(code);

  if requested_count <> cardinality(target_plant_codes) then
    raise exception 'Una planta no puede aparecer dos veces.';
  end if;

  if not exists (select 1 from auth.users u where u.id = target_user) then
    raise exception 'El usuario Auth objetivo no existe.';
  end if;

  -- Global transaction lock for the one-time bootstrap. The second concurrent caller
  -- resumes only after the winner commits and then observes the active director.
  perform pg_catalog.pg_advisory_xact_lock(741004, 1);

  if exists (
    select 1
    from public.plant_memberships pm
    where pm.role = 'director' and pm.active
  ) then
    raise exception 'Ya existe un director activo.';
  end if;

  select count(*)
  into matched_count
  from public.plants p
  where p.active
    and p.code = any(target_plant_codes);

  if matched_count <> requested_count then
    raise exception 'No se encontraron todas las plantas activas solicitadas.';
  end if;

  insert into public.profiles(id, display_name, active)
  values (target_user, btrim(target_display_name), true)
  on conflict (id) do update
    set display_name = excluded.display_name,
        active = true;

  insert into public.plant_memberships(user_id, plant_id, role, active)
  select target_user, p.id, 'director', true
  from public.plants p
  where p.active
    and p.code = any(target_plant_codes)
  on conflict on constraint plant_memberships_pkey do update
    set role = 'director',
        active = true;

  return query
  select p.id, p.code, p.name
  from public.plants p
  where p.active
    and p.code = any(target_plant_codes)
  order by p.code;
end;
$$;

revoke all on function public.admin_bootstrap_first_director(uuid,text,text[]) from public;
revoke all on function public.admin_bootstrap_first_director(uuid,text,text[]) from anon;
revoke all on function public.admin_bootstrap_first_director(uuid,text,text[]) from authenticated;
grant execute on function public.admin_bootstrap_first_director(uuid,text,text[]) to service_role;
