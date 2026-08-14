"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  formatStatusOperacional,
  STATUS_OPERACIONAL_LABELS,
  type MapeamentoAnexo,
  type MapeamentoStatusOperacional,
  type MapeamentoTimelineItem,
} from "@/lib/mapeamento-status";
import { MapeamentoTimelineList } from "./MapeamentoTimelineList";

interface MapeamentoStatusSectionProps {
  codigo: string;
  statusAtual: MapeamentoStatusOperacional | null;
  onStatusChanged: () => void;
}

export function MapeamentoStatusSection({
  codigo,
  statusAtual,
  onStatusChanged,
}: MapeamentoStatusSectionProps) {
  const { user } = useAuth();
  const [statusSelecionado, setStatusSelecionado] =
    useState<MapeamentoStatusOperacional | null>(null);
  const [observacao, setObservacao] = useState("");
  const [anexos, setAnexos] = useState<MapeamentoAnexo[]>([]);
  const [timeline, setTimeline] = useState<MapeamentoTimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [saving, setSaving] = useState(false);

  const carregarTimeline = useCallback(async () => {
    if (!codigo) return;
    setLoadingTimeline(true);
    try {
      const res = await fetch(
        `/api/mapeamento/timeline/${encodeURIComponent(codigo)}`
      );
      const data = await res.json();
      if (res.ok) setTimeline(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTimeline(false);
    }
  }, [codigo]);

  useEffect(() => {
    setStatusSelecionado(null);
    setObservacao("");
    setAnexos([]);
    carregarTimeline();
  }, [codigo, carregarTimeline]);

  const handleAdicionarAnexo = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const tipo = file.type.startsWith("image") ? "imagem" : "documento";
        setAnexos((prev) => [
          ...prev,
          { tipo, nome: file.name, base64, mime_type: file.type },
        ]);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSalvar = async () => {
    if (!statusSelecionado) return;

    setSaving(true);
    try {
      const res = await fetch("/api/mapeamento/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          status: statusSelecionado,
          observacao,
          anexos,
          criado_por_nome: user?.nome,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar");

      toast.success("Status registrado");
      setObservacao("");
      setAnexos([]);
      setStatusSelecionado(null);
      await carregarTimeline();
      onStatusChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 border-t border-mansure-gray-light pt-6">
      <div>
        <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-mansure-black">
          Status operacional
        </h3>
        <p className="mb-3 text-sm text-mansure-gray-dark">
          Status atual:{" "}
          <strong className="text-mansure-black">
            {formatStatusOperacional(statusAtual)}
          </strong>
        </p>

        {!statusSelecionado ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setStatusSelecionado("disponivel")}
              className="flex h-20 flex-col items-center justify-center bg-green-600 font-semibold text-white hover:bg-green-700"
            >
              Disponível
            </Button>
            <Button
              type="button"
              onClick={() => setStatusSelecionado("em_manutencao")}
              className="flex h-20 flex-col items-center justify-center bg-amber-500 font-semibold text-white hover:bg-amber-600"
            >
              Em Manutenção
            </Button>
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border border-mansure-gray-light bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-mansure-black">
                Registrar: {STATUS_OPERACIONAL_LABELS[statusSelecionado]}
              </p>
              <Button
                type="button"
                size="sm"
                variant="mansureOutline"
                onClick={() => {
                  setStatusSelecionado(null);
                  setObservacao("");
                  setAnexos([]);
                }}
              >
                Cancelar
              </Button>
            </div>

            <textarea
              placeholder="Observação sobre este status (opcional)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="kosmos-input min-h-[4.5rem] w-full resize-y py-2 leading-relaxed"
            />

            {anexos.length > 0 && (
              <div className="space-y-2">
                {anexos.map((anexo, idx) => (
                  <Card
                    key={idx}
                    className="border-mansure-gray-light bg-mansure-hover"
                  >
                    <CardContent className="flex items-center justify-between p-3">
                      <span className="text-sm font-medium text-mansure-black">
                        {anexo.nome}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setAnexos((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleAdicionarAnexo}
                variant="mansureOutline"
                size="sm"
                className="gap-2"
              >
                <Plus className="size-4" />
                Adicionar Anexo
              </Button>
              <Button
                type="button"
                onClick={handleSalvar}
                disabled={saving}
                variant="mansurePrimary"
                className="gap-2"
              >
                <Save className="size-4" />
                {saving ? "Salvando..." : "Salvar Status"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <MapeamentoTimelineList
        codigo={codigo}
        timeline={timeline}
        loading={loadingTimeline}
      />
    </div>
  );
}
