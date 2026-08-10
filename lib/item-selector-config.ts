import type { ItemColdbox, ItemMacharia, ItemVick } from "@/lib/types";

export type ItemSelectorAmbiente = "vick" | "coldbox" | "macharia";

export type SelectorItem = ItemVick | ItemColdbox | ItemMacharia;

export const ITEM_SELECTOR_LABELS: Record<string, string> = {
  codigo: "Código",
  arvore: "Árvore",
  pp: "P.P",
  macho: "Macho",
  macho_1: "Macho 1",
  macho_2: "Macho 2",
  peso_peca: "Peso Peça",
  peso: "Peso",
  peso_macho: "Peso Macho",
  peso_1: "Peso 1",
  peso_2: "Peso 2",
  gasagem: "Gasagem",
  qtde_ferramenta: "Qtde/Ferramenta",
  tempo_total: "Tempo Total",
};

export const ITEM_SELECTOR_COLUMNS: Record<ItemSelectorAmbiente, string[]> = {
  vick: ["codigo", "arvore", "pp", "macho", "macho_1", "macho_2", "peso_peca"],
  coldbox: ["codigo", "arvore", "peso", "macho", "peso_macho"],
  macharia: [
    "codigo",
    "peso_1",
    "peso_2",
    "gasagem",
    "macho_1",
    "macho_2",
    "qtde_ferramenta",
    "tempo_total",
  ],
};

export function formatSelectorCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "SIM" : "NÃO";
  return String(value);
}

export function itemMatchesSearch(
  item: SelectorItem,
  query: string,
  columns: string[]
): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return columns.some((col) =>
    formatSelectorCellValue(item[col as keyof SelectorItem])
      .toLowerCase()
      .includes(q)
  );
}
