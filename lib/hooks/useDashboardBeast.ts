"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDateForDb } from "@/lib/auth";
import {
  EMPTY_BEAST_KPIS,
  type BeastComparacaoData,
  type BeastDetalheData,
  type BeastGraficoData,
  type BeastKPIData,
} from "@/lib/dashboard-beast-types";
import { useDashboardFilterStore } from "@/lib/stores/dashboardFilterStore";

export type {
  BeastKPIData as KPIData,
  BeastGraficoData as GraficoData,
  BeastComparacaoData as ComparacaoData,
  BeastDetalheData as DetalheData,
};

async function fetchDashboardBeast(filters: {
  startDate: Date;
  endDate: Date;
  tipo: string;
  setup: string;
  codigo: string;
  graphType: string;
  page: number;
  limit: number;
}) {
  const params = new URLSearchParams({
    startDate: formatDateForDb(filters.startDate),
    endDate: formatDateForDb(filters.endDate),
    tipo: filters.tipo,
    setup: filters.setup,
    codigo: filters.codigo,
    graphType: filters.graphType,
    page: String(filters.page),
    limit: String(filters.limit),
  });

  const res = await fetch(`/api/dashboard/vick/beast?${params.toString()}`);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? "Erro ao carregar dashboard");
  }

  return json as {
    kpis: BeastKPIData;
    grafico: BeastGraficoData[];
    comparacao: BeastComparacaoData[];
    detalhes: BeastDetalheData[];
    detalheCount: number;
  };
}

export function useDashboardBeast() {
  const filters = useDashboardFilterStore((state) => state.filters);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "dashboard-beast",
      formatDateForDb(filters.startDate),
      formatDateForDb(filters.endDate),
      filters.tipo,
      filters.setup,
      filters.codigo,
      filters.graphType,
      filters.page,
      filters.limit,
    ],
    queryFn: () => fetchDashboardBeast(filters),
    staleTime: 60000,
    refetchInterval: 300000,
  });

  return {
    kpis: data?.kpis ?? EMPTY_BEAST_KPIS,
    grafico: data?.grafico ?? [],
    comparacao: data?.comparacao ?? [],
    detalhes: data?.detalhes ?? [],
    detalheCount: data?.detalheCount ?? 0,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
