import { NextRequest, NextResponse } from "next/server";
import { generateMapeamentoPdfBuffer } from "@/lib/pdf/generate-mapeamento-pdf";
import { requireMapeamentoAuth } from "@/lib/mapeamento-server";

type RouteContext = { params: Promise<{ codigo: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { codigo } = await context.params;
  const decodedCodigo = decodeURIComponent(codigo);
  const includeTimeline =
    req.nextUrl.searchParams.get("includeTimeline") === "true";
  const disposition = req.nextUrl.searchParams.get("disposition") ?? "attachment";
  const inline = disposition === "inline";

  const { supabase, user, error } = await requireMapeamentoAuth();
  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const pdfBytes = await generateMapeamentoPdfBuffer(
      supabase,
      user,
      decodedCodigo,
      includeTimeline
    );
    const filename = `mapeamento-${decodedCodigo.replace(/[^\w.-]+/g, "_")}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
