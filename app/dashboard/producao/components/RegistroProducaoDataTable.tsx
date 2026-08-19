"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Archive,
  ChevronDown,
  Download,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REGISTRO_COLUMNS, getColumnLabel, getEffectiveVisibleColumns } from "@/lib/registro-producao-config";
import {
  formatRegistroCell,
  type RegistroRecord,
} from "@/lib/registro-producao-utils";
import { highlightSearchMatch } from "@/lib/registro-producao-highlight";
import { useRegistroProducaoStore } from "@/lib/stores/registroProducaoStore";
import { useRegistroProducao } from "../hooks/useRegistroProducao";
import { RegistroProducaoDetailModal } from "./RegistroProducaoDetailModal";
import { getDensityClasses } from "./RegistroProducaoDensityToggle";
import { RegistroProducaoArchiveDialog } from "./RegistroProducaoArchiveDialog";
import type { ProducaoAmbiente } from "@/lib/producao-config";
import { getProducaoAmbienteConfig } from "@/lib/producao-config";
import {
  isArchivableProductionTable,
  type ArchivableProductionTable,
} from "@/lib/archive-config";
import { useArchiveRecord } from "@/lib/hooks/useArchiveRecord";
import type { RegistroViewMode } from "@/lib/stores/registroProducaoStore";
import * as XLSX from "xlsx";
import { recordToExportRow } from "@/lib/registro-producao-utils";

interface RegistroProducaoDataTableProps {
  ambiente: ProducaoAmbiente;
  onEdit: (record: RegistroRecord) => void;
  onDelete: (id: string) => void;
}

function SortIcon({
  columnId,
  sortBy,
}: {
  columnId: string;
  sortBy: { column: string; direction: "asc" | "desc" } | null;
}) {
  if (sortBy?.column !== columnId) {
    return <ArrowUpDown className="size-3.5 opacity-50" />;
  }
  return sortBy.direction === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

function RestoreRowButton({
  recordId,
  codigo,
  tabela,
}: {
  recordId: string;
  codigo: string;
  tabela: ArchivableProductionTable;
}) {
  const { restoreMutation } = useArchiveRecord();

  return (
    <Button
      type="button"
      size="sm"
      className="h-8 gap-1.5 bg-green-600 px-2.5 text-xs font-semibold text-white hover:bg-green-700"
      disabled={restoreMutation.isPending}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await restoreMutation.mutateAsync({
            id: recordId,
            tabela,
            motivo: "Desarquivado pelo usuário",
          });
        } catch {
          // toast via onError
        }
      }}
    >
      <RotateCcw className="size-3.5" />
      {restoreMutation.isPending ? "..." : "Desarquivar"}
    </Button>
  );
}

function RowActionsMenu({
  record,
  ambiente,
  viewMode,
  onEdit,
  onDelete,
}: {
  record: RegistroRecord;
  ambiente: ProducaoAmbiente;
  viewMode: RegistroViewMode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { table } = getProducaoAmbienteConfig(ambiente);
  const canArchive = isArchivableProductionTable(table);
  const isArchivedView = viewMode === "archived";

  const exportOne = () => {
    const row = recordToExportRow(record, ambiente);
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registro");
    XLSX.writeFile(wb, `registro-${record.codigo.replace(/[^\w.-]+/g, "_")}.xlsx`);
    toast.success("Registro exportado");
    setOpen(false);
  };

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="size-8 p-0 text-mansure-blue hover:bg-mansure-blue/10 hover:text-mansure-blue"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <ChevronDown className="size-4" />
        </Button>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-mansure-gray-light bg-white shadow-lg">
              {!isArchivedView && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-mansure-black hover:bg-mansure-hover"
                  onClick={() => {
                    onEdit();
                    setOpen(false);
                  }}
                >
                  <Pencil className="size-4 text-mansure-gray-dark" />
                  Editar
                </button>
              )}
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-mansure-black hover:bg-mansure-hover"
                onClick={exportOne}
              >
                <Download className="size-4 text-mansure-gray-dark" />
                Exportar linha
              </button>
              {canArchive && !isArchivedView ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50"
                  onClick={() => {
                    setShowArchiveDialog(true);
                    setOpen(false);
                  }}
                >
                  <Archive className="size-4" />
                  Arquivar
                </button>
              ) : !canArchive && !isArchivedView ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                  }}
                >
                  <Trash2 className="size-4" />
                  Deletar
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>

      {canArchive && (
        <RegistroProducaoArchiveDialog
          open={showArchiveDialog}
          onOpenChange={setShowArchiveDialog}
          recordId={record.id}
          codigo={record.codigo}
          tabela={table as ArchivableProductionTable}
        />
      )}
    </>
  );
}

