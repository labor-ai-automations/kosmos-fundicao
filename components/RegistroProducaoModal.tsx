"use client";

import { Save } from "lucide-react";
import { FormColdbox } from "@/components/FormColdbox";
import { FormMacharia } from "@/components/FormMacharia";
import { FormRefugo } from "@/components/FormRefugo";
import { FormVick } from "@/components/FormVick";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getProducaoAmbienteConfig,
  type ProducaoAmbiente,
} from "@/lib/producao-config";
import { PRODUCAO_FORM_IDS } from "@/lib/producao-form-props";

const formByAmbiente = {
  vick: FormVick,
  coldbox: FormColdbox,
  macharia: FormMacharia,
  refugo: FormRefugo,
} as const;

interface RegistroProducaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambiente: ProducaoAmbiente;
  onSaved?: () => void;
}

export function RegistroProducaoModal({
  isOpen,
  onClose,
  ambiente,
  onSaved,
}: RegistroProducaoModalProps) {
  const { title } = getProducaoAmbienteConfig(ambiente);
  const Form = formByAmbiente[ambiente];
  const formId = PRODUCAO_FORM_IDS[ambiente];

  const handleSaved = () => {
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton
        className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden border-mansure-border bg-mansure-light p-0 text-mansure-black"
      >
        <DialogHeader className="border-b border-mansure-border px-6 py-4">
          <DialogTitle className="text-xl font-bold text-mansure-black">
            Nova produção — {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form modal formId={formId} onSaved={handleSaved} hideSubmit />
        </div>

        <DialogFooter className="gap-2 border-t border-mansure-border bg-mansure-light px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="mansureOutline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="mansurePrimary"
            className="gap-2 font-semibold"
          >
            <Save className="size-4" />
            Salvar registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
