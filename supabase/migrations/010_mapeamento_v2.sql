-- MAPEAMENTO DE PEÇAS V2 — status, timeline, vick config, anexos

ALTER TABLE mapeamento_pecas_registros
  ADD COLUMN IF NOT EXISTS status_atual TEXT CHECK (
    status_atual IN ('disponivel', 'em_manutencao')
  ),
  ADD COLUMN IF NOT EXISTS status_definido_em TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS mapeamento_pecas_vick_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapeamento_id UUID NOT NULL REFERENCES mapeamento_pecas_registros(id),
  codigo TEXT NOT NULL,
  eh_meia_placa BOOLEAN NOT NULL DEFAULT false,
  eh_manual BOOLEAN NOT NULL DEFAULT false,
  segundo_codigo TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS mapeamento_vick_config_codigo_unique
  ON mapeamento_pecas_vick_config (codigo)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS mapeamento_pecas_status_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapeamento_id UUID NOT NULL REFERENCES mapeamento_pecas_registros(id),
  codigo TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('disponivel', 'em_manutencao')),
  status_anterior TEXT CHECK (
    status_anterior IN ('disponivel', 'em_manutencao')
  ),
  observacao TEXT,
  anexos JSONB NOT NULL DEFAULT '[]'::jsonb,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS mapeamento_timeline_codigo_idx
  ON mapeamento_pecas_status_timeline (codigo)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS mapeamento_pecas_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  timeline_id UUID NOT NULL REFERENCES mapeamento_pecas_status_timeline(id),
  tipo_anexo TEXT NOT NULL CHECK (tipo_anexo IN ('imagem', 'documento')),
  nome_original TEXT NOT NULL,
  base64 TEXT NOT NULL,
  tamanho_bytes INTEGER,
  mime_type TEXT,
  status_quando_adicionado TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

GRANT ALL ON mapeamento_pecas_vick_config TO authenticated;
GRANT ALL ON mapeamento_pecas_status_timeline TO authenticated;
GRANT ALL ON mapeamento_pecas_anexos TO authenticated;

ALTER TABLE mapeamento_pecas_vick_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeamento_pecas_status_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeamento_pecas_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vick_config_select" ON mapeamento_pecas_vick_config
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "vick_config_insert" ON mapeamento_pecas_vick_config
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vick_config_update" ON mapeamento_pecas_vick_config
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "timeline_select" ON mapeamento_pecas_status_timeline
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "timeline_insert" ON mapeamento_pecas_status_timeline
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "anexos_select" ON mapeamento_pecas_anexos
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "anexos_insert" ON mapeamento_pecas_anexos
  FOR INSERT TO authenticated WITH CHECK (true);
