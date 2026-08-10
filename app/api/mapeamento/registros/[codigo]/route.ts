import { NextRequest, NextResponse } from "next/server";
import { requireMapeamentoAuth } from "@/lib/mapeamento-server";

type RouteContext = {
  params: Promise<{ codigo: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const { codigo } = await context.params;
  const decodedCodigo = decodeURIComponent(codigo);

  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { data, error: dbError } = await supabase
      .from("mapeamento_pecas_registros")
      .select("*")
      .eq("codigo", decodedCodigo)
      .is("deleted_at", null)
      .maybeSingle();

    if (dbError) throw dbError;

    if (!data) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erro ao obter registro" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { codigo } = await context.params;
  const decodedCodigo = decodeURIComponent(codigo);

  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    const { error: registroError } = await supabase
      .from("mapeamento_pecas_registros")
      .update({ deleted_at: now, atualizado_por: user.id })
      .eq("codigo", decodedCodigo)
      .is("deleted_at", null);

    if (registroError) throw registroError;

    await supabase
      .from("mapeamento_pecas")
      .update({ deleted_at: now, atualizado_por: user.id })
      .eq("codigo", decodedCodigo)
      .is("deleted_at", null);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar registro" },
      { status: 500 }
    );
  }
}
