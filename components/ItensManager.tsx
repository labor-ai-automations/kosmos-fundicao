"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createItemColdbox,
  createItemMacharia,
  createItemVick,
  deleteItemColdbox,
  deleteItemMacharia,
  deleteItemVick,
  getItensColdbox,
  getItensMacharia,
  getItensVick,
  importItensColdbox,
  importItensMacharia,
  importItensVick,
  updateItemColdbox,
  updateItemMacharia,
  updateItemVick,
} from "@/lib/api-calls";
import {
  formatSelectorCellValue,
  ITEM_SELECTOR_COLUMNS,
  ITEM_SELECTOR_LABELS,
  itemMatchesSearch,
  type ItemSelectorAmbiente,
  type SelectorItem,
} from "@/lib/item-selector-config";
import type { ItemAmbiente } from "@/lib/types";
import { ProducaoSectionShell } from "@/components/ProducaoSectionShell";
import { CSVUploader } from "@/components/CSVUploader";
import { ItemFormModal } from "@/components/ItemFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 20;

const AMBIENTE_TITLES: Record<ItemAmbiente, string> = {
  vick: "VICK",
  coldbox: "COLDBOX",
  macharia: "MACHARIA",
};

function formatCellValue(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "✓ Sim" : "○ Não";
  }
  return formatSelectorCellValue(value);
}

async function loadItemsByAmbiente(
  ambiente: ItemAmbiente
): Promise<SelectorItem[]> {
  switch (ambiente) {
    case "vick":
      return getItensVick();
    case "coldbox":
      return getItensColdbox();
    case "macharia":
      return getItensMacharia();
  }
}

interface ItensManagerProps {
  ambiente: ItemAmbiente;
}

