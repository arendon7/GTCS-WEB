alter table material_receipts
  add column if not exists rejection_known boolean not null default true;

comment on column material_receipts.rejection_known is
  'True when rejection_kg is an observed/quantified mass. False preserves historical records whose rejection exists only as non-mass text (for example bultos/costales) and prevents treating missing measurement as observed zero.';
