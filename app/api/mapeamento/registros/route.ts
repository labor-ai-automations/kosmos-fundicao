import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SECOES_PREENCHIDAS } from "@/lib/mapeamento-config";
import { requireMapeamentoAuth } from "@/lib/mapeamento-server";

export async function GET() {
  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { data, error: dbError } = await supabase
      .from("mapeamento_pecas_registros")
      .select("*")
      .is("deleted_at", null)
      .order("criado_em", { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: "Erro ao listar registros" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const codigo = String(body.codigo ?? "").trim();

    if (!codigo) {
      return NextResponse.json(
        { error: "Código é obrigatório" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("mapeamento_pecas_registros")
      .select("id")
      .eq("codigo", codigo)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Este código já está registrado" },
        { status: 409 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("mapeamento_pecas_registros")
      .insert([
        {
          codigo,
          status: body.status ?? "rascunho",
          secoes_preenchidas:
            body.secoes_preenchidas ?? DEFAULT_SECOES_PREENCHIDAS,
          criado_por: user.id,
          atualizado_por: user.id,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao criar registro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
