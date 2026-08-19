-- Arquivamento de registros de refugo (alinhado a VICK / COLDBOX / MACHARIA)

ALTER TABLE refugo
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid;
