import { differenceInCalendarDays, startOfWeek, subDays } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDateForDb } from "@/lib/auth";
import { parseDbDate } from "@/lib/date-utils";
import type {
  BeastComparacaoData,
  BeastDashboardResult,
  BeastDetalheData,
  BeastGraficoData,
  BeastKPIData,
  BeastQueryParams,
} from "@/lib/dashboard-beast-types";
import { EMPTY_BEAST_KPIS } from "@/lib/dashboard-beast-types";

type VickRow = {
  id: string;
  data: string;
  codigo: string;
  codigo_2?: string | null;
  qtde_caixas: number;
  percas: number;
  peso_registro: number | null;
  setup: boolean;
  eh_manual?: boolean | null;
  eh_meia_placa?: boolean | null;
  tipo_placa?: string | null;
  observacao?: string | null;
  pedido_estoque?: string | null;
  criado_em: string;
  criado_por?: string | null;
};

function normalizeDate(value: string): string {
  return value.split("T")[0];
}

function classifyTipo(row: VickRow): "normal" | "manual" | "meia_placa" {
  if (row.eh_manual || row.tipo_placa === "manual") return "manual";
  if (row.eh_meia_placa || row.tipo_placa === "meia_placa") return "meia_placa";
  return "normal";
}

function matchesTipo(row: VickRow, tipo: BeastQueryParams["tipo"]) {
  if (tipo === "all") return true;
  return classifyTipo(row) === tipo;
}

function matchesSetup(row: VickRow, setup: BeastQueryParams["setup"]) {
  if (setup === "all") return true;
  return setup === "true" ? row.setup : !row.setup;
}

function matchesCodigo(row: VickRow, codigo: string) {
  if (!codigo.trim()) return true;
  const term = codigo.trim().toLowerCase();
  return (
    row.codigo.toLowerCase().includes(term) ||
    (row.codigo_2?.toLowerCase().includes(term) ?? false)
  );
}

function filterRows(rows: VickRow[], params: BeastQueryParams): VickRow[] {
  return rows.filter(
    (row) =>
      matchesTipo(row, params.tipo) &&
      matchesSetup(row, params.setup) &&
      matchesCodigo(row, params.codigo)
  );
}

function aggregateKpis(rows: VickRow[]): BeastKPIData {
  if (rows.length === 0) return EMPTY_BEAST_KPIS;

  const totalCaixas = rows.reduce((sum, row) => sum + (row.qtde_caixas ?? 0), 0);
  const totalPeso = rows.reduce((sum, row) => sum + (row.peso_registro ?? 0), 0);
  const setups = rows.filter((row) => row.setup).length;
  const codigos = new Set(rows.map((row) => row.codigo)).size;
  const totalPecas = rows.reduce((sum, row) => sum + (row.percas ?? 0), 0);

  let tipoManual = 0;
  let tipoMeia = 0;
  for (const row of rows) {
    const tipo = classifyTipo(row);
    if (tipo === "manual") tipoManual += 1;
    if (tipo === "meia_placa") tipoMeia += 1;
  }

  return {
    total_caixas: totalCaixas,
    total_peso_kg: Math.round(totalPeso * 10) / 10,
    taxa_setup_pct: Math.round((setups / rows.length) * 100),
    codigos_unicos: codigos,
    media_pecas: Math.round(totalPecas / rows.length),
    tipo_normal: rows.length - tipoManual - tipoMeia,
    tipo_manual: tipoManual,
    tipo_meia_placa: tipoMeia,
    total_registros: rows.length,
    setups_realizados: setups,
  };
}

