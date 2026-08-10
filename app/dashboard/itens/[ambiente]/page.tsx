"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { ItensManager } from "@/components/ItensManager";
import type { ItemAmbiente } from "@/lib/types";

const VALID: ItemAmbiente[] = ["vick", "coldbox", "macharia"];

function isValid(value: string): value is ItemAmbiente {
  return VALID.includes(value as ItemAmbiente);
}

export default function ItensAmbientePage() {
  const params = useParams();
  const ambiente = params.ambiente as string;

  if (!isValid(ambiente)) {
    notFound();
  }

  return <ItensManager ambiente={ambiente} />;
}
