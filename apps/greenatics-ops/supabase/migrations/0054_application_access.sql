-- CORE-005 · Entitlements por aplicación para el centro Greenatics.
-- La identidad vive en Supabase Auth; este registro no sustituye las
-- membresías por planta ni concede acceso a datos por sí solo.

create table if not exists public.application_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  app_code text not null check (app_code in ('ops','huella','red','agroway','sana')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, app_code)
);

create index if not exists application_access_user_idx
  on public.application_access(user_id) where enabled;

alter table public.application_access enable row level security;

drop policy if exists "application_access_self_select" on public.application_access;
create policy "application_access_self_select"
  on public.application_access for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function private.can_manage_application_user(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists (
    select 1
    from public.plant_memberships pm
    where pm.user_id = target_user
      and pm.active
      and private.can_manage_plant(pm.plant_id)
  );
$$;

create or replace function private.has_application_access(target_app text)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists (
    select 1
    from public.application_access aa
    where aa.user_id = (select auth.uid())
      and aa.app_code = target_app
      and aa.enabled
  );
$$;

create or replace function public.admin_app_access_for_managed_plants()
returns table(user_id uuid, app_code text, enabled boolean)
language sql
stable
security definer
set search_path=''
as $$
  select distinct aa.user_id, aa.app_code, aa.enabled
  from public.application_access aa
  join public.plant_memberships pm on pm.user_id = aa.user_id and pm.active
  where private.can_manage_plant(pm.plant_id)
  order by aa.user_id, aa.app_code;
$$;

create or replace function public.admin_set_user_workspace(
  target_user uuid,
  target_display_name text,
  assignments jsonb,
  app_codes jsonb
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  app_code text;
begin
  if (select auth.uid()) is null then raise exception 'Sesión requerida.'; end if;
  if target_user is null then raise exception 'Usuario objetivo requerido.'; end if;
  if jsonb_typeof(coalesce(app_codes, '[]'::jsonb)) <> 'array' then raise exception 'Aplicaciones inválidas.'; end if;
  if jsonb_array_length(coalesce(app_codes, '[]'::jsonb)) < 1 then raise exception 'Selecciona al menos una aplicación.'; end if;
  if jsonb_array_length(coalesce(app_codes, '[]'::jsonb)) > 5 then raise exception 'Demasiadas aplicaciones.'; end if;
  if exists (
    select 1
    from jsonb_array_elements_text(app_codes) item
    group by item
    having count(*) > 1
  ) then raise exception 'Una aplicación no puede aparecer dos veces.'; end if;

  for app_code in select jsonb_array_elements_text(app_codes)
  loop
    if app_code not in ('ops','huella','red','agroway','sana') then
      raise exception 'Aplicación inválida.';
    end if;
  end loop;

  -- Reutiliza la frontera existente: valida plantas, roles y autorización
  -- del administrador antes de actualizar las aplicaciones.
  perform public.admin_set_user_memberships(target_user, target_display_name, assignments);
  if not private.can_manage_application_user(target_user) then
    raise exception 'No tienes permiso para administrar este usuario.';
  end if;

  delete from public.application_access where user_id = target_user;
  insert into public.application_access(user_id, app_code, enabled)
  select target_user, item, true
  from jsonb_array_elements_text(app_codes) item;
end;
$$;

-- Los usuarios existentes de OPS conservan su acceso actual. Los nuevos
-- usuarios reciben explícitamente sus aplicaciones desde el centro.
insert into public.application_access(user_id, app_code, enabled)
select distinct pm.user_id, 'ops', true
from public.plant_memberships pm
where pm.active
on conflict (user_id, app_code) do nothing;

revoke all on function private.can_manage_application_user(uuid) from public;
revoke all on function private.has_application_access(text) from public;
revoke all on function public.admin_app_access_for_managed_plants() from public, anon;
revoke all on function public.admin_set_user_workspace(uuid,text,jsonb,jsonb) from public, anon;

grant execute on function public.admin_app_access_for_managed_plants() to authenticated;
grant execute on function public.admin_set_user_workspace(uuid,text,jsonb,jsonb) to authenticated;
