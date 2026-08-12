-- CORE-004H · Trigger functions execute only through their registered triggers.
-- They are not application RPCs and must not retain callable ACLs for API roles.

revoke execute on function private.purchase_request_submitted_event()
from public, anon, authenticated, service_role;

revoke execute on function private.supply_receipt_to_movement()
from public, anon, authenticated, service_role;
