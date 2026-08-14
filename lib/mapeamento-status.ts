export type MapeamentoStatusOperacional = "disponivel" | "em_manutencao";

export interface MapeamentoAnexo {
  tipo: "imagem" | "documento";
  nome: string;
  base64: string;
  mime_type: string;
}

export interface MapeamentoTimelineItem {
  id: string;
  codigo: string;
  status: MapeamentoStatusOperacional;
  status_anterior: MapeamentoStatusOperacional | null;
  observacao: string | null;
  anexos: MapeamentoAnexo[];
  criado_em: string;
  criado_por: string | null;
  criado_por_nome: string;
}

export interface MapeamentoVickConfig {
  id: string;
  mapeamento_id: string;
  codigo: string;
  eh_meia_placa: boolean;
  eh_manual: boolean;
  segundo_codigo: string | null;
}

export const STATUS_OPERACIONAL_LABELS: Record<
  MapeamentoStatusOperacional,
  string
> = {
  disponivel: "Disponível",
  em_manutencao: "Em Manutenção",
};

export function formatStatusOperacional(
  status: MapeamentoStatusOperacional | null | undefined
): string {
  if (!status) return "Aguardando definição";
  return STATUS_OPERACIONAL_LABELS[status];
}

export function parseAnexos(value: unknown): MapeamentoAnexo[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is MapeamentoAnexo =>
      !!item &&
      typeof item === "object" &&
      typeof (item as MapeamentoAnexo).nome === "string" &&
      typeof (item as MapeamentoAnexo).base64 === "string"
  );
}

export function isStatusOperacional(
  value: string
): value is MapeamentoStatusOperacional {
  return value === "disponivel" || value === "em_manutencao";
}

export function downloadBase64File(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = base64;
  link.download = filename.replace(/[^\w.-]+/g, "_");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
