"use client";

import { Archive, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";

export function RegistroProducaoViewTabs() {
  const { viewMode, setViewMode } = useRegistroProducaoStore();

  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-[#0f1419]/60 p-0.5">
      <button
        type="button"
        onClick={() => setViewMode("active")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
          viewMode === "active"
            ? "bg-mansure-blue text-white shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
      >
        <List className="size-3.5" />
        Ativos
      </button>
      <button
        type="button"
        onClick={() => setViewMode("archived")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
          viewMode === "archived"
            ? "bg-amber-600 text-white shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
      >
        <Archive className="size-3.5" />
        Arquivados
      </button>
    </div>
  );
}
