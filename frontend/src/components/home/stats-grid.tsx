"use client";

import { Box, Activity, Users, Fuel } from "lucide-react";
import { NumberTicker } from "@/components/effects";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/lib/hooks/use-stats";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  suffix?: string;
  decimalPlaces?: number;
  isLoading: boolean;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  decimalPlaces = 0,
  isLoading,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/20 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
        "transition-shadow duration-300",
        "dark:hover:border-[var(--integra-brand)]/30 dark:hover:shadow-[0_0_20px_rgba(255,109,73,0.15)]",
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-2">
        {isLoading || value === undefined ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-1">
            <NumberTicker
              value={value}
              decimalPlaces={decimalPlaces}
              className="text-2xl font-bold tabular-nums"
            />
            {suffix && (
              <span className="text-sm text-muted-foreground">{suffix}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsGrid() {
  const { data, isLoading } = useStats();

  const gweiValue = data?.averageGasPrice
    ? Number(data.averageGasPrice) / 1e9
    : undefined;

  return (
    <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <StatCard
        icon={<Box className="size-4" />}
        label="Total Blocks"
        value={data?.blockCountTotal}
        isLoading={isLoading}
      />
      <StatCard
        icon={<Activity className="size-4" />}
        label="Total Transactions"
        value={data?.txCountTotal}
        isLoading={isLoading}
      />
      <StatCard
        icon={<Users className="size-4" />}
        label="Active Wallets"
        value={data?.cumulativeWalletCount}
        isLoading={isLoading}
      />
      <StatCard
        icon={<Fuel className="size-4" />}
        label="Avg Gas Price"
        value={gweiValue}
        suffix="Gwei"
        decimalPlaces={2}
        isLoading={isLoading}
      />
    </div>
  );
}
