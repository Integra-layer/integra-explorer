"use client";

import { Badge } from "@/components/ui/badge";
import { PulseIndicator } from "@/components/effects";

export function NetworkStatusBar() {
  return (
    <div className="w-full border-b bg-muted/50 py-1.5">
      <div className="container mx-auto flex items-center justify-center gap-3 px-4 text-xs text-muted-foreground md:justify-start">
        {/* Chain name + ID */}
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">Integra Testnet</span>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            26218
          </Badge>
        </div>

        {/* Block Height — hidden on mobile */}
        <span className="hidden text-muted-foreground/50 md:inline">|</span>
        <div className="hidden items-center gap-1 md:flex">
          <span>Block</span>
          <span className="font-mono font-medium text-foreground">#59,700</span>
        </div>

        {/* Avg Block Time — hidden on mobile */}
        <span className="hidden text-muted-foreground/50 md:inline">|</span>
        <span className="hidden md:inline">~6s avg</span>

        {/* Health */}
        <span className="text-muted-foreground/50">|</span>
        <div className="flex items-center gap-1.5">
          <PulseIndicator status="online" size="sm" />
          <span className="text-integra-success">Healthy</span>
        </div>
      </div>
    </div>
  );
}
