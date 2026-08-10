import { z } from "zod";

export function normalizeObservacao(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function formatObservacaoDisplay(
  value: string | null | undefined
): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export const observacaoFieldSchema = z
  .string()
  .max(2000, "Observação muito longa (máx. 2000 caracteres)")
  .optional()
  .default("")
  .transform((val) => normalizeObservacao(val));
