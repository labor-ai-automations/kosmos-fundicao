import { cn } from "@/lib/utils";
import type { DashboardStatus } from "@/lib/dashboard-config";

interface DashboardStatusBadgeProps {
  status: DashboardStatus;
  label: string;
  className?: string;
}

export function DashboardStatusBadge({
  status,
  label,
  className,
}: DashboardStatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        status === "beta" &&
          "bg-mansure-warning/20 text-mansure-warning ring-1 ring-mansure-warning/40",
        status === "soon" &&
          "bg-mansure-gray-medium/15 text-mansure-gray-medium ring-1 ring-mansure-gray-medium/30",
        className
      )}
    >
      {label}
    </span>
  );
}
