"use client";

import { Check, RotateCcw, Settings2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { REGISTRO_COLUMNS, ARCHIVED_ONLY_COLUMN } from "@/lib/registro-producao-config";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";
import type { ProducaoAmbiente } from "@/lib/producao-config";

export function RegistroProducaoColumnToggle({
  ambiente,
  onClose,
}: {
  ambiente: ProducaoAmbiente;
  onClose?: () => void;
}) {
  const { visibleColumns, viewMode, toggleColumn, resetColumns } =
    useRegistroProducaoStore();

  const columns = REGISTRO_COLUMNS[ambiente].filter(
    (col) => viewMode === "archived" || col.id !== ARCHIVED_ONLY_COLUMN
  );
  const visibleCount = columns.filter((col) =>
    visibleColumns.includes(col.id)
  ).length;

  return (
    <div className="rounded-lg bg-white/[0.03] p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-mansure-blue" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Colunas visíveis
          </span>
          <span className="rounded-full bg-mansure-blue/20 px-2 py-0.5 text-[10px] font-bold text-mansure-blue">
            {visibleCount}/{columns.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={resetColumns}
            className="h-7 gap-1 px-2 text-[11px] text-white/60 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="size-3" />
            Padrão
          </Button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white/70"
              aria-label="Fechar colunas"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {columns.map((col) => {
          const active = visibleColumns.includes(col.id);
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => toggleColumn(col.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                active
                  ? "border-mansure-blue/60 bg-mansure-blue/25 text-white shadow-sm shadow-mansure-blue/10"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:bg-white/10 hover:text-white/80"
              )}
            >
              {active && <Check className="size-3" />}
              {col.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
