-- Galeria de fotos (múltiplas imagens por slot) + toggle macho
ALTER TABLE mapeamento_pecas
  ADD COLUMN IF NOT EXISTS fotos JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS usa_macho BOOLEAN DEFAULT false;
