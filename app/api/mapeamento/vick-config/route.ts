import { NextRequest, NextResponse } from "next/server";
import {
  getRegistroByCodigo,
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
    const { data, error: dbError } = await supabase
      .from("mapeamento_pecas_vick_config")
      .select("*")
      .eq("codigo", codigo)
      .is("deleted_at", null)
      .maybeSingle();

    if (dbError) throw dbError;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar configuração Vick" },
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
    const eh_meia_placa = Boolean(body.eh_meia_placa);
    const eh_manual = Boolean(body.eh_manual);
    const segundo_codigo = String(body.segundo_codigo ?? "").trim() || null;

    if (!codigo) {
      return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
    }

    if (eh_meia_placa && !segundo_codigo) {
      return NextResponse.json(
        { error: "Segundo código é obrigatório para Meia Placa" },
        { status: 400 }
      );
    }

    const registro = await getRegistroByCodigo(supabase, codigo);
    if (!registro) {
      return NextResponse.json({ error: "Código não encontrado" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("mapeamento_pecas_vick_config")
      .select("id")
      .eq("codigo", codigo)
      .is("deleted_at", null)
      .maybeSingle();

    let result;

    if (existing) {
      result = await supabase
        .from("mapeamento_pecas_vick_config")
        .update({
          eh_meia_placa,
          eh_manual,
          segundo_codigo,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("mapeamento_pecas_vick_config")
        .insert([
          {
            mapeamento_id: registro.id,
            codigo,
            eh_meia_placa,
            eh_manual,
            segundo_codigo,
          },
        ])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao salvar configuração";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
