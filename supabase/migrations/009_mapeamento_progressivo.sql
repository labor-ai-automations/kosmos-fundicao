-- ============================================================
-- MAPEAMENTO DE PEÇAS — fluxo progressivo (rascunho + seções)
-- Rode no Supabase → SQL Editor
--
-- ATENÇÃO: apaga a estrutura ANTIGA de mapeamento_pecas
-- (1 linha por foto). Faça backup se tiver dados importantes.
-- ============================================================

-- ----------------------------------------------------------------
-- 1) Seções por código: imagens (JSON) + endereço físico
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS mapeamento_pecas CASCADE;

CREATE TABLE mapeamento_pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  codigo TEXT NOT NULL,
  secao TEXT NOT NULL CHECK (
    secao IN (
      'ferramenta',
      'moldagem',
      'arvore',
      'peca',
      'ferramenta_macharia',
      'macho_core'
    )
  ),

  -- [{ "base64": "data:image/jpeg;base64,...", "observacao": "..." }, ...]
  imagens JSONB NOT NULL DEFAULT '[]'::jsonb,

  endereco_fisico TEXT,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_por UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX mapeamento_pecas_codigo_secao_unique
  ON mapeamento_pecas (codigo, secao)
  WHERE deleted_at IS NULL;

CREATE INDEX mapeamento_pecas_codigo_idx
  ON mapeamento_pecas (codigo)
  WHERE deleted_at IS NULL;

CREATE INDEX mapeamento_pecas_secao_idx
  ON mapeamento_pecas (secao)
  WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------
-- 2) Registro principal por código (rascunho / completo)
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS mapeamento_pecas_registros CASCADE;

CREATE TABLE mapeamento_pecas_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  codigo TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (
    status IN ('rascunho', 'completo')
  ),

  secoes_preenchidas JSONB NOT NULL DEFAULT '{
    "ferramenta": false,
    "moldagem": false,
    "arvore": false,
    "peca": false,
    "ferramenta_macharia": false,
    "macho_core": false
  }'::jsonb,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_por UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX mapeamento_pecas_registros_codigo_unique
  ON mapeamento_pecas_registros (codigo)
  WHERE deleted_at IS NULL;

CREATE INDEX mapeamento_pecas_registros_status_idx
  ON mapeamento_pecas_registros (status)
  WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------
-- 3) atualizado_em automático
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_mapeamento_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mapeamento_pecas_atualizado ON mapeamento_pecas;
CREATE TRIGGER trg_mapeamento_pecas_atualizado
  BEFORE UPDATE ON mapeamento_pecas
  FOR EACH ROW
  EXECUTE FUNCTION set_mapeamento_atualizado_em();

DROP TRIGGER IF EXISTS trg_mapeamento_registros_atualizado ON mapeamento_pecas_registros;
CREATE TRIGGER trg_mapeamento_registros_atualizado
  BEFORE UPDATE ON mapeamento_pecas_registros
  FOR EACH ROW
  EXECUTE FUNCTION set_mapeamento_atualizado_em();

-- ----------------------------------------------------------------
-- 4) Permissões + RLS
-- ----------------------------------------------------------------
GRANT ALL ON mapeamento_pecas TO authenticated;
GRANT ALL ON mapeamento_pecas TO service_role;
GRANT ALL ON mapeamento_pecas_registros TO authenticated;
GRANT ALL ON mapeamento_pecas_registros TO service_role;

ALTER TABLE mapeamento_pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeamento_pecas_registros ENABLE ROW LEVEL SECURITY;

-- mapeamento_pecas
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

-- mapeamento_pecas_registros
DROP POLICY IF EXISTS "mapeamento_registros_select" ON mapeamento_pecas_registros;
DROP POLICY IF EXISTS "mapeamento_registros_insert" ON mapeamento_pecas_registros;
DROP POLICY IF EXISTS "mapeamento_registros_update" ON mapeamento_pecas_registros;

CREATE POLICY "mapeamento_registros_select"
  ON mapeamento_pecas_registros FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "mapeamento_registros_insert"
  ON mapeamento_pecas_registros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "mapeamento_registros_update"
  ON mapeamento_pecas_registros FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
