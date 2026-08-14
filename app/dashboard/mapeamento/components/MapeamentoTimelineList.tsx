"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  downloadBase64File,
  formatStatusOperacional,
  type MapeamentoTimelineItem,
} from "@/lib/mapeamento-status";

interface MapeamentoTimelineListProps {
  codigo: string;
  timeline: MapeamentoTimelineItem[];
  loading?: boolean;
}

export function MapeamentoTimelineList({
  codigo,
  timeline,
  loading,
}: MapeamentoTimelineListProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-mansure-black">
        Histórico de status — {codigo}
      </h3>
      {loading ? (
        <p className="text-sm text-mansure-gray-dark">Carregando histórico...</p>
      ) : timeline.length === 0 ? (
        <p className="text-sm text-mansure-gray-dark">
          Nenhum registro de status ainda.
        </p>
      ) : (
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {timeline.map((item) => (
            <Card
              key={item.id}
              className="border-mansure-gray-light bg-white"
            >
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-mansure-black">
                    {formatStatusOperacional(item.status)}
                    {item.status_anterior && (
                      <span className="ml-2 text-xs font-normal text-mansure-gray-medium">
                        (de: {formatStatusOperacional(item.status_anterior)})
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-mansure-gray-medium">
                    {new Date(item.criado_em).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-mansure-gray-dark">
                  Por:{" "}
                  <span className="font-semibold">{item.criado_por_nome}</span>
                </p>
                {item.observacao && (
                  <p className="rounded bg-mansure-hover p-2 text-sm text-mansure-black">
                    {item.observacao}
                  </p>
                )}
                {item.anexos.length > 0 && (
                  <div className="space-y-1">
                    {item.anexos.map((anexo, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-mansure-hover p-2 text-xs"
                      >
                        <span className="text-mansure-black">{anexo.nome}</span>
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
  );
}
