"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Edit2, FileDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SecoesPreenchidasPills } from "./components/SecoesPreenchidasPills";
import {
  STATUS_OPERACIONAL_LABELS,
  type MapeamentoStatusOperacional,
} from "@/lib/mapeamento-status";
import type { MapeamentoRegistro } from "@/lib/types";
import { RegistroMapeamentoModal } from "./components/RegistroMapeamentoModal";
import { MapeamentoHubModal } from "./components/MapeamentoHubModal";
import { MapeamentoInfoPanel } from "./components/MapeamentoInfoPanel";
import { MapeamentoPDFPreviewModal } from "./components/MapeamentoPDFPreviewModal";
import { MapeamentoStatusModal } from "./components/MapeamentoStatusModal";

function StatusOperacionalBadge({
  status,
  onClick,
}: {
  status: MapeamentoStatusOperacional | null;
  onClick?: (event: React.MouseEvent) => void;
}) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick?.(event);
  };

  if (!status) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="rounded px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
      >
        Aguardando definição
      </button>
    );
  }

  const isDisponivel = status === "disponivel";
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded px-3 py-1 text-xs font-semibold ${
        isDisponivel
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-amber-100 text-amber-900 hover:bg-amber-200"
      }`}
    >
      {STATUS_OPERACIONAL_LABELS[status]}
    </button>
  );
}

export default function MapeamentoPage() {
  const [registros, setRegistros] = useState<MapeamentoRegistro[]>([]);
  const [openRegistroModal, setOpenRegistroModal] = useState(false);
  const [openHubModal, setOpenHubModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [codigoSelecionado, setCodigoSelecionado] = useState("");
  const [codigoExportar, setCodigoExportar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarRegistros = useCallback(async () => {
    try {
      const res = await fetch("/api/mapeamento/registros");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao carregar registros");
      }
      setRegistros(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao carregar registros"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const handleAbrirStatus = (codigo: string) => {
    setOpenHubModal(false);
    setCodigoSelecionado(codigo);
    setOpenStatusModal(true);
  };

  const handleAbrirHub = (codigo: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setOpenStatusModal(false);
    setCodigoSelecionado(codigo);
    setOpenHubModal(true);
  };

  const handleAbrirExportPdf = (codigo: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setCodigoExportar(codigo);
  };

  const registroSelecionado = registros.find(
    (r) => r.codigo === codigoSelecionado
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <Button
          type="button"
          onClick={() => setOpenRegistroModal(true)}
          variant="mansurePrimary"
          className="gap-2"
        >
          <Plus className="size-4" />
          Registrar Item
        </Button>
      </div>

      <MapeamentoInfoPanel />

      <div className="mb-4 flex items-start gap-3 rounded-xl border border-mansure-border bg-mansure-light px-5 py-4 text-sm text-mansure-gray-dark shadow-sm">
        <span className="text-lg leading-none" aria-hidden>
          💡
        </span>
        <p className="text-mansure-black">
          <strong className="font-bold text-mansure-black">Dica:</strong>{" "}
          clique em uma linha da tabela para abrir o mapeamento completo
          (seções, status e histórico). Clique apenas no badge{" "}
          <strong className="font-semibold text-mansure-blue">
            Status Atual
          </strong>{" "}
          para alterar o status diretamente.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-mansure-light/80">
          Carregando...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-mansure-border bg-mansure-light text-mansure-black">
          <Table>
            <TableHeader>
              <TableRow className="kosmos-table-header border-0 hover:bg-mansure-blue">
                <TableHead className="kosmos-table-head">Código</TableHead>
                <TableHead className="kosmos-table-head">Status Atual</TableHead>
                <TableHead className="kosmos-table-head">
                  Seções preenchidas
                </TableHead>
                <TableHead className="kosmos-table-head">Criado em</TableHead>
                <TableHead className="kosmos-table-head text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((registro) => (
                <TableRow
                  key={registro.id}
                  className="kosmos-table-row cursor-pointer border-mansure-gray-light hover:bg-mansure-hover/80"
                  onClick={() => handleAbrirHub(registro.codigo)}
                >
                  <TableCell className="kosmos-table-cell font-semibold text-mansure-black">
                    {registro.codigo}
                  </TableCell>
                  <TableCell
                    className="kosmos-table-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusOperacionalBadge
                      status={registro.status_atual}
                      onClick={() => handleAbrirStatus(registro.codigo)}
                    />
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    <SecoesPreenchidasPills
                      secoes={registro.secoes_preenchidas}
                    />
                  </TableCell>
                  <TableCell className="kosmos-table-cell text-mansure-gray-dark">
                    {new Date(registro.criado_em).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell
                    className="kosmos-table-cell text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => handleAbrirHub(registro.codigo, e)}
                      variant="mansurePrimary"
                      className="gap-1"
                      title="Editar seções (imagens)"
                    >
                      <Edit2 className="size-3" />
                      Seções
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="mansureOutline"
                      onClick={(e) => handleAbrirExportPdf(registro.codigo, e)}
                      className="ml-1 gap-1 text-mansure-gray-dark"
                      title="Exportar PDF"
                    >
                      <FileDown className="size-3" />
                      PDF
                    </Button>
                    <HoverTooltip
                      className="ml-1"
                      content={
                        <>
                          <strong className="font-semibold">Em breve</strong>
                          <span className="mt-0.5 block text-mansure-light/90">
                            Arquivar registros concluídos ou inativos sem
                            removê-los permanentemente.
                          </span>
                        </>
                      }
                    >
                      <span onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          size="sm"
                          variant="mansureOutline"
                          disabled
                          tabIndex={-1}
                          className="pointer-events-none cursor-not-allowed gap-1 text-mansure-gray-dark opacity-60"
                        >
                          <Archive className="size-3" />
                          Arquivar
                        </Button>
                      </span>
                    </HoverTooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {registros.length === 0 && (
            <button
              type="button"
              onClick={() => setOpenRegistroModal(true)}
              className="w-full py-12 text-center text-mansure-gray-dark transition hover:bg-mansure-hover/50"
            >
              <p className="font-medium text-mansure-black">
                Nenhum registro encontrado
              </p>
              <p className="mt-1 text-sm">
                Clique aqui ou em &quot;Registrar Item&quot; para começar
              </p>
            </button>
          )}
        </div>
      )}

      <RegistroMapeamentoModal
        isOpen={openRegistroModal}
        onClose={() => setOpenRegistroModal(false)}
        onRegistered={(codigo) => {
          setOpenRegistroModal(false);
          setOpenHubModal(false);
          carregarRegistros();
          setCodigoSelecionado(codigo);
          setOpenStatusModal(true);
        }}
      />

      <MapeamentoStatusModal
        isOpen={openStatusModal}
        onClose={() => setOpenStatusModal(false)}
        codigo={codigoSelecionado}
        statusAtual={registroSelecionado?.status_atual ?? null}
        onStatusChanged={carregarRegistros}
      />

      <MapeamentoHubModal
        isOpen={openHubModal}
        onClose={() => setOpenHubModal(false)}
        codigo={codigoSelecionado}
        onAtualizado={carregarRegistros}
      />

      <MapeamentoPDFPreviewModal
        isOpen={!!codigoExportar}
        onClose={() => setCodigoExportar(null)}
        codigo={codigoExportar ?? ""}
      />
    </div>
  );
}
