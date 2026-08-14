"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ItemSelectorModal } from "@/components/ItemSelectorModal";
import type { ItemSelectorAmbiente, SelectorItem } from "@/lib/item-selector-config";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ItemCodigoPickerProps {
  ambiente: ItemSelectorAmbiente;
  codigo: string | undefined;
  onSelect: (item: SelectorItem) => void;
  error?: string;
  label?: string;
  /** Oculta um código da listagem (ex.: Código A ao escolher Código Par) */
  excludeCodigo?: string;
  children?: React.ReactNode;
}

export function ItemCodigoPicker({
  ambiente,
  codigo,
  onSelect,
  error,
  label = "Código",
  excludeCodigo,
  children,
}: ItemCodigoPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="kosmos-label">{label}</Label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "kosmos-input flex h-11 w-full items-center justify-between px-3 text-left transition hover:border-mansure-blue",
            !codigo && "text-mansure-gray-medium"
          )}
        >
          <span className="truncate">
            {codigo || "Clique para pesquisar o código"}
          </span>
          <Search className="size-4 shrink-0 text-mansure-blue" />
        </button>
        {error && <p className="text-sm text-mansure-error">{error}</p>}
      </div>

      {children}

      <ItemSelectorModal
        ambiente={ambiente}
        isOpen={open}
        onSelect={onSelect}
        onClose={() => setOpen(false)}
        excludeCodigo={excludeCodigo}
      />
    </div>
  );
}
