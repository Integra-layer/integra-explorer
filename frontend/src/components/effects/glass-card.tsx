"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export function GlassCard({
  children,
  className,
  glowOnHover = true,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/20 bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.03]",
        "transition-all duration-300",
        glowOnHover && [
          "hover:shadow-[0_0_30px_rgba(255,109,73,0.06)] hover:border-integra-brand/20",
          "dark:hover:border-integra-brand/30 dark:hover:shadow-[0_0_30px_rgba(255,109,73,0.15)]",
        ],
        className,
      )}
    >
      {children}
    </div>
  );
}
