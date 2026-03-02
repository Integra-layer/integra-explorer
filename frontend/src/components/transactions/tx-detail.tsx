"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  ArrowRightLeft,
  Fuel,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { GlassCard, SkeletonShimmer, CopyButton } from "@/components/effects";
import {
  truncateAddress,
  formatIRL,
  formatGas,
  formatGwei,
  formatNumber,
  formatTxValue,
  formatFee,
  isErc20Transfer,
  timeAgo,
} from "@/lib/format";
import { TxFlow } from "./tx-flow";
import { TxTabs } from "./tx-tabs";
import type { Transaction } from "@/lib/api/types";

interface TxDetailProps {
  transaction: Transaction | undefined;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton loading state
// ---------------------------------------------------------------------------

function TxDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center gap-4">
        <SkeletonShimmer className="h-9 w-56" />
        <SkeletonShimmer className="h-7 w-20" />
      </div>

      {/* Flow skeleton */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <SkeletonShimmer className="h-24 w-48" />
        <SkeletonShimmer className="h-8 w-20" />
        <SkeletonShimmer className="h-24 w-48" />
      </div>

      {/* Summary card skeleton */}
      <GlassCard className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonShimmer className="h-3.5 w-24" />
              <SkeletonShimmer className="h-5 w-44" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tabs skeleton */}
      <SkeletonShimmer className="h-10 w-80" />
      <SkeletonShimmer className="h-40 w-full" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  icon: Icon,
  hint,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  children: React.ReactNode;
}) {
  const labelContent = (
    <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {Icon && <Icon className="size-3.5" />}
      {label}
      {hint && (
        <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
          ?
        </span>
      )}
    </span>
  );

  return (
    <div className="flex flex-col gap-1">
      {hint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-fit cursor-help">{labelContent}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px]">
            {hint}
          </TooltipContent>
        </Tooltip>
      ) : (
        labelContent
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: "success" | "failed" | "pending" }) {
  if (status === "success") {
    return (
      <Badge className="gap-1.5 bg-integra-success/10 text-integra-success hover:bg-integra-success/20">
        <CheckCircle className="size-3.5" />
        Success
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge className="gap-1.5 bg-integra-error/10 text-integra-error hover:bg-integra-error/20">
        <XCircle className="size-3.5" />
        Failed
      </Badge>
    );
  }

  return (
    <Badge className="gap-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
      <Clock className="size-3.5" />
      Pending
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TxDetail({ transaction: tx, isLoading }: TxDetailProps) {
  if (isLoading || !tx) {
    return <TxDetailSkeleton />;
  }

  const receiptStatus = tx.receipt
    ? tx.receipt.status
      ? "success"
      : "failed"
    : "pending";

  const gasUsedForFee = tx.receipt?.gasUsed ?? tx.gasUsed;
  const feeDisplay = formatFee(gasUsedForFee, tx.gasPrice);
  const isFree = feeDisplay === "Free";

  const gasUsedNum = tx.receipt?.gasUsed ?? tx.gasUsed;
  const gasLimitNum = tx.gas;
  const gasRatio =
    gasUsedNum && gasLimitNum
      ? ((Number(gasUsedNum) / Number(gasLimitNum)) * 100).toFixed(1)
      : null;

  const fullDate = new Date(tx.timestamp).toLocaleString();

  const txTypeLabel =
    tx.type === 0
      ? "Legacy (0)"
      : tx.type === 2
        ? "EIP-1559 (2)"
        : `Type ${tx.type}`;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center gap-3">
        <ArrowRightLeft className="size-6 text-integra-brand" />
        <h1 className="text-2xl font-bold tracking-tight">
          Transaction Details
        </h1>
        <StatusBadge
          status={receiptStatus as "success" | "failed" | "pending"}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Flow Diagram */}
      {/* ------------------------------------------------------------------ */}
      <TxFlow transaction={tx} />

      {/* ------------------------------------------------------------------ */}
      {/* Summary Card */}
      {/* ------------------------------------------------------------------ */}
      <GlassCard className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Transaction Hash */}
          <DetailRow label="Transaction Hash" icon={Hash}>
            <div className="flex items-center gap-1.5">
              <span className="truncate font-mono text-xs">{tx.hash}</span>
              <CopyButton text={tx.hash} />
            </div>
          </DetailRow>

          {/* Status */}
          <DetailRow label="Status">
            <StatusBadge
              status={receiptStatus as "success" | "failed" | "pending"}
            />
          </DetailRow>

          {/* Block */}
          <DetailRow
            label="Block"
            hint="The block number where this transaction was included and confirmed."
          >
            <div className="flex items-center gap-2">
              <Link
                href={`/blocks/${tx.blockNumber}`}
                className="font-mono text-integra-brand hover:underline"
              >
                {formatNumber(tx.blockNumber)}
              </Link>
            </div>
          </DetailRow>

          {/* Timestamp */}
          <DetailRow label="Timestamp" icon={Clock}>
            <span>
              {fullDate}{" "}
              <span className="text-muted-foreground">
                ({timeAgo(tx.timestamp)})
              </span>
            </span>
          </DetailRow>

          {/* From */}
          <DetailRow label="From" icon={User}>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/address/${tx.from}`}
                className="font-mono text-xs text-integra-brand hover:underline"
              >
                <span className="hidden md:inline">{tx.from}</span>
                <span className="md:hidden">{truncateAddress(tx.from, 8)}</span>
              </Link>
              <CopyButton text={tx.from} />
            </div>
          </DetailRow>

          {/* To */}
          <DetailRow label="To" icon={User}>
            {tx.to ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/address/${tx.to}`}
                  className="font-mono text-xs text-integra-brand hover:underline"
                >
                  <span className="hidden md:inline">{tx.to}</span>
                  <span className="md:hidden">{truncateAddress(tx.to, 8)}</span>
                </Link>
                <CopyButton text={tx.to} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Contract Create</Badge>
                {tx.receipt?.contractAddress && (
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/address/${tx.receipt.contractAddress}`}
                      className="font-mono text-xs text-integra-brand hover:underline"
                    >
                      {truncateAddress(tx.receipt.contractAddress, 8)}
                    </Link>
                    <CopyButton text={tx.receipt.contractAddress} />
                  </div>
                )}
              </div>
            )}
          </DetailRow>

          {/* Value */}
          <DetailRow label="Value">
            <span className="font-medium">{formatTxValue(tx)}</span>
            {isErc20Transfer(tx) && (
              <Badge className="ml-2 bg-integra-info/10 text-integra-info text-[10px]">
                ERC-20
              </Badge>
            )}
          </DetailRow>

          {/* Gas Price */}
          <DetailRow
            label="Gas Price"
            icon={Fuel}
            hint="The price per unit of computation. Higher gas prices mean faster processing."
          >
            <span className="font-mono">
              {formatGwei(tx.gasPrice)} Gwei
              {Number(tx.gasPrice) === 0 && (
                <span className="ml-1 text-muted-foreground">(free)</span>
              )}
            </span>
          </DetailRow>

          {/* Gas Used */}
          <DetailRow
            label="Gas Used"
            hint="How much computation this transaction actually consumed."
          >
            <span className="font-mono">
              {formatGas(gasUsedNum ?? "0")}
              {gasRatio && (
                <span className="text-muted-foreground">
                  {" "}
                  / {formatGas(gasLimitNum)} ({gasRatio}%)
                </span>
              )}
            </span>
          </DetailRow>

          {/* Nonce */}
          <DetailRow
            label="Nonce"
            hint="A counter that tracks how many transactions this address has sent. Prevents duplicate transactions."
          >
            <span className="font-mono">{tx.nonce}</span>
          </DetailRow>

          {/* Transaction Fee */}
          <DetailRow
            label="Transaction Fee"
            hint="The total cost paid to process this transaction (gas used x gas price)."
          >
            {isFree ? (
              <Badge className="bg-integra-success/10 text-integra-success">
                Free
              </Badge>
            ) : (
              <span className="font-medium">{feeDisplay}</span>
            )}
          </DetailRow>

          {/* Transaction Type */}
          <DetailRow label="Transaction Type">
            <span>{txTypeLabel}</span>
          </DetailRow>
        </div>
      </GlassCard>

      {/* ------------------------------------------------------------------ */}
      {/* Tabs */}
      {/* ------------------------------------------------------------------ */}
      <TxTabs transaction={tx} />
    </motion.div>
  );
}
