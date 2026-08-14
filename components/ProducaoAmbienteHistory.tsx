"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getAllRecords,
  PAGE_SIZE,
  softDeleteRecord,
  updateProducaoColdbox,
  updateProducaoMacharia,
  updateProducaoVick,
  updateRefugo,
} from "@/lib/api-calls";
import { formatDateDisplay, formatTimeRange } from "@/lib/auth";
import {
  getProducaoAmbienteConfig,
  type ProducaoAmbiente,
} from "@/lib/producao-config";
import type {
  ProducaoColdbox,
  ProducaoMacharia,
  ProducaoVick,
  Refugo,
  RecordWithUser,
} from "@/lib/types";
import { formatProducaoFieldLabel } from "@/lib/registro-producao-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { normalizeRecordNumbers } from "@/lib/number-utils";
import { DecimalInput } from "@/components/DecimalInput";
import { DatePicker } from "@/components/DatePicker";
import { formatObservacaoDisplay } from "@/lib/producao-observacao";
import { RegistroProducaoModal } from "@/components/RegistroProducaoModal";

type RecordRow = (
  | ProducaoVick
  | ProducaoColdbox
  | ProducaoMacharia
  | Refugo
) &
  RecordWithUser;

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-mansure-dark">
        {label}
      </span>
      <p className="text-sm font-medium text-mansure-black">{value ?? "—"}</p>
    </div>
  );
}

