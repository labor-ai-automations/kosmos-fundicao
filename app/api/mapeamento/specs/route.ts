import { NextRequest, NextResponse } from "next/server";
import {
  findItemSpecsByCodigo,
  requireMapeamentoAuth,
} from "@/lib/mapeamento-server";

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get("codigo")?.trim();

  if (!codigo) {
    return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
  }

  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const specs = await findItemSpecsByCodigo(supabase, codigo);
    if (!specs) {
      return NextResponse.json(
        { error: "Código não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(specs);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar especificações" },
      { status: 500 }
    );
  }
}
