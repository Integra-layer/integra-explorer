"use client";

import { cn } from "@/lib/utils";

type PulseStatus = "online" | "offline" | "warning";
type PulseSize = "sm" | "md" | "lg";

interface PulseIndicatorProps {
  status: PulseStatus;
  className?: string;
  size?: PulseSize;
}

const statusColors: Record<PulseStatus, string> = {
  online: "bg-integra-success",
  offline: "bg-integra-danger",
  warning: "bg-integra-warning",
};

const statusRingColors: Record<PulseStatus, string> = {
  online: "bg-integra-success/40",
  offline: "bg-integra-danger/40",
  warning: "bg-integra-warning/40",
};

const sizeMap: Record<PulseSize, { dot: string; ring: string }> = {
  sm: { dot: "h-2 w-2", ring: "h-2 w-2" },
  md: { dot: "h-3 w-3", ring: "h-3 w-3" },
  lg: { dot: "h-4 w-4", ring: "h-4 w-4" },
};

export function PulseIndicator({
  status,
  className,
  size = "md",
}: PulseIndicatorProps) {
  return (
    <span className={cn("relative inline-flex", className)}>
      {/* Pulse ring */}
      <span
        className={cn(
          "absolute inline-flex animate-ping rounded-full opacity-75",
          sizeMap[size].ring,
          statusRingColors[status],
        )}
      />
      {/* Solid dot */}
      <span
        className={cn(
          "relative inline-flex rounded-full",
          sizeMap[size].dot,
          statusColors[status],
        )}
      />
    </span>
  );
}
