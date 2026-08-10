"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Box,
  ChevronRight,
  Package,
  Wrench,
} from "lucide-react";
import { PRODUCAO_AMBIENTES } from "@/lib/producao-config";

const iconByAmbiente = {
  vick: Box,
  coldbox: Package,
  macharia: Wrench,
  refugo: AlertTriangle,
} as const;

export function ProducaoHub() {
  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-mansure-gray-medium">
        Selecione o ambiente de produção para abrir a tabela de registros.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PRODUCAO_AMBIENTES.map(({ key, title, description }) => {
          const Icon = iconByAmbiente[key];

          return (
            <Link
              key={key}
              href={`/dashboard/producao/${key}`}
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
                <p className="text-xs leading-relaxed text-mansure-gray-medium">
                  {description}
                </p>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
