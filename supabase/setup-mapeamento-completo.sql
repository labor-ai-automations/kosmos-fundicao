-- ============================================================
-- SETUP COMPLETO: Mapeamento de Peças (rode UMA vez no Supabase)
-- Dashboard → SQL Editor → New query → Cole tudo → Run
-- ============================================================

-- 1) Tabela (recria se necessário — apaga fotos antigas)
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
  criado_por UUID,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX mapeamento_pecas_codigo_secao_idx
  ON mapeamento_pecas (codigo, secao)
  WHERE deleted_at IS NULL;

-- 2) Permissões de acesso
GRANT ALL ON mapeamento_pecas TO authenticated;
GRANT ALL ON mapeamento_pecas TO service_role;

-- 3) RLS — usuários logados podem ler, inserir e atualizar
ALTER TABLE mapeamento_pecas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mapeamento_pecas_select" ON mapeamento_pecas;
DROP POLICY IF EXISTS "mapeamento_pecas_insert" ON mapeamento_pecas;
DROP POLICY IF EXISTS "mapeamento_pecas_update" ON mapeamento_pecas;

CREATE POLICY "mapeamento_pecas_select"
  ON mapeamento_pecas FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "mapeamento_pecas_insert"
  ON mapeamento_pecas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "mapeamento_pecas_update"
  ON mapeamento_pecas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
