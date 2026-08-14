"use client";

import { formatDateDisplay } from "@/lib/auth";
import {
  DASHBOARD_KPI_INFO,
  DASHBOARD_SECTION_INFO,
} from "@/lib/dashboard-config";
import { useDashboardVick } from "@/lib/hooks/useDashboardVick";
import { DashboardAmbienteTabs } from "./DashboardAmbienteTabs";
import { DashboardBetaBanner } from "./DashboardBetaBanner";
import {
  DashboardInfoTip,
  DashboardSectionHeader,
} from "./DashboardInfoTip";
import { DashboardKPICard } from "./DashboardKPICard";
import { DashboardGraficoProducao } from "./DashboardGraficoProducao";
import { DashboardGraficoTipos } from "./DashboardGraficoTipos";
import { DashboardStatusBadge } from "./DashboardStatusBadge";
import {
  BarChart3,
  Gauge,
  Hash,
  LayoutDashboard,
  Package,
  RefreshCw,
  Scale,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardVick() {
  const { kpis, grafico7Dias, referenciaData, isHoje, isLoading, isError, error, refetch } =
    useDashboardVick();

  const periodoLabel = isHoje
    ? "Hoje"
    : referenciaData
      ? formatDateDisplay(referenciaData)
      : "Sem registros";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardAmbienteTabs active="vick" />
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 animate-spin">
              <RefreshCw className="mx-auto h-8 w-8 text-mansure-blue" />
            </div>
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
            <RefreshCw className="h-4 w-4" />
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

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-mansure-blue/15 ring-1 ring-mansure-blue/30">
              <LayoutDashboard
                className="h-6 w-6 text-mansure-blue"
                strokeWidth={2}
              />
            </div>
            <h1 className="text-4xl font-bold text-mansure-light">
              Dashboard VICK
            </h1>
            <DashboardStatusBadge status="beta" label="Beta" />
            <DashboardInfoTip
              content="Dashboard operacional de produção VICK. Valide os números com a planilha ou tela de registros antes de tomar decisões."
            />
          </div>
          <p className="mt-2 text-mansure-gray-medium">
            Inteligência operacional — Produção em tempo real
            {!isHoje && referenciaData && (
              <span className="ml-2 text-mansure-blue">
                (KPIs referentes a {periodoLabel})
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          className="gap-2 bg-mansure-blue text-white hover:bg-mansure-blue/90"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div>
        <DashboardSectionHeader
          title={`Indicadores — ${periodoLabel}`}
          visibleNotice={DASHBOARD_SECTION_INFO.kpis.visible}
          hoverInfo={DASHBOARD_SECTION_INFO.kpis.hover}
          titleClassName="text-mansure-light"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <DashboardKPICard
            title="Caixas Produzidas"
            value={kpis.total_caixas}
            unit="caixas"
            icon={<Package className="h-6 w-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.caixas}
            bgColor="bg-blue-600"
            textColor="text-white"
          />

          <DashboardKPICard
            title="Peso Total"
            value={kpis.total_peso_kg.toFixed(1)}
            unit="kg"
            icon={<Scale className="h-6 w-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.peso}
            bgColor="bg-purple-600"
            textColor="text-white"
          />

          <DashboardKPICard
            title="Setup Realizado"
            value={kpis.taxa_setup_pct}
            unit="%"
            icon={<Wrench className="h-6 w-6" strokeWidth={2} />}
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
            icon={<Hash className="h-6 w-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.codigos}
            bgColor="bg-indigo-600"
            textColor="text-white"
          />

          <DashboardKPICard
            title="Média de Peças"
            value={kpis.media_pecas}
            unit="peças"
            icon={<Gauge className="h-6 w-6" strokeWidth={2} />}
            infoTip={DASHBOARD_KPI_INFO.pecas}
            bgColor="bg-orange-600"
            textColor="text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGraficoProducao data={grafico7Dias} />
        <DashboardGraficoTipos
          data={kpis}
          referenciaLabel={isHoje ? "hoje" : periodoLabel}
        />
      </div>

      <div className="rounded-lg border border-mansure-gray-light bg-mansure-hover p-6">
        <DashboardSectionHeader
          title={`Resumo — ${periodoLabel}`}
          visibleNotice={DASHBOARD_SECTION_INFO.resumo.visible}
          hoverInfo={DASHBOARD_SECTION_INFO.resumo.hover}
          icon={
            <BarChart3 className="h-5 w-5 text-mansure-blue" strokeWidth={2} />
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-mansure-gray-medium">
              Total de Registros
            </p>
            <p className="text-2xl font-bold text-mansure-black">
              {kpis.total_registros}
            </p>
          </div>
          <div>
            <p className="text-sm text-mansure-gray-medium">
              Setups Realizados
            </p>
            <p className="text-2xl font-bold text-mansure-black">
              {kpis.setups_realizados}/{kpis.total_registros}
            </p>
          </div>
          <div>
            <p className="text-sm text-mansure-gray-medium">
              Tipos de Produção
            </p>
            <p className="text-2xl font-bold text-mansure-black">
              {kpis.tipo_normal + kpis.tipo_manual + kpis.tipo_meia_placa}
            </p>
          </div>
          <div>
            <p className="text-sm text-mansure-gray-medium">
              Média de Caixas/Registro
            </p>
            <p className="text-2xl font-bold text-mansure-black">
              {kpis.total_registros > 0
                ? (kpis.total_caixas / kpis.total_registros).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
