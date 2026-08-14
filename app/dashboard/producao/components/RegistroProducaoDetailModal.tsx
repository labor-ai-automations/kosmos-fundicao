"use client";

import { useState } from "react";
import {
  Archive,
  Calendar,
  CalendarClock,
  Clock,
  Info,
  Package,
  RotateCcw,
  Scale,
  Settings,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateDisplay } from "@/lib/auth";
import {
  isArchivableProductionTable,
  type ArchivableProductionTable,
} from "@/lib/archive-config";
import { getProducaoAmbienteConfig, type ProducaoAmbiente } from "@/lib/producao-config";
import { formatObservacaoDisplay } from "@/lib/producao-observacao";
import { useArchiveRecord } from "@/lib/hooks/useArchiveRecord";
import type { RegistroRecord } from "@/lib/registro-producao-utils";
import { RegistroProducaoArchiveDialog } from "./RegistroProducaoArchiveDialog";

interface RegistroProducaoDetailModalProps {
  record: RegistroRecord;
  ambiente: ProducaoAmbiente;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

function dateOnly(value: string) {
  return value.split("T")[0];
}

function DetailCard({
  icon: Icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: typeof Tag;
  label: string;
  value: React.ReactNode;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`p-2.5 ${
        highlight
          ? "border-mansure-blue/30 bg-mansure-blue/5"
          : "border-mansure-gray-light bg-mansure-light"
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className="size-3.5 shrink-0 text-mansure-blue" />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-mansure-gray-dark">
          {label}
        </p>
      </div>
      <p className="text-sm font-semibold text-mansure-black">{value ?? "—"}</p>
      {hint && (
        <p className="mt-1 text-[10px] leading-snug text-mansure-gray-medium">{hint}</p>
      )}
    </Card>
  );
}

function formatCreator(record: RegistroRecord) {
  if (record.criado_por_nome) return record.criado_por_nome;
  if (record.criado_por_email) return record.criado_por_email;
  return "Não identificado";
}

export function RegistroProducaoDetailModal({
  record,
  ambiente,
  onClose,
  onEdit,
  onDelete,
}: RegistroProducaoDetailModalProps) {
  const config = getProducaoAmbienteConfig(ambiente);
  const tabela = config.table;
  const canArchive = isArchivableProductionTable(tabela);
  const isArchived =
    canArchive && "archived_at" in record && record.archived_at != null;

  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { restoreMutation } = useArchiveRecord();

  const handleRestore = async () => {
    await restoreMutation.mutateAsync({
      id: record.id,
      tabela: tabela as ArchivableProductionTable,
      motivo: "Desarquivado pelo usuário",
    });
    onClose();
  };

  const criadoEm = new Date(record.criado_em);
  const dataProducao = formatDateDisplay(record.data);
  const dataRegistroSistema = criadoEm.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const lancamentoRetroativo = dateOnly(record.data) !== dateOnly(record.criado_em);
  const pesoTotal =
    record.peso_registro != null && "qtde_caixas" in record
      ? (record.peso_registro * record.qtde_caixas).toFixed(2)
      : null;

  return (
    <>
      <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] w-[min(900px,calc(100vw-1.5rem))] max-w-none flex-col overflow-hidden border-mansure-gray-light bg-white p-0 text-mansure-black sm:max-w-none">
        <div className="shrink-0 border-b border-mansure-gray-light bg-gradient-to-r from-mansure-blue/10 to-transparent px-5 py-3">
          <DialogHeader className="gap-0.5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-lg font-bold">
                Registro #{record.codigo}
              </DialogTitle>
              {isArchived && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  ARQUIVADO
                </span>
              )}
            </div>
            <DialogDescription className="text-xs text-mansure-gray-dark">
              {config.title} · {config.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-5 py-3">
          {lancamentoRetroativo && (
            <div className="mb-2 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
              <Info className="size-3.5 shrink-0" />
              Produção de {dataProducao} lançada no sistema em {dataRegistroSistema}.
            </div>
          )}

          <div className="mb-2 grid gap-2 sm:grid-cols-2">
            <DetailCard
              highlight
              icon={Calendar}
              label="Data da produção"
              value={dataProducao}
              hint="Dia em que a produção ocorreu no chão de fábrica (selecionado no formulário)."
            />
            <DetailCard
              highlight
              icon={CalendarClock}
              label="Data do registro no sistema"
              value={dataRegistroSistema}
              hint="Momento em que alguém da administração salvou este lançamento no banco."
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
              icon={Tag}
              label="Código"
              value={
                "eh_meia_placa" in record &&
                record.eh_meia_placa &&
                record.codigo_2
                  ? `${record.codigo} + ${record.codigo_2}`
                  : record.codigo
              }
            />
            {"eh_meia_placa" in record && record.eh_meia_placa && record.codigo_2 && (
              <DetailCard icon={Tag} label="Código Par" value={record.codigo_2} />
            )}
            {"eh_manual" in record && (
              <DetailCard
                icon={Info}
                label="Manual"
                value={record.eh_manual ? "Sim" : "Não"}
              />
            )}
            {"eh_meia_placa" in record && (
              <DetailCard
                icon={Info}
                label="Meia Placa"
                value={record.eh_meia_placa ? "Sim" : "Não"}
              />
            )}
            <DetailCard
              icon={Scale}
              label="Peso (kg)"
              value={record.peso_registro ?? "—"}
            />
            {"qtde_caixas" in record && (
              <DetailCard icon={Package} label="Caixas" value={record.qtde_caixas} />
            )}
            {"percas" in record && (
              <DetailCard icon={Package} label="Peças (perdas)" value={record.percas} />
            )}
            {"setup" in record && (
              <DetailCard
                icon={Settings}
                label="Setup"
                value={record.setup ? "Sim" : "Não"}
              />
            )}
            {"pedido_estoque" in record && (
              <DetailCard icon={Tag} label="Pedido / Estoque" value={record.pedido_estoque} />
            )}
            {pesoTotal && (
              <DetailCard icon={Scale} label="Peso total (kg)" value={pesoTotal} />
            )}
            {"operador" in record && (
              <DetailCard icon={User} label="Operador" value={record.operador} />
            )}
            {"local" in record && (
              <DetailCard icon={Tag} label="Local" value={record.local} />
            )}
            {"ciclo" in record && (
              <DetailCard icon={Clock} label="Ciclo" value={`${record.ciclo}s`} />
            )}
            {"colaborador" in record && (
              <DetailCard icon={User} label="Colaborador" value={record.colaborador} />
            )}
            {"maquina" in record && (
              <DetailCard icon={Settings} label="Máquina" value={record.maquina} />
            )}
            {"funcao" in record && (
              <DetailCard icon={Settings} label="Função" value={record.funcao} />
            )}
            {"turno" in record && (
              <DetailCard icon={Clock} label="Turno" value={record.turno} />
            )}
            {"hora_inicial" in record && (
              <DetailCard
                icon={Clock}
                label="Horário"
                value={`${record.hora_inicial} — ${record.hora_final}`}
              />
            )}
            {"qtde_feita" in record && (
              <DetailCard icon={Package} label="Qtde feita" value={record.qtde_feita} />
            )}
            {"fundicao" in record && (
              <DetailCard icon={Tag} label="Fundição" value={record.fundicao} />
            )}
            {"qtde_perdida" in record && (
              <DetailCard icon={Package} label="Qtde refugada" value={record.qtde_perdida} />
            )}
            {"motivo" in record && (
              <DetailCard icon={Info} label="Motivo" value={record.motivo} />
            )}
            <DetailCard icon={User} label="Lançado por" value={formatCreator(record)} />
          </div>

          {isArchived && record.archived_at && (
            <Card className="mt-2 border border-amber-200 bg-amber-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase text-amber-800">
                Registro arquivado
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Arquivado em:{" "}
                {new Date(record.archived_at).toLocaleString("pt-BR")}
              </p>
            </Card>
          )}

          {record.observacao && (
            <Card className="mt-2 border-mansure-gray-light bg-mansure-light p-2.5">
              <p className="text-[10px] font-semibold uppercase text-mansure-gray-medium">
                Observação
              </p>
              <p className="mt-0.5 text-xs text-mansure-black">
                {formatObservacaoDisplay(record.observacao)}
              </p>
            </Card>
          )}
        </div>

        <DialogFooter className="-mx-0 -mb-0 shrink-0 justify-end gap-2 border-t border-mansure-gray-light bg-mansure-light/50 px-5 py-2.5">
          <Button type="button" size="sm" variant="mansureOutline" onClick={onClose}>
            Fechar
          </Button>
          {!isArchived && (
            <Button type="button" size="sm" variant="mansurePrimary" onClick={onEdit}>
              Editar
            </Button>
          )}
          {canArchive ? (
            isArchived ? (
              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                onClick={handleRestore}
                disabled={restoreMutation.isPending}
              >
                <RotateCcw className="size-4" />
                {restoreMutation.isPending ? "Desarquivando..." : "Desarquivar"}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => setShowArchiveDialog(true)}
              >
                <Archive className="size-4" />
                Arquivar
              </Button>
            )
          ) : (
            onDelete && (
              <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
                Deletar
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
      </Dialog>

      {canArchive && !isArchived && (
        <RegistroProducaoArchiveDialog
          open={showArchiveDialog}
          onOpenChange={setShowArchiveDialog}
          recordId={record.id}
          codigo={record.codigo}
          tabela={tabela as ArchivableProductionTable}
          onSuccess={onClose}
        />
      )}
    </>
  );
}
