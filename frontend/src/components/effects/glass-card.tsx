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
        "rounded-xl border border-white/20 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
        "transition-shadow duration-300",
        glowOnHover &&
          "dark:hover:border-[var(--integra-brand)]/30 dark:hover:shadow-[0_0_20px_rgba(255,109,73,0.15)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
