import { NextRequest, NextResponse } from "next/server";
import {
  ARCHIVABLE_PRODUCTION_TABLES,
  isArchivableProductionTable,
} from "@/lib/archive-config";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function formatArchiveDbError(err: unknown, tabela: string, action: "arquivar" | "restaurar") {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err && "message" in err
        ? String((err as { message: unknown }).message)
        : `Erro ao ${action}`;

  if (message.toLowerCase().includes("archived_at")) {
    return `Arquivamento indisponível na tabela "${tabela}". Execute no Supabase: ALTER TABLE ${tabela} ADD COLUMN IF NOT EXISTS archived_at timestamptz, ADD COLUMN IF NOT EXISTS archived_by uuid;`;
  }

  return message || `Erro ao ${action}`;
}

export async function POST(req: NextRequest, context: RouteContext) {
  let tabela = "producao_vick";

  try {
    const { id } = await context.params;
    const body = await req.json();
    tabela = body.tabela ?? tabela;
    const motivo = body.motivo as string | undefined;

    if (!isArchivableProductionTable(tabela)) {
      return NextResponse.json({ error: "Tabela inválida" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(tabela)
      .update({
        archived_at: new Date().toISOString(),
        archived_by: user.id,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .is("archived_at", null)
      .select("id, codigo")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Registro não encontrado ou já arquivado" },
        { status: 404 }
      );
    }

    const { error: logError } = await supabase.from("archive_log").insert({
      tabela,
      registro_id: id,
      codigo: data.codigo,
      acao: "arquivar",
      motivo: motivo?.trim() || null,
      arquivado_por: user.id,
    });

    if (logError) {
      console.error("Erro ao registrar log de arquivamento:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Registro arquivado com sucesso",
      data,
    });
  } catch (err) {
    console.error("Erro ao arquivar:", err);
    return NextResponse.json(
      { error: formatArchiveDbError(err, tabela, "arquivar") },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  let tabela = "producao_vick";

  try {
    const { id } = await context.params;
    const body = await req.json();
    tabela = body.tabela ?? tabela;
    const motivo = body.motivo as string | undefined;

    if (!isArchivableProductionTable(tabela)) {
      return NextResponse.json({ error: "Tabela inválida" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(tabela)
      .update({
        archived_at: null,
        archived_by: null,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .not("archived_at", "is", null)
      .select("id, codigo")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Registro não encontrado ou não está arquivado" },
        { status: 404 }
      );
    }

    const { error: logError } = await supabase.from("archive_log").insert({
      tabela,
      registro_id: id,
      codigo: data.codigo,
      acao: "restaurar",
      motivo: motivo?.trim() || null,
      arquivado_por: user.id,
    });

    if (logError) {
      console.error("Erro ao registrar log de restauração:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Registro restaurado com sucesso",
      data,
    });
  } catch (err) {
    console.error("Erro ao restaurar:", err);
    return NextResponse.json(
      { error: formatArchiveDbError(err, tabela, "restaurar") },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({
    archivableTables: ARCHIVABLE_PRODUCTION_TABLES,
  });
}
