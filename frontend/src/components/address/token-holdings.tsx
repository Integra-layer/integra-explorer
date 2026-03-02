"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import { truncateAddress } from "@/lib/format";
import type { TokenBalance } from "@/lib/api/types";

interface TokenHoldingsProps {
  tokenBalances: TokenBalance[] | undefined;
  isLoading: boolean;
}

function formatTokenBalance(balance: string, decimals: number): string {
  const num = Number(balance) / Math.pow(10, decimals);
  if (num === 0) return "0";
  if (num < 0.001) return "<0.001";
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function TokenRow({
  token,
  index,
}: {
  token: TokenBalance;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
        {/* Token icon placeholder */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Coins className="size-5 text-muted-foreground" />
        </div>

        {/* Token info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {token.tokenName || "Unknown Token"}
            </span>
            <span className="text-xs text-muted-foreground">
              {token.tokenSymbol}
            </span>
          </div>

          <Link
            href={`/address/${token.token}`}
            className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
          >
            {truncateAddress(token.token)}
          </Link>
        </div>

        {/* Balance */}
        <div className="text-right">
          <p className="text-sm font-medium">
            {formatTokenBalance(token.balance, token.tokenDecimals)}
          </p>
          <p className="text-xs text-muted-foreground">
            {token.tokenSymbol}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TokenHoldingsSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <SkeletonShimmer className="size-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <SkeletonShimmer className="h-4 w-32" />
            <SkeletonShimmer className="h-3 w-24" />
          </div>
          <div className="space-y-1.5 text-right">
            <SkeletonShimmer className="ml-auto h-4 w-20" />
            <SkeletonShimmer className="ml-auto h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TokenHoldings({ tokenBalances, isLoading }: TokenHoldingsProps) {
  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <TokenHoldingsSkeleton />
      </GlassCard>
    );
  }

  if (!tokenBalances || tokenBalances.length === 0) {
    return (
      <GlassCard className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">No token holdings found</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="divide-y divide-border/30 p-2">
      {tokenBalances.map((token, i) => (
        <TokenRow key={token.token} token={token} index={i} />
      ))}
    </GlassCard>
  );
}
