"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapeamentoImageZoomModal } from "./MapeamentoImageZoomModal";
import {
  fileToBase64Compressed,
  getMapeamentoSecaoConfig,
  type MapeamentoFoto,
  type MapeamentoSecaoId,
} from "@/lib/mapeamento-config";

interface SecaoMapeamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigo: string;
  secao: MapeamentoSecaoId;
  onAtualizado: () => void;
}

export function SecaoMapeamentoModal({
  isOpen,
  onClose,
  codigo,
  secao,
  onAtualizado,
}: SecaoMapeamentoModalProps) {
  const [imagens, setImagens] = useState<MapeamentoFoto[]>([]);
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagemZoom, setImagemZoom] = useState<{
    base64: string;
    nome: string;
    observacao?: string;
  } | null>(null);

  const secaoConfig = getMapeamentoSecaoConfig(secao);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mapeamento/pecas?codigo=${encodeURIComponent(codigo)}&secao=${encodeURIComponent(secao)}`
      );
      const data = await res.json();
      if (res.ok) {
        setImagens(data.imagens ?? []);
        setEndereco(data.endereco_fisico ?? "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [codigo, secao]);

  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen, carregarDados]);

  const handleAdicionarFoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const base64 = await fileToBase64Compressed(file);
        setImagens((prev) => [...prev, { base64, observacao: "" }]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erro ao processar imagem"
        );
      }
    };
    input.click();
  };

  const handleRemoverFoto = (index: number) => {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAtualizarObservacao = (index: number, texto: string) => {
    setImagens((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, observacao: texto } : img
      )
    );
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/mapeamento/pecas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          secao,
          imagens,
          endereco_fisico: endereco,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao salvar");
      }

      toast.success("Seção salva");
      onAtualizado();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-mansure-gray-light bg-mansure-light sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-mansure-black">
            {secaoConfig?.heading ?? secao}
          </DialogTitle>
          <p className="text-sm text-mansure-gray-dark">
            Código: <span className="font-semibold">{codigo}</span>
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-mansure-gray-dark">
            Carregando...
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-mansure-black">
                Imagens
              </h3>

              {imagens.length > 0 && (
                <div className="mb-4 space-y-3">
                  {imagens.map((img, idx) => (
                    <Card
                      key={idx}
                      className="border-mansure-gray-light bg-mansure-hover"
                    >
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-mansure-black">
                            Foto {idx + 1}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoverFoto(idx)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        {img.base64?.trim() ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={img.base64}
                            alt={`Foto ${idx + 1}`}
                            className="max-h-40 cursor-pointer rounded-md border border-mansure-gray-light object-contain transition hover:opacity-80"
                            onClick={() =>
                              setImagemZoom({
                                base64: img.base64,
                                nome: `Foto ${idx + 1}`,
                                observacao: img.observacao,
                              })
                            }
                          />
                        ) : (
                          <p className="text-sm text-mansure-gray-medium">
                            Imagem indisponível
                          </p>
                        )}

                        <textarea
                          placeholder="Adicione uma observação (opcional)"
                          value={img.observacao}
                          onChange={(e) =>
                            handleAtualizarObservacao(idx, e.target.value)
                          }
                          rows={2}
                          className="kosmos-input min-h-[3.5rem] w-full resize-y py-2 text-sm leading-relaxed"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                type="button"
                onClick={handleAdicionarFoto}
                variant="mansureOutline"
                size="sm"
                className="w-full gap-2"
              >
                <Plus className="size-4" />
                Adicionar Foto
              </Button>
            </div>

            <div className="border-t border-mansure-gray-light pt-4">
              <Label className="kosmos-label mb-4 block">
                Endereço físico
              </Label>
              <Input
                placeholder="Ex: Galpão A, Corredor 3, Prateleira 5"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
              <p className="mt-2 text-xs text-mansure-gray-medium">
                Onde esta seção da peça/ferramental está armazenada
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-mansure-gray-light bg-mansure-light">
          <Button type="button" variant="mansureOutline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSalvar}
            disabled={saving || loading}
            variant="mansurePrimary"
            className="gap-2"
          >
            <Save className="size-4" />
            {saving ? "Salvando..." : "Salvar & Voltar"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {imagemZoom?.base64?.trim() && (
        <MapeamentoImageZoomModal
          isOpen
          onClose={() => setImagemZoom(null)}
          imageBase64={imagemZoom.base64}
          imageName={imagemZoom.nome}
          observacao={imagemZoom.observacao}
        />
      )}
    </Dialog>
  );
}
