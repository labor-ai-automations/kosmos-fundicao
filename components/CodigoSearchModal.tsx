"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
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

interface CodigoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigos: string[];
  onSelect: (codigo: string) => void;
  title?: string;
  loading?: boolean;
}

export function CodigoSearchModal({
  isOpen,
  onClose,
  codigos,
  onSelect,
  title = "Pesquisar código",
  loading = false,
}: CodigoSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCodigo, setFilterCodigo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
    setFilterCodigo("");
    setShowFilters(false);
    setCurrentPage(1);
  }, [isOpen]);

  const filteredCodigos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filter = filterCodigo.trim().toLowerCase();

    return codigos.filter((codigo) => {
      if (query && !codigo.toLowerCase().includes(query)) return false;
      if (filter && !codigo.toLowerCase().includes(filter)) return false;
      return true;
    });
  }, [codigos, searchQuery, filterCodigo]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCodigos.length / ITEMS_PER_PAGE)
  );

  const paginatedCodigos = filteredCodigos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCodigo]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterCodigo("");
    setCurrentPage(1);
  };

  const handleSelect = (codigo: string) => {
    onSelect(codigo);
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
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <CodigoModalSearchInput
              className="flex-1"
              autoFocus
              placeholder="Buscar por código ou dados do item..."
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
              <div>
                <label className="mb-1 block text-xs font-medium text-mansure-dark">
                  Código
                </label>
                <Input
                  placeholder="Filtrar código"
                  value={filterCodigo}
                  onChange={(e) => setFilterCodigo(e.target.value)}
                  className="kosmos-input text-sm"
                />
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
                <TableHead className="whitespace-nowrap font-semibold text-white">
                  Código
                </TableHead>
                <TableHead className="codigo-selector-action-head whitespace-nowrap font-semibold text-white">
                  Ação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="py-8 text-center text-mansure-dark"
                  >
                    Carregando códigos...
                  </TableCell>
                </TableRow>
              ) : paginatedCodigos.length > 0 ? (
                paginatedCodigos.map((codigo) => (
                  <TableRow
                    key={codigo}
                    className="group border-mansure-gray-light hover:bg-mansure-light/50"
                  >
                    <TableCell className="whitespace-nowrap text-sm font-medium text-mansure-gray-dark">
                      {codigo}
                    </TableCell>
                    <TableCell className="codigo-selector-action-cell">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSelect(codigo)}
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
                    colSpan={2}
                    className="py-8 text-center text-mansure-dark"
                  >
                    Nenhum código encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredCodigos.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-mansure-border px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="mansure-pagination-meta">
              Página {currentPage} de {totalPages} ({filteredCodigos.length}{" "}
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
