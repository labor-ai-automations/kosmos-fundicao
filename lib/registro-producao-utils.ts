import { formatDateDisplay, formatTimeRange } from "@/lib/auth";
import type { ProducaoAmbiente } from "@/lib/producao-config";
import { formatObservacaoDisplay } from "@/lib/producao-observacao";
import type {
  ProducaoColdbox,
  ProducaoMacharia,
  ProducaoVick,
  RecordWithUser,
  Refugo,
} from "@/lib/types";

export type RegistroRecord = (
  | ProducaoVick
  | ProducaoColdbox
  | ProducaoMacharia
  | Refugo
) &
  RecordWithUser;

export function formatRegistroCell(
  record: RegistroRecord,
  columnId: string,
  ambiente: ProducaoAmbiente
): string {
  switch (columnId) {
    case "data":
      return formatDateDisplay(record.data);
    case "codigo":
      if (
        ambiente === "vick" &&
        "eh_meia_placa" in record &&
        record.eh_meia_placa &&
        record.codigo_2
      ) {
        return `${record.codigo} + ${record.codigo_2}`;
      }
      return record.codigo || "—";
    case "peso":
      return record.peso_registro != null ? String(record.peso_registro) : "—";
    case "caixas":
      if ("qtde_caixas" in record) return String(record.qtde_caixas);
      return "—";
    case "percas":
      if ("percas" in record) return String(record.percas);
      return "—";
    case "setup":
      if ("setup" in record) return record.setup ? "Sim" : "Não";
      return "—";
    case "meia_placa":
      if ("eh_meia_placa" in record) {
        return record.eh_meia_placa ? "Sim" : "Não";
      }
      return "—";
    case "manual":
      if ("eh_manual" in record) {
        return record.eh_manual ? "Sim" : "Não";
      }
      return "—";
    case "observacao":
      return formatObservacaoDisplay(record.observacao);
    case "pedido_estoque":
      if ("pedido_estoque" in record) return record.pedido_estoque || "—";
      return "—";
    case "operador":
      return "operador" in record ? record.operador : "—";
    case "local":
      return "local" in record ? record.local : "—";
    case "ciclo":
      return "ciclo" in record ? `${record.ciclo}s` : "—";
    case "colaborador":
      return "colaborador" in record ? record.colaborador : "—";
    case "maquina":
      return "maquina" in record ? record.maquina : "—";
    case "qtde_feita":
      return "qtde_feita" in record ? String(record.qtde_feita) : "—";
    case "horario":
      if ("hora_inicial" in record) {
        return formatTimeRange(record.hora_inicial, record.hora_final);
      }
      return "—";
    case "fundicao":
      return "fundicao" in record ? record.fundicao : "—";
    case "qtde_perdida":
      return "qtde_perdida" in record ? String(record.qtde_perdida) : "—";
    case "motivo":
      return "motivo" in record ? record.motivo : "—";
    case "criado_por":
      return (
        record.criado_por_nome ??
        record.criado_por_email?.split("@")[0] ??
        "—"
      );
    case "criado_em":
      return new Date(record.criado_em).toLocaleString("pt-BR");
    case "archived_at":
      if ("archived_at" in record && record.archived_at) {
        return new Date(record.archived_at).toLocaleString("pt-BR");
      }
      return "—";
    default:
      return "—";
  }
}

export function buildRecordsQueryFilters(
  filters: {
    search: string;
    dataFrom?: string;
    dataTo?: string;
    pesoMin?: number;
    pesoMax?: number;
    caixasMin?: number;
    caixasMax?: number;
    setup?: boolean;
    ehMeiaPlaca?: boolean;
    ehManual?: boolean;
    pedidoEstoque?: string[];
  },
  sortBy: { column: string; direction: "asc" | "desc" } | null,
  viewMode: "active" | "archived" = "active"
) {
  return {
    search: filters.search || undefined,
    dataFrom: filters.dataFrom,
    dataTo: filters.dataTo,
    pesoMin: filters.pesoMin,
    pesoMax: filters.pesoMax,
    caixasMin: filters.caixasMin,
    caixasMax: filters.caixasMax,
    setup: filters.setup,
    ehMeiaPlaca: filters.ehMeiaPlaca,
    ehManual: filters.ehManual,
    pedidoEstoque: filters.pedidoEstoque,
    sortBy: sortBy?.column,
    sortDirection: sortBy?.direction,
    archivedOnly: viewMode === "archived" ? true : undefined,
  };
}

export function recordToExportRow(
  record: RegistroRecord,
  ambiente: ProducaoAmbiente
) {
  const base: Record<string, string | number | boolean | null> = {
    Data: formatDateDisplay(record.data),
    Código: record.codigo,
    "Peso (kg)": record.peso_registro,
    Observação: record.observacao ?? "",
    "Criado Por":
      record.criado_por_nome ??
      record.criado_por_email?.split("@")[0] ??
      "",
    "Criado Em": new Date(record.criado_em).toLocaleString("pt-BR"),
  };

  if (ambiente === "vick") {
    const row = record as ProducaoVick;
    return {
      ...base,
      "Qtde Caixas": row.qtde_caixas,
      Peças: row.percas,
      Setup: row.setup ? "Sim" : "Não",
      "Meia Placa": row.eh_meia_placa ? "Sim" : "Não",
      Manual: row.eh_manual ? "Sim" : "Não",
      "Pedido Estoque": row.pedido_estoque,
    };
  }

  if (ambiente === "coldbox") {
    const row = record as ProducaoColdbox;
    return {
      ...base,
      Operador: row.operador,
      Local: row.local,
      "Qtde Caixas": row.qtde_caixas,
      Peças: row.percas,
      Ciclo: row.ciclo,
      "Pedido Estoque": row.pedido_estoque,
    };
  }

  if (ambiente === "macharia") {
    const row = record as ProducaoMacharia;
    return {
      ...base,
      Colaborador: row.colaborador,
      Máquina: row.maquina,
      "Qtde Feita": row.qtde_feita,
      Horário: formatTimeRange(row.hora_inicial, row.hora_final),
    };
  }

  const row = record as Refugo;
  return {
    ...base,
    Fundição: row.fundicao,
    "Qtde Perdida": row.qtde_perdida,
    Motivo: row.motivo,
  };
}

const PRODUCAO_FIELD_LABELS: Record<string, string> = {
  codigo: "Código",
  codigo_2: "Código Par",
  eh_manual: "Manual",
  eh_meia_placa: "Meia Placa",
  qtde_caixas: "Quantidade de Caixas",
  peso_registro: "Peso (kg)",
  pedido_estoque: "Pedido / Estoque",
  qtde_feita: "Quantidade feita",
  qtde_perdida: "Quantidade perdida",
  hora_inicial: "Hora inicial",
  hora_final: "Hora final",
  peso_registro_2: "Peso 2 (kg)",
  tipo_placa: "Tipo de placa",
  archived_at: "Arquivado em",
  archived_by: "Arquivado por",
};

/** Rótulo legível para campos de produção (sem prefixo "eh" na UI). */
export function formatProducaoFieldLabel(key: string): string {
  if (PRODUCAO_FIELD_LABELS[key]) return PRODUCAO_FIELD_LABELS[key];

  const normalized = key.startsWith("eh_") ? key.slice(3) : key;
  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
