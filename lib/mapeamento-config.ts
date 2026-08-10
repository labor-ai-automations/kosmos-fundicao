import type { LucideIcon } from "lucide-react";
import {
  Box,
  Cog,
  Cylinder,
  Package,
  Trees,
  Wrench,
} from "lucide-react";

export type MapeamentoSecaoId =
  | "ferramenta"
  | "moldagem"
  | "arvore"
  | "peca"
  | "ferramenta_macharia"
  | "macho_core";

export interface MapeamentoFoto {
  base64: string;
  observacao: string;
}

export interface MapeamentoSecaoConfig {
  id: MapeamentoSecaoId;
  titulo: string;
  subtitulo: string;
  Icon: LucideIcon;
  heading: string;
}

export const MAPEAMENTO_SECOES: MapeamentoSecaoConfig[] = [
  {
    id: "ferramenta",
    titulo: "Ferramenta",
    subtitulo: "(Matrizes)",
    Icon: Wrench,
    heading: "FERRAMENTA (MATRIZES)",
  },
  {
    id: "moldagem",
    titulo: "Moldagem",
    subtitulo: "& Pesos (Areia)",
    Icon: Cog,
    heading: "MOLDAGEM & PESOS (AREIA)",
  },
  {
    id: "arvore",
    titulo: "Árvore",
    subtitulo: "",
    Icon: Trees,
    heading: "ÁRVORE",
  },
  {
    id: "peca",
    titulo: "Peça",
    subtitulo: "",
    Icon: Box,
    heading: "PEÇA",
  },
  {
    id: "ferramenta_macharia",
    titulo: "Ferramenta de",
    subtitulo: "Macharia",
    Icon: Package,
    heading: "FERRAMENTA DE MACHARIA",
  },
  {
    id: "macho_core",
    titulo: "Macho /",
    subtitulo: "Core",
    Icon: Cylinder,
    heading: "MACHO / CORE",
  },
];

export const MAPEAMENTO_SECAO_IDS = MAPEAMENTO_SECOES.map((s) => s.id);

export type SecoesPreenchidas = Record<MapeamentoSecaoId, boolean>;

export const DEFAULT_SECOES_PREENCHIDAS: SecoesPreenchidas = {
  ferramenta: false,
  moldagem: false,
  arvore: false,
  peca: false,
  ferramenta_macharia: false,
  macho_core: false,
};

export function isMapeamentoSecaoId(value: string): value is MapeamentoSecaoId {
  return MAPEAMENTO_SECAO_IDS.includes(value as MapeamentoSecaoId);
}

export function getMapeamentoSecaoConfig(
  secaoId: string
): MapeamentoSecaoConfig | undefined {
  return MAPEAMENTO_SECOES.find((s) => s.id === secaoId);
}

export function normalizeSecoesPreenchidas(
  value: Partial<SecoesPreenchidas> | null | undefined
): SecoesPreenchidas {
  return {
    ...DEFAULT_SECOES_PREENCHIDAS,
    ...(value ?? {}),
  };
}

export function isMapeamentoCompleto(
  secoes: Partial<SecoesPreenchidas> | null | undefined
): boolean {
  const normalized = normalizeSecoesPreenchidas(secoes);
  return MAPEAMENTO_SECAO_IDS.every((id) => normalized[id]);
}

export function formatSecoesPreenchidas(
  secoes: Partial<SecoesPreenchidas> | null | undefined
): string {
  const normalized = normalizeSecoesPreenchidas(secoes);
  const labels = MAPEAMENTO_SECOES.filter((s) => normalized[s.id]).map(
    (s) => s.titulo
  );
  return labels.length > 0 ? labels.join(", ") : "—";
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Reduz tamanho da imagem antes de salvar em Base64 (evita limite do Supabase) */
export async function fileToBase64Compressed(
  file: File,
  maxDimension = 1280,
  quality = 0.85
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem válido");
  }

  const bitmap = await createImageBitmap(file);
  const largest = Math.max(bitmap.width, bitmap.height);
  const scale = largest > maxDimension ? maxDimension / largest : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result
          ? resolve(result)
          : reject(new Error("Falha ao comprimir imagem")),
      "image/jpeg",
      quality
    );
  });

  return fileToBase64(new File([blob], file.name, { type: "image/jpeg" }));
}
