import { subDays } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDateForDb } from "@/lib/auth";
import { parseDbDate, todayDbString } from "@/lib/date-utils";
import type {
  Comparacao,
  DashboardKPIs,
  GraficoProducaoDia,
} from "@/lib/hooks/useDashboardVick";

type VickRow = {
  data: string;
  qtde_caixas: number;
  peso_registro: number | null;
  percas: number;
  setup: boolean;
  codigo: string;
  eh_manual?: boolean | null;
  eh_meia_placa?: boolean | null;
  tipo_placa?: string | null;
};

export interface DashboardVickResult {
  kpis: DashboardKPIs;
  grafico7Dias: GraficoProducaoDia[];
  comparacao: Comparacao[];
  referenciaData: string | null;
  isHoje: boolean;
}

function normalizeRowDate(value: string): string {
  return value.split("T")[0];
}

function normalizeRows(rows: VickRow[]): VickRow[] {
  return rows.map((row) => ({
    ...row,
    data: normalizeRowDate(row.data),
  }));
}

function last7DayStrings(): string[] {
  const today = parseDbDate(todayDbString());
  if (!today) return [];

  return Array.from({ length: 7 }, (_, index) =>
    formatDateForDb(subDays(today, 6 - index))
  );
}

function classifyTipo(row: VickRow): "normal" | "manual" | "meia_placa" {
  if (row.eh_manual || row.tipo_placa === "manual") return "manual";
  if (row.eh_meia_placa || row.tipo_placa === "meia_placa") {
    return "meia_placa";
  }
  return "normal";
}

function aggregateKpis(rows: VickRow[]): DashboardKPIs {
  const totalRegistros = rows.length;

  if (totalRegistros === 0) {
    return {
      total_caixas: 0,
      total_peso_kg: 0,
      taxa_setup_pct: 0,
      codigos_unicos: 0,
      media_pecas: 0,
      tipo_normal: 0,
      tipo_manual: 0,
      tipo_meia_placa: 0,
      total_registros: 0,
      setups_realizados: 0,
    };
  }

  const totalCaixas = rows.reduce((sum, row) => sum + (row.qtde_caixas ?? 0), 0);
  const totalPeso = rows.reduce(
    (sum, row) => sum + (row.peso_registro ?? 0),
    0
  );
  const setupsRealizados = rows.filter((row) => row.setup).length;
  const codigosUnicos = new Set(rows.map((row) => row.codigo)).size;
  const totalPecas = rows.reduce((sum, row) => sum + (row.percas ?? 0), 0);

  let tipoManual = 0;
  let tipoMeiaPlaca = 0;

  for (const row of rows) {
    const tipo = classifyTipo(row);
    if (tipo === "manual") tipoManual += 1;
    if (tipo === "meia_placa") tipoMeiaPlaca += 1;
  }

  return {
    total_caixas: totalCaixas,
    total_peso_kg: Math.round(totalPeso * 10) / 10,
    taxa_setup_pct: Math.round((setupsRealizados / totalRegistros) * 100),
    codigos_unicos: codigosUnicos,
    media_pecas: Math.round(totalPecas / totalRegistros),
    tipo_normal: totalRegistros - tipoManual - tipoMeiaPlaca,
    tipo_manual: tipoManual,
    tipo_meia_placa: tipoMeiaPlaca,
    total_registros: totalRegistros,
    setups_realizados: setupsRealizados,
  };
}

function pickKpiRows(rows: VickRow[]): {
  rows: VickRow[];
  referenciaData: string | null;
  isHoje: boolean;
} {
  const today = todayDbString();
  const todayRows = rows.filter((row) => row.data === today);

  if (todayRows.length > 0) {
    return { rows: todayRows, referenciaData: today, isHoje: true };
  }

  const daysWithData = [...new Set(rows.map((row) => row.data))].sort().reverse();
  if (daysWithData.length === 0) {
    return { rows: [], referenciaData: null, isHoje: false };
  }

  const referenciaData = daysWithData[0];
  return {
    rows: rows.filter((row) => row.data === referenciaData),
    referenciaData,
    isHoje: false,
  };
}

function aggregateByDay(rows: VickRow[]): GraficoProducaoDia[] {
  const byDay = new Map<string, VickRow[]>();

  for (const row of rows) {
    const existing = byDay.get(row.data) ?? [];
    existing.push(row);
    byDay.set(row.data, existing);
  }

  return last7DayStrings().map((day) => {
    const dayRows = byDay.get(day) ?? [];
    const kpis = aggregateKpis(dayRows);

    return {
      data: day,
      total_caixas: kpis.total_caixas,
      total_peso_kg: kpis.total_peso_kg,
      total_registros: kpis.total_registros,
      codigos_unicos: kpis.codigos_unicos,
    };
  });
}

function buildComparacao(rows: VickRow[]): Comparacao[] {
  const today = todayDbString();
  const yesterday = formatDateForDb(
    subDays(parseDbDate(today) ?? new Date(), 1)
  );
  const weekStart = last7DayStrings()[0] ?? today;

  const toComparacao = (periodo: string, periodRows: VickRow[]): Comparacao => ({
    periodo,
    total_caixas: periodRows.reduce(
      (sum, row) => sum + (row.qtde_caixas ?? 0),
      0
    ),
    total_registros: periodRows.length,
  });

  return [
    toComparacao("Hoje", rows.filter((row) => row.data === today)),
    toComparacao("Ontem", rows.filter((row) => row.data === yesterday)),
    toComparacao(
      "Últimos 7 dias",
      rows.filter((row) => row.data >= weekStart)
    ),
  ];
}

async function fetchVickRows(
  supabase: SupabaseClient,
  fromDate: string
): Promise<VickRow[]> {
  const { data, error } = await supabase
    .from("producao_vick")
    .select(
      "data, qtde_caixas, peso_registro, percas, setup, codigo, eh_manual, eh_meia_placa, tipo_placa"
    )
    .is("deleted_at", null)
    .is("archived_at", null)
    .gte("data", fromDate)
    .order("data", { ascending: true });

  if (error) {
    throw error;
  }

  return normalizeRows((data ?? []) as VickRow[]);
}

export async function getDashboardVickData(
  supabase: SupabaseClient
): Promise<DashboardVickResult> {
  const weekStart = last7DayStrings()[0] ?? todayDbString();
  const rows = await fetchVickRows(supabase, weekStart);
  const { rows: kpiRows, referenciaData, isHoje } = pickKpiRows(rows);

  return {
    kpis: aggregateKpis(kpiRows),
    grafico7Dias: aggregateByDay(rows),
    comparacao: buildComparacao(rows),
    referenciaData,
    isHoje,
  };
}
