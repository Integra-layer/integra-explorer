"use client";

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GradientButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export function GradientButton({
  children,
  className,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-lg px-6 py-3 font-semibold text-white",
        "transition-all duration-300",
        className,
      )}
      style={{ background: "var(--integra-gradient-button)" }}
      {...props}
    >
      {/* Shimmer overlay */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
        aria-hidden="true"
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// Re-export with shimmer class wrapper
import { forwardRef } from "react";

export const GradientButtonWithShimmer = forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(function GradientButtonWithShimmer({ children, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "gradient-btn-shimmer relative cursor-pointer overflow-hidden rounded-lg px-6 py-3 font-semibold text-white",
        "transition-all duration-300",
        className,
      )}
      style={{ background: "var(--integra-gradient-button)" }}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full opacity-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
});
