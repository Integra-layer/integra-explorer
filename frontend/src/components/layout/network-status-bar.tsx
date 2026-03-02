"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { PulseIndicator } from "@/components/effects";
import { getBlocks } from "@/lib/api/blocks";

export function NetworkStatusBar() {
  const { data, isError } = useQuery({
    queryKey: ["blocks", 1, 1],
    queryFn: () => getBlocks({ page: 1, itemsPerPage: 1 }),
    refetchInterval: 10_000,
  });

  const latestBlock = data?.items?.[0]?.number;
  const isHealthy = !isError && latestBlock != null;

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
          <span className="font-mono font-medium text-foreground">
            {latestBlock != null
              ? `#${latestBlock.toLocaleString()}`
              : "..."}
          </span>
        </div>

        {/* Health */}
        <span className="text-muted-foreground/50">|</span>
        <div className="flex items-center gap-1.5">
          <PulseIndicator status={isHealthy ? "online" : "offline"} size="sm" />
          <span className={isHealthy ? "text-integra-success" : "text-integra-error"}>
            {isHealthy ? "Healthy" : "Connecting"}
          </span>
        </div>
      </div>
    </div>
  );
}
