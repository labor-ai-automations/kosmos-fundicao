import type { ProducaoAmbiente } from "@/lib/producao-config";

export interface ProducaoFormProps {
  modal?: boolean;
  onSaved?: () => void;
  formId?: string;
  hideSubmit?: boolean;
  onFormStateChange?: (state: {
    isValid: boolean;
    isSubmitting: boolean;
  }) => void;
}

export const PRODUCAO_FORM_IDS: Record<ProducaoAmbiente, string> = {
  vick: "producao-form-vick",
  coldbox: "producao-form-coldbox",
  macharia: "producao-form-macharia",
  refugo: "producao-form-refugo",
};
