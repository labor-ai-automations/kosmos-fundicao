-- Permite quantidades e valores fracionários (vírgula/ponto na UI)

ALTER TABLE producao_vick
  ALTER COLUMN qtde_caixas TYPE numeric USING qtde_caixas::numeric,
  ALTER COLUMN percas TYPE numeric USING percas::numeric;

ALTER TABLE producao_coldbox
  ALTER COLUMN qtde_caixas TYPE numeric USING qtde_caixas::numeric,
  ALTER COLUMN percas TYPE numeric USING percas::numeric,
  ALTER COLUMN ciclo TYPE numeric USING ciclo::numeric;

ALTER TABLE producao_macharia
  ALTER COLUMN qtde_feita TYPE numeric USING qtde_feita::numeric,
  ALTER COLUMN qtde_perdida TYPE numeric USING qtde_perdida::numeric;

ALTER TABLE refugo
  ALTER COLUMN qtde_perdida TYPE numeric USING qtde_perdida::numeric;
