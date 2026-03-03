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
  /** When set, only show transactions where tx.to matches this contract address */
  contractFilter?: boolean;
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

  // Pick icon and color based on classified category
  let icon = <ArrowUpRight className="size-5" />;
  let accentClass = "text-muted-foreground";
  let iconBgClass = "bg-muted text-muted-foreground";

  if (isReceived) {
    icon = <ArrowDownLeft className="size-5" />;
    accentClass = "text-integra-success";
    iconBgClass = "bg-integra-success/10 text-integra-success";
  } else if (classified.category === "contract-creation") {
    icon = <FileCode className="size-5" />;
    iconBgClass = "bg-integra-brand/10 text-integra-brand";
  } else if (classified.category.startsWith("nft-")) {
    icon = <FileCode className="size-5" />;
    iconBgClass = "bg-purple-500/10 text-purple-500";
  } else if (
    classified.category.startsWith("erc20-") &&
    !classified.category.includes("approve")
  ) {
    iconBgClass = "bg-blue-500/10 text-blue-500";
  } else if (classified.category.includes("approve")) {
    iconBgClass = "bg-amber-500/10 text-amber-500";
  }

  // Build description from classified data
  let description = "";
  const counterparty = isReceived ? classified.from : classified.to;

  if (classified.category === "contract-creation") {
    description = "Deployed new contract";
  } else if (classified.category === "native-transfer") {
    description = isReceived
      ? `Received ${classified.value} from`
      : `Sent ${classified.value} to`;
  } else if (classified.category.startsWith("erc20-transfer")) {
    description = isReceived
      ? `Received ${classified.value} from`
      : `Transferred ${classified.value} to`;
  } else if (classified.category.includes("approve")) {
    description = classified.spender
      ? `Approved ${classified.value} for`
      : `Approved on`;
  } else if (classified.category.startsWith("nft-")) {
    description = classified.tokenId
      ? `${isReceived ? "Received" : "Transferred"} NFT #${classified.tokenId} ${isReceived ? "from" : "to"}`
      : `${isReceived ? "Received" : "Transferred"} NFT ${isReceived ? "from" : "to"}`;
  } else {
    description = classified.methodName
      ? `Called ${classified.methodName} on`
      : `Interacted with`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
    >
      <GlassCard className="p-4 transition-colors hover:bg-muted/30">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${accentClass}`}>
                {classified.label}
              </span>
              {classified.tokenInfo && (
                <Badge variant="secondary" className="text-[10px]">
                  {classified.tokenInfo.standard}
                </Badge>
              )}
              {!isSuccess && (
                <Badge variant="destructive" className="text-[10px]">
                  Failed
                </Badge>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {timeAgo(tx.timestamp)}
              </span>
            </div>

            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}{" "}
              {(classified.category.includes("approve")
                ? classified.spender
                : counterparty) && (
                <Link
                  href={`/address/${classified.category.includes("approve") ? classified.spender! : counterparty!}`}
                  className="font-mono text-xs text-integra-brand hover:underline"
                >
                  {truncateAddress(
                    (classified.category.includes("approve")
                      ? classified.spender
                      : counterparty)!,
                  )}
                </Link>
              )}
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <Link
                href={`/transactions/${tx.hash}`}
                className="font-mono text-integra-brand hover:underline"
              >
                {truncateHash(tx.hash)}
              </Link>
              <span className="font-medium">{classified.value}</span>
              {classified.contractAddress &&
                classified.category !== "contract-creation" && (
                  <span className="text-muted-foreground/60">
                    via{" "}
                    <Link
                      href={`/address/${classified.contractAddress}`}
                      className="font-mono text-integra-brand/70 hover:underline"
                    >
                      {truncateAddress(classified.contractAddress)}
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
  const lowerAddr = address.toLowerCase();

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Transaction history for this address
        </caption>
        <thead className="sticky top-0 z-10 border-b border-border/50 bg-muted/80 backdrop-blur-sm">
          <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Tx Hash</th>
            <th className="hidden px-4 py-3 md:table-cell">Method</th>
            <th className="px-4 py-3">Direction</th>
            <th className="px-4 py-3">Counterparty</th>
            <th className="px-4 py-3">Value</th>
            <th className="hidden px-4 py-3 lg:table-cell">Fee</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {transactions.map((tx, i) => {
            const classified = classifyTransaction(tx);
            const isReceived = classified.to?.toLowerCase() === lowerAddr;
            const isSuccess = tx.receipt?.status !== false;
            const counterparty = isReceived ? classified.from : classified.to;
            const fee = formatFee(tx.gasUsed, tx.gasPrice);

            return (
              <motion.tr
                key={tx.hash}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.015 }}
                className="border-l-2 border-transparent transition-all duration-150 hover:border-l-integra-brand/50 hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  {isSuccess ? (
                    <CheckCircle
                      className="size-4 text-integra-success"
                      aria-label="Success"
                    />
                  ) : (
                    <XCircle
                      className="size-4 text-integra-error"
                      aria-label="Failed"
                    />
                  )}
                </td>

                <td className="px-4 py-3">
                  <Link
                    href={`/transactions/${tx.hash}`}
                    className="font-mono text-xs font-medium text-integra-brand hover:underline"
                  >
                    {truncateHash(tx.hash)}
                  </Link>
                </td>

                <td className="hidden px-4 py-3 md:table-cell">
                  <Badge variant="outline" className="text-[10px]">
                    {classified.label}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  {isReceived ? (
                    <Badge className="gap-1 bg-integra-success/10 text-integra-success hover:bg-integra-success/20 text-[10px]">
                      <ArrowDownLeft className="size-3" />
                      IN
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <ArrowUpRight className="size-3" />
                      OUT
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3">
                  {counterparty ? (
                    <Link
                      href={`/address/${counterparty}`}
                      className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                    >
                      {truncateAddress(counterparty)}
                    </Link>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Contract Create
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {classified.value}
                </td>

                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {fee}
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

export function ActivityFeed({ address, contractFilter }: ActivityFeedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAddressTransactions(
    address,
    page,
    ITEMS_PER_PAGE,
  );

  const rawTransactions = data?.items ?? [];
  // When contractFilter is set, only show txs that interact with this contract address
  const transactions = contractFilter
    ? rawTransactions.filter((tx) => {
        const addr = address.toLowerCase();
        return (
          tx.to?.toLowerCase() === addr ||
          tx.from?.toLowerCase() === addr ||
          tx.receipt?.contractAddress?.toLowerCase() === addr
        );
      })
    : rawTransactions;
  const total = contractFilter ? transactions.length : (data?.total ?? 0);
  const hasMore = rawTransactions.length === ITEMS_PER_PAGE;

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
