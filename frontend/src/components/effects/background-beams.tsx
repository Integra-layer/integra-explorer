"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundBeamsProps {
  className?: string;
}

const beamPaths = [
  "M-50 0 Q250 150 600 50 T1200 100",
  "M-100 80 Q200 300 500 200 T1300 250",
  "M0 200 Q300 50 600 150 T1100 80",
  "M-80 300 Q150 100 450 250 T1250 180",
  "M50 100 Q350 250 700 100 T1150 300",
];

export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {beamPaths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="url(#beam-gradient)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
            transition={{
              pathLength: {
                duration: 3 + i * 0.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 1,
              },
              opacity: {
                duration: 3 + i * 0.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 1,
              },
              delay: i * 0.8,
            }}
          />
        ))}
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              stopColor="var(--integra-brand-pink)"
              stopOpacity="0"
            />
            <stop
              offset="50%"
              stopColor="var(--integra-brand)"
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor="var(--integra-brand-pink)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