function aggregateByDay(
  rows: VickRow[],
  startDate: string,
  endDate: string
): BeastGraficoData[] {
  const start = parseDbDate(startDate);
  const end = parseDbDate(endDate);
  if (!start || !end) return [];

  const byDay = new Map<string, VickRow[]>();
  for (const row of rows) {
    const list = byDay.get(row.data) ?? [];
    list.push(row);
    byDay.set(row.data, list);
  }

  const days: BeastGraficoData[] = [];
  const totalDays = differenceInCalendarDays(end, start);

  for (let offset = 0; offset <= totalDays; offset += 1) {
    const day = formatDateForDb(subDays(end, totalDays - offset));
    const dayRows = byDay.get(day) ?? [];
    const kpis = aggregateKpis(dayRows);
    days.push({
      data: day,
      total_caixas: kpis.total_caixas,
      total_peso_kg: kpis.total_peso_kg,
      total_registros: kpis.total_registros,
      codigos_unicos: kpis.codigos_unicos,
      taxa_setup_pct: kpis.taxa_setup_pct,
    });
  }

  return days;
}

function aggregateByWeek(rows: VickRow[]): BeastGraficoData[] {
  const byWeek = new Map<string, VickRow[]>();

  for (const row of rows) {
    const date = parseDbDate(row.data);
    if (!date) continue;
    const weekStart = formatDateForDb(startOfWeek(date, { weekStartsOn: 1 }));
    const list = byWeek.get(weekStart) ?? [];
    list.push(row);
    byWeek.set(weekStart, list);
  }

  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semana_inicio, weekRows], index) => {
      const kpis = aggregateKpis(weekRows);
      return {
        semana_inicio,
        semana_numero: index + 1,
        total_caixas: kpis.total_caixas,
        total_peso_kg: kpis.total_peso_kg,
        total_registros: kpis.total_registros,
        codigos_unicos: kpis.codigos_unicos,
        taxa_setup_pct: kpis.taxa_setup_pct,
      };
    });
}

function buildComparacao(
  rows: VickRow[],
  startDate: string,
  endDate: string
): BeastComparacaoData[] {
  const start = parseDbDate(startDate);
  const end = parseDbDate(endDate);
  if (!start || !end) return [];

  const span = differenceInCalendarDays(end, start) + 1;
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, span - 1);
  const prevStartStr = formatDateForDb(prevStart);
  const prevEndStr = formatDateForDb(prevEnd);

  const currentRows = rows.filter(
    (row) => row.data >= startDate && row.data <= endDate
  );
  const prevRows = rows.filter(
    (row) => row.data >= prevStartStr && row.data <= prevEndStr
  );

  const toItem = (periodo: string, periodRows: VickRow[]): BeastComparacaoData => {
    const kpis = aggregateKpis(periodRows);
    return {
      periodo,
      total_caixas: kpis.total_caixas,
      total_peso_kg: kpis.total_peso_kg,
      taxa_setup_pct: kpis.taxa_setup_pct,
      codigos_unicos: kpis.codigos_unicos,
      total_registros: kpis.total_registros,
    };
  };

  return [
    toItem("Período atual", currentRows),
    toItem("Período anterior", prevRows),
  ];
}

async function fetchRows(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<VickRow[]> {
  const { data, error } = await supabase
    .from("producao_vick")
    .select(
      "id, data, codigo, codigo_2, qtde_caixas, percas, peso_registro, setup, eh_manual, eh_meia_placa, tipo_placa, observacao, pedido_estoque, criado_em, criado_por"
    )
    .is("deleted_at", null)
    .is("archived_at", null)
    .gte("data", startDate)
    .lte("data", endDate)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as VickRow[]).map((row) => ({
    ...row,
    data: normalizeDate(row.data),
  }));
}

function mapDetalhes(rows: VickRow[]): BeastDetalheData[] {
  return rows.map((row) => ({
    id: row.id,
    data: row.data,
    codigo: row.codigo,
    codigo_2: row.codigo_2,
    qtde_caixas: row.qtde_caixas,
    percas: row.percas,
    peso_registro: row.peso_registro ?? 0,
    setup: row.setup,
    eh_manual: Boolean(row.eh_manual),
    eh_meia_placa: Boolean(row.eh_meia_placa),
    observacao: row.observacao,
    pedido_estoque: row.pedido_estoque,
    criado_em: row.criado_em,
    criado_por_email: row.criado_por ?? "—",
  }));
}

