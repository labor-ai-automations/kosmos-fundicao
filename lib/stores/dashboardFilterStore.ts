import { create } from "zustand";
import { startOfDay, subDays } from "date-fns";

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  tipo: "all" | "normal" | "manual" | "meia_placa";
  setup: "all" | "true" | "false";
  codigo: string;
  graphType: "day" | "week";
  page: number;
  limit: number;
}

interface DashboardFilterStore {
  filters: DashboardFilters;
  setQuickFilter: (filter: "hoje" | "semana" | "mes" | "30d" | "custom") => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  setTipo: (tipo: DashboardFilters["tipo"]) => void;
  setSetup: (setup: DashboardFilters["setup"]) => void;
  setCodigo: (codigo: string) => void;
  setGraphType: (graphType: DashboardFilters["graphType"]) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

const today = startOfDay(new Date());

const defaultFilters: DashboardFilters = {
  startDate: startOfDay(subDays(today, 7)),
  endDate: today,
  tipo: "all",
  setup: "all",
  codigo: "",
  graphType: "day",
  page: 1,
  limit: 20,
};

export const useDashboardFilterStore = create<DashboardFilterStore>((set) => ({
  filters: defaultFilters,

  setQuickFilter: (filter) =>
    set((state) => {
      const endDate = startOfDay(new Date());
      let startDate: Date;

      switch (filter) {
        case "hoje":
          startDate = endDate;
          break;
        case "semana":
          startDate = startOfDay(subDays(endDate, 7));
          break;
        case "mes":
          startDate = startOfDay(subDays(endDate, 30));
          break;
        case "30d":
          startDate = startOfDay(subDays(endDate, 30));
          break;
        default:
          return state;
      }

      return {
        filters: { ...state.filters, startDate, endDate, page: 1 },
      };
    }),

  setDateRange: (startDate, endDate) =>
    set((state) => ({
      filters: {
        ...state.filters,
        startDate: startOfDay(startDate),
        endDate: startOfDay(endDate),
        page: 1,
      },
    })),

  setTipo: (tipo) =>
    set((state) => ({
      filters: { ...state.filters, tipo, page: 1 },
    })),

  setSetup: (setup) =>
    set((state) => ({
      filters: { ...state.filters, setup, page: 1 },
    })),

  setCodigo: (codigo) =>
    set((state) => ({
      filters: { ...state.filters, codigo, page: 1 },
    })),

  setGraphType: (graphType) =>
    set((state) => ({
      filters: { ...state.filters, graphType },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),

  resetFilters: () =>
    set({
      filters: {
        ...defaultFilters,
        startDate: startOfDay(subDays(startOfDay(new Date()), 7)),
        endDate: startOfDay(new Date()),
      },
    }),
}));
