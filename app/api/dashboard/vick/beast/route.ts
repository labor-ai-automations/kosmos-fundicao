import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardBeastData,
  parseBeastQueryParams,
} from "@/lib/dashboard-beast-server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const params = parseBeastQueryParams(req.nextUrl.searchParams);
    const data = await getDashboardBeastData(supabase, params);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
