"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLTIP_WIDTH = 256;
const GAP = 8;
const VIEWPORT_PADDING = 12;

interface DashboardInfoTipProps {
  content: string;
  className?: string;
  iconClassName?: string;
  side?: "top" | "bottom" | "auto";
}

type ResolvedSide = "top" | "bottom";

interface TooltipPosition {
  top: number;
  left: number;
  side: ResolvedSide;
}

function clampHorizontal(left: number) {
  const halfWidth = TOOLTIP_WIDTH / 2;
  const min = VIEWPORT_PADDING + halfWidth;
  const max = window.innerWidth - VIEWPORT_PADDING - halfWidth;
  return Math.max(min, Math.min(max, left));
}

export function DashboardInfoTip({
  content,
  className,
  iconClassName,
  side = "auto",
}: DashboardInfoTipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    side: "bottom",
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 72;
    const centerX = clampHorizontal(rect.left + rect.width / 2);

    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;

    let resolvedSide: ResolvedSide;

    if (side === "auto") {
      if (spaceBelow >= tooltipHeight + GAP) {
        resolvedSide = "bottom";
      } else if (spaceAbove >= tooltipHeight + GAP) {
        resolvedSide = "top";
      } else {
        resolvedSide = spaceBelow >= spaceAbove ? "bottom" : "top";
      }
    } else if (side === "top") {
      resolvedSide =
        spaceAbove >= tooltipHeight + GAP || spaceAbove >= spaceBelow
          ? "top"
          : "bottom";
    } else {
      resolvedSide =
        spaceBelow >= tooltipHeight + GAP || spaceBelow >= spaceAbove
          ? "bottom"
          : "top";
    }

    const top =
      resolvedSide === "bottom" ? rect.bottom + GAP : rect.top - GAP;

    setPosition({ top, left: centerX, side: resolvedSide });
  }, [side]);

  const show = useCallback(() => {
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, content, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updatePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn("inline-flex shrink-0", className)}
        tabIndex={0}
        role="button"
        aria-label="Mais informações"
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <Info
          className={cn(
            "size-4 cursor-help text-mansure-gray-medium transition-colors hover:text-mansure-blue focus:text-mansure-blue",
            iconClassName
          )}
          strokeWidth={2}
        />
      </span>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-[9999] w-64 max-w-[calc(100vw-24px)] rounded-lg border border-mansure-border bg-mansure-light p-3 text-left text-xs leading-relaxed text-mansure-black shadow-lg"
            style={{
              left: position.left,
              top: position.top,
              transform:
                position.side === "bottom"
                  ? "translateX(-50%)"
                  : "translate(-50%, -100%)",
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}

interface DashboardVisibleNoticeProps {
  children: ReactNode;
  className?: string;
}

export function DashboardVisibleNotice({
  children,
  className,
}: DashboardVisibleNoticeProps) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-mansure-gray-medium",
        className
      )}
    >
      {children}
    </p>
  );
}

interface DashboardSectionHeaderProps {
  title: string;
  visibleNotice?: string;
  hoverInfo?: string;
  icon?: ReactNode;
  titleClassName?: string;
}

export function DashboardSectionHeader({
  title,
  visibleNotice,
  hoverInfo,
  icon,
  titleClassName,
}: DashboardSectionHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3
          className={cn(
            "text-lg font-bold text-mansure-black",
            titleClassName
          )}
        >
          {title}
        </h3>
        {hoverInfo && (
          <DashboardInfoTip
            content={hoverInfo}
            iconClassName="text-mansure-gray-medium"
          />
        )}
      </div>
      {visibleNotice && (
        <DashboardVisibleNotice className="mt-1">
          {visibleNotice}
        </DashboardVisibleNotice>
      )}
    </div>
  );
}
