"use client";

import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadBase64File } from "@/lib/mapeamento-status";

interface MapeamentoImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageBase64: string;
  imageName: string;
  observacao?: string;
}

export function MapeamentoImageZoomModal({
  isOpen,
  onClose,
  imageBase64,
  imageName,
  observacao,
}: MapeamentoImageZoomModalProps) {
  const hasImage = Boolean(imageBase64?.trim());

  const handleDownload = () => {
    if (!hasImage) return;
    downloadBase64File(imageBase64, imageName);
  };

  if (!isOpen || !hasImage) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[95vh] max-w-4xl overflow-y-auto border-mansure-border bg-mansure-light p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-mansure-border px-6 py-4">
          <DialogTitle className="text-lg font-bold text-mansure-black">
            {imageName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 px-6 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageBase64}
            alt={imageName}
            className="max-h-[60vh] max-w-full rounded-lg shadow-lg"
          />

          {observacao && (
            <div className="w-full rounded-lg bg-mansure-hover p-4">
              <p className="text-sm text-mansure-black">{observacao}</p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-mansure-border bg-mansure-light">
          <Button type="button" variant="mansureOutline" onClick={onClose}>
            Fechar
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            variant="mansurePrimary"
            className="gap-2"
          >
            <Download className="size-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
