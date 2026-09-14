-- R3.4 · Financial settlement write boundary.
-- Collections and payments are append-only cash facts separate from their source sale/expense.
-- Authenticated clients may read them through plant RLS, but creation is RPC-only so source
-- locking, authorization, positive amounts and over-settlement guards cannot be bypassed.

revoke insert, update, delete on table public.financial_settlements from authenticated;
grant select on table public.financial_settlements to authenticated;

comment on table public.financial_settlements is
'Append-only cash ledger. Authenticated clients read through plant RLS and create movements only through record_sale_collection or record_expense_payment; direct INSERT/UPDATE/DELETE is closed.';
comment on function public.record_sale_collection(uuid,numeric,date,text,text,text) is
'Governed collection boundary. Locks the source sale, validates plant role and amount, prevents over-collection and records an append-only collection without mutating the source sale.';
comment on function public.record_expense_payment(uuid,numeric,date,text,text,text) is
'Governed payment boundary. Locks the source purchase/expense, validates plant role and amount, prevents over-payment and records an append-only payment without mutating the source economic fact.';
