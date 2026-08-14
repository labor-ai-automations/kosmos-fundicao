"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
import type {
  ProducaoColdbox,
  ProducaoMacharia,
  ProducaoVick,
  ProductionTable,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/PageHeader";
import { DatePicker } from "@/components/DatePicker";
import { DecimalInput } from "@/components/DecimalInput";
import { normalizeRecordNumbers } from "@/lib/number-utils";
import { formatObservacaoDisplay } from "@/lib/producao-observacao";

type TabKey = ProductionTable;

type RecordRow = (
  | ProducaoVick
  | ProducaoColdbox
  | ProducaoMacharia
  | Refugo
) &
  RecordWithUser;

const TAB_LABELS: Record<TabKey, string> = {
  producao_vick: "VICK",
  producao_coldbox: "COLDBOX",
  producao_macharia: "MACHARIA",
  refugo: "REFUGO",
};

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

export function RecordsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("producao_vick");
  const [page, setPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [viewRow, setViewRow] = useState<RecordRow | null>(null);
  const [editRow, setEditRow] = useState<RecordRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | number | boolean | null>>({});
  const [saving, setSaving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllRecords(activeTab, page, {
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
  }, [activeTab, page, appliedFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabKey);
    setPage(1);
  };

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

      switch (activeTab) {
        case "producao_vick":
          await updateProducaoVick(editRow.id, payload as Partial<ProducaoVick>);
          break;
        case "producao_coldbox":
          await updateProducaoColdbox(editRow.id, payload as Partial<ProducaoColdbox>);
          break;
        case "producao_macharia":
          await updateProducaoMacharia(editRow.id, payload as Partial<ProducaoMacharia>);
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
      await softDeleteRecord(activeTab, deleteId);
      toast.success("Registro excluído");
      setDeleteId(null);
      await loadRecords();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir registro"
      );
    }
  };

  const renderVickTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
          <TableHead className="font-semibold text-white">Data</TableHead>
          <TableHead className="font-semibold text-white">Código</TableHead>
          <TableHead className="font-semibold text-white">Qtde Caixas</TableHead>
          <TableHead className="font-semibold text-white">Percas</TableHead>
          <TableHead className="font-semibold text-white">Setup</TableHead>
          <TableHead className="font-semibold text-white">Observações</TableHead>
          <TableHead className="font-semibold text-white">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(rows as ProducaoVick[]).map((row) => (
          <TableRow
            key={row.id}
            className="border-mansure-gray-light hover:bg-mansure-light/50"
          >
            <TableCell className="text-sm text-mansure-gray-dark">
              {formatDateDisplay(row.data)}
            </TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.codigo}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.qtde_caixas}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.percas}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">
              {row.setup ? "Sim" : "Não"}
            </TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">
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

  const renderColdboxTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
          <TableHead className="font-semibold text-white">Data</TableHead>
          <TableHead className="font-semibold text-white">Operador</TableHead>
          <TableHead className="font-semibold text-white">Local</TableHead>
          <TableHead className="font-semibold text-white">Código</TableHead>
          <TableHead className="font-semibold text-white">Qtde</TableHead>
          <TableHead className="font-semibold text-white">Ciclo</TableHead>
          <TableHead className="font-semibold text-white">Observações</TableHead>
          <TableHead className="font-semibold text-white">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(rows as ProducaoColdbox[]).map((row) => (
          <TableRow
            key={row.id}
            className="border-mansure-gray-light hover:bg-mansure-light/50"
          >
            <TableCell className="text-sm text-mansure-gray-dark">
              {formatDateDisplay(row.data)}
            </TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.operador}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.local}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.codigo}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.qtde_caixas}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.ciclo}s</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">
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

  const renderMachariaTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
          <TableHead className="font-semibold text-white">Data</TableHead>
          <TableHead className="font-semibold text-white">Colaborador</TableHead>
          <TableHead className="font-semibold text-white">Máquina</TableHead>
          <TableHead className="font-semibold text-white">Qtde Feita</TableHead>
          <TableHead className="font-semibold text-white">Horário</TableHead>
          <TableHead className="font-semibold text-white">Observações</TableHead>
          <TableHead className="font-semibold text-white">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(rows as ProducaoMacharia[]).map((row) => (
          <TableRow
            key={row.id}
            className="border-mansure-gray-light hover:bg-mansure-light/50"
          >
            <TableCell className="text-sm text-mansure-gray-dark">
              {formatDateDisplay(row.data)}
            </TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.colaborador}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.maquina}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.qtde_feita}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">
              {formatTimeRange(row.hora_inicial, row.hora_final)}
            </TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">
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

  const renderRefugoTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
          <TableHead className="font-semibold text-white">Data</TableHead>
          <TableHead className="font-semibold text-white">Código</TableHead>
          <TableHead className="font-semibold text-white">Fundição</TableHead>
          <TableHead className="font-semibold text-white">Qtde</TableHead>
          <TableHead className="font-semibold text-white">Motivo</TableHead>
          <TableHead className="font-semibold text-white">Observações</TableHead>
          <TableHead className="font-semibold text-white">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(rows as Refugo[]).map((row) => (
          <TableRow
            key={row.id}
            className="border-mansure-gray-light hover:bg-mansure-light/50"
          >
            <TableCell className="text-sm text-mansure-gray-dark">
              {formatDateDisplay(row.data)}
            </TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.codigo}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.fundicao}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.qtde_perdida}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">{row.motivo}</TableCell>
            <TableCell className="text-sm text-mansure-gray-dark">
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

  function ActionButtons({ row }: { row: RecordRow }) {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewRow(row)}
          className="text-mansure-blue hover:bg-mansure-light"
        >
          <Eye className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => openEdit(row)}
          className="text-mansure-blue hover:bg-mansure-light"
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

  const renderEditFields = () => {
    if (!editRow) return null;

    const fields = Object.entries(editRow).filter(
      ([key]) =>
        !["id", "criado_em", "criado_por", "deleted_at", "criado_por_nome", "criado_por_email"].includes(key)
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
            onChange={(v) =>
              setEditForm((prev) => ({ ...prev, [key]: v }))
            }
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
      <PageHeader
        title="Registros"
        description="Consulte, edite e exclua registros de produção."
      />

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
          className="h-11 bg-mansure-blue font-semibold hover:bg-mansure-blue/90"
        >
          Aplicar
        </Button>
        <Button
          variant="outline"
          onClick={handleClearFilter}
          className="h-11 border-mansure-gray-light text-mansure-gray-dark"
        >
          Limpar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 bg-white shadow-sm">
          {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-active:bg-mansure-blue data-active:text-white"
            >
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="kosmos-form-panel overflow-x-auto p-0">
              {loading ? (
                <p className="p-8 text-center text-mansure-dark">
                  Carregando...
                </p>
              ) : rows.length === 0 ? (
                <p className="p-8 text-center text-mansure-dark">
                  Nenhum registro encontrado.
                </p>
              ) : (
                <>
                  {tab === "producao_vick" && renderVickTable()}
                  {tab === "producao_coldbox" && renderColdboxTable()}
                  {tab === "producao_macharia" && renderMachariaTable()}
                  {tab === "refugo" && renderRefugoTable()}
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-mansure-dark">
                  {total} registro(s) — Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="border-mansure-gray-light text-mansure-gray-dark"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-mansure-gray-light text-mansure-gray-dark"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

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
              variant="outline"
              onClick={() => setEditRow(null)}
              className="border-mansure-gray-light"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-mansure-blue hover:bg-mansure-blue/90"
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
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="border-mansure-gray-light"
            >
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
