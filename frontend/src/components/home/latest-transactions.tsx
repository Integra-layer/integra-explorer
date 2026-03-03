"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowRightLeft, MoveRight } from "lucide-react";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { getTransactions } from "@/lib/api/transactions";
import {
  truncateHash,
  truncateAddress,
  timeAgo,
} from "@/lib/format";
import { classifyTransaction } from "@/lib/tx-classifier";
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
            <div key={i} className="space-y-2 px-5 py-3">
              <div className="flex items-center gap-3">
                <SkeletonShimmer className="h-5 w-28" />
                <SkeletonShimmer className="h-4 w-16" />
                <div className="ml-auto">
                  <SkeletonShimmer className="h-5 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SkeletonShimmer className="h-3 w-40" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {data?.items.map((tx) => {
              const classified = classifyTransaction(tx);
              const isToken = !!classified.tokenInfo;

              return (
                <motion.div
                  key={tx.hash}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25 }}
                  className="border-l-2 border-transparent px-5 py-3 transition-all duration-150 hover:border-l-integra-brand hover:bg-muted/30"
                >
                  {/* Row 1: Hash + method + amount */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/transactions/${tx.hash}`}
                      className="font-mono text-sm font-medium text-integra-brand hover:underline"
                    >
                      {truncateHash(tx.hash)}
                    </Link>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium"
                    >
                      {classified.label}
                    </Badge>
                    <div className="ml-auto flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${isToken ? "text-integra-brand" : ""}`}
                      >
                        {classified.value}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: From -> To + time */}
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-mono">
                      {truncateAddress(tx.from)}
                    </span>
                    <MoveRight className="size-3 shrink-0" />
                    <span className="font-mono">
                      {classified.to
                        ? truncateAddress(classified.to)
                        : "Contract Create"}
                    </span>
                    <span className="ml-auto shrink-0">
                      {timeAgo(tx.timestamp)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}
