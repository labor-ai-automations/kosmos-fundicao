"use client";

import {
  AlertTriangle,
  Box,
  Clock,
  Package,
  Wrench,
} from "lucide-react";
import {
  DASHBOARD_AMBIENTES,
  type DashboardAmbienteConfig,
} from "@/lib/dashboard-config";
import { DashboardStatusBadge } from "./DashboardStatusBadge";
import { DashboardInfoTip } from "./DashboardInfoTip";
import { cn } from "@/lib/utils";
import type { ProducaoAmbiente } from "@/lib/producao-config";

const iconByAmbiente = {
  vick: Box,
  coldbox: Package,
  macharia: Wrench,
  refugo: AlertTriangle,
} as const;

interface DashboardAmbienteTabsProps {
  active: ProducaoAmbiente;
}

function tabClassName(isActive: boolean, available: boolean) {
  return cn(
    "relative flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition sm:flex-none sm:px-4",
    isActive &&
      "border-mansure-blue/50 bg-mansure-blue/15 text-mansure-light ring-1 ring-mansure-blue/30",
    !isActive &&
      available &&
      "border-mansure-border/40 bg-mansure-black/20 text-mansure-gray-medium hover:border-mansure-blue/30 hover:text-mansure-light",
    !available &&
      "cursor-not-allowed border-mansure-border/20 bg-mansure-black/10 text-mansure-gray-medium/70"
  );
}

function TabContent({
  ambiente,
  isActive,
}: {
  ambiente: DashboardAmbienteConfig;
  isActive: boolean;
}) {
  const Icon = iconByAmbiente[ambiente.key];

  return (
    <>
      <Icon className="size-4 shrink-0" strokeWidth={2} />
      <span className="truncate">{ambiente.title}</span>
      <DashboardStatusBadge
        status={ambiente.status}
        label={ambiente.statusLabel}
      />
      <DashboardInfoTip
        content={ambiente.tabInfo}
        className="hidden sm:inline-flex"
        iconClassName={cn(
          isActive ? "text-mansure-light/70" : "text-mansure-gray-medium/80"
        )}
      />
    </>
  );
}

function TabButton({
  ambiente,
  isActive,
}: {
  ambiente: DashboardAmbienteConfig;
  isActive: boolean;
}) {
  if (!ambiente.available) {
    return (
      <div
        className={tabClassName(isActive, false)}
        aria-disabled="true"
        role="tab"
      >
        <TabContent ambiente={ambiente} isActive={isActive} />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={tabClassName(isActive, true)}
    >
      <TabContent ambiente={ambiente} isActive={isActive} />
    </button>
  );
}

export function DashboardAmbienteTabs({ active }: DashboardAmbienteTabsProps) {
  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Ambientes de dashboard"
      >
        {DASHBOARD_AMBIENTES.map((ambiente) => (
          <TabButton
            key={ambiente.key}
            ambiente={ambiente}
            isActive={ambiente.key === active}
          />
        ))}
      </div>
      <p className="flex items-start gap-2 text-xs text-mansure-gray-medium">
        <Clock className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        COLDBOX, MACHARIA e REFUGO terão dashboards próprios em breve — por
        enquanto, use o registro de produção de cada ambiente.
      </p>
    </div>
  );
}
