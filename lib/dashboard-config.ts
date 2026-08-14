import type { ProducaoAmbiente } from "@/lib/producao-config";

export type DashboardStatus = "beta" | "soon";

export interface DashboardAmbienteConfig {
  key: ProducaoAmbiente;
  title: string;
  description: string;
  available: boolean;
  status: DashboardStatus;
  statusLabel: string;
  /** Texto sempre visível quando este ambiente está ativo */
  visibleNotice?: string;
  /** Detalhe extra ao passar o mouse no ícone de informação da aba */
  tabInfo: string;
}

export const DASHBOARD_AMBIENTES: DashboardAmbienteConfig[] = [
  {
    key: "vick",
    title: "VICK",
    description: "Produção VICK",
    available: true,
    status: "beta",
    statusLabel: "Beta",
    visibleNotice:
      "Versão beta — KPIs e gráficos podem apresentar valores incorretos ou incompletos enquanto validamos os cálculos com a operação.",
    tabInfo:
      "Único dashboard disponível no momento. Agrega registros ativos (não arquivados) de produção VICK. Reporte divergências à equipe de sistemas.",
  },
  {
    key: "coldbox",
    title: "COLDBOX",
    description: "Produção coldbox",
    available: false,
    status: "soon",
    statusLabel: "Em breve",
    tabInfo:
      "Dashboard COLDBOX em desenvolvimento. Em breve: caixas por operador, peso, ciclos e comparativos diários.",
  },
  {
    key: "macharia",
    title: "MACHARIA",
    description: "Operações de macharia",
    available: false,
    status: "soon",
    statusLabel: "Em breve",
    tabInfo:
      "Dashboard MACHARIA em desenvolvimento. Em breve: produção por máquina, turno, colaborador e perdas.",
  },
  {
    key: "refugo",
    title: "REFUGO",
    description: "Registro de refugo",
    available: false,
    status: "soon",
    statusLabel: "Em breve",
    tabInfo:
      "Dashboard REFUGO em desenvolvimento. Em breve: volume de refugo, motivos, fundição e tendências.",
  },
];

export const DASHBOARD_SECTION_INFO = {
  kpis: {
    visible:
      "Indicadores do dia de referência — hoje ou o último dia com produção registrada.",
    hover:
      "Soma dos registros VICK ativos na data de referência. Exclui arquivados e excluídos. Atualiza a cada 5 minutos ou ao clicar em Atualizar.",
  },
  graficoProducao: {
    visible: "Últimos 7 dias corridos de produção VICK.",
    hover:
      "Barras: total de caixas por dia. Linha: peso total (kg) no mesmo período. Considera apenas registros ativos.",
  },
  graficoTipos: {
    visible: "Normal, Manual e Meia Placa na data de referência dos KPIs.",
    hover:
      "Classificação por tipo_placa e flags eh_manual / eh_meia_placa. Mesma data usada nos cards acima.",
  },
  resumo: {
    visible: "Detalhamento complementar da data de referência.",
    hover:
      "Setups realizados, tipos de produção e média de caixas por lançamento no dia selecionado.",
  },
} as const;

export const DASHBOARD_KPI_INFO: Record<string, string> = {
  caixas: "Soma de qtde_caixas de todos os registros na data de referência.",
  peso: "Soma de peso_registro (kg) na data de referência.",
  setup: "Percentual de registros com setup = true sobre o total do dia.",
  codigos: "Quantidade de códigos distintos processados no dia.",
  pecas: "Média de peças (percas) por registro no dia.",
};

export function getDashboardAmbiente(key: ProducaoAmbiente) {
  return DASHBOARD_AMBIENTES.find((item) => item.key === key)!;
}
