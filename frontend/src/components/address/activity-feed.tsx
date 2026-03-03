"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileCode,
  List,
  LayoutGrid,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import {
  truncateAddress,
  truncateHash,
  timeAgo,
  formatTxValue,
  formatFee,
} from "@/lib/format";
import { classifyTransaction } from "@/lib/tx-classifier";
import { useAddressTransactions } from "@/lib/hooks/use-transactions";
import type { Transaction } from "@/lib/api/types";

interface ActivityFeedProps {
  address: string;
}

type ViewMode = "feed" | "table";

// ---------------------------------------------------------------------------
// Feed card
// ---------------------------------------------------------------------------

function ActivityCard({
  tx,
  address,
  index,
}: {
  tx: Transaction;
  address: string;
  index: number;
}) {
  const classified = classifyTransaction(tx);
  const lowerAddr = address.toLowerCase();
  const isReceived = classified.to?.toLowerCase() === lowerAddr;
  const isSuccess = tx.receipt?.status !== false;

  // Icon + color by category
  let icon = <ArrowUpRight className="size-4" />;
  let iconBgClass = "bg-muted text-muted-foreground";

  if (isReceived) {
    icon = <ArrowDownLeft className="size-4" />;
    iconBgClass = "bg-integra-success/10 text-integra-success";
  } else if (classified.category === "contract-creation") {
    icon = <FileCode className="size-4" />;
    iconBgClass = "bg-integra-brand/10 text-integra-brand";
  } else if (classified.category.startsWith("nft-")) {
    icon = <FileCode className="size-4" />;
    iconBgClass = "bg-purple-500/10 text-purple-500";
  } else if (
    classified.category.startsWith("erc20-") &&
    !classified.category.includes("approve")
  ) {
    iconBgClass = "bg-blue-500/10 text-blue-500";
  } else if (classified.category.includes("approve")) {
    iconBgClass = "bg-amber-500/10 text-amber-500";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.015 }}
    >
      <GlassCard className="px-4 py-3 transition-colors hover:bg-muted/30">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}
          >
            {icon}
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Row 1: Label + badges + time */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {classified.label}
              </span>
              {classified.tokenInfo && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {classified.tokenInfo.standard}
                </Badge>
              )}
              {!isSuccess && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  Failed
                </Badge>
              )}
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {timeAgo(tx.timestamp)}
              </span>
            </div>

            {/* Row 2: From → Amount → To */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
              {/* From */}
              <Link
                href={`/address/${classified.from}`}
                className="font-mono text-muted-foreground hover:text-integra-brand hover:underline"
              >
                {truncateAddress(classified.from)}
              </Link>

              {/* Arrow + Amount */}
              <span className="text-muted-foreground/50">&rarr;</span>
              <span className="font-semibold text-foreground">
                {classified.value}
              </span>
              <span className="text-muted-foreground/50">&rarr;</span>

              {/* To */}
              {classified.to ? (
                <Link
                  href={`/address/${classified.to}`}
                  className="font-mono text-muted-foreground hover:text-integra-brand hover:underline"
                >
                  {truncateAddress(classified.to)}
                </Link>
              ) : classified.category === "contract-creation" ? (
                <span className="text-muted-foreground italic">
                  New Contract
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>

            {/* Row 3: Tx hash + Contract info */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70">
              <Link
                href={`/transactions/${tx.hash}`}
                className="font-mono hover:text-integra-brand hover:underline"
              >
                {truncateHash(tx.hash)}
              </Link>

              {/* Contract with name/symbol */}
              {classified.contractAddress &&
                classified.category !== "contract-creation" && (
                  <span className="flex items-center gap-1">
                    <FileCode className="size-3" />
                    <Link
                      href={`/address/${classified.contractAddress}`}
                      className="font-mono hover:text-integra-brand hover:underline"
                    >
                      {classified.tokenInfo
                        ? `${classified.tokenInfo.name} (${classified.tokenInfo.symbol})`
                        : truncateAddress(classified.contractAddress)}
                    </Link>
                  </span>
                )}

              {/* NFT token ID */}
              {classified.tokenId && (
                <span className="font-mono">Token #{classified.tokenId}</span>
              )}

              {/* Spender for approvals */}
              {classified.spender && (
                <span className="flex items-center gap-1">
                  Spender:{" "}
                  <Link
                    href={`/address/${classified.spender}`}
                    className="font-mono hover:text-integra-brand hover:underline"
                  >
                    {truncateAddress(classified.spender)}
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Table view
// ---------------------------------------------------------------------------

function ActivityTable({
  transactions,
  address,
}: {
  transactions: Transaction[];
  address: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Transaction history for this address
        </caption>
        <thead className="sticky top-0 z-10 border-b border-border/50 bg-muted/80 backdrop-blur-sm">
          <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="w-8 px-3 py-3" />
            <th className="px-3 py-3">Tx Hash</th>
            <th className="hidden px-3 py-3 md:table-cell">Type</th>
            <th className="px-3 py-3">From</th>
            <th className="px-3 py-3">To</th>
            <th className="px-3 py-3">Value</th>
            <th className="hidden px-3 py-3 lg:table-cell">Contract</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {transactions.map((tx, i) => {
            const classified = classifyTransaction(tx);
            const isSuccess = tx.receipt?.status !== false;

            return (
              <motion.tr
                key={tx.hash}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.015 }}
                className="border-l-2 border-transparent transition-all duration-150 hover:border-l-integra-brand/50 hover:bg-muted/30"
              >
                {/* Status */}
                <td className="px-3 py-2.5">
                  {isSuccess ? (
                    <CheckCircle
                      className="size-3.5 text-integra-success"
                      aria-label="Success"
                    />
                  ) : (
                    <XCircle
                      className="size-3.5 text-integra-error"
                      aria-label="Failed"
                    />
                  )}
                </td>

                {/* Hash */}
                <td className="px-3 py-2.5">
                  <Link
                    href={`/transactions/${tx.hash}`}
                    className="font-mono text-xs text-integra-brand hover:underline"
                  >
                    {truncateHash(tx.hash)}
                  </Link>
                </td>

                {/* Type */}
                <td className="hidden px-3 py-2.5 md:table-cell">
                  <Badge variant="outline" className="text-[10px]">
                    {classified.label}
                  </Badge>
                </td>

                {/* From */}
                <td className="px-3 py-2.5">
                  <Link
                    href={`/address/${classified.from}`}
                    className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                  >
                    {truncateAddress(classified.from)}
                  </Link>
                </td>

                {/* To */}
                <td className="px-3 py-2.5">
                  {classified.to ? (
                    <Link
                      href={`/address/${classified.to}`}
                      className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                    >
                      {truncateAddress(classified.to)}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Contract Create
                    </span>
                  )}
                </td>

                {/* Value */}
                <td className="px-3 py-2.5 text-xs font-medium text-foreground">
                  {classified.value}
                </td>

                {/* Contract */}
                <td className="hidden px-3 py-2.5 lg:table-cell">
                  {classified.contractAddress &&
                  classified.category !== "contract-creation" ? (
                    <Link
                      href={`/address/${classified.contractAddress}`}
                      className="text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                    >
                      {classified.tokenInfo
                        ? `${classified.tokenInfo.name} (${classified.tokenInfo.symbol})`
                        : truncateAddress(classified.contractAddress)}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No transactions found
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <GlassCard key={i} className="p-4">
          <div className="flex items-start gap-3">
            <SkeletonShimmer className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonShimmer className="h-4 w-32" />
              <SkeletonShimmer className="h-3 w-48" />
              <SkeletonShimmer className="h-3 w-40" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 25;

export function ActivityFeed({ address }: ActivityFeedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAddressTransactions(
    address,
    page,
    ITEMS_PER_PAGE,
  );

  // The API already filters by address (returns txs where address is from or to),
  // so no client-side filtering is needed.
  const transactions = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;
  const hasMore = page < totalPages;

  return (
    <div className="space-y-4">
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading transactions..."
            : total > 0
              ? `${total.toLocaleString()} transaction${total !== 1 ? "s" : ""} total`
              : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
        </p>

        <div className="flex items-center gap-1 rounded-lg border border-border/50 p-0.5">
          <Button
            variant={viewMode === "feed" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => setViewMode("feed")}
          >
            <LayoutGrid className="size-3.5" />
            Feed
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => setViewMode("table")}
          >
            <List className="size-3.5" />
            Table
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <FeedSkeleton />
      ) : transactions.length === 0 ? (
        <GlassCard className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">
            No transactions found for this address
          </p>
        </GlassCard>
      ) : viewMode === "feed" ? (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <ActivityCard key={tx.hash} tx={tx} address={address} index={i} />
          ))}
        </div>
      ) : (
        <ActivityTable transactions={transactions} address={address} />
      )}

      {/* Pagination */}
      {!isLoading && transactions.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">Page {page}</span>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
