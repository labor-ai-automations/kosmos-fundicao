"use client";

import { RotateCcw } from "lucide-react";
import { useDashboardFilterStore } from "@/lib/stores/dashboardFilterStore";
import type { DashboardFilters } from "@/lib/stores/dashboardFilterStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DashboardFiltersPanel() {
  const { filters, setTipo, setSetup, setCodigo, setGraphType, resetFilters } =
    useDashboardFilterStore();

  return (
    <div className="space-y-4 rounded-lg border border-mansure-gray-light bg-mansure-hover p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-mansure-black">Filtros</h3>
        <Button
          onClick={resetFilters}
          size="sm"
          variant="mansureOutline"
          className="gap-1"
        >
          <RotateCcw className="size-3" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-mansure-black">
            Tipo
          </label>
          <select
            value={filters.tipo}
            onChange={(e) =>
              setTipo(e.target.value as DashboardFilters["tipo"])
            }
            className="kosmos-input w-full px-3 py-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="normal">Normal</option>
            <option value="manual">Manual</option>
            <option value="meia_placa">Meia Placa</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-mansure-black">
            Setup
          </label>
          <select
            value={filters.setup}
            onChange={(e) =>
              setSetup(e.target.value as DashboardFilters["setup"])
            }
            className="kosmos-input w-full px-3 py-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-mansure-black">
            Código
          </label>
          <Input
            type="text"
            placeholder="Buscar código..."
            value={filters.codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-mansure-black">
            Visualizar
          </label>
          <select
            value={filters.graphType}
            onChange={(e) =>
              setGraphType(e.target.value as DashboardFilters["graphType"])
            }
            className="kosmos-input w-full px-3 py-2 text-sm"
          >
            <option value="day">Por Dia</option>
            <option value="week">Por Semana</option>
          </select>
        </div>
      </div>
    </div>
  );
}
