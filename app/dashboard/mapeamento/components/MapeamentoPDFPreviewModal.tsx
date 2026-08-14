"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapeamentoPDFViewer } from "./MapeamentoPDFViewer";

interface MapeamentoPDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigo: string;
}

export function MapeamentoPDFPreviewModal({
  isOpen,
  onClose,
  codigo,
}: MapeamentoPDFPreviewModalProps) {
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [showViewer, setShowViewer] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleClose = () => {
    setShowViewer(false);
    onClose();
  };

  const handleDownload = async () => {
    if (!codigo) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/mapeamento/pdf/${encodeURIComponent(codigo)}?includeTimeline=${includeTimeline}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao exportar PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mapeamento-${codigo.replace(/[^\w.-]+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado");
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao exportar PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (showViewer && codigo) {
    return (
      <MapeamentoPDFViewer
        codigo={codigo}
        includeTimeline={includeTimeline}
        onBack={() => setShowViewer(false)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md border-mansure-gray-light bg-mansure-light sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-mansure-black">
            Exportar relatório
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-mansure-gray-dark">
            Código:{" "}
            <strong className="text-mansure-black">{codigo}</strong>
          </p>

          <div className="rounded-lg border border-mansure-gray-light bg-mansure-hover/50 px-4 py-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="include-timeline"
                checked={includeTimeline}
                onCheckedChange={(checked) =>
                  setIncludeTimeline(checked === true)
                }
              />
              <div>
                <Label
                  htmlFor="include-timeline"
                  className="cursor-pointer text-sm font-semibold text-mansure-black"
                >
                  Incluir histórico de status
                </Label>
                <p className="mt-1 text-xs text-mansure-gray-medium">
                  Adiciona a linha do tempo com alterações, operador e
                  observações.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-mansure-gray-light bg-mansure-light sm:justify-end">
          <Button type="button" variant="mansureOutline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="mansureOutline"
            onClick={() => setShowViewer(true)}
            className="gap-2"
          >
            <Eye className="size-4" />
            Visualizar
          </Button>
          <Button
            type="button"
            variant="mansurePrimary"
            onClick={handleDownload}
            disabled={downloading}
            className="gap-2"
          >
            <Download className="size-4" />
            {downloading ? "Gerando..." : "Baixar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
