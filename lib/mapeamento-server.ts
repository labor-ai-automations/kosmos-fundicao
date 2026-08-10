import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  DEFAULT_SECOES_PREENCHIDAS,
  isMapeamentoCompleto,
  isMapeamentoSecaoId,
  normalizeSecoesPreenchidas,
  type MapeamentoFoto,
  type MapeamentoSecaoId,
  type SecoesPreenchidas,
} from "@/lib/mapeamento-config";
import type { MapeamentoItemSpecs } from "@/lib/types";

export async function getMapeamentoAuthContext(): Promise<{
  supabase: SupabaseClient;
  user: User | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireMapeamentoAuth() {
  const ctx = await getMapeamentoAuthContext();
  if (!ctx.user) {
    return { ...ctx, error: "Não autenticado" as const };
  }
  return { ...ctx, error: null };
}

export async function findItemSpecsByCodigo(
  supabase: SupabaseClient,
  codigo: string
): Promise<MapeamentoItemSpecs | null> {
  const { data: vick } = await supabase
    .from("itens_vick")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (vick) {
    return {
      codigo: vick.codigo,
      origem: "vick",
      peso_peca: vick.peso_peca,
      arvore: vick.arvore,
      macho: vick.macho,
      pp: vick.pp,
    };
  }

  const { data: coldbox } = await supabase
    .from("itens_coldbox")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (coldbox) {
    return {
      codigo: coldbox.codigo,
      origem: "coldbox",
      peso: coldbox.peso,
      arvore: coldbox.arvore,
      macho: coldbox.macho,
    };
  }

  const { data: macharia } = await supabase
    .from("itens_macharia")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (macharia) {
    return {
      codigo: macharia.codigo,
      origem: "macharia",
    };
  }

  return null;
}

export function parseImagens(value: unknown): MapeamentoFoto[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is MapeamentoFoto =>
        !!item &&
        typeof item === "object" &&
        typeof (item as MapeamentoFoto).base64 === "string"
    )
    .map((item) => ({
      base64: item.base64,
      observacao: item.observacao ?? "",
    }));
}

export async function updateRegistroSecoes(
  supabase: SupabaseClient,
  codigo: string,
  secao: MapeamentoSecaoId,
  userId: string | null
) {
  const { data: registro } = await supabase
    .from("mapeamento_pecas_registros")
    .select("secoes_preenchidas")
    .eq("codigo", codigo)
    .is("deleted_at", null)
    .maybeSingle();

  if (!registro) return;

  const secoes = normalizeSecoesPreenchidas(
    registro.secoes_preenchidas as Partial<SecoesPreenchidas>
  );
  secoes[secao] = true;

  await supabase
    .from("mapeamento_pecas_registros")
    .update({
      secoes_preenchidas: secoes,
      status: isMapeamentoCompleto(secoes) ? "completo" : "rascunho",
      atualizado_por: userId,
    })
    .eq("codigo", codigo)
    .is("deleted_at", null);
}

export function assertValidSecao(secao: string): secao is MapeamentoSecaoId {
  return isMapeamentoSecaoId(secao);
}

export { DEFAULT_SECOES_PREENCHIDAS };
