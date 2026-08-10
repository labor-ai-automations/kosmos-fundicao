"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ObservacaoFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function ObservacaoField({
  error,
  className,
  placeholder = "Observações sobre este registro (opcional)",
  rows = 3,
  ...props
}: ObservacaoFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="kosmos-label">Observação</Label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "kosmos-input min-h-[5.5rem] resize-y py-2 leading-relaxed",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
