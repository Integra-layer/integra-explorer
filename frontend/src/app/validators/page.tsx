"use client";

import { useMemo } from "react";
import { Shield, Coins, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard, NumberTicker, PageTransition, SkeletonShimmer } from "@/components/effects";
import { ValidatorCard } from "@/components/validators/validator-card";
import { useValidators } from "@/lib/hooks/use-validators";
import { useStakingPool } from "@/lib/hooks/use-validators";

export default function ValidatorsPage() {
  const { data: validators, isLoading: loadingValidators } = useValidators();
  const { data: pool, isLoading: loadingPool } = useStakingPool();

  // Sort validators by tokens (highest first)
  const sortedValidators = useMemo(() => {
    if (!validators) return [];
    return [...validators].sort(
      (a, b) => Number(b.tokens) - Number(a.tokens),
    );
  }, [validators]);

  const totalBonded = pool?.bonded_tokens || "0";
  const totalNotBonded = pool?.not_bonded_tokens || "0";
  const totalSupply = Number(totalBonded) + Number(totalNotBonded);
  const bondedRatio =
    totalSupply > 0 ? (Number(totalBonded) / totalSupply) * 100 : 0;
  const totalStakedIRL = Number(totalBonded) / 1e18;
  const activeCount =
    sortedValidators.filter((v) => v.status === "BOND_STATUS_BONDED").length;

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <Shield className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Validators</h1>
          {sortedValidators.length > 0 && (
            <Badge variant="secondary" className="font-mono">
              {sortedValidators.length}
            </Badge>
          )}
        </div>

        {/* Top stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Staked */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
                <Coins className="size-5 text-integra-brand" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                {loadingPool ? (
                  <SkeletonShimmer width={120} height={24} />
                ) : (
                  <p className="text-xl font-bold">
                    <NumberTicker value={totalStakedIRL} /> IRL
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Bonded Ratio */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-integra-success/10">
                <TrendingUp className="size-5 text-integra-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Bonded Ratio</p>
                {loadingPool ? (
                  <SkeletonShimmer width={80} height={24} />
                ) : (
                  <div className="space-y-1">
                    <p className="text-xl font-bold">
                      <NumberTicker value={bondedRatio} decimalPlaces={1} />%
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-integra-success transition-all duration-700"
                        style={{ width: `${Math.min(bondedRatio, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Active Validators */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-integra-info/10">
                <Users className="size-5 text-integra-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Validators
                </p>
                {loadingValidators ? (
                  <SkeletonShimmer width={60} height={24} />
                ) : (
                  <p className="text-xl font-bold">
                    <NumberTicker value={activeCount} />
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Validators grid */}
        {loadingValidators ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonShimmer key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : sortedValidators.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <Shield className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground">No validators found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sortedValidators.map((validator) => (
              <ValidatorCard
                key={validator.operator_address}
                validator={validator}
                totalBonded={totalBonded}
              />
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
