"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SkeletonShimmer } from "@/components/effects";
import {
  truncateAddress,
  truncateHash,
  timeAgo,
  formatIRL,
  parseErc20Amount,
  formatTokenAmount,
} from "@/lib/format";
import { findKnownToken } from "@/lib/api/tokens";
import type { Transaction } from "@/lib/api/types";

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

interface TxTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const SKELETON_ROWS = 25;

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-5 w-5" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-4 w-28" />
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <SkeletonShimmer className="h-5 w-16" />
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <SkeletonShimmer className="h-4 w-16" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-4 w-20" />
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <SkeletonShimmer className="h-4 w-20" />
      </td>
    </tr>
  );
}

export function TxTable({ transactions, isLoading }: TxTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b border-border/50 bg-muted/80 backdrop-blur-sm">
          <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Tx Hash</th>
            <th className="hidden px-4 py-3 md:table-cell">Method</th>
            <th className="hidden px-4 py-3 md:table-cell">Block</th>
            <th className="px-4 py-3">From</th>
            <th className="px-4 py-3">To</th>
            <th className="px-4 py-3">Value</th>
            <th className="hidden px-4 py-3 lg:table-cell">Fee</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            : transactions.map((tx, i) => {
                const fee =
                  tx.gasUsed && tx.gasPrice
                    ? (Number(tx.gasUsed) * Number(tx.gasPrice)).toString()
                    : "0";

                const status = !tx.receipt
                  ? "pending"
                  : tx.receipt.status
                    ? "success"
                    : "fail";

                return (
                  <motion.tr
                    key={tx.hash}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.015 }}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {/* Status */}
                    <td className="px-4 py-3">
                      {status === "success" ? (
                        <CheckCircle className="size-4 text-integra-success" />
                      ) : status === "fail" ? (
                        <XCircle className="size-4 text-integra-error" />
                      ) : (
                        <Clock className="size-4 text-yellow-500" />
                      )}
                    </td>

                    {/* Tx Hash */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/transactions/${tx.hash}`}
                        className="font-mono text-xs font-medium text-integra-brand hover:underline"
                      >
                        {truncateHash(tx.hash)}
                      </Link>
                    </td>

                    {/* Method */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Badge variant="outline" className="text-[10px]">
                        {tx.methodDetails?.name ?? "Transfer"}
                      </Badge>
                    </td>

                    {/* Block */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Link
                        href={`/blocks/${tx.blockNumber}`}
                        className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                      >
                        {tx.blockNumber.toLocaleString()}
                      </Link>
                    </td>

                    {/* From */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/address/${tx.from}`}
                        className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                      >
                        {truncateAddress(tx.from)}
                      </Link>
                    </td>

                    {/* To */}
                    <td className="px-4 py-3">
                      {tx.to ? (
                        <Link
                          href={`/address/${tx.to}`}
                          className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                        >
                          {truncateAddress(tx.to)}
                        </Link>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Contract Create
                        </Badge>
                      )}
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTxValue(tx)}
                    </td>

                    {/* Fee */}
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {formatIRL(fee)}
                    </td>
                  </motion.tr>
                );
              })}
        </tbody>
      </table>

      {/* Empty state */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No transactions found
        </div>
      )}
    </div>
  );
}
