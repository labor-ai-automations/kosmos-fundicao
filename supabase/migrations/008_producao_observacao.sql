-- Campo de observação livre em todos os registros de produção

ALTER TABLE producao_vick
  ADD COLUMN IF NOT EXISTS observacao text;

ALTER TABLE producao_coldbox
  ADD COLUMN IF NOT EXISTS observacao text;

ALTER TABLE producao_macharia
  ADD COLUMN IF NOT EXISTS observacao text;

ALTER TABLE refugo
  ADD COLUMN IF NOT EXISTS observacao text;
