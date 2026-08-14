"use client";

import type { ReactNode } from "react";

export function highlightSearchMatch(text: string, search: string): ReactNode {
  if (!search.trim() || text === "—") return text;

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-amber-200/80 px-0.5 text-mansure-black"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}
