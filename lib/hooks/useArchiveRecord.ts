"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ArchivableProductionTable } from "@/lib/archive-config";

interface ArchivePayload {
  id: string;
  tabela: ArchivableProductionTable;
  motivo?: string;
}

async function archiveRecord({ id, tabela, motivo }: ArchivePayload) {
  const res = await fetch(`/api/registros-producao/${id}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tabela, motivo }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "Erro ao arquivar registro");
  }
  return json;
}

async function restoreRecord({ id, tabela, motivo }: ArchivePayload) {
  const res = await fetch(`/api/registros-producao/${id}/archive`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tabela, motivo }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "Erro ao restaurar registro");
  }
  return json;
}

export function useArchiveRecord() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["registros-producao"] });
  };

  const archiveMutation = useMutation({
    mutationFn: archiveRecord,
    onSuccess: () => {
      invalidate();
      toast.success("Registro arquivado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreRecord,
    onSuccess: () => {
      invalidate();
      toast.success("Registro desarquivado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { archiveMutation, restoreMutation };
}
