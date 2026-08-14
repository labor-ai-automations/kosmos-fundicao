import { NextRequest, NextResponse } from "next/server";
import {
  getOperadorNome,
  getRegistroByCodigo,
  parseAnexos,
  requireMapeamentoAuth,
} from "@/lib/mapeamento-server";
import { isStatusOperacional } from "@/lib/mapeamento-status";

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const codigo = String(body.codigo ?? "").trim();
    const status = String(body.status ?? "").trim();
    const observacao = String(body.observacao ?? "").trim() || null;
    const anexos = parseAnexos(body.anexos);

    if (!codigo || !status) {
      return NextResponse.json(
        { error: "Código e status são obrigatórios" },
        { status: 400 }
      );
    }

    if (!isStatusOperacional(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const registro = await getRegistroByCodigo(supabase, codigo);
    if (!registro) {
      return NextResponse.json({ error: "Código não encontrado" }, { status: 404 });
    }

    const statusAnterior = registro.status_atual as string | null;

    const criado_por_nome =
      String(body.criado_por_nome ?? "").trim() ||
      (await getOperadorNome(supabase, user));

    const { data: timelineEntry, error: timelineError } = await supabase
      .from("mapeamento_pecas_status_timeline")
      .insert([
        {
          mapeamento_id: registro.id,
          codigo,
          status,
          status_anterior: statusAnterior,
          observacao,
          anexos,
          criado_por: user.id,
          criado_por_nome,
        },
      ])
      .select()
      .single();

    if (timelineError) throw timelineError;

    const { error: updateError } = await supabase
      .from("mapeamento_pecas_registros")
      .update({
        status_atual: status,
        status_definido_em: new Date().toISOString(),
        atualizado_por: user.id,
      })
      .eq("id", registro.id);

    if (updateError) throw updateError;

    if (anexos.length > 0) {
      const anexosData = anexos.map((anexo) => ({
        codigo,
        timeline_id: timelineEntry.id,
        tipo_anexo: anexo.tipo,
        nome_original: anexo.nome,
        base64: anexo.base64,
        tamanho_bytes: anexo.base64.length,
        mime_type: anexo.mime_type,
        status_quando_adicionado: status,
      }));

      const { error: anexosError } = await supabase
        .from("mapeamento_pecas_anexos")
        .insert(anexosData);

      if (anexosError) throw anexosError;
    }

    return NextResponse.json(
      {
        ...timelineEntry,
        anexos,
        criado_por_nome,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
