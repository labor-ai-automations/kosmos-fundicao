"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DecimalInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type" | "inputMode">) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      className={cn("kosmos-input", className)}
      {...props}
    />
  );
}
