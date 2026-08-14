export interface BeastKPIData {
  total_caixas: number;
  total_peso_kg: number;
  taxa_setup_pct: number;
  codigos_unicos: number;
  media_pecas: number;
  tipo_normal: number;
  tipo_manual: number;
  tipo_meia_placa: number;
  total_registros: number;
  setups_realizados: number;
}

export interface BeastGraficoData {
  data?: string;
  semana_inicio?: string;
  semana_numero?: number;
  total_caixas: number;
  total_peso_kg: number;
  total_registros: number;
  codigos_unicos: number;
  taxa_setup_pct?: number;
}

export interface BeastComparacaoData {
  periodo: string;
  total_caixas: number;
  total_peso_kg: number;
  taxa_setup_pct: number;
  codigos_unicos: number;
  total_registros: number;
}

export interface BeastDetalheData {
  id: string;
  data: string;
  codigo: string;
  codigo_2?: string | null;
  qtde_caixas: number;
  percas: number;
  peso_registro: number;
  setup: boolean;
  eh_manual: boolean;
  eh_meia_placa: boolean;
  observacao?: string | null;
  pedido_estoque?: string | null;
  criado_em: string;
  criado_por_email: string;
}

export interface BeastQueryParams {
  startDate: string;
  endDate: string;
  tipo: "all" | "normal" | "manual" | "meia_placa";
  setup: "all" | "true" | "false";
  codigo: string;
  graphType: "day" | "week";
  page: number;
  limit: number;
}

export interface BeastDashboardResult {
  kpis: BeastKPIData;
  grafico: BeastGraficoData[];
  comparacao: BeastComparacaoData[];
  detalhes: BeastDetalheData[];
  detalheCount: number;
}

export const EMPTY_BEAST_KPIS: BeastKPIData = {
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
