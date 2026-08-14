"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatStatusOperacional } from "@/lib/mapeamento-status";
import type { MapeamentoStatusOperacional } from "@/lib/mapeamento-status";
import { MapeamentoStatusFormModal } from "./MapeamentoStatusFormModal";

interface MapeamentoStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigo: string;
  statusAtual: MapeamentoStatusOperacional | null;
  onStatusChanged: () => void;
}

export function MapeamentoStatusModal({
  isOpen,
  onClose,
  codigo,
  statusAtual,
  onStatusChanged,
}: MapeamentoStatusModalProps) {
  const [statusSelecionado, setStatusSelecionado] =
    useState<MapeamentoStatusOperacional | null>(null);

  useEffect(() => {
    if (!isOpen) setStatusSelecionado(null);
  }, [isOpen, codigo]);

  if (statusSelecionado) {
    return (
      <MapeamentoStatusFormModal
        isOpen
        onClose={() => setStatusSelecionado(null)}
        codigo={codigo}
        statusSelecionado={statusSelecionado}
        onStatusChanged={() => {
          onStatusChanged();
          setStatusSelecionado(null);
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-mansure-border bg-mansure-light sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-mansure-black">
            Selecionar Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-mansure-gray-dark">
            Código:{" "}
            <span className="font-semibold text-mansure-black">{codigo}</span>
          </p>
          <p className="text-sm text-mansure-gray-dark">
            Status atual:{" "}
            <span className="font-semibold text-mansure-black">
              {formatStatusOperacional(statusAtual)}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setStatusSelecionado("disponivel")}
              className="flex h-24 flex-col items-center justify-center bg-green-600 font-semibold text-white hover:bg-green-700"
            >
              <span className="mb-1 text-2xl">✓</span>
              Disponível
            </Button>
            <Button
              type="button"
              onClick={() => setStatusSelecionado("em_manutencao")}
              className="flex h-24 flex-col items-center justify-center bg-amber-500 font-semibold text-white hover:bg-amber-600"
            >
              <span className="mb-1 text-2xl">⚙</span>
              Em Manutenção
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t border-mansure-border bg-mansure-light">
          <Button type="button" variant="mansureOutline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
