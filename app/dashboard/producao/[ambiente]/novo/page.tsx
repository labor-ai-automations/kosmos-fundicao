import { redirect } from "next/navigation";

export default async function ProducaoAmbienteNovoRedirect({
  params,
}: {
  params: Promise<{ ambiente: string }>;
}) {
  const { ambiente } = await params;
  redirect(`/dashboard/producao/${ambiente}`);
}