async function fetchViaRpc(
  supabase: SupabaseClient,
  params: BeastQueryParams
): Promise<BeastDashboardResult | null> {
  const rpcParams = {
    start_date: params.startDate,
    end_date: params.endDate,
  };

  const detalheParams = {
    ...rpcParams,
    p_tipo: params.tipo === "all" ? null : params.tipo,
    p_setup: params.setup === "all" ? null : params.setup === "true",
    p_codigo: params.codigo.trim() || null,
    limit_rows: params.limit,
    offset_rows: (params.page - 1) * params.limit,
  };

  const graphFn =
    params.graphType === "day"
      ? "get_dashboard_producao_por_dia"
      : "get_dashboard_producao_por_semana";

  const [kpisRes, graficoRes, comparacaoRes, detalhesRes, countRes] =
    await Promise.all([
      supabase.rpc("get_dashboard_kpis_date_range", rpcParams),
      supabase.rpc(graphFn, rpcParams),
      supabase.rpc("get_dashboard_comparacao_periodos", rpcParams),
      supabase.rpc("get_dashboard_detalhes", detalheParams),
      supabase.rpc("get_dashboard_detalhes_count", {
        start_date: params.startDate,
        end_date: params.endDate,
        p_tipo: detalheParams.p_tipo,
        p_setup: detalheParams.p_setup,
        p_codigo: detalheParams.p_codigo,
      }),
    ]);

  if (
    kpisRes.error ||
    graficoRes.error ||
    comparacaoRes.error ||
    detalhesRes.error ||
    countRes.error
  ) {
    return null;
  }

  return {
    kpis: (kpisRes.data?.[0] ?? EMPTY_BEAST_KPIS) as BeastKPIData,
    grafico: (graficoRes.data ?? []) as BeastGraficoData[],
    comparacao: (comparacaoRes.data ?? []) as BeastComparacaoData[],
    detalhes: (detalhesRes.data ?? []) as BeastDetalheData[],
    detalheCount: Number(countRes.data ?? 0),
  };
}

function buildFallback(
  allRows: VickRow[],
  params: BeastQueryParams
): BeastDashboardResult {
  const filtered = filterRows(allRows, params);
  const grafico =
    params.graphType === "week"
      ? aggregateByWeek(filtered)
      : aggregateByDay(filtered, params.startDate, params.endDate);

  const offset = (params.page - 1) * params.limit;
  const pageRows = filtered.slice(offset, offset + params.limit);

  return {
    kpis: aggregateKpis(filtered),
    grafico,
    comparacao: buildComparacao(filtered, params.startDate, params.endDate),
    detalhes: mapDetalhes(pageRows),
    detalheCount: filtered.length,
  };
}

export async function getDashboardBeastData(
  supabase: SupabaseClient,
  params: BeastQueryParams
): Promise<BeastDashboardResult> {
  const rpcData = await fetchViaRpc(supabase, params);
  if (rpcData) return rpcData;

  const rows = await fetchRows(supabase, params.startDate, params.endDate);
  return buildFallback(rows, params);
}

export function parseBeastQueryParams(
  searchParams: URLSearchParams
): BeastQueryParams {
  const startDate =
    searchParams.get("startDate") ??
    formatDateForDb(subDays(new Date(), 7));
  const endDate =
    searchParams.get("endDate") ?? formatDateForDb(new Date());

  const tipo = searchParams.get("tipo") as BeastQueryParams["tipo"];
  const setup = searchParams.get("setup") as BeastQueryParams["setup"];
  const graphType = searchParams.get(
    "graphType"
  ) as BeastQueryParams["graphType"];

  return {
    startDate,
    endDate,
    tipo:
      tipo === "normal" || tipo === "manual" || tipo === "meia_placa"
        ? tipo
        : "all",
    setup: setup === "true" || setup === "false" ? setup : "all",
    codigo: searchParams.get("codigo") ?? "",
    graphType: graphType === "week" ? "week" : "day",
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    limit: Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 20))),
  };
}
