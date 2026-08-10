"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { formatSecoesPreenchidas } from "@/lib/mapeamento-config";
import type { MapeamentoRegistro } from "@/lib/types";
import { RegistroMapeamentoModal } from "./components/RegistroMapeamentoModal";
import { MapeamentoHubModal } from "./components/MapeamentoHubModal";
import { MapeamentoInfoPanel } from "./components/MapeamentoInfoPanel";

export default function MapeamentoPage() {
  const [registros, setRegistros] = useState<MapeamentoRegistro[]>([]);
  const [openRegistroModal, setOpenRegistroModal] = useState(false);
  const [openHubModal, setOpenHubModal] = useState(false);
  const [codigoSelecionado, setCodigoSelecionado] = useState("");
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

  const handleAbrirRegistro = (codigo: string) => {
    setCodigoSelecionado(codigo);
    setOpenHubModal(true);
  };

  const handleDeletarRegistro = async (
    codigo: string,
    event?: React.MouseEvent
  ) => {
    event?.stopPropagation();
    if (!confirm(`Deletar o registro do código ${codigo}?`)) return;

    try {
      const res = await fetch(
        `/api/mapeamento/registros/${encodeURIComponent(codigo)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao deletar");
      }
      toast.success("Registro removido");
      carregarRegistros();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao deletar");
    }
  };

  const handleRowDoubleClick = (codigo: string) => {
    handleAbrirRegistro(codigo);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Mapeamento de Peças"
          description="Registre códigos e preencha as seções progressivamente."
        />
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
                <TableHead className="kosmos-table-head">Status</TableHead>
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
                  onDoubleClick={() => handleRowDoubleClick(registro.codigo)}
                  title="Dois cliques para abrir o mapeamento"
                >
                  <TableCell
                    className="kosmos-table-cell font-semibold text-mansure-black"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleRowDoubleClick(registro.codigo);
                    }}
                  >
                    <span className="underline-offset-2 hover:underline">
                      {registro.codigo}
                    </span>
                  </TableCell>
                  <TableCell className="kosmos-table-cell text-mansure-gray-dark">
                    <span
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        registro.status === "rascunho"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {registro.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="kosmos-table-cell text-mansure-gray-dark">
                    {formatSecoesPreenchidas(registro.secoes_preenchidas)}
                  </TableCell>
                  <TableCell className="kosmos-table-cell text-mansure-gray-dark">
                    {new Date(registro.criado_em).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell
                    className="kosmos-table-cell text-right"
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAbrirRegistro(registro.codigo);
                      }}
                      variant="mansurePrimary"
                      className="gap-1"
                    >
                      <Edit2 className="size-3" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="mansureOutline"
                      onClick={(e) => handleDeletarRegistro(registro.codigo, e)}
                      className="ml-2 gap-1 text-mansure-gray-dark"
                    >
                      <Trash2 className="size-3" />
                      Deletar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {registros.length === 0 && (
            <button
              type="button"
              onDoubleClick={() => setOpenRegistroModal(true)}
              onClick={() => setOpenRegistroModal(true)}
              className="w-full py-12 text-center text-mansure-gray-dark transition hover:bg-mansure-hover/50"
              title="Clique ou dê dois cliques para registrar o primeiro item"
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
        onRegistered={() => {
          setOpenRegistroModal(false);
          carregarRegistros();
        }}
      />

      <MapeamentoHubModal
        isOpen={openHubModal}
        onClose={() => setOpenHubModal(false)}
        codigo={codigoSelecionado}
        onAtualizado={carregarRegistros}
      />
    </div>
  );
}
