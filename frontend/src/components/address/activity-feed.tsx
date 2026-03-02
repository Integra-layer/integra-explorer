"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileCode,
  List,
  LayoutGrid,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import {
  truncateAddress,
  truncateHash,
  formatIRL,
  timeAgo,
  parseErc20Amount,
  formatTokenAmount,
} from "@/lib/format";
import { fetchApi } from "@/lib/api/client";
import { findKnownToken } from "@/lib/api/tokens";
import type { Transaction, PaginatedResponse } from "@/lib/api/types";

function formatTxValue(tx: Transaction): string {
  if (
    tx.methodDetails?.name === "transfer" &&
    tx.value === "0" &&
    tx.to &&
    tx.data
  ) {
    const token = findKnownToken(tx.to);
    if (token) {
      const amount = parseErc20Amount(tx.data);
      if (amount !== null) {
        return formatTokenAmount(amount, token.decimals, token.symbol);
      }
    }
  }
  return formatIRL(tx.value);
}

interface ActivityFeedProps {
  address: string;
}

type ViewMode = "feed" | "table";

function useAddressTransactions(address: string) {
  return useQuery({
    queryKey: ["address-transactions", address],
    queryFn: () =>
      fetchApi<PaginatedResponse<Transaction>>("/transactions", {
        address,
        itemsPerPage: "50",
        order: "DESC",
      }),
    enabled: !!address,
  });
}

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
  const lowerAddr = address.toLowerCase();
  const isReceived = tx.to?.toLowerCase() === lowerAddr;
  const isSent = tx.from.toLowerCase() === lowerAddr;
  const isContractCall = tx.data && tx.data !== "0x" && tx.data.length > 2;

  const isSuccess = tx.receipt?.status !== false;

  let icon = <ArrowUpRight className="size-5" />;
  let label = "Sent";
  let description = "";
  let accentClass = "text-muted-foreground";

  if (isReceived && !isSent) {
    icon = <ArrowDownLeft className="size-5" />;
    label = "Received";
    description = `Received ${formatTxValue(tx)} from`;
    accentClass = "text-integra-success";
  } else if (isSent && !isReceived) {
    if (isContractCall) {
      icon = <FileCode className="size-5" />;
      label = tx.methodDetails?.name ?? "Contract Call";
      description = `Called ${tx.methodDetails?.name ?? "function"} on`;
    } else {
      label = "Sent";
      description = `Sent ${formatTxValue(tx)} to`;
    }
  } else {
    // Self-transfer
    label = "Self";
    description = `Self-transfer of ${formatTxValue(tx)}`;
  }

  const counterparty = isReceived ? tx.from : tx.to;

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
            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${
              isReceived
                ? "bg-integra-success/10 text-integra-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${accentClass}`}>
                {label}
              </span>
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
              {counterparty && (
                <Link
                  href={`/address/${counterparty}`}
                  className="font-mono text-xs text-integra-brand hover:underline"
                >
                  {truncateAddress(counterparty)}
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
              <span className="font-medium">{formatTxValue(tx)}</span>
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
            const isReceived = tx.to?.toLowerCase() === lowerAddr;
            const isSuccess = tx.receipt?.status !== false;
            const counterparty = isReceived ? tx.from : tx.to;
            const fee =
              tx.gasUsed && tx.gasPrice
                ? (Number(tx.gasUsed) * Number(tx.gasPrice)).toString()
                : "0";

            return (
              <motion.tr
                key={tx.hash}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.015 }}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  {isSuccess ? (
                    <CheckCircle className="size-4 text-integra-success" />
                  ) : (
                    <XCircle className="size-4 text-integra-error" />
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
                    {tx.methodDetails?.name ?? "Transfer"}
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
                  {formatTxValue(tx)}
                </td>

                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {formatIRL(fee)}
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

export function ActivityFeed({ address }: ActivityFeedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const { data, isLoading } = useAddressTransactions(address);

  const transactions = data?.items ?? [];

  return (
    <div className="space-y-4">
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading transactions..."
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
    </div>
  );
}
