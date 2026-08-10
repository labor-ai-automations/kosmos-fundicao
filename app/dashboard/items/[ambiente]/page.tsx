import { redirect } from "next/navigation";

export default async function ItemsRedirect({
  params,
}: {
  params: Promise<{ ambiente: string }>;
}) {
  const { ambiente } = await params;
  redirect(`/dashboard/itens/${ambiente}`);
}
