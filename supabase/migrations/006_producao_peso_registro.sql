-- Peso registrado no momento da produção (não altera cadastro de itens)

ALTER TABLE producao_vick
  ADD COLUMN IF NOT EXISTS peso_registro numeric;

ALTER TABLE producao_coldbox
  ADD COLUMN IF NOT EXISTS peso_registro numeric,
  ADD COLUMN IF NOT EXISTS peso_macho_registro numeric;

ALTER TABLE producao_macharia
  ADD COLUMN IF NOT EXISTS peso_registro numeric,
  ADD COLUMN IF NOT EXISTS peso_registro_2 numeric;

ALTER TABLE refugo
  ADD COLUMN IF NOT EXISTS peso_registro numeric;
