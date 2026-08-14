"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllRecords, getRecordsForExport } from "@/lib/api-calls";
import { getProducaoAmbienteConfig } from "@/lib/producao-config";
import { buildRecordsQueryFilters } from "@/lib/registro-producao-utils";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";
import type { ProducaoAmbiente } from "@/lib/producao-config";

export function useRegistroProducao(ambiente: ProducaoAmbiente) {
  const { table } = getProducaoAmbienteConfig(ambiente);
  const {
    page,
    pageSize,
    filters,
    debouncedSearch,
    sortBy,
    viewMode,
  } = useRegistroProducaoStore();

  const queryFilters = buildRecordsQueryFilters(
    { ...filters, search: debouncedSearch },
    sortBy,
    viewMode
  );

  const query = useQuery({
    queryKey: ["registros-producao", ambiente, viewMode, page, pageSize, queryFilters],
    queryFn: () => getAllRecords(table, page, queryFilters, pageSize),
  });

  return {
    records: query.data?.data ?? [],
    totalCount: query.data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((query.data?.total ?? 0) / pageSize)),
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    queryFilters,
    table,
  };
}

export function useRegistroProducaoExport(
  ambiente: ProducaoAmbiente,
  enabled: boolean
) {
  const { table } = getProducaoAmbienteConfig(ambiente);
  const { filters, debouncedSearch, sortBy, viewMode } = useRegistroProducaoStore();

  const queryFilters = buildRecordsQueryFilters(
    { ...filters, search: debouncedSearch },
    sortBy,
    viewMode
  );

  return useQuery({
    queryKey: ["registros-producao-export", ambiente, viewMode, queryFilters],
    queryFn: () => getRecordsForExport(table, queryFilters),
    enabled,
  });
}
