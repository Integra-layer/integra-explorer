"use client";

import { motion } from "framer-motion";
import { Activity, Users, Clock, Box } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NumberTicker, SkeletonShimmer } from "@/components/effects";
import { useStats } from "@/lib/hooks/use-stats";
import { getBlocks } from "@/lib/api/blocks";
import { useExplorerReady } from "@/lib/explorer-provider";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  suffix?: string;
  decimalPlaces?: number;
  isLoading: boolean;
  index: number;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  decimalPlaces = 0,
  isLoading,
  index,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div
        className={cn(
          "gradient-brand-border rounded-xl border border-white/20 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
          "transition-all duration-300",
          "hover:border-integra-brand/30 hover:shadow-[0_0_30px_rgba(255,109,73,0.12)]",
          "dark:hover:border-integra-brand/30 dark:hover:shadow-[0_0_20px_rgba(255,109,73,0.15)]",
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="mt-2">
          {isLoading || value === undefined ? (
            <SkeletonShimmer className="h-8 w-24" />
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
    </motion.div>
  );
}

export function StatsGrid() {
  const { data, isLoading } = useStats();

  const isReady = useExplorerReady();

  // Get latest block number from the blocks API (first block in DESC order)
  const { data: blocksData, isLoading: blocksLoading } = useQuery({
    queryKey: ["blocks", 1, 1],
    queryFn: () => getBlocks({ page: 1, itemsPerPage: 1 }),
    refetchInterval: 10_000,
    enabled: isReady,
  });

  const latestBlock = blocksData?.items?.[0]?.number;

  return (
    <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <StatCard
        icon={<Box className="size-4" />}
        label="Latest Block"
        value={latestBlock}
        isLoading={blocksLoading}
        index={0}
      />
      <StatCard
        icon={<Activity className="size-4" />}
        label="Total Transactions"
        value={data?.txCountTotal}
        isLoading={isLoading}
        index={1}
      />
      <StatCard
        icon={<Users className="size-4" />}
        label="Active Wallets"
        value={data?.activeWalletCount}
        isLoading={isLoading}
        index={2}
      />
      <StatCard
        icon={<Clock className="size-4" />}
        label="24h Transactions"
        value={data?.txCount24h}
        isLoading={isLoading}
        index={3}
      />
    </div>
  );
}
