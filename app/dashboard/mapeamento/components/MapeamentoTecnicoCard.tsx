"use client";

import type { MapeamentoItemSpecs, MapeamentoVickConfig } from "@/lib/types";

interface MapeamentoTecnicoCardProps {
  specs: MapeamentoItemSpecs | null;
  vickConfig: MapeamentoVickConfig | null;
  loading?: boolean;
}

export function MapeamentoTecnicoCard({
  specs,
  vickConfig,
  loading,
}: MapeamentoTecnicoCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-mansure-gray-light bg-mansure-hover p-4 text-sm text-mansure-gray-dark">
        Carregando mapeamento técnico...
      </div>
    );
  }

  if (!specs) {
    return (
      <div className="rounded-lg border border-mansure-gray-light bg-mansure-hover p-4 text-sm text-mansure-gray-dark">
        Especificações técnicas não encontradas para este código.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-mansure-blue/30 bg-mansure-hover p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-mansure-black">
        Mapeamento técnico
      </h3>
      <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <p className="text-mansure-gray-dark">
          <strong className="text-mansure-black">Código:</strong> {specs.codigo}
        </p>
        <p className="text-mansure-gray-dark">
          <strong className="text-mansure-black">Origem:</strong>{" "}
          {specs.origem.toUpperCase()}
        </p>
        <p className="text-mansure-gray-dark">
          <strong className="text-mansure-black">Peso:</strong>{" "}
          {specs.peso_peca ?? specs.peso ?? "—"} kg
        </p>
        <p className="text-mansure-gray-dark">
          <strong className="text-mansure-black">Árvore:</strong>{" "}
          {specs.arvore != null ? specs.arvore : "—"}
        </p>
        <p className="text-mansure-gray-dark">
          <strong className="text-mansure-black">Macho:</strong>{" "}
          {specs.macho != null ? (specs.macho ? "SIM" : "NÃO") : "—"}
        </p>
        {specs.pp != null && (
          <p className="text-mansure-gray-dark">
            <strong className="text-mansure-black">PP:</strong> {specs.pp} kg
          </p>
        )}
        {vickConfig && (
          <>
            <p className="text-mansure-gray-dark">
              <strong className="text-mansure-black">Meia Placa:</strong>{" "}
              {vickConfig.eh_meia_placa ? "SIM" : "NÃO"}
            </p>
            <p className="text-mansure-gray-dark">
              <strong className="text-mansure-black">Manual (Vick):</strong>{" "}
              {vickConfig.eh_manual ? "SIM" : "NÃO"}
            </p>
            {vickConfig.segundo_codigo && (
              <p className="text-mansure-gray-dark">
                <strong className="text-mansure-black">Segundo Código:</strong>{" "}
                {vickConfig.segundo_codigo}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