export function ProducaoAmbienteHistory({
  ambiente,
}: {
  ambiente: ProducaoAmbiente;
}) {
  const { table } = getProducaoAmbienteConfig(ambiente);

  const [page, setPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [viewRow, setViewRow] = useState<RecordRow | null>(null);
  const [editRow, setEditRow] = useState<RecordRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<
    Record<string, string | number | boolean | null>
  >({});
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllRecords(table, page, {
        data: appliedFilter || undefined,
      });
      setRows(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar registros"
      );
    } finally {
      setLoading(false);
    }
  }, [table, page, appliedFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleApplyFilter = () => {
    setAppliedFilter(filterDate);
    setPage(1);
  };

  const handleClearFilter = () => {
    setFilterDate("");
    setAppliedFilter("");
    setPage(1);
  };

  const openEdit = (row: RecordRow) => {
    setEditRow(row);
    setEditForm({ ...row });
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const payload = normalizeRecordNumbers({
        ...editForm,
      }) as Record<string, string | number | boolean | null>;
      delete payload.id;
      delete payload.criado_por;
      delete payload.criado_em;
      delete payload.deleted_at;
      delete payload.criado_por_nome;
      delete payload.criado_por_email;

      switch (table) {
        case "producao_vick":
          await updateProducaoVick(editRow.id, payload as Partial<ProducaoVick>);
          break;
        case "producao_coldbox":
          await updateProducaoColdbox(
            editRow.id,
            payload as Partial<ProducaoColdbox>
          );
          break;
        case "producao_macharia":
          await updateProducaoMacharia(
            editRow.id,
            payload as Partial<ProducaoMacharia>
          );
          break;
        case "refugo":
          await updateRefugo(editRow.id, payload as Partial<Refugo>);
          break;
      }

      toast.success("Registro atualizado");
      setEditRow(null);
      await loadRecords();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar registro"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await softDeleteRecord(table, deleteId);
      toast.success("Registro excluído");
      setDeleteId(null);
      await loadRecords();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir registro"
      );
    }
  };

  function ActionButtons({ row }: { row: RecordRow }) {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewRow(row)}
          className="text-mansure-blue hover:bg-[rgba(6,182,212,0.1)]"
        >
          <Eye className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => openEdit(row)}
          className="text-mansure-blue hover:bg-[rgba(6,182,212,0.1)]"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDeleteId(row.id)}
          className="text-red-400 hover:bg-red-400/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    );
  }

  const renderTable = () => {
    switch (ambiente) {
      case "vick":
        return (
          <Table>
            <TableHeader>
              <TableRow className="kosmos-table-header">
                <TableHead className="kosmos-table-head">Data</TableHead>
                <TableHead className="kosmos-table-head">Código</TableHead>
                <TableHead className="kosmos-table-head">Peso</TableHead>
                <TableHead className="kosmos-table-head">
                  Qtde Caixas
                </TableHead>
                <TableHead className="kosmos-table-head">Percas</TableHead>
                <TableHead className="kosmos-table-head">Setup</TableHead>
                <TableHead className="kosmos-table-head">Observações</TableHead>
                <TableHead className="kosmos-table-head">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as ProducaoVick[]).map((row) => (
                <TableRow
                  key={row.id}
                  className="kosmos-table-row"
                >
                  <TableCell className="kosmos-table-cell">
                    {formatDateDisplay(row.data)}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.codigo}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.peso_registro ?? "—"}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.qtde_caixas}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.percas}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.setup ? "Sim" : "Não"}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {formatObservacaoDisplay(row.observacao)}
                  </TableCell>
                  <TableCell>
                    <ActionButtons row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "coldbox":
        return (
          <Table>
            <TableHeader>
              <TableRow className="kosmos-table-header">
                <TableHead className="kosmos-table-head">Data</TableHead>
                <TableHead className="kosmos-table-head">
                  Operador
                </TableHead>
                <TableHead className="kosmos-table-head">Local</TableHead>
                <TableHead className="kosmos-table-head">Código</TableHead>
                <TableHead className="kosmos-table-head">Peso</TableHead>
                <TableHead className="kosmos-table-head">Qtde</TableHead>
                <TableHead className="kosmos-table-head">Ciclo</TableHead>
                <TableHead className="kosmos-table-head">Observações</TableHead>
                <TableHead className="kosmos-table-head">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as ProducaoColdbox[]).map((row) => (
                <TableRow
                  key={row.id}
                  className="kosmos-table-row"
                >
                  <TableCell className="kosmos-table-cell">
                    {formatDateDisplay(row.data)}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.operador}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.local}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.codigo}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.peso_registro ?? "—"}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.qtde_caixas}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.ciclo}s
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {formatObservacaoDisplay(row.observacao)}
                  </TableCell>
                  <TableCell>
                    <ActionButtons row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "macharia":
        return (
          <Table>
            <TableHeader>
              <TableRow className="kosmos-table-header">
                <TableHead className="kosmos-table-head">Data</TableHead>
                <TableHead className="kosmos-table-head">
                  Colaborador
                </TableHead>
                <TableHead className="kosmos-table-head">Máquina</TableHead>
                <TableHead className="kosmos-table-head">Peso 1</TableHead>
                <TableHead className="kosmos-table-head">
                  Qtde Feita
                </TableHead>
                <TableHead className="kosmos-table-head">Horário</TableHead>
                <TableHead className="kosmos-table-head">Observações</TableHead>
                <TableHead className="kosmos-table-head">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as ProducaoMacharia[]).map((row) => (
                <TableRow
                  key={row.id}
                  className="kosmos-table-row"
                >
                  <TableCell className="kosmos-table-cell">
                    {formatDateDisplay(row.data)}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.colaborador}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.maquina}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.peso_registro ?? "—"}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.qtde_feita}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {formatTimeRange(row.hora_inicial, row.hora_final)}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {formatObservacaoDisplay(row.observacao)}
                  </TableCell>
                  <TableCell>
                    <ActionButtons row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "refugo":
        return (
          <Table>
            <TableHeader>
              <TableRow className="kosmos-table-header">
                <TableHead className="kosmos-table-head">Data</TableHead>
                <TableHead className="kosmos-table-head">Código</TableHead>
                <TableHead className="kosmos-table-head">Peso</TableHead>
                <TableHead className="kosmos-table-head">
                  Fundição
                </TableHead>
                <TableHead className="kosmos-table-head">Qtde</TableHead>
                <TableHead className="kosmos-table-head">Motivo</TableHead>
                <TableHead className="kosmos-table-head">Observações</TableHead>
                <TableHead className="kosmos-table-head">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as Refugo[]).map((row) => (
                <TableRow
                  key={row.id}
                  className="kosmos-table-row"
                >
                  <TableCell className="kosmos-table-cell">
                    {formatDateDisplay(row.data)}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.codigo}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.peso_registro ?? "—"}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.fundicao}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.qtde_perdida}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {row.motivo}
                  </TableCell>
                  <TableCell className="kosmos-table-cell">
                    {formatObservacaoDisplay(row.observacao)}
                  </TableCell>
                  <TableCell>
                    <ActionButtons row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  const renderEditFields = () => {
    if (!editRow) return null;

    const fields = Object.entries(editRow).filter(
      ([key]) =>
        ![
          "id",
          "criado_em",
          "criado_por",
          "deleted_at",
          "criado_por_nome",
          "criado_por_email",
        ].includes(key)
    );

    return fields.map(([key, value]) => (
      <div key={key} className="space-y-1">
        <Label className="kosmos-label">{formatProducaoFieldLabel(key)}</Label>
        {typeof value === "boolean" ? (
          <select
            className="kosmos-input px-2 py-1.5 text-sm"
            value={String(editForm[key])}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                [key]: e.target.value === "true",
              }))
            }
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        ) : typeof value === "number" ? (
          <DecimalInput
            value={String(editForm[key] ?? "")}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
          />
        ) : key === "data" ? (
          <DatePicker
            value={String(editForm[key] ?? "").split("T")[0]}
            onChange={(v) => setEditForm((prev) => ({ ...prev, [key]: v }))}
          />
        ) : (
          <Input
            value={String(editForm[key] ?? "")}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="kosmos-input"
          />
        )}
      </div>
    ));
  };

  const renderViewDetails = () => {
    if (!viewRow) return null;

    return Object.entries(viewRow)
      .filter(
        ([key]) =>
          !["criado_por_nome", "criado_por_email", "deleted_at"].includes(key)
      )
      .map(([key, value]) => (
        <DetailField
          key={key}
          label={formatProducaoFieldLabel(key)}
          value={
            typeof value === "boolean"
              ? value
                ? "Sim"
                : "Não"
              : key === "data"
                ? formatDateDisplay(String(value))
                : String(value ?? "—")
          }
        />
      ));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/producao"
          className="inline-flex items-center gap-2 rounded px-2 py-1.5 text-sm text-mansure-gray-medium transition hover:bg-mansure-hover hover:text-mansure-blue"
        >
          <ArrowLeft className="size-4" />
          Voltar à seleção
        </Link>
        <Button
          type="button"
          onClick={() => setOpenModal(true)}
          variant="mansurePrimary"
          className="h-11 gap-2 font-semibold"
        >
          <Plus className="size-4" />
          Nova produção
        </Button>
      </div>

        <div className="mb-6 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="kosmos-label">Filtrar por data</Label>
            <DatePicker
              value={filterDate}
              onChange={setFilterDate}
              placeholder="Todas as datas"
            />
          </div>
          <Button
            onClick={handleApplyFilter}
            variant="mansurePrimary"
            className="h-11 font-semibold"
          >
            Aplicar
          </Button>
          <Button
            variant="mansureOutline"
            onClick={handleClearFilter}
            className="h-11"
          >
            Limpar
          </Button>
        </div>

        <div className="kosmos-form-panel overflow-x-auto p-0">
          {loading ? (
            <p className="p-8 text-center text-mansure-gray-medium">Carregando...</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-mansure-gray-medium">
              Nenhum registro encontrado.
            </p>
          ) : (
            renderTable()
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="mansure-pagination-meta">
              {total} registro(s) — Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="mansureOutline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="mansureOutline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

      <RegistroProducaoModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        ambiente={ambiente}
        onSaved={loadRecords}
      />

      <Dialog open={!!viewRow} onOpenChange={() => setViewRow(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-mansure-gray-light bg-white text-mansure-black">
          <DialogHeader>
            <DialogTitle>Detalhes do registro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">{renderViewDetails()}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={() => setEditRow(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-mansure-gray-light bg-white text-mansure-black">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
            <DialogDescription className="text-mansure-dark">
              Altere os campos desejados e salve.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">{renderEditFields()}</div>
          <DialogFooter>
            <Button
              variant="mansureOutline"
              onClick={() => setEditRow(null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              variant="mansurePrimary"
              className="font-semibold"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border-mansure-gray-light bg-white text-mansure-black">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-mansure-dark">
              Tem certeza que deseja excluir este registro?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="mansureOutline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
