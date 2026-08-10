import { createClient } from "@/lib/supabase/client";
import type { AuthUser, Usuario } from "@/lib/types";

export async function loginMock(displayEmail: string): Promise<AuthUser> {
  const supabase = createClient();

  const demoEmail = process.env.NEXT_PUBLIC_SUPABASE_DEMO_EMAIL;
  const demoPassword = process.env.NEXT_PUBLIC_SUPABASE_DEMO_PASSWORD;

  if (!demoEmail || !demoPassword) {
    throw new Error(
      "Credenciais demo não configuradas. Defina NEXT_PUBLIC_SUPABASE_DEMO_EMAIL e NEXT_PUBLIC_SUPABASE_DEMO_PASSWORD."
    );
  }

  let data;
  let error;

  try {
    ({ data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    }));
  } catch {
    throw new Error(
      "Não foi possível conectar ao Supabase. Verifique NEXT_PUBLIC_SUPABASE_URL no .env.local (Settings → API no dashboard do Supabase)."
    );
  }

  if (error) {
    const isNetworkError =
      error.message.includes("Failed to fetch") ||
      error.message.includes("fetch") ||
      error.status === 0;

    if (isNetworkError) {
      throw new Error(
        "Não foi possível conectar ao Supabase. Verifique NEXT_PUBLIC_SUPABASE_URL no .env.local (Settings → API no dashboard do Supabase)."
      );
    }

    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Falha ao autenticar usuário demo.");
  }

  const { data: profile } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle<Usuario>();

  return {
    id: data.user.id,
    email: displayEmail || data.user.email || demoEmail,
    nome: profile?.nome || displayEmail.split("@")[0] || "Operador",
  };
}

export async function logout(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Usuario>();

  return {
    id: user.id,
    email: user.email || "",
    nome: profile?.nome || user.email?.split("@")[0] || "Operador",
  };
}

export function formatDateForDb(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("T")[0].split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

export function formatTimeRange(
  inicio: string | null | undefined,
  fim: string | null | undefined
): string {
  if (!inicio || !fim) return "—";
  return `${inicio.slice(0, 5)} - ${fim.slice(0, 5)}`;
}
