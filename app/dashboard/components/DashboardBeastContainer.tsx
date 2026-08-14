"use client";

import {
  DASHBOARD_KPI_INFO,
  DASHBOARD_SECTION_INFO,
} from "@/lib/dashboard-config";
import { useDashboardBeast } from "@/lib/hooks/useDashboardBeast";
import { DashboardAmbienteTabs } from "./DashboardAmbienteTabs";
import { DashboardBetaBanner } from "./DashboardBetaBanner";
import { DashboardDateRangePicker } from "./DashboardDateRangePicker";
import { DashboardFiltersPanel } from "./DashboardFiltersPanel";
import { DashboardGraficoProducaoBeast } from "./DashboardGraficoProducaoBeast";
import { DashboardGraficoTipos } from "./DashboardGraficoTipos";
import {
  DashboardInfoTip,
  DashboardSectionHeader,
} from "./DashboardInfoTip";
import { DashboardKPICard } from "./DashboardKPICard";
import { DashboardStatusBadge } from "./DashboardStatusBadge";
import { DashboardTabelaDetalhes } from "./DashboardTabelaDetalhes";
import {
  Gauge,
  Hash,
  LayoutDashboard,
  Package,
  RefreshCw,
  Scale,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardBeastContainer() {
  const {
    kpis,
    grafico,
    comparacao,
    detalhes,
    detalheCount,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardBeast();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardAmbienteTabs active="vick" />
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 size-8 animate-spin text-mansure-blue" />
            <p className="text-mansure-gray-medium">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <DashboardAmbienteTabs active="vick" />
        <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
          <p className="text-mansure-error">
            {error instanceof Error ? error.message : "Erro ao carregar dashboard"}
          </p>
          <Button
            onClick={() => refetch()}
            className="gap-2 bg-mansure-blue text-white hover:bg-mansure-blue/90"
          >
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardAmbienteTabs active="vick" />
      <DashboardBetaBanner ambiente="vick" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-mansure-blue/15 ring-1 ring-mansure-blue/30">
              <LayoutDashboard
                className="size-6 text-mansure-blue"
                strokeWidth={2}
              />
            </div>
            <h1 className="text-4xl font-bold text-mansure-light">
              Dashboard VICK
            </h1>
            <DashboardStatusBadge status="beta" label="Beta" />
            <DashboardInfoTip content="Dashboard avançado com filtros, gráficos por dia/semana, comparativo e exportação." />
          </div>
          <p className="mt-2 text-mansure-gray-medium">
            Inteligência operacional com controle total de período e filtros
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 bg-mansure-blue text-white hover:bg-mansure-blue/90"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <DashboardDateRangePicker />
      <DashboardFiltersPanel />

      <div>
        <DashboardSectionHeader
          title="Indicadores do período"
          visibleNotice={DASHBOARD_SECTION_INFO.kpis.visible}
          hoverInfo={DASHBOARD_SECTION_INFO.kpis.hover}
          titleClassName="text-mansure-light"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <DashboardKPICard
            title="Caixas Produzidas"
            value={kpis.total_caixas}
            unit="caixas"
            icon={<Package className="size-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.caixas}
            bgColor="bg-blue-600"
            textColor="text-white"
          />
          <DashboardKPICard
            title="Peso Total"
            value={kpis.total_peso_kg.toFixed(1)}
            unit="kg"
            icon={<Scale className="size-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.peso}
            bgColor="bg-purple-600"
            textColor="text-white"
          />
          <DashboardKPICard
            title="Setup Realizado"
            value={kpis.taxa_setup_pct}
            unit="%"
            icon={<Wrench className="size-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.setup}
            bgColor={
              kpis.taxa_setup_pct >= 80 ? "bg-green-600" : "bg-yellow-600"
            }
            textColor="text-white"
          />
          <DashboardKPICard
            title="Códigos Processados"
            value={kpis.codigos_unicos}
            unit="itens"
            icon={<Hash className="size-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.codigos}
            bgColor="bg-indigo-600"
            textColor="text-white"
          />
          <DashboardKPICard
            title="Média de Peças"
            value={kpis.media_pecas}
            unit="peças"
            icon={<Gauge className="size-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.pecas}
            bgColor="bg-orange-600"
            textColor="text-white"
          />
        </div>
      </div>

      {comparacao.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {comparacao.map((item) => (
            <div
              key={item.periodo}
              className="rounded-lg border border-mansure-gray-light bg-mansure-hover p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-mansure-blue" />
                <p className="text-sm font-semibold text-mansure-black">
                  {item.periodo}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-mansure-gray-medium">Caixas</p>
                  <p className="font-bold text-mansure-black">
                    {item.total_caixas}
                  </p>
                </div>
                <div>
                  <p className="text-mansure-gray-medium">Registros</p>
                  <p className="font-bold text-mansure-black">
                    {item.total_registros}
                  </p>
                </div>
                <div>
                  <p className="text-mansure-gray-medium">Setup</p>
                  <p className="font-bold text-mansure-black">
                    {item.taxa_setup_pct}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGraficoProducaoBeast data={grafico} />
        <DashboardGraficoTipos
          data={kpis}
          referenciaLabel="período selecionado"
        />
      </div>

      <DashboardTabelaDetalhes data={detalhes} total={detalheCount} />
    </div>
  );
}
