"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

import "react-day-picker/style.css";

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
      className={cn("p-3 mansure-calendar bg-mansure-light", className)}
      classNames={{
        ...defaultClassNames,
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex flex-col gap-2", defaultClassNames.months),
        month: cn("flex flex-col gap-3", defaultClassNames.month),
        month_caption: cn(
          "flex items-center justify-center px-8 relative",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "text-sm font-semibold capitalize text-mansure-black",
          defaultClassNames.caption_label
        ),
        nav: cn(
          "flex items-center gap-1 absolute inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          defaultClassNames.button_next
        ),
        weekday: cn(
          "w-9 text-xs font-medium text-mansure-dark",
          defaultClassNames.weekday
        ),
        day: cn("relative p-0 text-center", defaultClassNames.day),
        day_button: cn(
          "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-mansure-light aria-selected:bg-mansure-blue aria-selected:text-white aria-selected:hover:bg-mansure-blue/90",
          defaultClassNames.day_button
        ),
        selected: cn(
          "bg-mansure-blue text-white hover:bg-mansure-blue/90",
          defaultClassNames.selected
        ),
        today: cn(
          "bg-mansure-blue/10 text-mansure-blue font-semibold",
          defaultClassNames.today
        ),
        outside: cn(
          "text-mansure-dark/40 aria-selected:text-white/70",
          defaultClassNames.outside
        ),
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
      }}
      {...props}
    />
  );
}

export { Calendar };
