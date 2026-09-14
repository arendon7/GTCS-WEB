-- CORE-004F · Canonical pilot plants.
-- Fresh environments must contain the two operational plants without requiring manual seed steps.
-- Existing rows are preserved exactly as administered.

insert into public.plants(code, name, active)
values
  ('TAM', 'Támesis', true),
  ('YAR', 'Yarumal', true)
on conflict (code) do nothing;
