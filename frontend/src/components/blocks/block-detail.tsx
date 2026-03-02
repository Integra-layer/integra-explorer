"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Box,
  ArrowRightLeft,
  Fuel,
  Clock,
  Hash,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GlassCard, SkeletonShimmer, CopyButton } from "@/components/effects";
import {
  truncateAddress,
  truncateHash,
  timeAgo,
  formatGas,
  formatIRL,
  formatNumber,
} from "@/lib/format";
import type { Block } from "@/lib/api/types";

interface BlockDetailProps {
  block: Block | undefined;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton loading state
// ---------------------------------------------------------------------------

function BlockDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SkeletonShimmer className="h-9 w-56" />
        <div className="flex gap-2">
          <SkeletonShimmer className="h-9 w-32" />
          <SkeletonShimmer className="h-9 w-32" />
        </div>
      </div>

      {/* Summary card skeleton */}
      <GlassCard className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonShimmer className="h-3.5 w-24" />
              <SkeletonShimmer className="h-5 w-44" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Transactions skeleton */}
      <GlassCard className="p-6">
        <SkeletonShimmer className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonShimmer key={i} className="h-12 w-full" />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gas progress bar
// ---------------------------------------------------------------------------

function GasBar({ used, limit }: { used: string; limit: string }) {
  const usedNum = Number(used);
  const limitNum = Number(limit);
  const pct = limitNum > 0 ? Math.min((usedNum / limitNum) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <span>
        {formatGas(used)}{" "}
        <span className="text-muted-foreground">
          / {formatGas(limit)} ({pct.toFixed(1)}%)
        </span>
      </span>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-integra-brand"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BlockDetail({ block, isLoading }: BlockDetailProps) {
  if (isLoading || !block) {
    return <BlockDetailSkeleton />;
  }

  const blockNum = block.number;
  const fullDate = new Date(block.timestamp).toLocaleString();
  const txs = block.transactions ?? [];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header + Prev/Next */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Box className="size-6 text-integra-brand" />
          Block #{blockNum.toLocaleString()}
        </h1>

        <div className="flex items-center gap-2">
          {blockNum > 0 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/blocks/${blockNum - 1}`}>
                <ChevronLeft className="mr-1 size-4" />
                Block #{(blockNum - 1).toLocaleString()}
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="mr-1 size-4" />
              Prev
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/blocks/${blockNum + 1}`}>
              Block #{(blockNum + 1).toLocaleString()}
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Summary Card */}
      {/* ------------------------------------------------------------------ */}
      <GlassCard className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Block Height */}
          <DetailRow label="Block Height" icon={Box}>
            <span className="font-mono font-medium">
              {formatNumber(blockNum)}
            </span>
          </DetailRow>

          {/* Timestamp */}
          <DetailRow label="Timestamp" icon={Clock}>
            <span>
              {fullDate}{" "}
              <span className="text-muted-foreground">
                ({timeAgo(block.timestamp)})
              </span>
            </span>
          </DetailRow>

          {/* Transactions */}
          <DetailRow label="Transactions" icon={ArrowRightLeft}>
            <span className="font-medium">
              {block.transactionsCount} transaction
              {block.transactionsCount !== 1 ? "s" : ""}
            </span>
          </DetailRow>

          {/* Validator */}
          <DetailRow label="Validator / Miner" icon={User}>
            <Link
              href={`/address/${block.miner}`}
              className="font-mono text-integra-brand hover:underline"
            >
              <span className="hidden md:inline">{block.miner}</span>
              <span className="md:hidden">
                {truncateAddress(block.miner, 8)}
              </span>
            </Link>
          </DetailRow>

          {/* Gas Used / Limit bar */}
          <DetailRow label="Gas Used" icon={Fuel}>
            <GasBar used={block.gasUsed} limit={block.gasLimit} />
          </DetailRow>

          {/* Gas Limit */}
          <DetailRow label="Gas Limit">
            <span className="font-mono">{formatGas(block.gasLimit)}</span>
          </DetailRow>

          {/* Base Fee */}
          {block.baseFeePerGas && (
            <DetailRow label="Base Fee Per Gas">
              <span className="font-mono">
                {formatGas(block.baseFeePerGas)} wei
              </span>
            </DetailRow>
          )}

          {/* Block Hash */}
          <DetailRow label="Hash" icon={Hash}>
            <div className="flex items-center gap-1.5">
              <span className="truncate font-mono text-xs">{block.hash}</span>
              <CopyButton text={block.hash} />
            </div>
          </DetailRow>

          {/* Parent Hash */}
          <DetailRow label="Parent Hash">
            <Link
              href={`/blocks/${blockNum - 1}`}
              className="truncate font-mono text-xs text-integra-brand hover:underline"
            >
              {truncateHash(block.parentHash, 10)}
            </Link>
          </DetailRow>

          {/* Nonce */}
          <DetailRow label="Nonce">
            <span className="font-mono text-xs">{block.nonce}</span>
          </DetailRow>

          {/* Extra Data */}
          {block.extraData && (
            <DetailRow label="Extra Data">
              <span className="truncate font-mono text-xs text-muted-foreground">
                {block.extraData.length > 66
                  ? `${block.extraData.slice(0, 66)}...`
                  : block.extraData}
              </span>
            </DetailRow>
          )}
        </div>
      </GlassCard>

      {/* ------------------------------------------------------------------ */}
      {/* Transactions Section */}
      {/* ------------------------------------------------------------------ */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/50 px-6 py-4">
          <ArrowRightLeft className="size-4 text-integra-brand" />
          <h2 className="text-base font-semibold">
            Transactions ({block.transactionsCount})
          </h2>
        </div>

        {txs.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No transactions in this block
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/50">
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Tx Hash</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Method</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="hidden px-4 py-3 md:table-cell">Value</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {txs.map((tx, i) => {
                  const fee =
                    tx.gasUsed && tx.gasPrice
                      ? (Number(tx.gasUsed) * Number(tx.gasPrice)).toString()
                      : "0";

                  return (
                    <motion.tr
                      key={tx.hash}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="transition-colors hover:bg-muted/50"
                    >
                      {/* Hash */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/transactions/${tx.hash}`}
                          className="font-mono text-xs text-integra-brand hover:underline"
                        >
                          {truncateHash(tx.hash)}
                        </Link>
                      </td>

                      {/* Method */}
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {tx.methodDetails?.name ?? "Transfer"}
                        </Badge>
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
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {formatIRL(tx.value)}
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
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
