import { NextRequest, NextResponse } from "next/server";
import {
  getUsuarioNome,
  parseAnexos,
  requireMapeamentoAuth,
} from "@/lib/mapeamento-server";

type RouteContext = { params: Promise<{ codigo: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { codigo } = await context.params;
  const decodedCodigo = decodeURIComponent(codigo);

  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { data, error: dbError } = await supabase
      .from("mapeamento_pecas_status_timeline")
      .select("*")
      .eq("codigo", decodedCodigo)
      .is("deleted_at", null)
      .order("criado_em", { ascending: false });

    if (dbError) throw dbError;

    const timeline = await Promise.all(
      (data ?? []).map(async (item) => ({
        id: item.id,
        codigo: item.codigo,
        status: item.status,
        status_anterior: item.status_anterior,
        observacao: item.observacao,
        anexos: parseAnexos(item.anexos),
        criado_em: item.criado_em,
        criado_por: item.criado_por,
        criado_por_nome:
          item.criado_por_nome ||
          (await getUsuarioNome(supabase, item.criado_por, user)),
      }))
    );

    return NextResponse.json(timeline);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao buscar timeline";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
