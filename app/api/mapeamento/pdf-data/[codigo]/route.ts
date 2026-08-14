import { NextRequest, NextResponse } from "next/server";
import { fetchMapeamentoPdfData } from "@/lib/pdf/fetch-mapeamento-data";
import { requireMapeamentoAuth } from "@/lib/mapeamento-server";

type RouteContext = { params: Promise<{ codigo: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { codigo } = await context.params;
  const decodedCodigo = decodeURIComponent(codigo);
  const includeTimeline =
    req.nextUrl.searchParams.get("includeTimeline") === "true";

  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const data = await fetchMapeamentoPdfData(
      supabase,
      user,
      decodedCodigo,
      includeTimeline
    );

    return NextResponse.json({ ...data, includeTimeline });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao buscar dados do PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
