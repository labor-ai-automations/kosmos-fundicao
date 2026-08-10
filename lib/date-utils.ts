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
