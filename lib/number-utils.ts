import { z } from "zod";

/** Aceita vírgula ou ponto como separador decimal (ex.: 23,12 ou 1.234,56). */
export function parseDecimalInput(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let str = String(value).trim();
  if (!str) return null;

  str = str.replace(/\s/g, "");
  const hasComma = str.includes(",");
  const hasDot = str.includes(".");

  if (hasComma && hasDot) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    str = str.replace(",", ".");
  }

  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

export function parseOptionalNumber(value: unknown): number | null {
  return parseDecimalInput(value);
}

export function zDecimal(min = 0) {
  return z
    .union([z.string(), z.number()])
    .superRefine((val, ctx) => {
      const parsed = parseDecimalInput(val);
      if (parsed === null) {
        ctx.addIssue({
          code: "custom",
          message: "Valor numérico inválido",
        });
        return;
      }
      if (parsed < min) {
        ctx.addIssue({
          code: "custom",
          message:
            min === 0 ? "Valor deve ser >= 0" : `Valor deve ser >= ${min}`,
        });
      }
    })
    .transform((val) => parseDecimalInput(val)!);
}

export function zOptionalDecimal() {
  return z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => parseDecimalInput(val));
}

export function normalizeRecordNumbers(
  record: Record<string, string | number | boolean | null>
): Record<string, string | number | boolean | null> {
  const result = { ...record };
  const numericKeys = new Set([
    "peso_registro",
    "peso_registro_2",
    "qtde_perdida",
    "qtde_feita",
    "qtde_caixas",
    "percas",
    "ciclo",
  ]);

  for (const [key, value] of Object.entries(result)) {
    const isNumeric = numericKeys.has(key) || typeof value === "number";
    if (!isNumeric || typeof value === "boolean") continue;

    if (value === null || value === undefined || value === "") {
      result[key] = null;
      continue;
    }

    if (typeof value === "string") {
      result[key] = parseDecimalInput(value);
    }
  }

  return result;
}
