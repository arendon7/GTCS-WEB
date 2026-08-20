begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

select has_table('public','home_garden_launch_evidence_revisions','home garden evidence revision ledger exists');
select ok(has_table_privilege('authenticated','public.home_garden_launch_evidence_revisions','SELECT'),'authenticated keeps governed read privilege through RLS');
select ok(not has_table_privilege('authenticated','public.home_garden_launch_evidence_revisions','INSERT'),'authenticated cannot insert evidence directly');
select ok(not has_table_privilege('authenticated','public.home_garden_launch_evidence_revisions','UPDATE'),'authenticated cannot rewrite evidence history');
select ok(not has_table_privilege('authenticated','public.home_garden_launch_evidence_revisions','DELETE'),'authenticated cannot delete evidence history');
select ok(has_function_privilege('authenticated','public.admin_append_home_garden_launch_evidence(text,text,text,text,text,date,boolean,boolean,boolean,text)','EXECUTE'),'authenticated can execute governed evidence RPC');

insert into auth.users(id,email,created_at,updated_at) values
 ('e1000000-0000-4000-8000-000000000001','evidence-technical@greenatics.test',now(),now()),
 ('e1000000-0000-4000-8000-000000000002','evidence-supervisor@greenatics.test',now(),now()),
 ('e1000000-0000-4000-8000-000000000003','evidence-admin@greenatics.test',now(),now());
insert into public.plants(id,code,name,active) values
 ('e2000000-0000-4000-8000-000000000001','EVD-A','Evidence Plant A',true),
 ('e2000000-0000-4000-8000-000000000002','EVD-B','Evidence Plant B',true);
insert into public.profiles(id,display_name) values
 ('e1000000-0000-4000-8000-000000000001','Evidence Technical'),
 ('e1000000-0000-4000-8000-000000000002','Evidence Supervisor'),
 ('e1000000-0000-4000-8000-000000000003','Evidence Admin');
insert into public.plant_memberships(user_id,plant_id,role) values
 ('e1000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','technical'),
 ('e1000000-0000-4000-8000-000000000002','e2000000-0000-4000-8000-000000000001','supervisor'),
 ('e1000000-0000-4000-8000-000000000003','e2000000-0000-4000-8000-000000000002','admin');

set local role authenticated;
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';

select lives_ok($$select public.admin_append_home_garden_launch_evidence(
 'crece-500-g','approved-label','verified','Etiqueta CRECE 500 g','SharePoint/Wondergreen/Etiquetas/CRECE_500G.pdf','2026-08-20',true,true,true,'Arte y presentación conciliados para revisión QA.'
)$$,'technical can append a governed evidence revision');
select is((select count(*) from public.home_garden_launch_evidence_revisions),1::bigint,'first evidence revision is stored once');
select is((select evidence_kind from public.home_garden_launch_evidence_revisions limit 1),'approved-label','evidence kind is preserved');
select is((select disposition from public.home_garden_launch_evidence_revisions limit 1),'verified','evidence disposition is preserved');
select is((select created_by from public.home_garden_launch_evidence_revisions limit 1),'e1000000-0000-4000-8000-000000000001'::uuid,'evidence revision records its author');

select lives_ok($$select public.admin_append_home_garden_launch_evidence(
 'crece-500-g','approved-label','rejected','Etiqueta CRECE 500 g · revisión 2','SharePoint/Wondergreen/Etiquetas/CRECE_500G_REV2.pdf','2026-08-20',true,true,false,'La segunda revisión detectó un conflicto que vuelve a abrir el gate.'
)$$,'a correction appends a second revision instead of rewriting history');
select is((select count(*) from public.home_garden_launch_evidence_revisions),2::bigint,'correction preserves append-only history');
select is((select disposition from public.home_garden_launch_evidence_revisions order by revision_no desc limit 1),'rejected','latest revision becomes current evidence state');
select is((select disposition from public.home_garden_launch_evidence_revisions order by revision_no asc limit 1),'verified','earlier verified evidence remains auditable');

select throws_ok($$select public.admin_append_home_garden_launch_evidence(
 'crece-500-g','approved-label','draft','Signed link','https://files.example.com/a.pdf?access_token=secret',null,true,true,false,'No debe aceptar credenciales.'
)$$,'No guardes enlaces firmados, tokens ni credenciales en la referencia fuente.','signed or credential-bearing source links are rejected');
select throws_ok($$select public.admin_append_home_garden_launch_evidence(
 'crece-500-g','approved-label','draft','Future evidence','SharePoint/Future.pdf',current_date+1,true,true,false,'Fecha futura inválida.'
)$$,'La fecha de la evidencia no puede estar en el futuro.','future source dates are rejected');
select throws_ok($$select public.admin_append_home_garden_launch_evidence(
 'crece-500-g','price-sheet','draft','Invalid kind','SharePoint/Invalid.pdf',null,true,true,false,'Tipo inválido.'
)$$,'Tipo de evidencia inválido.','unknown evidence kinds cannot enter the governed ledger');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000002';
select throws_ok($$select public.admin_append_home_garden_launch_evidence(
 'crece-500-g','laboratory-report','verified','Supervisor attempt','SharePoint/Lab.pdf','2026-08-20',true,true,true,'Supervisor no autorizado.'
)$$,'No tienes permiso para administrar evidencia de lanzamiento.','supervisor cannot append company launch evidence');
select is((select count(*) from public.home_garden_launch_evidence_revisions),0::bigint,'RLS hides company launch evidence from supervisor-only users');

set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000003';
select lives_ok($$select public.admin_append_home_garden_launch_evidence(
 'equilibra-1-kg','cost-model','draft','Costo B2C en construcción','Finanzas/Modelo B2C interno.xlsx','2026-08-20',true,true,false,'El modelo todavía no cubre el checklist all-in completo.'
)$$,'admin can append company launch evidence from another plant membership');
select is((select count(*) from public.home_garden_launch_evidence_revisions),3::bigint,'authorized company role sees the complete governed evidence history');
select is((select max(revision_no)>min(revision_no) from public.home_garden_launch_evidence_revisions),true,'global revision sequence preserves deterministic history ordering');

reset role;
select * from finish();
rollback;
