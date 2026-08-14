"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardKPIs {
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

export interface GraficoProducaoDia {
  data: string;
  total_caixas: number;
  total_peso_kg: number;
  total_registros: number;
  codigos_unicos: number;
}

export interface Comparacao {
  periodo: string;
  total_caixas: number;
  total_registros: number;
}

export interface DashboardVickData {
  kpis: DashboardKPIs;
  grafico7Dias: GraficoProducaoDia[];
  comparacao: Comparacao[];
  referenciaData: string | null;
  isHoje: boolean;
}

const EMPTY_KPIS: DashboardKPIs = {
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

async function fetchDashboardVick(): Promise<DashboardVickData> {
  const res = await fetch("/api/dashboard/vick");
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? "Erro ao carregar dashboard");
  }

  return {
    kpis: json.kpis ?? EMPTY_KPIS,
    grafico7Dias: json.grafico7Dias ?? [],
    comparacao: json.comparacao ?? [],
    referenciaData: json.referenciaData ?? null,
    isHoje: json.isHoje ?? false,
  };
}

export function useDashboardVick() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-vick"],
    queryFn: fetchDashboardVick,
    staleTime: 60000,
    refetchInterval: 300000,
  });

  return {
    kpis: data?.kpis ?? EMPTY_KPIS,
    grafico7Dias: data?.grafico7Dias ?? [],
    comparacao: data?.comparacao ?? [],
    referenciaData: data?.referenciaData ?? null,
    isHoje: data?.isHoje ?? false,
    isLoading,
    isError,
    error,
    refetch,
  };
}
