"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { RefugoItemSelectorModal } from "@/components/RefugoItemSelectorModal";
import type { RefugoSelectorItem } from "@/lib/refugo-selector-config";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RefugoCodigoPickerProps {
  codigo: string;
  onSelect: (item: RefugoSelectorItem) => void;
  error?: string;
}

export function RefugoCodigoPicker({
  codigo,
  onSelect,
  error,
}: RefugoCodigoPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="kosmos-label">Código</Label>
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

      <RefugoItemSelectorModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </div>
  );
}
