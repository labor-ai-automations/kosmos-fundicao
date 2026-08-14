import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getMapeamentoSecaoConfig, type MapeamentoSecaoId } from "@/lib/mapeamento-config";
import {
  findItemSpecsByCodigo,
  getOperadorNome,
  getRegistroByCodigo,
  getUsuarioNome,
  parseImagens,
} from "@/lib/mapeamento-server";
import type { MapeamentoPdfData } from "./types";

export async function fetchMapeamentoPdfData(
  supabase: SupabaseClient,
  user: User | null,
  codigo: string,
  includeTimeline: boolean
): Promise<MapeamentoPdfData> {
  const registro = await getRegistroByCodigo(supabase, codigo);
  if (!registro) {
    throw new Error("Registro não encontrado");
  }

  const specs = await findItemSpecsByCodigo(supabase, codigo);

  const { data: vickConfig } = await supabase
    .from("mapeamento_pecas_vick_config")
    .select("*")
    .eq("codigo", codigo)
    .is("deleted_at", null)
    .maybeSingle();

  const { data: secoesRows } = await supabase
    .from("mapeamento_pecas")
    .select("*")
    .eq("codigo", codigo)
    .is("deleted_at", null);

  let timeline: MapeamentoPdfData["timeline"] = [];
  if (includeTimeline) {
    const { data: timelineRows } = await supabase
      .from("mapeamento_pecas_status_timeline")
      .select("*")
      .eq("codigo", codigo)
      .is("deleted_at", null)
      .order("criado_em", { ascending: false });

    timeline = await Promise.all(
      (timelineRows ?? []).map(async (item) => ({
        id: item.id,
        status: item.status,
        status_anterior: item.status_anterior,
        observacao: item.observacao,
        criado_em: item.criado_em,
        criado_por_nome:
          item.criado_por_nome ||
          (await getUsuarioNome(supabase, item.criado_por, user)),
      }))
    );
  }

  const secoes = (secoesRows ?? []).map((sec) => {
    const config = getMapeamentoSecaoConfig(sec.secao as MapeamentoSecaoId);
    return {
      secao: sec.secao,
      titulo: config?.heading ?? sec.secao,
      endereco_fisico: sec.endereco_fisico,
      imagens: parseImagens(sec.imagens).filter((img) => img.base64?.trim()),
    };
  });

  const operador = await getOperadorNome(supabase, user);
  const ultimoStatus = timeline[0];

  return {
    codigo,
    especificacoes: {
      origem: specs?.origem?.toUpperCase(),
      peso_peca: specs?.peso_peca ?? specs?.peso ?? null,
      arvore: specs?.arvore ?? null,
      macho: specs?.macho ?? null,
      pp: specs?.pp ?? null,
      eh_meia_placa: vickConfig?.eh_meia_placa ?? false,
      eh_manual: vickConfig?.eh_manual ?? false,
      segundo_codigo: vickConfig?.segundo_codigo ?? null,
    },
    status: {
      status_atual: registro.status_atual,
      status_definido_em: registro.status_definido_em,
      criado_por_nome: ultimoStatus?.criado_por_nome ?? null,
    },
    timeline,
    secoes,
    dataGeracao: new Date().toLocaleString("pt-BR"),
    operador,
  };
}
