"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useArchiveRecord } from "@/lib/hooks/useArchiveRecord";
import type { ArchivableProductionTable } from "@/lib/archive-config";

interface RegistroProducaoArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
  codigo: string;
  tabela: ArchivableProductionTable;
  onSuccess?: () => void;
}

export function RegistroProducaoArchiveDialog({
  open,
  onOpenChange,
  recordId,
  codigo,
  tabela,
  onSuccess,
}: RegistroProducaoArchiveDialogProps) {
  const [motivo, setMotivo] = useState("");
  const { archiveMutation } = useArchiveRecord();

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync({
        id: recordId,
        tabela,
        motivo: motivo.trim() || undefined,
      });
      setMotivo("");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Erro exibido via toast em useArchiveRecord.onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-mansure-gray-light bg-white text-mansure-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Archive className="size-5 text-amber-600" />
            Arquivar registro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            O registro <strong>{codigo}</strong> sairá da listagem, mas poderá ser
            restaurado depois pela administração.
          </div>

          <div className="space-y-2">
            <label
              htmlFor="archive-motivo"
              className="text-sm font-medium text-mansure-black"
            >
              Motivo (opcional)
            </label>
            <textarea
              id="archive-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: produção descontinuada, lançamento duplicado..."
              className="min-h-[80px] w-full rounded-lg border border-mansure-gray-light bg-mansure-light px-3 py-2 text-sm text-mansure-black placeholder:text-mansure-gray-medium focus:border-mansure-blue focus:outline-none focus:ring-2 focus:ring-mansure-blue/20"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-mansure-gray-light bg-mansure-light sm:justify-end">
          <Button
            type="button"
            variant="mansureOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-amber-600 text-white hover:bg-amber-700"
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending ? "Arquivando..." : "Arquivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
