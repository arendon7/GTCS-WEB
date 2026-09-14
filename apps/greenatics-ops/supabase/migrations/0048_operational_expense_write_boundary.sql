-- R3.3 · Operational expense write boundary.
-- Purchases/expenses are append-only economic facts. Authenticated clients create them only
-- through governed functions so plant role, supplier resolution, amount/document validation
-- and purchase-request fulfillment semantics cannot be bypassed with direct table DML.

drop policy if exists "operational_expenses_insert" on public.operational_expenses;
drop policy if exists "suppliers_member_insert" on public.suppliers;

revoke insert, update, delete on table public.operational_expenses from authenticated;
revoke insert, update, delete on table public.suppliers from authenticated;

grant select on table public.operational_expenses to authenticated;
grant select on table public.suppliers to authenticated;

comment on table public.operational_expenses is
'Append-only operational economic ledger. Authenticated clients read through plant RLS; standalone purchase/expense creation is RPC-only through ops_record_operational_expense and approved-request fulfillment remains atomic through fulfill_purchase_request.';
comment on table public.suppliers is
'Supplier master used by governed economic transactions. Authenticated clients may read it; V1 supplier creation/reuse occurs only inside governed expense or approved purchase-request fulfillment transactions.';
comment on function public.ops_record_operational_expense(uuid,text,text,text,text,numeric,date,text,uuid,text,text,text) is
'Governed standalone purchase/expense boundary. Validates plant role, record semantics, positive amount, document date and same-plant equipment; resolves supplier and creates the economic fact atomically.';
