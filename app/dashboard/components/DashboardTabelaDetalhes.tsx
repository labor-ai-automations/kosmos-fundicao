"use client";

import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
} from "lucide-react";
import { formatDateDisplay } from "@/lib/auth";
import type { BeastDetalheData } from "@/lib/dashboard-beast-types";
import { useDashboardFilterStore } from "@/lib/stores/dashboardFilterStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardSectionHeader } from "./DashboardInfoTip";
import * as XLSX from "xlsx";

interface DashboardTabelaDetalhesProps {
  data: BeastDetalheData[];
  total: number;
}

function formatDateTime(value: string) {
  const datePart = value.split("T")[0];
  const timePart = value.includes("T") ? value.split("T")[1]?.slice(0, 5) : "";
  return timePart
    ? `${formatDateDisplay(datePart)} ${timePart}`
    : formatDateDisplay(datePart);
}

export function DashboardTabelaDetalhes({
  data,
  total,
}: DashboardTabelaDetalhesProps) {
  const { filters, setPage } = useDashboardFilterStore();
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Data: formatDateDisplay(item.data),
        Código: item.codigo,
        "Código Par": item.codigo_2 || "—",
        Caixas: item.qtde_caixas,
        Peças: item.percas,
        Peso: item.peso_registro,
        Setup: item.setup ? "Sim" : "Não",
        Manual: item.eh_manual ? "Sim" : "Não",
        "Meia Placa": item.eh_meia_placa ? "Sim" : "Não",
        Observação: item.observacao || "—",
        "Tipo Pedido": item.pedido_estoque || "—",
        "Criado Por": item.criado_por_email,
        "Data Criação": formatDateTime(item.criado_em),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(
      wb,
      `dashboard-detalhes-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  const pageStart = total === 0 ? 0 : (filters.page - 1) * filters.limit + 1;
  const pageEnd = Math.min(filters.page * filters.limit, total);

  return (
    <Card className="overflow-visible rounded-lg border-mansure-gray-light bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <DashboardSectionHeader
            title="Detalhes dos Registros"
            visibleNotice={`Total: ${total} registros · Página ${filters.page} de ${totalPages}`}
            hoverInfo="Lista paginada conforme filtros de período, tipo, setup e código."
            icon={
              <ClipboardList
                className="h-5 w-5 text-mansure-blue"
                strokeWidth={2}
              />
            }
            titleClassName="text-xl"
          />
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={data.length === 0}
          className="gap-2 bg-green-600 text-white hover:bg-green-700"
        >
          <Download className="size-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mansure-gray-light bg-mansure-hover">
              <th className="p-3 text-left font-semibold text-mansure-black">
                Data
              </th>
              <th className="p-3 text-left font-semibold text-mansure-black">
                Código
              </th>
              <th className="p-3 text-left font-semibold text-mansure-black">
                Código Par
              </th>
              <th className="p-3 text-center font-semibold text-mansure-black">
                Caixas
              </th>
              <th className="p-3 text-center font-semibold text-mansure-black">
                Peças
              </th>
              <th className="p-3 text-center font-semibold text-mansure-black">
                Peso (kg)
              </th>
              <th className="p-3 text-center font-semibold text-mansure-black">
                Setup
              </th>
              <th className="p-3 text-center font-semibold text-mansure-black">
                Manual
              </th>
              <th className="p-3 text-center font-semibold text-mansure-black">
                Meia Placa
              </th>
              <th className="p-3 text-left font-semibold text-mansure-black">
                Observação
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-mansure-gray-light ${
                    idx % 2 === 0 ? "bg-white" : "bg-mansure-hover/60"
                  } transition hover:bg-mansure-light`}
                >
                  <td className="p-3 text-mansure-black">
                    {formatDateDisplay(item.data)}
                  </td>
                  <td className="p-3 font-semibold text-mansure-blue">
                    {item.codigo}
                  </td>
                  <td className="p-3 text-mansure-gray-dark">
                    {item.codigo_2 || "—"}
                  </td>
                  <td className="p-3 text-center font-semibold text-mansure-black">
                    {item.qtde_caixas}
                  </td>
                  <td className="p-3 text-center text-mansure-black">
                    {item.percas}
                  </td>
                  <td className="p-3 text-center text-mansure-black">
                    {item.peso_registro.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        item.setup
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.setup ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        item.eh_manual
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.eh_manual ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        item.eh_meia_placa
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.eh_meia_placa ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="max-w-xs truncate p-3 text-mansure-gray-dark">
                    {item.observacao || "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="p-6 text-center text-mansure-gray-dark"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-mansure-gray-light pt-4">
        <p className="text-sm text-mansure-gray-medium">
          Mostrando {pageStart} até {pageEnd} de {total}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => setPage(Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            size="sm"
            variant="mansureOutline"
            className="gap-1"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <Button
            onClick={() => setPage(Math.min(totalPages, filters.page + 1))}
            disabled={filters.page >= totalPages}
            size="sm"
            variant="mansureOutline"
            className="gap-1"
          >
            Próximo
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
