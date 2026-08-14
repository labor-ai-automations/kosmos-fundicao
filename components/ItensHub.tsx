"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, ChevronRight, Package, Wrench } from "lucide-react";
import { getItemCounts } from "@/lib/api-calls";
import type { ItemAmbiente } from "@/lib/types";

const ambientes: {
  key: ItemAmbiente;
  title: string;
  description: string;
  icon: typeof Box;
}[] = [
  {
    key: "vick",
    title: "VICK",
    description: "Cadastro base VICK",
    icon: Box,
  },
  {
    key: "coldbox",
    title: "COLDBOX",
    description: "Cadastro base coldbox",
    icon: Package,
  },
  {
    key: "macharia",
    title: "MACHARIA",
    description: "Cadastro base macharia",
    icon: Wrench,
  },
];

export function ItensHub() {
  const [counts, setCounts] = useState({ vick: 0, coldbox: 0, macharia: 0 });

  useEffect(() => {
    getItemCounts()
      .then(setCounts)
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-mansure-gray-medium">
        Selecione o ambiente para gerenciar códigos e dados base.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ambientes.map(({ key, title, description, icon: Icon }) => (
          <Link
            key={key}
            href={`/dashboard/itens/${key}`}
            className="group block h-full"
          >
            <article className="kosmos-selection-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-mansure-blue/15">
                  <Icon className="size-5 text-mansure-blue" strokeWidth={2} />
                </div>
                <ChevronRight className="size-4 shrink-0 text-mansure-gray-medium transition group-hover:translate-x-0.5 group-hover:text-mansure-blue" />
              </div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-mansure-light">
                {title}
              </h2>
              <p className="mb-4 text-xs leading-relaxed text-mansure-gray-medium">
                {description}
              </p>
              <p className="mt-auto text-lg font-semibold text-mansure-light">
                {counts[key]}
                <span className="ml-1 text-xs font-normal text-mansure-gray-medium">
                  itens cadastrados
                </span>
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
