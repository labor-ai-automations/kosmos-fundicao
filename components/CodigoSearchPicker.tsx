"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CodigoSearchModal } from "@/components/CodigoSearchModal";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CodigoSearchPickerProps {
  codigo: string;
  onSelect: (codigo: string) => void;
  codigos: string[];
  error?: string;
  loading?: boolean;
  title?: string;
}

export function CodigoSearchPicker({
  codigo,
  onSelect,
  codigos,
  error,
  loading = false,
  title = "Pesquisar código",
}: CodigoSearchPickerProps) {
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

      <CodigoSearchModal
        isOpen={open}
        onClose={() => setOpen(false)}
        codigos={codigos}
        onSelect={onSelect}
        title={title}
        loading={loading}
      />
    </div>
  );
}
