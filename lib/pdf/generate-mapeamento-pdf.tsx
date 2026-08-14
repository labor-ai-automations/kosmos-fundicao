import { renderToBuffer } from "@react-pdf/renderer";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { fetchMapeamentoPdfData } from "./fetch-mapeamento-data";
import { getFamaLogoSrcServer } from "./fama-logo-server";
import { registerPdfFonts } from "./register-fonts";
import { RelatorioMapeamento } from "./templates/RelatorioMapeamento";

export async function generateMapeamentoPdfBuffer(
  supabase: SupabaseClient,
  user: User | null,
  codigo: string,
  includeTimeline: boolean
): Promise<Uint8Array> {
  registerPdfFonts();

  const data = await fetchMapeamentoPdfData(
    supabase,
    user,
    codigo,
    includeTimeline
  );

  const buffer = await renderToBuffer(
    <RelatorioMapeamento
      {...data}
      includeTimeline={includeTimeline}
      logoSrc={getFamaLogoSrcServer()}
    />
  );

  return new Uint8Array(buffer);
}
