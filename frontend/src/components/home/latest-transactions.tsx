"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import { getTransactions } from "@/lib/api/transactions";
import {
  truncateHash,
  truncateAddress,
  timeAgo,
  formatTxValue,
} from "@/lib/format";
import { useExplorerReady } from "@/lib/explorer-provider";

export function LatestTransactions() {
  const isReady = useExplorerReady();
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", 1, 6],
    queryFn: () => getTransactions({ page: 1, itemsPerPage: 6 }),
    refetchInterval: 10_000,
    enabled: isReady,
  });

  return (
    <GlassCard className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="size-4 text-integra-brand" />
          <h2 className="text-base font-semibold">Latest Transactions</h2>
          <span className="flex items-center gap-1.5 text-xs text-integra-success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-integra-success/75" />
              <span className="relative inline-flex size-2 rounded-full bg-integra-success" />
            </span>
            Live
          </span>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-integra-brand"
        >
          View All
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Transaction rows */}
      <div className="divide-y divide-border/30">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <SkeletonShimmer className="h-5 w-24" />
              <SkeletonShimmer className="hidden h-4 w-48 sm:block" />
              <div className="ml-auto flex gap-3">
                <SkeletonShimmer className="h-4 w-16" />
                <SkeletonShimmer className="h-4 w-12" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {data?.items.map((tx) => (
              <motion.div
                key={tx.hash}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-l-2 border-transparent px-5 py-3 transition-all duration-150 hover:border-l-integra-brand hover:bg-muted/30"
              >
                {/* Tx hash + method */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/transactions/${tx.hash}`}
                    className="font-mono text-sm font-medium text-integra-brand hover:underline"
                  >
                    {truncateHash(tx.hash)}
                  </Link>
                  {tx.methodDetails?.name && (
                    <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
                      {tx.methodDetails.name}
                    </span>
                  )}
                </div>

                {/* From -> To (hidden on small screens) */}
                <div className="hidden items-center gap-1 font-mono text-xs text-muted-foreground sm:flex">
                  <span>{truncateAddress(tx.from)}</span>
                  <ArrowRight className="size-3 shrink-0" />
                  <span>
                    {tx.to ? truncateAddress(tx.to) : "Contract Create"}
                  </span>
                </div>

                {/* Right side: value + time */}
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs font-medium">
                    {formatTxValue(tx)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(tx.timestamp)}
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
