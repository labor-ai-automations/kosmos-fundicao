"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type DayPickerProps,
} from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import "react-day-picker/style.css";

export const calendarRootClassName = cn(
  "mansure-calendar bg-mansure-light p-3",
  "[--rdp-accent-color:var(--mansure-blue)]",
  "[--rdp-accent-background-color:color-mix(in_srgb,var(--mansure-blue)_14%,white)]",
  "[--rdp-range_middle-color:var(--mansure-gray-dark)]",
  "[--rdp-day-height:2.25rem] [--rdp-day-width:2.25rem]",
  "[--rdp-day_button-height:2.25rem] [--rdp-day_button-width:2.25rem]",
  "[--rdp-day_button-border-radius:0.5rem]",
  "[--rdp-months-gap:1.5rem]"
);

export const calendarPopoverClassName =
  "w-auto overflow-hidden rounded-lg border border-mansure-border bg-mansure-light p-0 shadow-md";

function CalendarDayButton({
  day,
  modifiers,
  className,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSingleSelected =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      data-single={isSingleSelected || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-mansure-hover",
        "data-[single=true]:bg-mansure-blue data-[single=true]:text-white data-[single=true]:hover:bg-mansure-blue/90",
        "data-[range-start=true]:rounded-r-none data-[range-start=true]:bg-mansure-blue data-[range-start=true]:text-white data-[range-start=true]:hover:bg-mansure-blue/90",
        "data-[range-end=true]:rounded-l-none data-[range-end=true]:bg-mansure-blue data-[range-end=true]:text-white data-[range-end=true]:hover:bg-mansure-blue/90",
        "data-[range-start=true][data-range-end=true]:rounded-lg",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-mansure-blue/15 data-[range-middle=true]:text-mansure-gray-dark data-[range-middle=true]:hover:bg-mansure-blue/20",
        modifiers.today &&
          !modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle &&
          "border border-mansure-blue/40 bg-mansure-blue/10 font-semibold text-mansure-blue",
        modifiers.outside && "text-mansure-gray-medium/60",
        modifiers.disabled && "pointer-events-none opacity-40",
        className
      )}
    />
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn(calendarRootClassName, className)}
      classNames={{
        ...defaultClassNames,
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-row flex-wrap gap-6",
          defaultClassNames.months
        ),
        month: cn("flex flex-col gap-3", defaultClassNames.month),
        month_caption: cn(
          "relative flex h-9 items-center justify-center px-8",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "text-sm font-semibold capitalize text-mansure-black",
          defaultClassNames.caption_label
        ),
        nav: cn(
          "absolute inset-x-0 flex items-center justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-80 hover:opacity-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-80 hover:opacity-100",
          defaultClassNames.button_next
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-9 text-xs font-medium text-mansure-gray-medium",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        day: cn("relative p-0 text-center", defaultClassNames.day),
        day_button: cn(defaultClassNames.day_button),
        range_start: cn("rounded-l-lg", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-lg", defaultClassNames.range_end),
        selected: cn(defaultClassNames.selected),
        today: cn(defaultClassNames.today),
        outside: cn("opacity-60", defaultClassNames.outside),
        disabled: cn("opacity-40", defaultClassNames.disabled),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
