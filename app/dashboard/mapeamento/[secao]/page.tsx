import { redirect } from "next/navigation";

export default async function MapeamentoSecaoLegacyRedirect() {
  redirect("/dashboard/mapeamento");
}
