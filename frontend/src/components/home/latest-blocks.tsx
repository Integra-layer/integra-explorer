"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Box } from "lucide-react";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { getBlocks } from "@/lib/api/blocks";
import { useExplorerReady } from "@/lib/explorer-provider";
import { useValidatorMap } from "@/lib/hooks/use-validators";
import { truncateAddress, timeAgo, formatGas } from "@/lib/format";

export function LatestBlocks() {
  const isReady = useExplorerReady();
  const validatorMap = useValidatorMap();
  const { data, isLoading } = useQuery({
    queryKey: ["blocks", 1, 6],
    queryFn: () => getBlocks({ page: 1, itemsPerPage: 6 }),
    refetchInterval: 5_000,
    enabled: isReady,
  });

  return (
    <GlassCard className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <Box className="size-4 text-integra-brand" />
          <h2 className="text-base font-semibold">Latest Blocks</h2>
          <span className="flex items-center gap-1.5 text-xs text-integra-success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-integra-success/75" />
              <span className="relative inline-flex size-2 rounded-full bg-integra-success" />
            </span>
            Live
          </span>
        </div>
        <Link
          href="/blocks"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-integra-brand"
        >
          View All
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Block rows */}
      <div className="divide-y divide-border/30">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <SkeletonShimmer className="h-5 w-16" />
              <SkeletonShimmer className="h-4 w-14" />
              <SkeletonShimmer className="hidden h-4 w-28 sm:block" />
              <div className="ml-auto flex gap-3">
                <SkeletonShimmer className="h-5 w-12" />
                <SkeletonShimmer className="hidden h-4 w-20 sm:block" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {data?.items.map((block) => (
              <motion.div
                key={block.number}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-l-2 border-transparent px-5 py-3 transition-all duration-150 hover:border-l-integra-brand hover:bg-muted/30"
              >
                {/* Block number */}
                <Link
                  href={`/blocks/${block.number}`}
                  className="font-mono text-sm font-medium text-integra-brand hover:underline"
                >
                  #{block.number.toLocaleString()}
                </Link>

                {/* Relative time */}
                <span className="text-xs text-muted-foreground">
                  {timeAgo(block.timestamp)}
                </span>

                {/* Validator name or truncated address */}
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {validatorMap.get(block.miner?.toLowerCase()) || (
                    <span className="font-mono">
                      {truncateAddress(block.miner)}
                    </span>
                  )}
                </span>

                {/* Right side: tx count + gas */}
                <div className="ml-auto flex items-center gap-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {block.transactionsCount} txs
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {formatGas(block.gasUsed)} gas
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}
