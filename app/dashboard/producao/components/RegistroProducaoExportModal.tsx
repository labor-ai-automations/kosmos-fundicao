"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRegistroProducaoExport } from "../hooks/useRegistroProducao";
import { recordToExportRow } from "@/lib/registro-producao-utils";
import { getEffectiveVisibleColumns } from "@/lib/registro-producao-config";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";
import type { ProducaoAmbiente } from "@/lib/producao-config";

interface RegistroProducaoExportModalProps {
  ambiente: ProducaoAmbiente;
  onClose: () => void;
}

export function RegistroProducaoExportModal({
  ambiente,
  onClose,
}: RegistroProducaoExportModalProps) {
  const { visibleColumns, debouncedSearch, viewMode } = useRegistroProducaoStore();
  const displayColumns = getEffectiveVisibleColumns(visibleColumns, viewMode);
  const [exportMode, setExportMode] = useState<"visible" | "all">("visible");
  const [includeHeader, setIncludeHeader] = useState(true);

  const { data: exportRows = [], isLoading } = useRegistroProducaoExport(
    ambiente,
    true
  );

  const rowsToExport = exportRows;

  const previewRows = rowsToExport.slice(0, 5);

  const handleExport = () => {
    if (rowsToExport.length === 0) {
      toast.error("Nenhum registro para exportar");
      return;
    }

    const sheetData = rowsToExport.map((record) => {
      const full = recordToExportRow(record, ambiente);
      if (exportMode === "all") return full;

      const filtered: Record<string, string | number | boolean | null> = {};
      for (const col of displayColumns) {
        const keyMap: Record<string, string> = {
          data: "Data",
          codigo: "Código",
          peso: "Peso (kg)",
          caixas: "Qtde Caixas",
          percas: "Peças",
          setup: "Setup",
          meia_placa: "Meia Placa",
          manual: "Manual",
          observacao: "Observação",
          pedido_estoque: "Pedido Estoque",
          operador: "Operador",
          local: "Local",
          ciclo: "Ciclo",
          colaborador: "Colaborador",
          maquina: "Máquina",
          qtde_feita: "Qtde Feita",
          horario: "Horário",
          fundicao: "Fundição",
          qtde_perdida: "Qtde Perdida",
          motivo: "Motivo",
          criado_por: "Criado Por",
          criado_em: "Criado Em",
        };
        const label = keyMap[col];
        if (label && label in full) {
          filtered[label] = full[label as keyof typeof full];
        }
      }
      return Object.keys(filtered).length > 0 ? filtered : full;
    });

    const ws = XLSX.utils.json_to_sheet(sheetData, {
      skipHeader: !includeHeader,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    const fileName = `registro-producao-${ambiente}-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Excel exportado");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-mansure-gray-light bg-white text-mansure-black">
        <DialogHeader>
          <DialogTitle>Exportar para Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Modo de exportação</h3>
            <div className="space-y-2 text-sm">
              {[
                {
                  id: "visible" as const,
                  label: `Colunas visíveis (${displayColumns.length})`,
                },
                { id: "all" as const, label: "Todas as colunas" },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="radio"
                    name="export-mode"
                    checked={exportMode === option.id}
                    onChange={() => setExportMode(option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <Card className="border-mansure-gray-light bg-mansure-light p-4">
            <p className="text-sm">
              <strong>Total:</strong>{" "}
              {isLoading ? "Carregando..." : `${rowsToExport.length} registros`}
              {debouncedSearch && ` — filtro: "${debouncedSearch}"`}
            </p>
          </Card>

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox
              checked={includeHeader}
              onCheckedChange={(v) => setIncludeHeader(v === true)}
            />
            Incluir cabeçalho
          </label>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Preview (5 primeiras linhas)</h3>
            <div className="overflow-x-auto rounded-lg border border-mansure-gray-light">
              <table className="w-full text-xs">
                <thead className="bg-mansure-blue text-white">
                  <tr>
                    <th className="px-2 py-1 text-left">Data</th>
                    <th className="px-2 py-1 text-left">Código</th>
                    <th className="px-2 py-1 text-left">Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-mansure-gray-light"
                    >
                      <td className="px-2 py-1">
                        {new Date(record.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-2 py-1">{record.codigo}</td>
                      <td className="px-2 py-1">{record.peso_registro ?? "—"}</td>
                    </tr>
                  ))}
                  {!isLoading && previewRows.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-2 py-4 text-center text-mansure-gray-medium">
                        Nenhum registro
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="mansureOutline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="mansurePrimary"
            className="gap-2"
            onClick={handleExport}
            disabled={isLoading || rowsToExport.length === 0}
          >
            <Download className="size-4" />
            Baixar Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
