import { NextResponse } from "next/server";
import { getDashboardVickData } from "@/lib/dashboard-vick-server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const data = await getDashboardVickData(supabase);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
