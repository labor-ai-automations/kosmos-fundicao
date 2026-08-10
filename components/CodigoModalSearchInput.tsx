"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodigoModalSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CodigoModalSearchInput({
  value,
  onChange,
  placeholder = "Buscar por código ou dados do item...",
  autoFocus = false,
  className,
}: CodigoModalSearchInputProps) {
  return (
    <div
      className={cn(
        "kosmos-input flex h-11 items-center gap-2.5 px-3 focus-within:border-mansure-blue focus-within:ring-[3px] focus-within:ring-mansure-blue/10",
        className
      )}
    >
      <Search
        className="size-4 shrink-0 text-mansure-gray-medium"
        aria-hidden
      />
      <input
        type="search"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-base text-mansure-black placeholder:text-mansure-gray-medium focus:outline-none"
      />
    </div>
  );
}
