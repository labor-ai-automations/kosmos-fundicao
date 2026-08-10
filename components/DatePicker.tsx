"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { formatDateDisplay, formatDateForDb } from "@/lib/auth";
import { parseDbDate, todayDbString } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  disabled,
  className,
  placeholder = "Selecione a data",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDbDate(value);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(formatDateForDb(date));
      setOpen(false);
      onBlur?.();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "kosmos-input flex h-11 w-full items-center justify-between px-3 text-left font-normal",
          !value && "text-mansure-dark",
          className
        )}
      >
        <span>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-mansure-blue" />
      </PopoverTrigger>
      <PopoverContent className="mansure-calendar w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          className="mansure-calendar"
        />
        <div className="flex items-center justify-between border-t border-mansure-border px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-mansure-blue hover:text-mansure-blue/80"
            onClick={() => {
              onChange("");
              setOpen(false);
              onBlur?.();
            }}
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-mansure-blue hover:text-mansure-blue/80"
            onClick={() => {
              onChange(todayDbString());
              setOpen(false);
              onBlur?.();
            }}
          >
            Hoje
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
