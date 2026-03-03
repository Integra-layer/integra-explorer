"use client";

import { cn } from "@/lib/utils";

interface SkeletonShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function SkeletonShimmer({
  className,
  width,
  height,
}: SkeletonShimmerProps) {
  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-md bg-muted",
          className,
        )}
        style={{ width, height }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>
    </>
  );
}
