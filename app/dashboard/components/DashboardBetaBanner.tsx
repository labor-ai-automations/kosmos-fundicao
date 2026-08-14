import { AlertTriangle } from "lucide-react";
import { getDashboardAmbiente } from "@/lib/dashboard-config";
import type { ProducaoAmbiente } from "@/lib/producao-config";

interface DashboardBetaBannerProps {
  ambiente: ProducaoAmbiente;
}

export function DashboardBetaBanner({ ambiente }: DashboardBetaBannerProps) {
  const config = getDashboardAmbiente(ambiente);

  if (!config.visibleNotice) {
    return null;
  }

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-mansure-warning/35 bg-mansure-warning/10 px-4 py-3"
    >
      <AlertTriangle
        className="mt-0.5 size-5 shrink-0 text-mansure-warning"
        strokeWidth={2}
      />
      <div>
        <p className="text-sm font-semibold text-mansure-light">
          Dashboard {config.title} — {config.statusLabel}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-mansure-gray-medium">
          {config.visibleNotice}
        </p>
      </div>
    </div>
  );
}
