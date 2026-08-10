"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Box, Package, Wrench } from "lucide-react";
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
    description: "Cadastro base de fornada VICK",
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
      <p className="mb-6 max-w-2xl text-sm text-accent/60">
        Selecione o ambiente para gerenciar códigos e dados base.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ambientes.map(({ key, title, description, icon: Icon }) => (
          <Link
            key={key}
            href={`/dashboard/itens/${key}`}
            className="group block h-full"
          >
            <article className="flex h-full cursor-pointer flex-col rounded-xl border border-[rgba(233,237,242,0.12)] bg-[rgba(36,94,143,0.1)] p-5 transition-all duration-200 hover:border-secondary/50 hover:bg-[rgba(36,94,143,0.2)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(6,182,212,0.12)]">
                  <Icon className="size-5 text-secondary" strokeWidth={2} />
                </div>
                <ArrowRight className="size-4 shrink-0 text-accent/30 transition group-hover:translate-x-0.5 group-hover:text-secondary" />
              </div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-accent">
                {title}
              </h2>
              <p className="mb-4 text-xs text-accent/50">{description}</p>
              <p className="mt-auto text-lg font-semibold text-accent">
                {counts[key]}
                <span className="ml-1 text-xs font-normal text-accent/50">
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
