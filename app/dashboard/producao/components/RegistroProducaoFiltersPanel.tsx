"use client";

import { useState } from "react";
import { Bookmark, CalendarRange, Sliders, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";
import type { ProducaoAmbiente } from "@/lib/producao-config";

const DATE_PRESETS = [
  { id: "today", label: "Hoje" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
] as const;

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

function getPresetRange(preset: (typeof DATE_PRESETS)[number]["id"]) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (preset === "week") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
  }

  if (preset === "month") {
    start.setDate(1);
  }

  return {
    dataFrom: toDateInputValue(start),
    dataTo: toDateInputValue(now),
  };
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </p>
      {children}
    </div>
  );
}

const inputClass =
  "h-8 border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:border-mansure-blue/50 focus:bg-white/10";

export function RegistroProducaoFiltersPanel({
  ambiente,
  onClose,
}: {
  ambiente: ProducaoAmbiente;
  onClose?: () => void;
}) {
  const { filters, setFilters } = useRegistroProducaoStore();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    setFilters(localFilters);
    onClose?.();
  };

  const handleSave = () => {
    localStorage.setItem(
      `registro-producao-filters-${ambiente}`,
      JSON.stringify(localFilters)
    );
  };

  const handleLoad = () => {
    const raw = localStorage.getItem(`registro-producao-filters-${ambiente}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as typeof localFilters;
      setLocalFilters({ ...parsed, search: filters.search });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-lg bg-white/[0.03] p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-mansure-blue" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Filtros avançados
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white/70"
            aria-label="Fechar filtros"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <CalendarRange className="size-3.5 text-white/35" />
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() =>
              setLocalFilters((prev) => ({
                ...prev,
                ...getPresetRange(preset.id),
              }))
            }
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/70 transition hover:border-mansure-blue/40 hover:bg-mansure-blue/20 hover:text-white"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Data de">
          <Input
            type="date"
            value={localFilters.dataFrom ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                dataFrom: e.target.value || undefined,
              }))
            }
            className={inputClass}
          />
        </Field>

        <Field label="Data até">
          <Input
            type="date"
            value={localFilters.dataTo ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                dataTo: e.target.value || undefined,
              }))
            }
            className={inputClass}
          />
        </Field>

        <Field label="Peso mín.">
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            value={localFilters.pesoMin ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                pesoMin: e.target.value ? parseFloat(e.target.value) : undefined,
              }))
            }
            className={inputClass}
          />
        </Field>

        <Field label="Peso máx.">
          <Input
            type="number"
            step="0.01"
            placeholder="9999"
            value={localFilters.pesoMax ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                pesoMax: e.target.value ? parseFloat(e.target.value) : undefined,
              }))
            }
            className={inputClass}
          />
        </Field>

        {(ambiente === "vick" || ambiente === "coldbox") && (
          <>
            <Field label="Caixas mín.">
              <Input
                type="number"
                value={localFilters.caixasMin ?? ""}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    caixasMin: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Caixas máx.">
              <Input
                type="number"
                value={localFilters.caixasMax ?? ""}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    caixasMax: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {ambiente === "vick" && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Setup
              </span>
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                {[
                  { label: "Todos", value: undefined },
                  { label: "Sim", value: true },
                  { label: "Não", value: false },
                ].map((option) => (
                  <button
                    key={`setup-${String(option.value)}`}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        setup: option.value,
                      }))
                    }
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium transition",
                      localFilters.setup === option.value
                        ? "bg-mansure-blue text-white"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Meia Placa
              </span>
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                {[
                  { label: "Todos", value: undefined },
                  { label: "Sim", value: true },
                  { label: "Não", value: false },
                ].map((option) => (
                  <button
                    key={`meia-${String(option.value)}`}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        ehMeiaPlaca: option.value,
                      }))
                    }
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium transition",
                      localFilters.ehMeiaPlaca === option.value
                        ? "bg-mansure-blue text-white"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Manual
              </span>
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                {[
                  { label: "Todos", value: undefined },
                  { label: "Sim", value: true },
                  { label: "Não", value: false },
                ].map((option) => (
                  <button
                    key={`manual-${String(option.value)}`}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        ehManual: option.value,
                      }))
                    }
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium transition",
                      localFilters.ehManual === option.value
                        ? "bg-mansure-blue text-white"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(ambiente === "vick" || ambiente === "coldbox") && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
              Demanda
            </span>
            <div className="flex gap-1">
              {["Pedido", "Estoque"].map((tipo) => {
                const active = localFilters.pedidoEstoque?.includes(tipo) ?? false;
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        pedidoEstoque: active
                          ? (prev.pedidoEstoque ?? []).filter((t) => t !== tipo)
                          : [...(prev.pedidoEstoque ?? []), tipo],
                      }))
                    }
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition",
                      active
                        ? "border-mansure-blue/50 bg-mansure-blue/25 text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {tipo}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="ml-auto flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="mansurePrimary"
            onClick={handleApply}
            className="h-7 px-3 text-xs"
          >
            Aplicar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="mansureOutline"
            onClick={handleSave}
            className="h-7 gap-1 border-white/15 bg-white/5 px-2.5 text-xs text-white/80 hover:bg-white/10"
          >
            <Bookmark className="size-3" />
            Salvar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="mansureOutline"
            onClick={handleLoad}
            className="h-7 border-white/15 bg-white/5 px-2.5 text-xs text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            Carregar
          </Button>
        </div>
      </div>
    </div>
  );
}
