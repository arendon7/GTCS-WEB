-- Public Contact · governed lead capture.
-- Public leads contain PII and intentionally live outside GREENATICS OPS operational masters.
-- The browser never writes this table directly: a server-side route calls the service-only RPC.

create table public.public_leads (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  status text not null default 'new' check (status in ('new','contacted','closed','discarded')),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  email text check (email is null or char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) between 7 and 40),
  organization text check (organization is null or char_length(organization) <= 180),
  role_title text check (role_title is null or char_length(role_title) <= 120),
  audience text not null check (audience in ('esp','municipio','empresa','ph','planta','wondergreen','otro')),
  need text not null check (need in ('diagnostico','planeacion','regulacion','rutas','planta','operacion','datos','valorizacion','nutricion','distribucion','otro')),
  location text check (location is null or char_length(location) <= 180),
  service text check (service is null or char_length(service) <= 180),
  product text check (product is null or char_length(product) <= 180),
  crop text check (crop is null or char_length(crop) <= 120),
  context text check (context is null or char_length(context) <= 480),
  details text check (details is null or char_length(details) <= 1500),
  source_path text not null default '/contacto' check (char_length(source_path) <= 300),
  consent_version text not null default 'public-contact-v1',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  retention_expires_at timestamptz not null default (now() + interval '180 days'),
  constraint public_leads_contact_required check (email is not null or phone is not null),
  constraint public_leads_retention_after_creation check (retention_expires_at > created_at)
);

create table public.public_lead_submission_events (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.public_leads(id) on delete cascade,
  request_fingerprint text not null check (request_fingerprint ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index public_lead_submission_events_fingerprint_created_idx
  on public.public_lead_submission_events(request_fingerprint, created_at desc);
create index public_leads_status_created_idx on public.public_leads(status, created_at desc);
create index public_leads_retention_idx on public.public_leads(retention_expires_at);

alter table public.public_leads enable row level security;
alter table public.public_lead_submission_events enable row level security;

-- PII is never exposed through the public/authenticated Supabase client roles.
revoke all on table public.public_leads from public, anon, authenticated;
revoke all on table public.public_lead_submission_events from public, anon, authenticated;
grant select, insert, update, delete on table public.public_leads to service_role;
grant select, insert, update, delete on table public.public_lead_submission_events to service_role;
grant usage, select on sequence public.public_lead_submission_events_id_seq to service_role;

create or replace function public.submit_public_lead_service(
  p_request_id uuid,
  p_request_fingerprint text,
  p_name text,
  p_email text,
  p_phone text,
  p_organization text,
  p_role_title text,
  p_audience text,
  p_need text,
  p_location text,
  p_service text,
  p_product text,
  p_crop text,
  p_context text,
  p_details text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_lead_id uuid;
  new_lead_id uuid;
  recent_submissions integer;
begin
  if p_request_id is null then
    raise exception 'PUBLIC_LEAD_INVALID_REQUEST_ID';
  end if;
  if p_request_fingerprint is null or p_request_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'PUBLIC_LEAD_INVALID_FINGERPRINT';
  end if;

  -- Idempotent browser retries return the original lead and do not consume rate-limit quota.
  select l.id into existing_lead_id
  from public.public_leads l
  where l.request_id = p_request_id;
  if existing_lead_id is not null then
    return existing_lead_id;
  end if;

  -- Serialize submissions by pseudonymous connection fingerprint so concurrent requests
  -- cannot race the quota check.
  perform pg_advisory_xact_lock(hashtext(p_request_fingerprint)::bigint);

  select l.id into existing_lead_id
  from public.public_leads l
  where l.request_id = p_request_id;
  if existing_lead_id is not null then
    return existing_lead_id;
  end if;

  select count(*)::integer into recent_submissions
  from public.public_lead_submission_events e
  where e.request_fingerprint = p_request_fingerprint
    and e.created_at >= now() - interval '15 minutes';

  if recent_submissions >= 5 then
    raise exception 'PUBLIC_LEAD_RATE_LIMIT';
  end if;

  insert into public.public_leads(
    request_id,
    name,
    email,
    phone,
    organization,
    role_title,
    audience,
    need,
    location,
    service,
    product,
    crop,
    context,
    details
  ) values (
    p_request_id,
    btrim(p_name),
    nullif(lower(btrim(coalesce(p_email,''))),''),
    nullif(btrim(coalesce(p_phone,'')),''),
    nullif(btrim(coalesce(p_organization,'')),''),
    nullif(btrim(coalesce(p_role_title,'')),''),
    p_audience,
    p_need,
    nullif(btrim(coalesce(p_location,'')),''),
    nullif(btrim(coalesce(p_service,'')),''),
    nullif(btrim(coalesce(p_product,'')),''),
    nullif(btrim(coalesce(p_crop,'')),''),
    nullif(btrim(coalesce(p_context,'')),''),
    nullif(btrim(coalesce(p_details,'')),'')
  ) returning id into new_lead_id;

  insert into public.public_lead_submission_events(lead_id, request_fingerprint)
  values (new_lead_id, p_request_fingerprint);

  return new_lead_id;
end;
$$;

revoke all on function public.submit_public_lead_service(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_public_lead_service(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text) to service_role;

comment on table public.public_leads is
'PII-bearing public commercial inquiries. Separate from OPS customers and operational masters; no anon/authenticated table privileges. Unconverted inquiries default to 180-day retention.';
comment on table public.public_lead_submission_events is
'Non-PII submission throttle ledger keyed only by a server-generated HMAC fingerprint; raw client IP is never persisted.';
comment on function public.submit_public_lead_service(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text) is
'Service-role-only public lead boundary. Provides idempotent request handling and an atomic five-submissions-per-15-minutes connection quota before storing PII.';
