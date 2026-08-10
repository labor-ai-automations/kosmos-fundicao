import type { ProductionTable } from "@/lib/types";

export type ProducaoAmbiente = "vick" | "coldbox" | "macharia" | "refugo";

export const PRODUCAO_AMBIENTES: {
  key: ProducaoAmbiente;
  table: ProductionTable;
  title: string;
  description: string;
}[] = [
  {
    key: "vick",
    table: "producao_vick",
    title: "VICK",
    description: "Controle de fornada",
  },
  {
    key: "coldbox",
    table: "producao_coldbox",
    title: "COLDBOX",
    description: "Produção coldbox",
  },
  {
    key: "macharia",
    table: "producao_macharia",
    title: "MACHARIA",
    description: "Operações de macharia",
  },
  {
    key: "refugo",
    table: "refugo",
    title: "REFUGO",
    description: "Registro de refugo",
  },
];

export function isValidProducaoAmbiente(
  value: string
): value is ProducaoAmbiente {
  return PRODUCAO_AMBIENTES.some((a) => a.key === value);
}

export function getProducaoAmbienteConfig(ambiente: ProducaoAmbiente) {
  return PRODUCAO_AMBIENTES.find((a) => a.key === ambiente)!;
}
