-- R3.2 · Sales write boundary.
-- A canonical sale is both a commercial fact and the source of an exact-lot inventory
-- dispatch. Authenticated clients therefore write sales only through ops_record_sale,
-- which validates the transaction and preserves atomicity with the inventory trigger.

-- Close legacy direct customer/sale creation paths. Customer creation in V1 is subordinate
-- to the governed sale transaction so an authenticated client cannot create orphan master rows.
drop policy if exists "sales_operator_insert" on public.sales;
drop policy if exists "customers_member_insert" on public.customers;

revoke insert, update, delete on table public.sales from authenticated;
revoke insert, update, delete on table public.customers from authenticated;

grant select on table public.sales to authenticated;
grant select on table public.customers to authenticated;

comment on table public.sales is
'Append-only commercial ledger. Authenticated clients read through plant RLS; canonical sale creation is RPC-only through ops_record_sale so the sale and exact-lot dispatch remain atomic.';
comment on table public.customers is
'Commercial customer master. Authenticated clients may read it; V1 customer creation occurs only as part of the governed ops_record_sale transaction.';
comment on function public.ops_record_sale(uuid,text,uuid,text,numeric,numeric,text) is
'Governed sale boundary. Validates plant role, product, lot, quantity and price; resolves the customer and creates the sale plus its exact-lot inventory dispatch atomically.';
