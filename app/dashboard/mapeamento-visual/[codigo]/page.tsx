import { redirect } from "next/navigation";

export default async function MapeamentoVisualCodigoRedirect({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  await params;
  redirect("/dashboard/mapeamento");
}
