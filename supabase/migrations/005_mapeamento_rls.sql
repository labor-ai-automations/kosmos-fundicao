-- RLS + permissões para mapeamento_pecas
GRANT ALL ON mapeamento_pecas TO authenticated;
GRANT ALL ON mapeamento_pecas TO service_role;

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

-- FK opcional: evita falha se perfil não existir em auth.users
ALTER TABLE mapeamento_pecas
  DROP CONSTRAINT IF EXISTS mapeamento_pecas_criado_por_fkey;
