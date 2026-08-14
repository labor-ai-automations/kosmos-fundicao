"use client";

import { useRouter } from "next/navigation";
import { Camera, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const mapeamentoTags = ["Fotos", "Etapas", "Peças"];
const producaoTags = ["VICK", "COLDBOX", "MACHARIA", "REFUGO"];

export function DashboardHub() {
  const router = useRouter();

  return (
    <div className="-mx-4 -mt-6 -mb-6 min-h-[calc(100vh-4rem)] lg:-mx-8 lg:-mt-8 lg:-mb-8">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:px-8 lg:py-20">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-mansure-light sm:text-5xl">
          Inteligência operacional
        </h1>
        <p className="mb-14 text-base text-mansure-gray-medium sm:text-lg">
          Documentação visual e registro de produção em um só lugar
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="kosmos-panel p-8 text-center transition hover:border-mansure-blue/40">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-mansure-blue/15 ring-1 ring-mansure-blue/30">
              <Camera className="size-8 text-mansure-blue" strokeWidth={2} />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-mansure-light">
              Mapeamento de Peças
            </h2>
            <p className="mb-8 text-sm text-mansure-gray-medium">
              Documentação visual com fotos de cada etapa de produção
            </p>
            <div className="mb-8 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-mansure-gray-medium">
                Registre imagens de
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {mapeamentoTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-mansure-blue/25 bg-mansure-blue/10 px-3 py-1 text-xs font-medium text-mansure-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={() => router.push("/dashboard/mapeamento")}
              variant="mansurePrimary"
              className="h-11 w-full font-semibold"
            >
              Abrir mapeamento
            </Button>
          </article>

          <article className="kosmos-panel p-8 text-center transition hover:border-mansure-blue/40">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-mansure-blue/15 ring-1 ring-mansure-blue/30">
              <ClipboardList
                className="size-8 text-mansure-blue"
                strokeWidth={2}
              />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-mansure-light">
              Registro de Produção
            </h2>
            <p className="mb-8 text-sm text-mansure-gray-medium">
              Histórico e lançamentos por ambiente de produção
            </p>
            <div className="mb-8 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-mansure-gray-medium">
                Ambientes disponíveis
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {producaoTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-mansure-blue/25 bg-mansure-blue/10 px-3 py-1 text-xs font-medium text-mansure-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={() => router.push("/dashboard/producao")}
              variant="mansurePrimary"
              className="h-11 w-full font-semibold"
            >
              Abrir produção
            </Button>
          </article>
        </div>
      </div>
    </div>
  );
}
