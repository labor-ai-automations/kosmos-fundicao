"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getProducaoAmbienteConfig,
  type ProducaoAmbiente,
} from "@/lib/producao-config";
import {
  updateProducaoColdbox,
  updateProducaoMacharia,
  updateProducaoVick,
  updateRefugo,
} from "@/lib/api-calls";
import type {
  ProducaoColdbox,
  ProducaoMacharia,
  ProducaoVick,
  Refugo,
} from "@/lib/types";
import { normalizeRecordNumbers } from "@/lib/number-utils";
import { formatDateDisplay } from "@/lib/auth";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";
import { RegistroProducaoModal } from "@/components/RegistroProducaoModal";
import { DecimalInput } from "@/components/DecimalInput";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistroProducaoToolbar } from "./RegistroProducaoToolbar";
import { RegistroProducaoViewTabs } from "./RegistroProducaoViewTabs";
import { RegistroProducaoDataTable } from "./RegistroProducaoDataTable";
import { isArchivableProductionTable } from "@/lib/archive-config";
import { RegistroProducaoDensityToggle } from "./RegistroProducaoDensityToggle";
import {
  formatProducaoFieldLabel,
  isProducaoNumericField,
  PRODUCAO_NUMERIC_FIELD_KEYS,
  type RegistroRecord,
} from "@/lib/registro-producao-utils";
import { useRegistroProducao } from "../hooks/useRegistroProducao";
import {
  FUNCOES_OPCOES,
  MACHARIAS_OPCOES,
  TURNOS_OPCOES,
} from "@/lib/constants/macharia";

export function RegistroProducaoWorkspace({
  ambiente,
}: {
  ambiente: ProducaoAmbiente;
}) {
  const config = getProducaoAmbienteConfig(ambiente);
  const { initAmbiente, viewMode } = useRegistroProducaoStore();
  const canArchive = isArchivableProductionTable(config.table);
  const { refetch, table } = useRegistroProducao(ambiente);

  const [openModal, setOpenModal] = useState(false);
  const [editRow, setEditRow] = useState<RegistroRecord | null>(null);
  const [editForm, setEditForm] = useState<
    Record<string, string | number | boolean | null>
  >({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initAmbiente(ambiente);
  }, [ambiente, initAmbiente]);

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const openEdit = (row: RegistroRecord) => {
    setEditRow(row);
    const form: Record<string, string | number | boolean | null> = { ...row };
    for (const key of PRODUCAO_NUMERIC_FIELD_KEYS) {
      if (!(key in form)) {
        form[key] = null;
      }
    }
    setEditForm(form);
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
      delete payload.archived_at;
      delete payload.archived_by;
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
      await reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar registro"
      );
    } finally {
      setSaving(false);
    }
  };

  const renderEditFields = () => {
    if (!editRow) return null;

    const renderSelectField = (
      key: string,
      options: readonly { value: string; label: string }[]
    ) => (
      <select
        className="kosmos-input px-2 py-1.5 text-sm"
        value={String(editForm[key] ?? "")}
        onChange={(e) =>
          setEditForm((prev) => ({
            ...prev,
            [key]: e.target.value,
          }))
        }
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );

    return Object.entries(editForm)
      .filter(
        ([key]) =>
          ![
            "id",
            "criado_em",
            "criado_por",
            "deleted_at",
            "archived_at",
            "archived_by",
            "tipo_placa",
            "criado_por_nome",
            "criado_por_email",
          ].includes(key)
      )
      .map(([key, value]) => (
        <div key={key} className="space-y-1">
          <Label className="kosmos-label">
            {formatProducaoFieldLabel(key)}
          </Label>
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
          ) : isProducaoNumericField(key, value) ? (
            <DecimalInput
              value={
                editForm[key] === null || editForm[key] === undefined
                  ? ""
                  : String(editForm[key])
              }
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
          ) : ambiente === "macharia" && key === "maquina" ? (
            renderSelectField(key, MACHARIAS_OPCOES)
          ) : ambiente === "macharia" && key === "funcao" ? (
            renderSelectField(key, FUNCOES_OPCOES)
          ) : ambiente === "macharia" && key === "turno" ? (
            renderSelectField(key, TURNOS_OPCOES)
          ) : key === "hora_inicial" || key === "hora_final" ? (
            <Input
              type="time"
              value={String(editForm[key] ?? "")}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="kosmos-input"
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

  return (
    <div className="-mt-2 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <Link
              href="/dashboard/producao"
              className="inline-flex items-center gap-1 text-mansure-gray-light transition hover:text-mansure-blue"
            >
              <ArrowLeft className="size-3.5" />
              Voltar à seleção
            </Link>
            <span className="hidden text-white/25 sm:inline">·</span>
            <span className="hidden text-white/55 sm:inline">{config.description}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-mansure-light">
            Registro de Produção — {config.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RegistroProducaoDensityToggle />
          {viewMode === "active" && (
            <Button
              type="button"
              onClick={() => setOpenModal(true)}
              variant="mansurePrimary"
              className="h-9 gap-2 px-4 text-sm font-semibold"
            >
              <Plus className="size-4" />
              Nova produção
            </Button>
          )}
        </div>
      </div>

      {canArchive && <RegistroProducaoViewTabs />}
      <RegistroProducaoToolbar ambiente={ambiente} />
      <RegistroProducaoDataTable
        ambiente={ambiente}
        onEdit={openEdit}
        onDelete={() => {}}
      />

      <RegistroProducaoModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        ambiente={ambiente}
        onSaved={reload}
      />

      <Dialog open={!!editRow} onOpenChange={() => setEditRow(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-mansure-gray-light bg-white text-mansure-black">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
            <DialogDescription className="text-mansure-dark">
              {editRow ? `Código ${editRow.codigo} — ${formatDateDisplay(editRow.data)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">{renderEditFields()}</div>
          <DialogFooter>
            <Button variant="mansureOutline" onClick={() => setEditRow(null)}>
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
    </div>
  );
}
