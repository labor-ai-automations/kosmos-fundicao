"use client";

import { TrendingUp } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { DASHBOARD_SECTION_INFO } from "@/lib/dashboard-config";
import type { BeastGraficoData } from "@/lib/dashboard-beast-types";
import { formatDbDateChartLabel } from "@/lib/date-utils";
import { useDashboardFilterStore } from "@/lib/stores/dashboardFilterStore";
import { DashboardSectionHeader } from "./DashboardInfoTip";

interface DashboardGraficoProducaoBeastProps {
  data: BeastGraficoData[];
}

export function DashboardGraficoProducaoBeast({
  data,
}: DashboardGraficoProducaoBeastProps) {
  const graphType = useDashboardFilterStore((state) => state.filters.graphType);

  const formattedData = data.map((item) => {
    if (graphType === "day" && item.data) {
      return {
        ...item,
        label: formatDbDateChartLabel(item.data),
      };
    }
    if (graphType === "week") {
      return {
        ...item,
        label: item.semana_inicio
          ? `Sem. ${formatDbDateChartLabel(item.semana_inicio)}`
          : `Semana ${item.semana_numero ?? ""}`,
      };
    }
    return { ...item, label: "—" };
  });

  return (
    <Card className="overflow-visible rounded-lg border-mansure-gray-light bg-white p-6 shadow-lg">
      <DashboardSectionHeader
        title={`Produção (${graphType === "day" ? "Por Dia" : "Por Semana"})`}
        visibleNotice={DASHBOARD_SECTION_INFO.graficoProducao.visible}
        hoverInfo={DASHBOARD_SECTION_INFO.graficoProducao.hover}
        icon={
          <TrendingUp className="h-5 w-5 text-mansure-blue" strokeWidth={2} />
        }
        titleClassName="text-xl"
      />

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={formattedData}
          margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            stroke="#718096"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            yAxisId="left"
            stroke="#718096"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#718096"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f5f7fb",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="total_caixas"
            fill="#1e5aa8"
            name="Caixas"
            radius={[8, 8, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_peso_kg"
            stroke="#718096"
            name="Peso (kg)"
            strokeWidth={2}
            dot={{ fill: "#718096", r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
