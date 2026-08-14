"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Filter,
  RotateCcw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { RegistroProducaoFiltersPanel } from "./RegistroProducaoFiltersPanel";
import { RegistroProducaoColumnToggle } from "./RegistroProducaoColumnToggle";
import { RegistroProducaoExportModal } from "./RegistroProducaoExportModal";
import type { ProducaoAmbiente } from "@/lib/producao-config";

export function RegistroProducaoToolbar({
  ambiente,
}: {
  ambiente: ProducaoAmbiente;
}) {
  const { filters, setDebouncedSearch, clearFilters } = useRegistroProducaoStore();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [panel, setPanel] = useState<"filters" | "columns" | null>(null);
  const [showExport, setShowExport] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setDebouncedSearch(debouncedSearch);
  }, [debouncedSearch, setDebouncedSearch]);

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.dataFrom) ||
    Boolean(filters.dataTo) ||
    filters.pesoMin != null ||
    filters.pesoMax != null ||
    filters.caixasMin != null ||
    filters.caixasMax != null ||
    filters.setup != null ||
    filters.ehMeiaPlaca != null ||
    filters.ehManual != null ||
    (filters.pedidoEstoque?.length ?? 0) > 0;

  const togglePanel = (next: "filters" | "columns") => {
    setPanel((current) => (current === next ? null : next));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f1419]/90 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2 p-2">
        <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar código ou observação..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 border-white/10 bg-white/5 pl-8 text-sm text-white placeholder:text-white/35 focus:border-mansure-blue/50 focus:bg-white/10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              aria-label="Limpar busca"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={panel === "filters" ? "mansurePrimary" : "mansureOutline"}
            onClick={() => togglePanel("filters")}
            className={cn(
              "h-8 gap-1.5 px-2.5 text-xs font-semibold",
              panel !== "filters" &&
                "border-white/15 bg-white/5 text-white/80 hover:border-mansure-blue/40 hover:bg-white/10 hover:text-white"
            )}
          >
            <Filter className="size-3.5" />
            Filtros
            {hasActiveFilters && (
              <span className="size-1.5 rounded-full bg-amber-400" />
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={panel === "columns" ? "mansurePrimary" : "mansureOutline"}
            onClick={() => togglePanel("columns")}
            className={cn(
              "h-8 gap-1.5 px-2.5 text-xs font-semibold",
              panel !== "columns" &&
                "border-white/15 bg-white/5 text-white/80 hover:border-mansure-blue/40 hover:bg-white/10 hover:text-white"
            )}
          >
            <Settings2 className="size-3.5" />
            Colunas
          </Button>

          <Button
            type="button"
            size="sm"
            variant="mansurePrimary"
            onClick={() => setShowExport(true)}
            className="h-8 gap-1.5 px-3 text-[11px] font-bold tracking-wide"
          >
            <Download className="size-3.5" />
            EXPORTAR DADOS
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchInput("");
                clearFilters();
              }}
              className="h-8 gap-1 px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <RotateCcw className="size-3.5" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {panel && (
        <div className="border-t border-white/10 px-2 pb-2 pt-1.5">
          {panel === "filters" && (
            <RegistroProducaoFiltersPanel
              ambiente={ambiente}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === "columns" && (
            <RegistroProducaoColumnToggle
              ambiente={ambiente}
              onClose={() => setPanel(null)}
            />
          )}
        </div>
      )}

      {showExport && (
        <RegistroProducaoExportModal
          ambiente={ambiente}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
