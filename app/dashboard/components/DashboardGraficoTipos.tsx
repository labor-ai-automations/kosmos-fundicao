"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DASHBOARD_SECTION_INFO } from "@/lib/dashboard-config";
import type { DashboardKPIs } from "@/lib/hooks/useDashboardVick";
import { DashboardSectionHeader } from "./DashboardInfoTip";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DashboardGraficoTiposProps {
  data: DashboardKPIs;
  referenciaLabel?: string;
}

export function DashboardGraficoTipos({
  data,
  referenciaLabel = "hoje",
}: DashboardGraficoTiposProps) {
  const chartData = [
    { name: "Normal", value: data.tipo_normal, color: "#1e5aa8" },
    { name: "Manual", value: data.tipo_manual, color: "#f59e0b" },
    { name: "Meia Placa", value: data.tipo_meia_placa, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const allTypes = [
    { name: "Normal", value: data.tipo_normal, color: "#1e5aa8" },
    { name: "Manual", value: data.tipo_manual, color: "#f59e0b" },
    { name: "Meia Placa", value: data.tipo_meia_placa, color: "#ef4444" },
  ];

  return (
    <Card className="overflow-visible rounded-lg border-mansure-gray-light bg-white p-6 shadow-lg">
      <DashboardSectionHeader
        title="Distribuição de Registros"
        visibleNotice={`Por tipo de produção (${referenciaLabel}). ${DASHBOARD_SECTION_INFO.graficoTipos.visible}`}
        hoverInfo={DASHBOARD_SECTION_INFO.graficoTipos.hover}
        icon={
          <PieChartIcon className="h-5 w-5 text-mansure-blue" strokeWidth={2} />
        }
        titleClassName="text-xl"
      />

      <div className="flex items-center gap-8">
        <div className="relative w-1/2">
          {totalValue > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} registros`}
                  contentStyle={{
                    backgroundColor: "#f5f7fb",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-mansure-gray-light bg-mansure-hover/50">
              <p className="text-sm text-mansure-gray-medium">
                Sem registros no período
              </p>
            </div>
          )}
        </div>

        <div className="w-1/2 space-y-4">
          {allTypes.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-mansure-black">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-mansure-black">
                  {item.value}
                </p>
                <p className="text-xs text-mansure-gray-medium">
                  {totalValue > 0
                    ? ((item.value / totalValue) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
