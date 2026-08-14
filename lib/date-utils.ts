import { formatDateForDb } from "@/lib/auth";

export function parseDbDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function todayDbString(): string {
  return formatDateForDb(new Date());
}

/** Rótulo curto para gráficos — evita shift de timezone em strings YYYY-MM-DD */
export function formatDbDateChartLabel(value: string): string {
  const date = parseDbDate(value);
  if (!date) return value;
  return date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
}
