-- R3.5: physical supply inventory is RPC-only for authenticated clients.
-- A purchase/payment is financial evidence; only a measured receipt creates physical stock.

revoke insert, update, delete on table public.supplies from authenticated;
revoke insert, update, delete on table public.supply_receipts from authenticated;
revoke insert, update, delete on table public.supply_movements from authenticated;

grant select on table public.supplies to authenticated;
grant select on table public.supply_receipts to authenticated;
grant select on table public.supply_movements to authenticated;

revoke all on function public.record_supply_receipt(uuid,text,text,text,numeric,date,text,uuid,text,text,text) from public, anon;
revoke all on function public.consume_supply(uuid,uuid,text,numeric,date,text,uuid,text,text) from public, anon;
grant execute on function public.record_supply_receipt(uuid,text,text,text,numeric,date,text,uuid,text,text,text) to authenticated;
grant execute on function public.consume_supply(uuid,uuid,text,numeric,date,text,uuid,text,text) to authenticated;

comment on function public.record_supply_receipt(uuid,text,text,text,numeric,date,text,uuid,text,text,text) is
  'Governed R3.5 boundary for measured physical supply receipt. Creates/reuses the supply master, receipt and receipt movement atomically; a linked expense must be a purchase from the same plant.';
comment on function public.consume_supply(uuid,uuid,text,numeric,date,text,uuid,text,text) is
  'Governed R3.5 boundary for physical supply consumption. Serializes by plant+supply+lot and rejects consumption beyond available stock.';
comment on table public.supply_receipts is
  'Append-only physical receipt evidence. Authenticated clients read through RLS and write only through record_supply_receipt.';
comment on table public.supply_movements is
  'Append-only physical supply kardex. Authenticated clients read through RLS; receipt/consumption writes are produced only by governed RPC paths.';
