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
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
          KOSMOS Fundição
        </p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-accent sm:text-5xl">
          Inteligência operacional
        </h1>
        <p className="mb-14 text-base font-normal text-accent/60 sm:text-lg">
          Documentação visual e registro de produção em um só lugar
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="kosmos-panel p-8 text-center transition hover:border-secondary/30">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl bg-[rgba(6,182,212,0.12)]">
              <Camera className="size-7 text-secondary" strokeWidth={2} />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-accent">
              Mapeamento de Peças
            </h2>
            <p className="mb-8 text-sm text-accent/60">
              Documentação visual com fotos de cada etapa de produção
            </p>
            <div className="mb-8 space-y-2">
              <p className="text-xs uppercase tracking-wide text-accent/40">
                Registre imagens de
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {mapeamentoTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[rgba(233,237,242,0.1)] bg-[rgba(12,16,20,0.4)] px-3 py-1 text-xs text-accent/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={() => router.push("/dashboard/mapeamento")}
              className="h-11 w-full bg-primary font-semibold text-accent hover:bg-secondary hover:text-background"
            >
              Abrir mapeamento
            </Button>
          </article>

          <article className="kosmos-panel p-8 text-center transition hover:border-secondary/30">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl bg-[rgba(6,182,212,0.12)]">
              <ClipboardList
                className="size-7 text-secondary"
                strokeWidth={2}
              />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-accent">
              Registro de Produção
            </h2>
            <p className="mb-8 text-sm text-accent/60">
              Histórico e lançamentos por ambiente de produção
            </p>
            <div className="mb-8 space-y-2">
              <p className="text-xs uppercase tracking-wide text-accent/40">
                Ambientes disponíveis
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {producaoTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[rgba(233,237,242,0.1)] bg-[rgba(12,16,20,0.4)] px-3 py-1 text-xs text-accent/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={() => router.push("/dashboard/producao")}
              className="h-11 w-full bg-primary font-semibold text-accent hover:bg-secondary hover:text-background"
            >
              Abrir produção
            </Button>
          </article>
        </div>
      </div>
    </div>
  );
}
