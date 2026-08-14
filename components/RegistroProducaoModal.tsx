"use client";

import { useEffect, useState } from "react";
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
  const [formState, setFormState] = useState({
    isValid: ambiente !== "vick",
    isSubmitting: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormState({
        isValid: ambiente !== "vick",
        isSubmitting: false,
      });
    }
  }, [isOpen, ambiente]);

  const submitDisabled =
    ambiente === "vick"
      ? !formState.isValid || formState.isSubmitting
      : formState.isSubmitting;

  const handleSaved = () => {
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton
        className="flex max-h-[90vh] w-[min(960px,calc(100vw-2rem))] max-w-none flex-col overflow-hidden border-mansure-border bg-mansure-light p-0 text-mansure-black sm:max-w-none"
      >
        <DialogHeader className="border-b border-mansure-border px-8 py-5">
          <DialogTitle className="text-xl font-bold text-mansure-black">
            Nova produção — {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-5">
          <Form
            modal
            formId={formId}
            onSaved={handleSaved}
            hideSubmit
            onFormStateChange={setFormState}
          />
        </div>

        <DialogFooter className="gap-2 border-t border-mansure-border bg-mansure-light px-8 py-5 sm:justify-end">
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
            disabled={submitDisabled}
          >
            <Save className="size-4" />
            {formState.isSubmitting ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
