"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps {
  className?: string;
  dotColor?: string;
}

export function DotPattern({
  className,
  dotColor = "var(--integra-brand)",
}: DotPatternProps) {
  const id = useId();
  const patternId = `dot-pattern-${id}`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-15",
        className,
      )}
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill={dotColor}>
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="4s"
                begin={`${Math.random() * 4}s`}
                repeatCount="indefinite"
              />
            </circle>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
