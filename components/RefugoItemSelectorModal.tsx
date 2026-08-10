"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import { toast } from "sonner";
import { getItensRefugo } from "@/lib/api-calls";
import {
  formatRefugoCellValue,
  REFUGO_SELECTOR_COLUMNS,
  REFUGO_SELECTOR_LABELS,
  refugoItemMatchesSearch,
  type RefugoSelectorItem,
} from "@/lib/refugo-selector-config";
import { CodigoModalSearchInput } from "@/components/CodigoModalSearchInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 20;

interface RefugoItemSelectorModalProps {
  isOpen: boolean;
  onSelect: (item: RefugoSelectorItem) => void;
  onClose: () => void;
}

export function RefugoItemSelectorModal({
  isOpen,
  onSelect,
  onClose,
}: RefugoItemSelectorModalProps) {
  const [items, setItems] = useState<RefugoSelectorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filterColumns = REFUGO_SELECTOR_COLUMNS.filter((col) => col !== "codigo");

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getItensRefugo());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar itens"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
    setFilters({});
    setShowFilters(false);
    setCurrentPage(1);
    loadItems();
  }, [isOpen, loadItems]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!refugoItemMatchesSearch(item, searchQuery)) return false;

      return Object.entries(filters).every(([key, value]) => {
        if (!value.trim()) return true;
        const cell = formatRefugoCellValue(
          item[key as keyof RefugoSelectorItem]
        ).toLowerCase();
        return cell.includes(value.toLowerCase());
      });
    });
  }, [items, searchQuery, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({});
    setCurrentPage(1);
  };

  const handleSelect = (item: RefugoSelectorItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[85vh] max-w-5xl flex-col border-mansure-border bg-mansure-light sm:max-w-5xl">
        <DialogHeader className="border-b border-mansure-border px-6 py-4">
          <DialogTitle className="text-lg font-bold text-mansure-black">
            Pesquisar código — Refugo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <CodigoModalSearchInput
              className="flex-1"
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <Button
              type="button"
              variant="mansureOutline"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter className="size-4" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-3 rounded-lg border border-mansure-gray-light bg-mansure-light p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {filterColumns.map((col) => (
                  <div key={col}>
                    <label className="mb-1 block text-xs font-medium text-mansure-dark">
                      {REFUGO_SELECTOR_LABELS[col]}
                    </label>
                    <Input
                      placeholder={`Filtrar ${REFUGO_SELECTOR_LABELS[col].toLowerCase()}`}
                      value={filters[col] ?? ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [col]: e.target.value,
                        }))
                      }
                      className="kosmos-input text-sm"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-red-400 hover:text-red-300"
              >
                <X className="mr-1 size-4" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        <div className="mx-6 mb-4 min-h-0 flex-1 overflow-auto rounded-lg border border-mansure-border">
          <Table>
            <TableHeader>
              <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
                {REFUGO_SELECTOR_COLUMNS.map((col) => (
                  <TableHead
                    key={col}
                    className="whitespace-nowrap font-semibold text-white"
                  >
                    {REFUGO_SELECTOR_LABELS[col]}
                  </TableHead>
                ))}
                <TableHead className="codigo-selector-action-head whitespace-nowrap font-semibold text-white">
                  Ação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={REFUGO_SELECTOR_COLUMNS.length + 1}
                    className="py-8 text-center text-mansure-dark"
                  >
                    Carregando itens...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow
                    key={`${item.origem}-${item.id}`}
                    className="group border-mansure-gray-light hover:bg-mansure-light/50"
                  >
                    {REFUGO_SELECTOR_COLUMNS.map((col) => (
                      <TableCell
                        key={`${item.id}-${col}`}
                        className="whitespace-nowrap text-sm text-mansure-gray-dark"
                      >
                        {formatRefugoCellValue(item[col])}
                      </TableCell>
                    ))}
                    <TableCell className="codigo-selector-action-cell">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSelect(item)}
                        variant="mansurePrimary"
                        className="font-semibold"
                      >
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={REFUGO_SELECTOR_COLUMNS.length + 1}
                    className="py-8 text-center text-mansure-dark"
                  >
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredItems.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-mansure-border px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="mansure-pagination-meta">
              Página {currentPage} de {totalPages} ({filteredItems.length}{" "}
              itens)
            </span>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="mansureOutline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="mansureOutline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
