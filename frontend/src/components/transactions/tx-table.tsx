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
  formatTxValue,
  formatFee,
} from "@/lib/format";
import { classifyTransaction } from "@/lib/tx-classifier";
import type { Transaction } from "@/lib/api/types";
import type { TxCategory } from "@/lib/tx-classifier";

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

/**
 * Color-coded badge based on transaction category.
 * green = transfers, blue = approvals, purple = NFT, gray = contract-call
 */
function CategoryBadge({ label, category }: { label: string; category: TxCategory }) {
  let colorClass: string;

  switch (category) {
    case "native-transfer":
    case "erc20-transfer":
    case "erc20-transferFrom":
      colorClass = "border-integra-success/30 text-integra-success";
      break;
    case "erc20-approve":
    case "approval-for-all":
      colorClass = "border-integra-info/30 text-integra-info";
      break;
    case "nft-transfer":
    case "nft-safeTransfer":
      colorClass = "border-purple-500/30 text-purple-400";
      break;
    case "contract-creation":
      colorClass = "border-integra-warning/30 text-integra-warning";
      break;
    case "contract-call":
    default:
      colorClass = "border-border text-muted-foreground";
      break;
  }

  return (
    <Badge variant="outline" className={`text-[10px] ${colorClass}`}>
      {label}
    </Badge>
  );
}

export function TxTable({ transactions, isLoading }: TxTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
      <table className="w-full text-sm">
        <caption className="sr-only">List of transactions</caption>
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
                const fee = formatFee(tx.gasUsed, tx.gasPrice);
                const classified = classifyTransaction(tx);

                const status = !tx.receipt
                  ? "pending"
                  : tx.receipt.status
                    ? "success"
                    : "failed";

                return (
                  <motion.tr
                    key={tx.hash}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.015 }}
                    className="border-l-2 border-transparent transition-all duration-150 hover:border-l-integra-brand/50 hover:bg-muted/30"
                  >
                    {/* Status */}
                    <td className="px-4 py-3">
                      {status === "success" ? (
                        <CheckCircle
                          className="size-4 text-integra-success"
                          aria-label="Success"
                        />
                      ) : status === "failed" ? (
                        <XCircle
                          className="size-4 text-integra-error"
                          aria-label="Failed"
                        />
                      ) : (
                        <Clock
                          className="size-4 text-integra-warning"
                          aria-label="Pending"
                        />
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
                      <CategoryBadge
                        label={classified.label}
                        category={classified.category}
                      />
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
                      {classified.to ? (
                        <Link
                          href={`/address/${classified.to}`}
                          className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                        >
                          {truncateAddress(classified.to)}
                        </Link>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Contract Create
                        </Badge>
                      )}
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {classified.value}
                    </td>

                    {/* Fee */}
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {fee}
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
