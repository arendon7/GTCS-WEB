begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

select has_table('public','public_leads','public lead PII ledger exists');
select has_table('public','public_lead_submission_events','public lead throttle ledger exists');
select ok(not has_table_privilege('anon','public.public_leads','SELECT'),'anon cannot read lead PII');
select ok(not has_table_privilege('anon','public.public_leads','INSERT'),'anon cannot insert lead PII directly');
select ok(not has_table_privilege('authenticated','public.public_leads','SELECT'),'authenticated OPS clients cannot read public lead PII directly');
select ok(not has_table_privilege('authenticated','public.public_leads','INSERT'),'authenticated OPS clients cannot insert public lead PII directly');
select ok(has_table_privilege('service_role','public.public_leads','SELECT'),'service role can support the protected admin read boundary');
select ok(has_function_privilege('service_role','public.submit_public_lead_service(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text)','EXECUTE'),'service role can call the governed lead boundary');
select ok(not has_function_privilege('anon','public.submit_public_lead_service(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text)','EXECUTE'),'anon cannot call the lead RPC directly');
select ok(not has_function_privilege('authenticated','public.submit_public_lead_service(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text)','EXECUTE'),'authenticated clients cannot call the lead RPC directly');

set local role service_role;
select lives_ok($$select public.submit_public_lead_service(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  repeat('a',64),
  'Ana Pérez','ANA@EXAMPLE.COM','+57 300 555 1212','ESP Ejemplo','Directora técnica',
  'planta','operacion','Antioquia','Dirección técnica y coordinación de operación',null,null,
  'Interés en fortalecer una planta existente.','Queremos mejorar la operación sin reemplazar infraestructura útil.'
)$$,'service boundary stores a valid public consultation');
select is((select count(*) from public.public_leads),1::bigint,'one public lead is stored');
select is((select count(*) from public.public_lead_submission_events),1::bigint,'one throttle event is stored');
select is((select consent_version from public.public_leads limit 1),'public-contact-v1','consent version is frozen on the lead');
select ok((select retention_expires_at > created_at + interval '179 days' from public.public_leads limit 1),'unconverted lead receives the 180-day retention horizon');

select lives_ok($$select public.submit_public_lead_service(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  repeat('a',64),
  'Ana Pérez','ana@example.com','+57 300 555 1212','ESP Ejemplo','Directora técnica',
  'planta','operacion','Antioquia','Dirección técnica y coordinación de operación',null,null,
  'Interés heredado','Retry del navegador.'
)$$,'same request id is idempotent');
select is((select count(*) from public.public_leads),1::bigint,'idempotent retry does not duplicate lead PII');
select is((select count(*) from public.public_lead_submission_events),1::bigint,'idempotent retry does not consume throttle quota');

select lives_ok($$select public.submit_public_lead_service('550e8400-e29b-41d4-a716-446655440001',repeat('a',64),'Lead 2','lead2@example.com',null,null,null,'empresa','diagnostico',null,null,null,null,null,null)$$,'second submission within quota lives');
select lives_ok($$select public.submit_public_lead_service('550e8400-e29b-41d4-a716-446655440002',repeat('a',64),'Lead 3','lead3@example.com',null,null,null,'empresa','diagnostico',null,null,null,null,null,null)$$,'third submission within quota lives');
select lives_ok($$select public.submit_public_lead_service('550e8400-e29b-41d4-a716-446655440003',repeat('a',64),'Lead 4','lead4@example.com',null,null,null,'empresa','diagnostico',null,null,null,null,null,null)$$,'fourth submission within quota lives');
select lives_ok($$select public.submit_public_lead_service('550e8400-e29b-41d4-a716-446655440004',repeat('a',64),'Lead 5','lead5@example.com',null,null,null,'empresa','diagnostico',null,null,null,null,null,null)$$,'fifth submission within quota lives');
select is((select count(*) from public.public_lead_submission_events),5::bigint,'quota ledger contains five accepted submissions');
select throws_ok($$select public.submit_public_lead_service('550e8400-e29b-41d4-a716-446655440005',repeat('a',64),'Lead 6','lead6@example.com',null,null,null,'empresa','diagnostico',null,null,null,null,null,null)$$,'PUBLIC_LEAD_RATE_LIMIT','sixth submission inside fifteen minutes is rejected atomically');
select is((select count(*) from public.public_leads),5::bigint,'rate-limited submission does not create PII');
select is((select source_path from public.public_leads where request_id='550e8400-e29b-41d4-a716-446655440000'),'/contacto','lead source stays on the public contact surface');
select is((select count(*) from public.customers where lower(name)=lower('Ana Pérez')),0::bigint,'public inquiry is not mixed into the OPS customer master');

reset role;
select * from finish();
rollback;
