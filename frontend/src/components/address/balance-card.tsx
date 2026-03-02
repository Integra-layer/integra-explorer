"use client";

import { Wallet, FileCode } from "lucide-react";
import { GlassCard, NumberTicker, SkeletonShimmer } from "@/components/effects";

interface BalanceCardProps {
  balance: string;
  address: string;
  isContract: boolean;
  isLoading: boolean;
}

export function BalanceCard({
  balance,
  isContract,
  isLoading,
}: BalanceCardProps) {
  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <SkeletonShimmer className="mb-4 h-5 w-20" />
        <SkeletonShimmer className="mb-2 h-10 w-48" />
        <SkeletonShimmer className="mb-6 h-4 w-12" />
        <SkeletonShimmer className="h-4 w-32" />
      </GlassCard>
    );
  }

  const irlBalance = Number(balance) / 1e18;

  return (
    <GlassCard className="p-6">
      <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Balance
      </h2>

      <div className="mb-1">
        <NumberTicker
          value={irlBalance}
          decimalPlaces={irlBalance < 1 ? 6 : irlBalance < 1000 ? 4 : 2}
          className="text-4xl font-bold tracking-tight"
        />
      </div>

      <p className="mb-6 text-lg font-medium text-muted-foreground">IRL</p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isContract ? (
          <>
            <FileCode className="size-4 text-integra-brand" />
            <span>Smart Contract</span>
          </>
        ) : (
          <>
            <Wallet className="size-4 text-integra-brand" />
            <span>Externally Owned Account (EOA)</span>
          </>
        )}
      </div>
    </GlassCard>
  );
}
