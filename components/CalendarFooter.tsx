"use client";

import { Button } from "@/components/ui/button";

interface CalendarFooterProps {
  onClear?: () => void;
  onToday?: () => void;
  clearLabel?: string;
  todayLabel?: string;
}

export function CalendarFooter({
  onClear,
  onToday,
  clearLabel = "Limpar",
  todayLabel = "Hoje",
}: CalendarFooterProps) {
  if (!onClear && !onToday) return null;

  return (
    <div className="flex items-center justify-between border-t border-mansure-border px-3 py-2">
      {onClear ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-mansure-blue hover:text-mansure-blue/80"
          onClick={onClear}
        >
          {clearLabel}
        </Button>
      ) : (
        <span />
      )}
      {onToday ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-mansure-blue hover:text-mansure-blue/80"
          onClick={onToday}
        >
          {todayLabel}
        </Button>
      ) : null}
    </div>
  );
}
