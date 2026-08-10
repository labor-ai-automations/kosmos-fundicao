"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface HistoryColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

interface HistoryTableProps<T extends { id: string }> {
  title?: string;
  columns: HistoryColumn<T>[];
  rows: T[];
  onDelete: (id: string) => Promise<void>;
  emptyMessage?: string;
}

export function HistoryTable<T extends { id: string }>({
  title = "Histórico",
  columns,
  rows,
  onDelete,
  emptyMessage = "Nenhum registro encontrado.",
}: HistoryTableProps<T>) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="kosmos-side-panel">
      <h2 className="mb-4 text-lg font-bold text-mansure-black">{title}</h2>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-mansure-dark">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-mansure-gray-light">
          <Table>
            <TableHeader>
              <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="whitespace-nowrap font-semibold text-white"
                  >
                    {col.header}
                  </TableHead>
                ))}
                <TableHead className="font-semibold text-white">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-mansure-gray-light transition-colors hover:bg-mansure-light/80"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className="whitespace-nowrap text-sm text-mansure-gray-dark"
                    >
                      {col.render(row)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteId(row.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" strokeWidth={2} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border-mansure-gray-light bg-white">
          <DialogHeader>
            <DialogTitle className="text-mansure-black">
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription className="text-mansure-dark">
              Tem certeza que deseja excluir este registro? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
