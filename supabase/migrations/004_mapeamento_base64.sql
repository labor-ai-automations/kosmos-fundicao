-- Mapeamento de peças: uma linha por foto (Base64 + observação)
DROP TABLE IF EXISTS mapeamento_pecas;

CREATE TABLE mapeamento_pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  secao TEXT NOT NULL,
  card_id TEXT NOT NULL,
  foto_index INTEGER NOT NULL DEFAULT 0,
  imagem_base64 TEXT NOT NULL,
  observacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS mapeamento_pecas_codigo_secao_idx
  ON mapeamento_pecas (codigo, secao)
  WHERE deleted_at IS NULL;
