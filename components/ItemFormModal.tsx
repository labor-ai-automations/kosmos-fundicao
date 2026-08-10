"use client";

import { useEffect } from "react";
import { Controller, useForm, type FieldValues } from "react-hook-form";
import { z } from "zod";
import type { ItemAmbiente } from "@/lib/types";
import type { ItemColdbox, ItemMacharia, ItemVick } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { zOptionalDecimal, parseDecimalInput } from "@/lib/number-utils";
import { DecimalInput } from "@/components/DecimalInput";

const optionalNumber = zOptionalDecimal();

const vickSchema = z.object({
  codigo: z.string().min(1, "Código obrigatório"),
  arvore: optionalNumber,
  pp: optionalNumber,
  macho: z.boolean(),
  macho_1: optionalNumber,
  macho_2: optionalNumber,
  peso_peca: optionalNumber,
});

const coldboxSchema = z.object({
  codigo: z.string().min(1, "Código obrigatório"),
  arvore: optionalNumber,
  peso: optionalNumber,
  macho: z.boolean(),
  peso_macho: optionalNumber,
});

const machariaSchema = z.object({
  codigo: z.string().min(1, "Código obrigatório"),
  peso_1: optionalNumber,
  peso_2: optionalNumber,
  gasagem: optionalNumber,
  macho_1: optionalNumber,
  macho_2: optionalNumber,
  qtde_ferramenta: optionalNumber,
  tempo_total: z.string().nullable(),
});

type ItemRecord = ItemVick | ItemColdbox | ItemMacharia;

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox";
}

const FIELDS: Record<ItemAmbiente, FieldConfig[]> = {
  vick: [
    { name: "codigo", label: "Código", type: "text" },
    { name: "arvore", label: "Árvore", type: "number" },
    { name: "pp", label: "P.P", type: "number" },
    { name: "macho", label: "Macho", type: "checkbox" },
    { name: "macho_1", label: "Macho 1", type: "number" },
    { name: "macho_2", label: "Macho 2", type: "number" },
    { name: "peso_peca", label: "Peso Peça", type: "number" },
  ],
  coldbox: [
    { name: "codigo", label: "Código", type: "text" },
    { name: "arvore", label: "Árvore", type: "number" },
    { name: "peso", label: "Peso", type: "number" },
    { name: "macho", label: "Macho", type: "checkbox" },
    { name: "peso_macho", label: "Peso Macho", type: "number" },
  ],
  macharia: [
    { name: "codigo", label: "Código", type: "text" },
    { name: "peso_1", label: "Peso 1", type: "number" },
    { name: "peso_2", label: "Peso 2", type: "number" },
    { name: "gasagem", label: "Gasagem", type: "number" },
    { name: "macho_1", label: "Macho 1", type: "number" },
    { name: "macho_2", label: "Macho 2", type: "number" },
    { name: "qtde_ferramenta", label: "Qtde/Ferramenta", type: "number" },
    { name: "tempo_total", label: "Tempo Total", type: "text" },
  ],
};

function getSchema(ambiente: ItemAmbiente) {
  if (ambiente === "vick") return vickSchema;
  if (ambiente === "coldbox") return coldboxSchema;
  return machariaSchema;
}

function getDefaultValues(ambiente: ItemAmbiente): FieldValues {
  if (ambiente === "vick") {
    return {
      codigo: "",
      arvore: null,
      pp: null,
      macho: false,
      macho_1: null,
      macho_2: null,
      peso_peca: null,
    };
  }
  if (ambiente === "coldbox") {
    return {
      codigo: "",
      arvore: null,
      peso: null,
      macho: false,
      peso_macho: null,
    };
  }
  return {
    codigo: "",
    peso_1: null,
    peso_2: null,
    gasagem: null,
    macho_1: null,
    macho_2: null,
    qtde_ferramenta: null,
    tempo_total: null,
  };
}

function itemToFormValues(
  ambiente: ItemAmbiente,
  item: ItemRecord
): FieldValues {
  const defaults = getDefaultValues(ambiente);
  const record = item as unknown as Record<string, unknown>;
  const values: FieldValues = { ...defaults };

  for (const field of FIELDS[ambiente]) {
    if (field.name in record) {
      values[field.name] = record[field.name];
    }
  }

  return values;
}

interface ItemFormModalProps {
  ambiente: ItemAmbiente;
  isOpen: boolean;
  item: ItemRecord | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export function ItemFormModal({
  ambiente,
  isOpen,
  item,
  onSave,
  onClose,
}: ItemFormModalProps) {
  const form = useForm<FieldValues>({
    defaultValues: getDefaultValues(ambiente),
  });

  useEffect(() => {
    if (!isOpen) return;
    form.clearErrors();
    if (item) {
      form.reset(itemToFormValues(ambiente, item));
    } else {
      form.reset(getDefaultValues(ambiente));
    }
  }, [item, isOpen, ambiente, form]);

  const onSubmit = async (data: FieldValues) => {
    const result = getSchema(ambiente).safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field, { message: issue.message });
        }
      }
      return;
    }
    await onSave(result.data as Record<string, unknown>);
  };

  const fields = FIELDS[ambiente];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto border-mansure-gray-light bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-mansure-black">
            {item ? "Editar Item" : "Novo Item"} — {ambiente.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "checkbox"
                    ? "flex items-center gap-2 sm:col-span-2"
                    : "space-y-2"
                }
              >
                {field.type === "checkbox" ? (
                  <>
                    <Controller
                      name={field.name}
                      control={form.control}
                      render={({ field: checkboxField }) => (
                        <Checkbox
                          checked={Boolean(checkboxField.value)}
                          onCheckedChange={(checked) =>
                            checkboxField.onChange(checked === true)
                          }
                        />
                      )}
                    />
                    <Label className="kosmos-label">{field.label}</Label>
                  </>
                ) : field.type === "number" ? (
                  <>
                    <Label className="kosmos-label">{field.label}</Label>
                    <DecimalInput
                      placeholder={field.label}
                      {...form.register(field.name, {
                        setValueAs: (value: string) => parseDecimalInput(value),
                      })}
                    />
                    {form.formState.errors[field.name] && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors[field.name]?.message as string}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Label className="kosmos-label">{field.label}</Label>
                    <Input
                      type="text"
                      placeholder={field.label}
                      className="kosmos-input"
                      {...form.register(field.name, {
                        setValueAs:
                          field.name === "tempo_total"
                            ? (value: string) => (value === "" ? null : value)
                            : undefined,
                      })}
                    />
                    {form.formState.errors[field.name] && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors[field.name]?.message as string}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-mansure-gray-light"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-mansure-blue hover:bg-mansure-blue/90"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
