import type { ProductionTable } from "@/lib/types";

export const ARCHIVABLE_PRODUCTION_TABLES = [
  "producao_vick",
  "producao_coldbox",
  "producao_macharia",
  "refugo",
] as const;

export type ArchivableProductionTable =
  (typeof ARCHIVABLE_PRODUCTION_TABLES)[number];

export function isArchivableProductionTable(
  table: string
): table is ArchivableProductionTable {
  return ARCHIVABLE_PRODUCTION_TABLES.includes(
    table as ArchivableProductionTable
  );
}

export type ArchiveLogAction = "arquivar" | "restaurar";

export interface ArchiveLogEntry {
  tabela: string;
  registro_id: string;
  codigo?: string | null;
  acao: ArchiveLogAction;
  motivo?: string | null;
  arquivado_por: string;
}
