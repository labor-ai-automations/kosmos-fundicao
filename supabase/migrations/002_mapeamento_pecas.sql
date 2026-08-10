-- Mapeamento visual de peças (fotos por etapa de produção)
CREATE TABLE IF NOT EXISTS mapeamento_pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  ferramenta_id TEXT,
  data DATE NOT NULL DEFAULT CURRENT_DATE,

  foto_ferramenta_topo TEXT,
  foto_ferramenta_fundo TEXT,
  foto_molde_superior TEXT,
  foto_molde_inferior TEXT,
  foto_peca_limpa TEXT,
  foto_caixa_macho_aberta TEXT,
  foto_caixa_macho_fechada TEXT,
  foto_arvore TEXT,
  foto_macho_1 TEXT,
  foto_macho_2 TEXT,

  criado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS mapeamento_pecas_codigo_data_idx
  ON mapeamento_pecas (codigo, data)
  WHERE deleted_at IS NULL;

-- Bucket de storage (executar no Supabase Dashboard se necessário):
-- Storage > New bucket > mapeamento-pecas (public)
