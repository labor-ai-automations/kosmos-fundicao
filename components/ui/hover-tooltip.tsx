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
import { cn } from "@/lib/utils";

const GAP = 8;
const VIEWPORT_PADDING = 12;
const DEFAULT_WIDTH = 256;

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  side?: "top" | "bottom" | "auto";
}

interface TooltipPosition {
  top: number;
  left: number;
  transform: string;
}

export function HoverTooltip({
  children,
  content,
  className,
  side = "top",
}: HoverTooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    transform: "translate(-50%, -100%)",
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? DEFAULT_WIDTH;
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 72;

    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;

    let resolvedSide: "top" | "bottom";
    if (side === "auto") {
      if (spaceAbove >= tooltipHeight + GAP) {
        resolvedSide = "top";
      } else if (spaceBelow >= tooltipHeight + GAP) {
        resolvedSide = "bottom";
      } else {
        resolvedSide = spaceAbove >= spaceBelow ? "top" : "bottom";
      }
    } else {
      resolvedSide = side;
    }

    const centerX = rect.left + rect.width / 2;
    const halfWidth = tooltipWidth / 2;
    let left = centerX;
    let transformX = "-50%";

    if (centerX + halfWidth > window.innerWidth - VIEWPORT_PADDING) {
      left = rect.right;
      transformX = "-100%";
    } else if (centerX - halfWidth < VIEWPORT_PADDING) {
      left = rect.left;
      transformX = "0";
    }

    const top =
      resolvedSide === "bottom" ? rect.bottom + GAP : rect.top - GAP;
    const transformY = resolvedSide === "bottom" ? "0" : "-100%";

    setPosition({
      top,
      left,
      transform: `translate(${transformX}, ${transformY})`,
    });
  }, [side]);

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
        className={cn("inline-flex", className)}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-[9999] w-64 max-w-[calc(100vw-24px)] rounded-lg border border-mansure-border bg-mansure-black px-3 py-2 text-left text-xs leading-relaxed text-mansure-light shadow-lg"
            style={{
              left: position.left,
              top: position.top,
              transform: position.transform,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
