"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { DashboardInfoTip } from "./DashboardInfoTip";

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  infoTip?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  bgColor?: string;
  textColor?: string;
}

export function DashboardKPICard({
  title,
  value,
  unit,
  icon,
  infoTip,
  trend = "stable",
  trendValue = 0,
  bgColor = "bg-mansure-blue",
  textColor = "text-white",
}: DashboardKPICardProps) {
  return (
    <Card className={`${bgColor} ${textColor} overflow-visible rounded-lg p-6 shadow-lg`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-1.5">
            <p className="text-sm font-medium opacity-90">{title}</p>
            {infoTip && (
              <DashboardInfoTip
                content={infoTip}
                iconClassName="text-white/75 hover:text-white"
              />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{value}</span>
            {unit && <span className="text-sm opacity-80">{unit}</span>}
          </div>

          {trendValue !== 0 && (
            <div className="mt-3 flex items-center gap-1">
              {trend === "up" && (
                <>
                  <ArrowUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">
                    +{trendValue}%
                  </span>
                </>
              )}
              {trend === "down" && (
                <>
                  <ArrowDown className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400">
                    -{trendValue}%
                  </span>
                </>
              )}
              {trend === "stable" && (
                <>
                  <Minus className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">
                    Estável
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
          {icon}
        </div>
      </div>
    </Card>
  );
}
