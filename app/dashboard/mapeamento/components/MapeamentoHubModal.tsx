"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MAPEAMENTO_SECOES,
  normalizeSecoesPreenchidas,
  type MapeamentoSecaoId,
  type SecoesPreenchidas,
} from "@/lib/mapeamento-config";
import type { MapeamentoStatusOperacional } from "@/lib/mapeamento-status";
import type { MapeamentoItemSpecs, MapeamentoVickConfig } from "@/lib/types";
import { MapeamentoStatusSection } from "./MapeamentoStatusSection";
import { MapeamentoTecnicoCard } from "./MapeamentoTecnicoCard";
import { SecaoMapeamentoModal } from "./SecaoMapeamentoModal";

interface MapeamentoHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigo: string;
  onAtualizado: () => void;
}

export function MapeamentoHubModal({
  isOpen,
  onClose,
  codigo,
  onAtualizado,
}: MapeamentoHubModalProps) {
  const [secaoAberta, setSecaoAberta] = useState<MapeamentoSecaoId | null>(
    null
  );
  const [secoesPreenchidas, setSecoesPreenchidas] =
    useState<SecoesPreenchidas>(normalizeSecoesPreenchidas(null));
  const [statusAtual, setStatusAtual] =
    useState<MapeamentoStatusOperacional | null>(null);
  const [specs, setSpecs] = useState<MapeamentoItemSpecs | null>(null);
  const [vickConfig, setVickConfig] = useState<MapeamentoVickConfig | null>(
    null
  );
  const [loadingTecnico, setLoadingTecnico] = useState(false);

  const carregarDados = useCallback(async () => {
    if (!codigo) return;

    try {
      const registroRes = await fetch(
        `/api/mapeamento/registros/${encodeURIComponent(codigo)}`
      );
      if (registroRes.ok) {
        const data = await registroRes.json();
        setSecoesPreenchidas(
          normalizeSecoesPreenchidas(data.secoes_preenchidas)
        );
        setStatusAtual(data.status_atual ?? null);
      }
    } catch (error) {
      console.error(error);
    }

    setLoadingTecnico(true);
    try {
      const [specsRes, vickRes] = await Promise.all([
        fetch(`/api/mapeamento/specs?codigo=${encodeURIComponent(codigo)}`),
        fetch(
          `/api/mapeamento/vick-config?codigo=${encodeURIComponent(codigo)}`
        ),
      ]);

      if (specsRes.ok) {
        setSpecs(await specsRes.json());
      } else {
        setSpecs(null);
      }

      if (vickRes.ok) {
        const vickData = await vickRes.json();
        setVickConfig(vickData ?? null);
      } else {
        setVickConfig(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTecnico(false);
    }
  }, [codigo]);

  useEffect(() => {
    if (isOpen && codigo) {
      carregarDados();
    } else {
      setSecaoAberta(null);
      setSpecs(null);
      setVickConfig(null);
      setStatusAtual(null);
    }
  }, [isOpen, codigo, carregarDados]);

  const handleSecaoAtualizada = () => {
    carregarDados();
    onAtualizado();
    setSecaoAberta(null);
  };

  const handleStatusChanged = () => {
    carregarDados();
    onAtualizado();
  };

  if (secaoAberta) {
    return (
      <SecaoMapeamentoModal
        isOpen
        onClose={() => setSecaoAberta(null)}
        codigo={codigo}
        secao={secaoAberta}
        onAtualizado={handleSecaoAtualizada}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-mansure-gray-light bg-mansure-light sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-mansure-black">
            Mapeamento: {codigo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <MapeamentoTecnicoCard
            specs={specs}
            vickConfig={vickConfig}
            loading={loadingTecnico}
          />

          <div>
            <p className="mb-4 text-sm text-mansure-gray-dark">
              Selecione uma seção para adicionar imagens e endereço
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {MAPEAMENTO_SECOES.map((secao) => {
                const preenchida = secoesPreenchidas[secao.id];
                const Icon = secao.Icon;

                return (
                  <Button
                    key={secao.id}
                    type="button"
                    variant="mansureOutline"
                    onClick={() => setSecaoAberta(secao.id)}
                    className={`h-32 flex-col gap-3 rounded-lg border-2 ${
                      preenchida
                        ? "border-mansure-blue bg-mansure-hover text-mansure-black"
                        : "border-mansure-gray-light bg-mansure-light text-mansure-black hover:border-mansure-blue"
                    }`}
                  >
                    <Icon className="size-8 text-mansure-blue" />
                    <div className="text-center">
                      <p className="font-semibold text-mansure-black">
                        {secao.titulo}
                      </p>
                      {secao.subtitulo && (
                        <p className="text-xs text-mansure-gray-medium">
                          {secao.subtitulo}
                        </p>
                      )}
                      {preenchida && (
                        <p className="mt-1 text-xs font-semibold text-mansure-blue">
                          Preenchida
                        </p>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <MapeamentoStatusSection
            codigo={codigo}
            statusAtual={statusAtual}
            onStatusChanged={handleStatusChanged}
          />
        </div>

        <DialogFooter className="border-t border-mansure-gray-light bg-mansure-light">
          <Button type="button" variant="mansureOutline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
