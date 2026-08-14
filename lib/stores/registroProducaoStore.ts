import { create } from "zustand";
import type { ProducaoAmbiente } from "@/lib/producao-config";
import {
  ARCHIVED_ONLY_COLUMN,
  getDefaultVisibleColumns,
} from "@/lib/registro-producao-config";
import type { RecordsFilter } from "@/lib/types";

export type RegistroDensity = "compact" | "normal" | "relaxed";

export interface RegistroProducaoFilter extends RecordsFilter {
  search: string;
}

export type RegistroViewMode = "active" | "archived";

interface RegistroProducaoStore {
  ambiente: ProducaoAmbiente | null;
  initAmbiente: (ambiente: ProducaoAmbiente) => void;

  viewMode: RegistroViewMode;
  setViewMode: (viewMode: RegistroViewMode) => void;

  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  filters: RegistroProducaoFilter;
  debouncedSearch: string;
  setFilters: (filters: RegistroProducaoFilter) => void;
  setDebouncedSearch: (search: string) => void;
  clearFilters: () => void;

  sortBy: { column: string; direction: "asc" | "desc" } | null;
  setSortBy: (sort: { column: string; direction: "asc" | "desc" } | null) => void;

  visibleColumns: string[];
  toggleColumn: (column: string) => void;
  resetColumns: () => void;

  density: RegistroDensity;
  setDensity: (density: RegistroDensity) => void;

  selectedRows: string[];
  selectAllMatching: boolean;
  toggleRowSelection: (id: string) => void;
  toggleAllPageSelection: (ids: string[]) => void;
  setSelectAllMatching: (value: boolean) => void;
  clearSelection: () => void;
}

const defaultFilters = (): RegistroProducaoFilter => ({ search: "" });

export const useRegistroProducaoStore = create<RegistroProducaoStore>((set, get) => ({
  ambiente: null,
  initAmbiente: (ambiente) => {
    const current = get().ambiente;
    if (current === ambiente) return;
    set({
      ambiente,
      viewMode: "active",
      page: 1,
      pageSize: 20,
      filters: defaultFilters(),
      debouncedSearch: "",
      sortBy: null,
      visibleColumns: getDefaultVisibleColumns(ambiente),
      selectedRows: [],
      selectAllMatching: false,
    });
  },

  viewMode: "active",
  setViewMode: (viewMode) =>
    set((state) => {
      let visibleColumns = state.visibleColumns;

      if (viewMode === "archived") {
        if (!visibleColumns.includes(ARCHIVED_ONLY_COLUMN)) {
          visibleColumns = [...visibleColumns, ARCHIVED_ONLY_COLUMN];
        }
      } else {
        visibleColumns = visibleColumns.filter(
          (col) => col !== ARCHIVED_ONLY_COLUMN
        );
      }

      return {
        viewMode,
        page: 1,
        visibleColumns,
        selectAllMatching: false,
        selectedRows: [],
      };
    }),

  page: 1,
  pageSize: 20,
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

  filters: defaultFilters(),
  debouncedSearch: "",
  setFilters: (filters) => set({ filters, page: 1, selectAllMatching: false }),
  setDebouncedSearch: (debouncedSearch) =>
    set((state) => ({
      debouncedSearch,
      filters: { ...state.filters, search: debouncedSearch },
      page: 1,
      selectAllMatching: false,
    })),
  clearFilters: () =>
    set({
      filters: defaultFilters(),
      debouncedSearch: "",
      page: 1,
      selectAllMatching: false,
    }),

  sortBy: null,
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),

  visibleColumns: [],
  toggleColumn: (column) =>
    set((state) => {
      if (column === ARCHIVED_ONLY_COLUMN && state.viewMode === "active") {
        return state;
      }

      return {
        visibleColumns: state.visibleColumns.includes(column)
          ? state.visibleColumns.filter((c) => c !== column)
          : [...state.visibleColumns, column],
      };
    }),
  resetColumns: () => {
    const ambiente = get().ambiente;
    if (!ambiente) return;
    set({ visibleColumns: getDefaultVisibleColumns(ambiente) });
  },

  density: "normal",
  setDensity: (density) => set({ density }),

  selectedRows: [],
  selectAllMatching: false,
  toggleRowSelection: (id) =>
    set((state) => ({
      selectAllMatching: false,
      selectedRows: state.selectedRows.includes(id)
        ? state.selectedRows.filter((rid) => rid !== id)
        : [...state.selectedRows, id],
    })),
  toggleAllPageSelection: (ids) =>
    set((state) => ({
      selectAllMatching: false,
      selectedRows:
        ids.length > 0 && state.selectedRows.length === ids.length ? [] : ids,
    })),
  setSelectAllMatching: (selectAllMatching) =>
    set({ selectAllMatching, selectedRows: selectAllMatching ? [] : get().selectedRows }),
  clearSelection: () => set({ selectedRows: [], selectAllMatching: false }),
}));