export function ItensManager({ ambiente }: ItensManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<SelectorItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SelectorItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<SelectorItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const columns = ITEM_SELECTOR_COLUMNS[ambiente as ItemSelectorAmbiente];

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadItemsByAmbiente(ambiente);
      setItems(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar itens"
      );
    } finally {
      setLoading(false);
    }
  }, [ambiente]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => itemMatchesSearch(item, searchQuery, columns)),
    [items, searchQuery, columns]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, ambiente]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  );
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSaveItem = async (data: Record<string, unknown>) => {
    try {
      if (editingItem) {
        switch (ambiente) {
          case "vick":
            await updateItemVick(editingItem.id, data);
            break;
          case "coldbox":
            await updateItemColdbox(editingItem.id, data);
            break;
          case "macharia":
            await updateItemMacharia(editingItem.id, data);
            break;
        }
        toast.success("Item atualizado");
      } else {
        switch (ambiente) {
          case "vick":
            await createItemVick(data as Parameters<typeof createItemVick>[0]);
            break;
          case "coldbox":
            await createItemColdbox(
              data as Parameters<typeof createItemColdbox>[0]
            );
            break;
          case "macharia":
            await createItemMacharia(
              data as Parameters<typeof createItemMacharia>[0]
            );
            break;
        }
        toast.success("Item criado");
      }
      setOpenForm(false);
      setEditingItem(null);
      await loadItems();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar item"
      );
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      switch (ambiente) {
        case "vick":
          await deleteItemVick(deleteItem.id);
          break;
        case "coldbox":
          await deleteItemColdbox(deleteItem.id);
          break;
        case "macharia":
          await deleteItemMacharia(deleteItem.id);
          break;
      }
      toast.success("Item excluído");
      setDeleteItem(null);
      await loadItems();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir item"
      );
    }
  };

  const handleImport = async (
    data: Record<string, unknown>[],
    onProgress: (percent: number) => void
  ) => {
    switch (ambiente) {
      case "vick":
        return importItensVick(data, onProgress);
      case "coldbox":
        return importItensColdbox(data, onProgress);
      case "macharia":
        return importItensMacharia(data, onProgress);
    }
  };

  return (
    <ProducaoSectionShell>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/itens")}
              className="rounded-lg p-2 text-mansure-gray-dark transition hover:bg-mansure-light"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-mansure-black sm:text-3xl">
                Cadastro de Itens
              </h1>
              <p className="text-sm text-mansure-dark">
                {AMBIENTE_TITLES[ambiente]} • CRUD e importação CSV
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-mansure-dark">Total de itens</p>
            <p className="text-2xl font-bold text-mansure-black">
              {items.length}
            </p>
          </div>
        </div>

        <Tabs defaultValue="itens" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 border border-mansure-gray-light bg-mansure-light">
            <TabsTrigger
              value="itens"
              className="data-active:bg-mansure-blue data-active:text-white"
            >
              Itens ({items.length})
            </TabsTrigger>
            <TabsTrigger
              value="importar"
              className="data-active:bg-mansure-blue data-active:text-white"
            >
              Importar CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itens" className="space-y-6">
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex flex-wrap gap-4 pt-6">
                <div className="relative min-w-64 flex-1">
                  <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-mansure-dark" />
                  <Input
                    placeholder="Buscar por código..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 border-mansure-gray-light pl-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setOpenForm(true);
                  }}
                  className="h-11 gap-2 bg-mansure-blue hover:bg-mansure-blue/90"
                >
                  <Plus className="size-4" />
                  Novo Item
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 bg-white shadow-sm">
              <div className="overflow-auto">
                {loading ? (
                  <p className="p-12 text-center text-mansure-dark">
                    Carregando itens...
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
                        {columns.map((col) => (
                          <TableHead
                            key={col}
                            className="font-semibold text-white"
                          >
                            {ITEM_SELECTOR_LABELS[col]}
                          </TableHead>
                        ))}
                        <TableHead className="font-semibold text-white">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length > 0 ? (
                        paginatedItems.map((item) => (
                          <TableRow
                            key={item.id}
                            className="border-mansure-gray-light hover:bg-mansure-light/50"
                          >
                            {columns.map((col) => (
                              <TableCell
                                key={`${item.id}-${col}`}
                                className="text-sm text-mansure-gray-dark"
                              >
                                {formatCellValue(
                                  item[col as keyof SelectorItem]
                                )}
                              </TableCell>
                            ))}
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setOpenForm(true);
                                  }}
                                  className="text-mansure-blue hover:bg-mansure-blue/20"
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteItem(item)}
                                  className="text-red-400 hover:bg-red-500/20"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length + 1}
                            className="py-12 text-center"
                          >
                            <div className="text-mansure-dark">
                              <p className="text-lg font-medium">
                                Nenhum item encontrado
                              </p>
                              <p className="mt-1 text-sm">
                                Crie o primeiro item clicando em &quot;Novo
                                Item&quot;
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mansure-gray-light bg-mansure-light/50 px-6 py-4">
                  <span className="text-sm text-mansure-dark">
                    Página {currentPage} de {totalPages} •{" "}
                    {filteredItems.length} itens
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="border-mansure-gray-light text-mansure-gray-dark"
                    >
                      ← Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="border-mansure-gray-light text-mansure-gray-dark"
                    >
                      Próxima →
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="importar">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-mansure-black">
                  <Package className="size-5 text-mansure-blue" />
                  Importar Itens de CSV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CSVUploader
                  ambiente={ambiente}
                  onImport={async (data, onProgress) => {
                    const count = await handleImport(data, onProgress);
                    await loadItems();
                    return count;
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ItemFormModal
        ambiente={ambiente}
        isOpen={openForm}
        item={editingItem}
        onSave={handleSaveItem}
        onClose={() => {
          setOpenForm(false);
          setEditingItem(null);
        }}
      />

      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="border-mansure-gray-light bg-white">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o item{" "}
              <strong>{deleteItem?.codigo}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProducaoSectionShell>
  );
}
