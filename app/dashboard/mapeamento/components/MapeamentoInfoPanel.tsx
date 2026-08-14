"use client";

import { useState } from "react";
import {
  Camera,
  ChevronDown,
  Info,
  MapPin,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAPEAMENTO_SECOES } from "@/lib/mapeamento-config";

export function MapeamentoInfoPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="overflow-hidden rounded-xl border border-mansure-border/30 bg-mansure-light text-mansure-black">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-mansure-hover/60"
          aria-expanded={open}
        >
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-mansure-blue" />
            <div>
              <h3 className="text-base font-bold text-mansure-black">
                Informações sobre o mapeamento
              </h3>
              <p className="mt-0.5 text-sm text-mansure-gray-dark">
                {open
                  ? "Clique para recolher"
                  : "Clique para ver como funciona, o que preencher e os status"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-mansure-gray-dark transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="space-y-4 border-t border-mansure-gray-light px-5 pb-5 pt-4">
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-mansure-black">
                Como funciona
              </h4>
              <p className="mb-4 text-sm text-mansure-gray-dark">
                Registre um código, defina o{" "}
                <strong className="text-mansure-black">status operacional</strong>{" "}
                (Disponível ou Em Manutenção) e preencha as 6 seções com fotos
                e endereço físico — no seu ritmo.
              </p>

              <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    step: "1",
                    title: "Registrar código",
                    text: 'Clique em "Registrar Item" e selecione um código do cadastro de itens (VICK, COLDBOX ou MACHARIA).',
                  },
                  {
                    step: "2",
                    title: "Definir status",
                    text: 'Clique no badge "Status Atual" na tabela para escolher Disponível ou Em Manutenção, com observação e anexos.',
                  },
                  {
                    step: "3",
                    title: "Preencher seções",
                    text: 'Use o botão "Seções" para abrir o hub com as 6 áreas (ferramenta, moldagem, árvore, etc.).',
                  },
                  {
                    step: "4",
                    title: "Exportar PDF",
                    text: "Gere um PDF completo com specs, timeline, imagens e endereços pelo botão PDF na tabela.",
                  },
                ].map((item) => (
                  <li
                    key={item.step}
                    className="list-none rounded-lg border border-mansure-gray-light bg-mansure-hover/80 p-3"
                  >
                    <span className="mb-2 inline-flex size-6 items-center justify-center rounded-full bg-mansure-blue text-xs font-bold text-mansure-light">
                      {item.step}
                    </span>
                    <p className="text-sm font-semibold text-mansure-black">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-mansure-gray-dark">
                      {item.text}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-mansure-blue/20 bg-mansure-blue/5 px-3 py-2 text-xs text-mansure-gray-dark">
                <MousePointerClick className="size-4 shrink-0 text-mansure-blue" />
                <span>
                  <strong className="text-mansure-black">Status:</strong> clique
                  no badge verde/amarelo na coluna{" "}
                  <strong className="text-mansure-black">Status Atual</strong>{" "}
                  para alterar entre Disponível e Em Manutenção.
                </span>
              </div>
            </div>

            <div className="border-t border-mansure-gray-light pt-4">
              <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-mansure-black">
                O que preencher em cada seção
              </h4>
              <p className="mb-4 text-sm text-mansure-gray-dark">
                Todas as seções seguem o mesmo padrão:{" "}
                <span className="inline-flex items-center gap-1 font-medium text-mansure-black">
                  <Camera className="size-3.5" /> imagens
                </span>{" "}
                +{" "}
                <span className="inline-flex items-center gap-1 font-medium text-mansure-black">
                  <MapPin className="size-3.5" /> endereço físico
                </span>
                . Salve cada seção individualmente; o progresso aparece na
                tabela.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MAPEAMENTO_SECOES.map((secao) => {
                  const Icon = secao.Icon;
                  return (
                    <div
                      key={secao.id}
                      className="flex gap-3 rounded-lg border border-mansure-gray-light bg-white p-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mansure-blue/10">
                        <Icon className="size-5 text-mansure-blue" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-mansure-black">
                          {secao.nome}
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs text-mansure-gray-dark">
                          <li>• Fotos do ferramental/peça nesta etapa</li>
                          <li>• Observação por foto (opcional)</li>
                          <li>• Local físico (galpão, corredor, prateleira…)</li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
