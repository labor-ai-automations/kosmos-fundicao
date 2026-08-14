-- Nome do operador no histórico de status (login demo usa e-mail exibido)

ALTER TABLE mapeamento_pecas_status_timeline
  ADD COLUMN IF NOT EXISTS criado_por_nome TEXT;
