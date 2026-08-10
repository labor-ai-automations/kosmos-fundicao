export interface RefugoSelectorItem {
  id: string;
  codigo: string;
  origem: "VICK" | "COLDBOX" | "MACHARIA";
  arvore: number | null;
  pp: number | null;
  macho: boolean | null;
  macho_1: number | null;
  macho_2: number | null;
  peso_peca: number | null;
  peso: number | null;
  peso_macho: number | null;
  peso_1: number | null;
  peso_2: number | null;
  gasagem: number | null;
  qtde_ferramenta: number | null;
  tempo_total: string | null;
}

export const REFUGO_SELECTOR_LABELS: Record<string, string> = {
  codigo: "Código",
  origem: "Origem",
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

export const REFUGO_SELECTOR_COLUMNS = [
  "codigo",
  "origem",
  "arvore",
  "pp",
  "macho",
  "macho_1",
  "macho_2",
  "peso_peca",
  "peso",
  "peso_macho",
  "peso_1",
  "peso_2",
  "gasagem",
  "qtde_ferramenta",
  "tempo_total",
] as const;

export function formatRefugoCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "SIM" : "NÃO";
  return String(value);
}

export function refugoItemMatchesSearch(
  item: RefugoSelectorItem,
  query: string
): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return REFUGO_SELECTOR_COLUMNS.some((col) =>
    formatRefugoCellValue(item[col]).toLowerCase().includes(q)
  );
}

export function getRefugoPesoPrincipal(item: RefugoSelectorItem): number | null {
  return item.peso_peca ?? item.peso ?? item.peso_1 ?? null;
}
