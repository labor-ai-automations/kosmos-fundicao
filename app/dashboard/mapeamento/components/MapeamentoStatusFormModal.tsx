"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  downloadBase64File,
  formatStatusOperacional,
  STATUS_OPERACIONAL_LABELS,
  type MapeamentoAnexo,
  type MapeamentoStatusOperacional,
  type MapeamentoTimelineItem,
} from "@/lib/mapeamento-status";

interface MapeamentoStatusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigo: string;
  statusSelecionado: MapeamentoStatusOperacional;
  onStatusChanged: () => void;
}

export function MapeamentoStatusFormModal({
  isOpen,
  onClose,
  codigo,
  statusSelecionado,
  onStatusChanged,
}: MapeamentoStatusFormModalProps) {
  const { user } = useAuth();
  const [observacao, setObservacao] = useState("");
  const [anexos, setAnexos] = useState<MapeamentoAnexo[]>([]);
  const [timeline, setTimeline] = useState<MapeamentoTimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const carregarTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mapeamento/timeline/${encodeURIComponent(codigo)}`
      );
      const data = await res.json();
      if (res.ok) setTimeline(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [codigo]);

  useEffect(() => {
    if (isOpen) {
      setObservacao("");
      setAnexos([]);
      carregarTimeline();
    }
  }, [isOpen, codigo, carregarTimeline]);

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
      await carregarTimeline();
      onStatusChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-mansure-border bg-mansure-light sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-mansure-black">
            Status: {STATUS_OPERACIONAL_LABELS[statusSelecionado]}
          </DialogTitle>
          <p className="text-sm text-mansure-gray-dark">
            Código: <span className="font-semibold">{codigo}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-mansure-black">
              Observação
            </h3>
            <textarea
              placeholder="Adicione uma observação sobre este status..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={4}
              className="kosmos-input min-h-[6rem] w-full resize-y py-2 leading-relaxed"
            />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-mansure-black">
              Anexos
            </h3>
            {anexos.length > 0 && (
              <div className="mb-3 space-y-2">
                {anexos.map((anexo, idx) => (
                  <Card
                    key={idx}
                    className="border-mansure-gray-light bg-mansure-hover"
                  >
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <span className="font-medium text-mansure-black">
                          {anexo.nome}
                        </span>
                        <span className="ml-2 text-xs text-mansure-gray-medium">
                          ({anexo.tipo})
                        </span>
                      </div>
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
            <Button
              type="button"
              onClick={handleAdicionarAnexo}
              variant="mansureOutline"
              size="sm"
              className="w-full gap-2"
            >
              <Plus className="size-4" />
              Adicionar Anexo
            </Button>
          </div>

          <div className="border-t border-mansure-gray-light pt-4">
            <h3 className="mb-3 text-sm font-semibold text-mansure-black">
              Histórico — {codigo}
            </h3>
            {loading ? (
              <p className="text-sm text-mansure-gray-dark">Carregando...</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-mansure-gray-dark">
                Nenhum registro de status ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {timeline.map((item) => (
                  <Card
                    key={item.id}
                    className="border-mansure-gray-light bg-mansure-hover"
                  >
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-mansure-black">
                          {formatStatusOperacional(item.status)}
                          {item.status_anterior && (
                            <span className="ml-2 text-xs font-normal text-mansure-gray-medium">
                              (de:{" "}
                              {formatStatusOperacional(item.status_anterior)})
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-mansure-gray-medium">
                          {new Date(item.criado_em).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm text-mansure-gray-dark">
                        Por:{" "}
                        <span className="font-semibold">
                          {item.criado_por_nome}
                        </span>
                      </p>
                      {item.observacao && (
                        <p className="rounded bg-white p-2 text-sm text-mansure-black">
                          {item.observacao}
                        </p>
                      )}
                      {item.anexos.length > 0 && (
                        <div className="space-y-1">
                          {item.anexos.map((anexo, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded bg-white p-2 text-xs"
                            >
                              <span className="text-mansure-black">
                                {anexo.nome}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  downloadBase64File(anexo.base64, anexo.nome)
                                }
                                className="h-7 gap-1 text-mansure-blue"
                              >
                                <Download className="size-3" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-mansure-border bg-mansure-light">
          <Button type="button" variant="mansureOutline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSalvar}
            disabled={saving}
            variant="mansurePrimary"
            className="gap-2"
          >
            <Save className="size-4" />
            {saving ? "Salvando..." : "Salvar & Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
