"use client";

import { useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, CalendarRange, Clock, Timer } from "lucide-react";
import { formatDateForDb } from "@/lib/auth";
import { useDashboardFilterStore } from "@/lib/stores/dashboardFilterStore";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  calendarPopoverClassName,
} from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DashboardDateRangePicker() {
  const { filters, setDateRange, setQuickFilter } = useDashboardFilterStore();
  const [open, setOpen] = useState(false);

  const todayStr = formatDateForDb(new Date());
  const isHoje =
    formatDateForDb(filters.startDate) === todayStr &&
    formatDateForDb(filters.endDate) === todayStr;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setQuickFilter("hoje")}
          variant={isHoje ? "mansurePrimary" : "mansureOutline"}
          className="gap-2"
        >
          <CalendarDays className="size-4" />
          Hoje
        </Button>

        <Button
          onClick={() => setQuickFilter("semana")}
          variant="mansureOutline"
          className="gap-2"
        >
          <CalendarRange className="size-4" />
          Esta Semana
        </Button>

        <Button
          onClick={() => setQuickFilter("mes")}
          variant="mansureOutline"
          className="gap-2"
        >
          <Clock className="size-4" />
          Este Mês
        </Button>

        <Button
          onClick={() => setQuickFilter("30d")}
          variant="mansureOutline"
          className="gap-2"
        >
          <Timer className="size-4" />
          30 Dias
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="ml-auto inline-flex h-8 items-center gap-2 rounded-lg border border-mansure-border bg-mansure-light px-3 text-sm font-medium text-mansure-black hover:bg-mansure-hover">
            <CalendarRange className="size-4 text-mansure-blue" />
            {format(filters.startDate, "dd/MM/yy", { locale: ptBR })} —{" "}
            {format(filters.endDate, "dd/MM/yy", { locale: ptBR })}
          </PopoverTrigger>
          <PopoverContent className={calendarPopoverClassName} align="end">
            <Calendar
              mode="range"
              selected={{ from: filters.startDate, to: filters.endDate }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange(range.from, range.to);
                  setOpen(false);
                } else if (range?.from) {
                  setDateRange(range.from, range.from);
                }
              }}
              defaultMonth={filters.startDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-lg border border-mansure-gray-light bg-mansure-hover p-3">
        <p className="text-xs text-mansure-gray-medium">Período selecionado</p>
        <p className="text-sm font-semibold text-mansure-black">
          {format(filters.startDate, "dd MMM yyyy", { locale: ptBR })} até{" "}
          {format(filters.endDate, "dd MMM yyyy", { locale: ptBR })} (
          {differenceInCalendarDays(filters.endDate, filters.startDate) + 1}{" "}
          dias)
        </p>
      </div>
    </div>
  );
}
