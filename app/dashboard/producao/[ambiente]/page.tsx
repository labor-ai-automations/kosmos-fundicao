"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { RegistroProducaoWorkspace } from "@/app/dashboard/producao/components/RegistroProducaoWorkspace";
import { isValidProducaoAmbiente } from "@/lib/producao-config";

export default function ProducaoAmbientePage() {
  const params = useParams();
  const ambiente = params.ambiente as string;

  if (!isValidProducaoAmbiente(ambiente)) {
    notFound();
  }

  return <RegistroProducaoWorkspace ambiente={ambiente} />;
}
