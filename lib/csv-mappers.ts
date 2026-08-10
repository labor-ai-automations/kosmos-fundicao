export type ImportAmbiente = "vick" | "coldbox" | "macharia";

export const CSV_MAPPERS: Record<
  ImportAmbiente,
  Record<string, string>
> = {
  vick: {
    CÓDIGO: "codigo",
    COD: "codigo",
    CODIGO: "codigo",
    ARVORE: "arvore",
    ÁRVORE: "arvore",
    "P.P": "pp",
    PP: "pp",
    MACHO: "macho",
    "MACHO 1": "macho_1",
    "MACHO 2": "macho_2",
    "PESO PEÇA": "peso_peca",
    "PESO PECA": "peso_peca",
    "PESO PEÇA ": "peso_peca",
  },
  coldbox: {
    COD: "codigo",
    CÓDIGO: "codigo",
    CODIGO: "codigo",
    ARVORE: "arvore",
    ÁRVORE: "arvore",
    PESO: "peso",
    MACHO: "macho",
    "PESO MACHO": "peso_macho",
  },
  macharia: {
    COD: "codigo",
    CÓDIGO: "codigo",
    CODIGO: "codigo",
    "PESO 1": "peso_1",
    "PESO 2": "peso_2",
    GASAGEM: "gasagem",
    "MACHO 1": "macho_1",
    "MACHO 2": "macho_2",
    "QTDE/FERRAMENTA": "qtde_ferramenta",
    "QTDE / FERRAMENTA": "qtde_ferramenta",
    "TEMPO TOTAL": "tempo_total",
  },
};

const BOOL_COLUMNS = new Set(["macho"]);
const INT_COLUMNS = new Set(["qtde_ferramenta", "arvore", "pp"]);
const FLOAT_COLUMNS = new Set([
  "peso",
  "peso_macho",
  "peso_peca",
  "peso_1",
  "peso_2",
  "gasagem",
  "macho_1",
  "macho_2",
]);

function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").toUpperCase().trim();
}

export function mapHeaders(
  csvHeaders: string[],
  ambiente: ImportAmbiente
): Record<string, string> {
  const mapper = CSV_MAPPERS[ambiente];
  const mapped: Record<string, string> = {};

  csvHeaders.forEach((header) => {
    const normalized = normalizeHeader(header);
    const dbColumn = mapper[normalized];
    if (dbColumn) {
      mapped[header] = dbColumn;
    }
  });

  return mapped;
}

function parseNumber(value: string): number | null {
  const cleaned = value.toString().trim().replace(",", ".");
  if (cleaned === "") return null;
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
}

function parseInteger(value: string): number | null {
  const cleaned = value.toString().trim().replace(",", ".");
  if (cleaned === "") return null;
  const num = parseInt(cleaned, 10);
  return Number.isNaN(num) ? null : num;
}

export function transformRow(
  row: Record<string, unknown>,
  headerMap: Record<string, string>
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  Object.entries(headerMap).forEach(([csvHeader, dbColumn]) => {
    const raw = row[csvHeader];

    if (raw === null || raw === undefined || String(raw).trim() === "") {
      transformed[dbColumn] = null;
      return;
    }

    const value = String(raw).trim();

    if (BOOL_COLUMNS.has(dbColumn)) {
      transformed[dbColumn] =
        raw === null || raw === undefined || String(raw).trim() === ""
          ? false
          : value.toUpperCase() === "SIM";
    } else if (dbColumn === "tempo_total") {
      transformed[dbColumn] = value;
    } else if (dbColumn === "codigo") {
      transformed[dbColumn] = value;
    } else if (INT_COLUMNS.has(dbColumn)) {
      transformed[dbColumn] = parseInteger(value);
    } else if (FLOAT_COLUMNS.has(dbColumn)) {
      transformed[dbColumn] = parseNumber(value);
    } else {
      transformed[dbColumn] = value;
    }
  });

  return transformed;
}

export function validateHeaderMap(
  headerMap: Record<string, string>,
  ambiente: ImportAmbiente
): string | null {
  if (Object.keys(headerMap).length === 0) {
    return "Nenhum header reconhecido no CSV.";
  }

  const dbColumns = new Set(Object.values(headerMap));
  if (!dbColumns.has("codigo")) {
    return `Coluna COD/CÓDIGO não encontrada. Headers esperados: ${Object.keys(CSV_MAPPERS[ambiente]).join(", ")}`;
  }

  const minExpected = Math.ceil(Object.keys(CSV_MAPPERS[ambiente]).length / 3);
  if (Object.keys(headerMap).length < minExpected) {
    return `Poucos headers reconhecidos (${Object.keys(headerMap).length}). Verifique se o CSV é do ambiente ${ambiente.toUpperCase()}.`;
  }

  return null;
}

export function validateRows(
  rows: Record<string, unknown>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const line = index + 2;
    const codigo = row.codigo;

    if (!codigo || String(codigo).trim() === "") {
      errors.push(`Linha ${line}: código vazio`);
      return;
    }

    for (const [key, val] of Object.entries(row)) {
      if (key === "codigo" || key === "tempo_total" || key === "macho") continue;
      if (val !== null && typeof val === "number" && Number.isNaN(val)) {
        errors.push(`Linha ${line}: valor inválido em "${key}"`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors.slice(0, 15),
  };
}

export function getExpectedHeaders(ambiente: ImportAmbiente): string[] {
  return Object.keys(CSV_MAPPERS[ambiente]);
}