export function RegistroProducaoDataTable({
  ambiente,
  onEdit,
  onDelete,
}: RegistroProducaoDataTableProps) {
  const {
    visibleColumns,
    density,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortBy,
    setSortBy,
    debouncedSearch,
    viewMode,
  } = useRegistroProducaoStore();

  const { records, totalCount, totalPages, isLoading, isRefetching, error } =
    useRegistroProducao(ambiente);

  const displayColumns = getEffectiveVisibleColumns(visibleColumns, viewMode);

  const [detailRecord, setDetailRecord] = useState<RegistroRecord | null>(null);
  const [gotoPage, setGotoPage] = useState("");

  const { table: productionTable } = getProducaoAmbienteConfig(ambiente);
  const showArchivedActions = viewMode === "archived" && isArchivableProductionTable(productionTable);
  const emptyMessage =
    viewMode === "archived"
      ? "Nenhum registro arquivado."
      : "Nenhum registro encontrado.";

  const densityClasses = getDensityClasses(density);

  const handleSort = (columnId: string, multi = false) => {
    const col = REGISTRO_COLUMNS[ambiente].find((c) => c.id === columnId);
    if (!col?.sortable) return;

    if (sortBy?.column === columnId) {
      if (sortBy.direction === "asc") {
        setSortBy({ column: columnId, direction: "desc" });
      } else if (!multi) {
        setSortBy(null);
      } else {
        setSortBy({ column: columnId, direction: "asc" });
      }
      return;
    }

    setSortBy({ column: columnId, direction: "asc" });
  };

  const columns = useMemo<ColumnDef<RegistroRecord>[]>(() => {
    const dynamicCols = displayColumns.map((columnId) => ({
      id: columnId,
      accessorKey: columnId,
      header: () => (
        <button
          type="button"
          className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide"
          onClick={(e) => handleSort(columnId, e.ctrlKey || e.metaKey)}
        >
          {getColumnLabel(ambiente, columnId)}
          <SortIcon columnId={columnId} sortBy={sortBy} />
        </button>
      ),
      cell: ({ row }: { row: { original: RegistroRecord } }) => {
        const text = formatRegistroCell(row.original, columnId, ambiente);
        const shouldHighlight = columnId === "codigo" || columnId === "observacao";

        if (
          ambiente === "macharia" &&
          (columnId === "maquina" || columnId === "funcao")
        ) {
          return (
            <span className="inline-flex rounded-full bg-mansure-blue/10 px-2.5 py-0.5 text-xs font-medium text-mansure-blue">
              {text}
            </span>
          );
        }

        return (
          <span className="text-mansure-black">
            {shouldHighlight
              ? highlightSearchMatch(text, debouncedSearch)
              : text}
          </span>
        );
      },
    }));

    return dynamicCols;
  }, [displayColumns, ambiente, sortBy, debouncedSearch]);

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-mansure-gray-light bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-mansure-blue hover:bg-mansure-blue">
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`${densityClasses.head} text-white`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
                <TableHead
                  className={`${densityClasses.head} min-w-[7.5rem] text-center text-white`}
                >
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + 1}
                    className="py-16 text-center text-mansure-gray-medium"
                  >
                    Carregando registros...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + 1}
                    className="py-16 text-center text-red-600"
                  >
                    Erro ao carregar registros:{" "}
                    {error instanceof Error ? error.message : "Falha desconhecida"}
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + 1}
                    className="py-16 text-center text-mansure-gray-medium"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-mansure-gray-light/80 transition hover:bg-mansure-blue/5"
                    onClick={() => setDetailRecord(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={densityClasses.cell}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    <TableCell
                      className={`${densityClasses.cell} text-center`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {showArchivedActions && (
                          <RestoreRowButton
                            recordId={row.original.id}
                            codigo={row.original.codigo}
                            tabela={productionTable as ArchivableProductionTable}
                          />
                        )}
                        <RowActionsMenu
                          record={row.original}
                          ambiente={ambiente}
                          viewMode={viewMode}
                          onEdit={() => onEdit(row.original)}
                          onDelete={() => onDelete(row.original.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {isRefetching && !isLoading && (
          <p className="border-t border-mansure-gray-light px-4 py-2 text-xs text-mansure-gray-medium">
            Atualizando...
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-mansure-gray-light bg-white px-4 py-3">
        <p className="text-sm text-mansure-gray-dark">
          Mostrando {start}-{end} de {totalCount} registros
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="mansureOutline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ◄ Anterior
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                type="button"
                size="sm"
                variant={page === pageNum ? "mansurePrimary" : "mansureOutline"}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            type="button"
            variant="mansureOutline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próximo ►
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-mansure-gray-medium">Ir para</span>
            <Input
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value.replace(/\D/g, ""))}
              className="h-8 w-14 px-2 text-center text-sm"
              placeholder="1"
            />
            <Button
              type="button"
              size="sm"
              variant="mansureOutline"
              onClick={() => {
                const n = parseInt(gotoPage, 10);
                if (n >= 1 && n <= totalPages) setPage(n);
              }}
            >
              Go
            </Button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="h-8 rounded-md border border-mansure-gray-light bg-white px-2 text-sm text-mansure-black"
          >
            {[10, 20, 50, 100, 200].map((size) => (
              <option key={size} value={size}>
                {size} / pág
              </option>
            ))}
          </select>
        </div>
      </div>

      {detailRecord && (
        <RegistroProducaoDetailModal
          record={detailRecord}
          ambiente={ambiente}
          onClose={() => setDetailRecord(null)}
          onEdit={() => {
            onEdit(detailRecord);
            setDetailRecord(null);
          }}
        />
      )}
    </>
  );
}
