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

  const carregarStatusSecoes = useCallback(async () => {
    if (!codigo) return;

    try {
      const res = await fetch(
        `/api/mapeamento/registros/${encodeURIComponent(codigo)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setSecoesPreenchidas(
        normalizeSecoesPreenchidas(data.secoes_preenchidas)
      );
    } catch (error) {
      console.error(error);
    }
  }, [codigo]);

  useEffect(() => {
    if (isOpen && codigo) {
      carregarStatusSecoes();
    } else {
      setSecaoAberta(null);
    }
  }, [isOpen, codigo, carregarStatusSecoes]);

  const handleSecaoAtualizada = () => {
    carregarStatusSecoes();
    onAtualizado();
    setSecaoAberta(null);
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
      <DialogContent className="max-w-3xl border-mansure-gray-light bg-mansure-light sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-mansure-black">
            Mapeamento: {codigo}
          </DialogTitle>
        </DialogHeader>

        <div>
          <p className="mb-6 text-sm text-mansure-gray-dark">
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

        <DialogFooter className="border-t border-mansure-gray-light bg-mansure-light">
          <Button type="button" variant="mansureOutline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
