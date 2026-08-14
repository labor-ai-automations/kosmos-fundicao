"use client";

import { AlignJustify, LayoutGrid, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useRegistroProducaoStore,
  type RegistroDensity,
} from "@/lib/stores/registroProducaoStore";

const OPTIONS: { id: RegistroDensity; label: string; icon: typeof Rows3 }[] = [
  { id: "compact", label: "Compacta", icon: AlignJustify },
  { id: "normal", label: "Normal", icon: LayoutGrid },
  { id: "relaxed", label: "Relaxada", icon: Rows3 },
];

export function RegistroProducaoDensityToggle() {
  const { density, setDensity } = useRegistroProducaoStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-mansure-gray-light">
        Modo de visualização
      </span>
      <div className="flex items-center gap-1 rounded-lg border border-mansure-gray-light bg-white p-1">
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          size="sm"
          variant={density === id ? "mansurePrimary" : "mansureOutline"}
          onClick={() => setDensity(id)}
          className="h-8 gap-1.5 px-2.5 text-xs"
        >
          <Icon className="size-3.5" />
          {label}
        </Button>
      ))}
      </div>
    </div>
  );
}

export function getDensityClasses(density: RegistroDensity) {
  switch (density) {
    case "compact":
      return {
        cell: "py-1.5 px-3 text-xs",
        head: "py-2 px-3 text-[11px]",
      };
    case "relaxed":
      return {
        cell: "py-4 px-4 text-base",
        head: "py-4 px-4 text-sm",
      };
    default:
      return {
        cell: "py-2.5 px-3 text-sm",
        head: "py-3 px-3 text-xs",
      };
  }
}
