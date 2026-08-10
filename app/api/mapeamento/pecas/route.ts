import { NextRequest, NextResponse } from "next/server";
import {
  assertValidSecao,
  parseImagens,
  requireMapeamentoAuth,
  updateRegistroSecoes,
} from "@/lib/mapeamento-server";

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get("codigo")?.trim();
  const secao = req.nextUrl.searchParams.get("secao")?.trim();

  if (!codigo || !secao) {
    return NextResponse.json(
      { error: "Código e seção são obrigatórios" },
      { status: 400 }
    );
  }

  if (!assertValidSecao(secao)) {
    return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
  }

  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { data, error: dbError } = await supabase
      .from("mapeamento_pecas")
      .select("*")
      .eq("codigo", codigo)
      .eq("secao", secao)
      .is("deleted_at", null)
      .maybeSingle();

    if (dbError) throw dbError;

    if (!data) {
      return NextResponse.json({
        codigo,
        secao,
        imagens: [],
        endereco_fisico: "",
      });
    }

    return NextResponse.json({
      ...data,
      imagens: parseImagens(data.imagens),
      endereco_fisico: data.endereco_fisico ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Erro ao obter seção" }, { status: 500 });
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
    const secao = String(body.secao ?? "").trim();
    const imagens = parseImagens(body.imagens);
    const endereco_fisico = String(body.endereco_fisico ?? "").trim() || null;

    if (!codigo || !secao) {
      return NextResponse.json(
        { error: "Código e seção são obrigatórios" },
        { status: 400 }
      );
    }

    if (!assertValidSecao(secao)) {
      return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("mapeamento_pecas")
      .select("id")
      .eq("codigo", codigo)
      .eq("secao", secao)
      .is("deleted_at", null)
      .maybeSingle();

    let result;

    if (existing) {
      result = await supabase
        .from("mapeamento_pecas")
        .update({
          imagens,
          endereco_fisico,
          atualizado_por: user.id,
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("mapeamento_pecas")
        .insert([
          {
            codigo,
            secao,
            imagens,
            endereco_fisico,
            criado_por: user.id,
            atualizado_por: user.id,
          },
        ])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    await updateRegistroSecoes(supabase, codigo, secao, user.id);

    return NextResponse.json(
      {
        ...result.data,
        imagens: parseImagens(result.data.imagens),
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar seção";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
