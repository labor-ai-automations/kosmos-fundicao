"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseDecimalInput } from "@/lib/number-utils";

function formatPeso(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return String(value);
}

interface PesoRegistroFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

export function PesoRegistroField({
  label,
  value,
  onChange,
  className,
}: PesoRegistroFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!editing) {
      setDraft(value !== null && value !== undefined ? String(value) : "");
    }
  }, [value, editing]);

  const startEdit = () => {
    setDraft(value !== null && value !== undefined ? String(value) : "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(value !== null && value !== undefined ? String(value) : "");
    setEditing(false);
  };

  const confirmEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      onChange(null);
      setEditing(false);
      return;
    }
    const parsed = parseDecimalInput(trimmed);
    if (parsed === null) return;
    onChange(parsed);
    setEditing(false);
  };

  return (
    <div className={cn("rounded-lg border border-mansure-border bg-mansure-hover/40 p-3", className)}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-mansure-gray-medium">
          {label}
        </span>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="rounded p-1 text-mansure-blue transition hover:bg-mansure-light"
            title="Editar peso deste registro"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="kosmos-input h-9 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmEdit();
              }
              if (e.key === "Escape") {
                cancelEdit();
              }
            }}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="mansurePrimary"
            onClick={confirmEdit}
            title="Confirmar"
          >
            <Check className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="mansureOutline"
            onClick={cancelEdit}
            title="Cancelar"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <p className="text-base font-semibold text-mansure-black">
          {formatPeso(value)}
        </p>
      )}
    </div>
  );
}

export { parseDecimalInput as parseOptionalNumber };
