import type { ProducaoAmbiente } from "@/lib/producao-config";

export interface RegistroColumnDef {
  id: string;
  label: string;
  defaultVisible?: boolean;
  sortable?: boolean;
}

export const REGISTRO_COLUMNS: Record<ProducaoAmbiente, RegistroColumnDef[]> = {
  vick: [
    { id: "data", label: "Data", defaultVisible: true, sortable: true },
    { id: "codigo", label: "Código", defaultVisible: true, sortable: true },
    { id: "peso", label: "Peso (kg)", defaultVisible: true, sortable: true },
    { id: "caixas", label: "Qtde Caixas", defaultVisible: true, sortable: true },
    { id: "percas", label: "Peças", defaultVisible: true, sortable: true },
    { id: "setup", label: "Setup", defaultVisible: true, sortable: true },
    { id: "meia_placa", label: "Meia Placa", defaultVisible: true, sortable: true },
    { id: "manual", label: "Manual", defaultVisible: true, sortable: true },
    { id: "observacao", label: "Observação", defaultVisible: true },
    { id: "pedido_estoque", label: "Pedido Estoque", defaultVisible: false, sortable: true },
    { id: "criado_por", label: "Criado Por", defaultVisible: false },
    { id: "criado_em", label: "Criado Em", defaultVisible: false, sortable: true },
    { id: "archived_at", label: "Arquivado em", defaultVisible: false, sortable: true },
  ],
  coldbox: [
    { id: "data", label: "Data", defaultVisible: true, sortable: true },
    { id: "operador", label: "Operador", defaultVisible: true, sortable: true },
    { id: "local", label: "Local", defaultVisible: true, sortable: true },
    { id: "codigo", label: "Código", defaultVisible: true, sortable: true },
    { id: "peso", label: "Peso (kg)", defaultVisible: true, sortable: true },
    { id: "caixas", label: "Qtde Caixas", defaultVisible: true, sortable: true },
    { id: "percas", label: "Peças", defaultVisible: true, sortable: true },
    { id: "ciclo", label: "Ciclo", defaultVisible: true, sortable: true },
    { id: "observacao", label: "Observação", defaultVisible: true },
    { id: "pedido_estoque", label: "Pedido Estoque", defaultVisible: false, sortable: true },
    { id: "criado_por", label: "Criado Por", defaultVisible: false },
    { id: "criado_em", label: "Criado Em", defaultVisible: false, sortable: true },
    { id: "archived_at", label: "Arquivado em", defaultVisible: false, sortable: true },
  ],
  macharia: [
    { id: "data", label: "Data", defaultVisible: true, sortable: true },
    { id: "colaborador", label: "Colaborador", defaultVisible: true, sortable: true },
    { id: "maquina", label: "Máquina", defaultVisible: true, sortable: true },
    { id: "funcao", label: "Função", defaultVisible: true, sortable: true },
    { id: "turno", label: "Turno", defaultVisible: true, sortable: true },
    { id: "codigo", label: "Código", defaultVisible: true, sortable: true },
    { id: "hora_inicial", label: "Hora Inicial", defaultVisible: true, sortable: true },
    { id: "hora_final", label: "Hora Final", defaultVisible: true, sortable: true },
    { id: "duracao", label: "Duração", defaultVisible: false },
    { id: "qtde_feita", label: "Qtde Feita", defaultVisible: true, sortable: true },
    { id: "qtde_perdida", label: "Qtde Perdida", defaultVisible: true, sortable: true },
    { id: "peso", label: "Peso 1", defaultVisible: false, sortable: true },
    { id: "peso_2", label: "Peso 2", defaultVisible: false, sortable: true },
    { id: "horario", label: "Horário", defaultVisible: false },
    { id: "observacao", label: "Observação", defaultVisible: true },
    { id: "criado_por", label: "Criado Por", defaultVisible: false },
    { id: "criado_em", label: "Criado Em", defaultVisible: false, sortable: true },
    { id: "archived_at", label: "Arquivado em", defaultVisible: false, sortable: true },
  ],
  refugo: [
    { id: "data", label: "Data", defaultVisible: true, sortable: true },
    { id: "codigo", label: "Código", defaultVisible: true, sortable: true },
    { id: "peso", label: "Peso (kg)", defaultVisible: true, sortable: true },
    { id: "fundicao", label: "Fundição", defaultVisible: true, sortable: true },
    { id: "qtde_perdida", label: "Qtde Perdida", defaultVisible: true, sortable: true },
    { id: "motivo", label: "Motivo", defaultVisible: true, sortable: true },
    { id: "observacao", label: "Observação", defaultVisible: true },
    { id: "criado_por", label: "Criado Por", defaultVisible: false },
    { id: "criado_em", label: "Criado Em", defaultVisible: false, sortable: true },
    { id: "archived_at", label: "Arquivado em", defaultVisible: false, sortable: true },
  ],
};

export function getDefaultVisibleColumns(ambiente: ProducaoAmbiente): string[] {
  return REGISTRO_COLUMNS[ambiente]
    .filter((col) => col.defaultVisible !== false)
    .map((col) => col.id);
}

export function getColumnLabel(ambiente: ProducaoAmbiente, columnId: string): string {
  return REGISTRO_COLUMNS[ambiente].find((col) => col.id === columnId)?.label ?? columnId;
}

/** Coluna exibida apenas na aba Arquivados */
export const ARCHIVED_ONLY_COLUMN = "archived_at";

export function getEffectiveVisibleColumns(
  visibleColumns: string[],
  viewMode: "active" | "archived"
): string[] {
  if (viewMode === "archived") {
    return visibleColumns.includes(ARCHIVED_ONLY_COLUMN)
      ? visibleColumns
      : [...visibleColumns, ARCHIVED_ONLY_COLUMN];
  }
  return visibleColumns.filter((col) => col !== ARCHIVED_ONLY_COLUMN);
}
