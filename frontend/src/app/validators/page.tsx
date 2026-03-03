"use client";

import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Coins, Users, TrendingUp, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  GlassCard,
  NumberTicker,
  PageTransition,
  SkeletonShimmer,
} from "@/components/effects";
import { ValidatorCard } from "@/components/validators/validator-card";
import { ProposalCard } from "@/components/proposals/proposal-card";
import { useValidators, useStakingPool } from "@/lib/hooks/use-validators";
import { useProposals } from "@/lib/hooks/use-proposals";

type Tab = "validators" | "proposals";

function StakingGovernanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "validators";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const { data: validators, isLoading: loadingValidators } = useValidators();
  const { data: pool, isLoading: loadingPool } = useStakingPool();
  const { data: proposals, isLoading: loadingProposals } = useProposals();

  // Sort validators by tokens (highest first)
  const sortedValidators = useMemo(() => {
    if (!validators) return [];
    return [...validators].sort((a, b) => Number(b.tokens) - Number(a.tokens));
  }, [validators]);

  const totalBonded = pool?.bonded_tokens || "0";
  const totalNotBonded = pool?.not_bonded_tokens || "0";
  const totalSupply = Number(totalBonded) + Number(totalNotBonded);
  const bondedRatio =
    totalSupply > 0 ? (Number(totalBonded) / totalSupply) * 100 : 0;
  const totalStakedIRL = Number(totalBonded) / 1e18;
  const activeCount = sortedValidators.filter(
    (v) => v.status === "BOND_STATUS_BONDED",
  ).length;

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    router.replace(`/validators?tab=${tab}`);
  }

  const badgeCount =
    activeTab === "validators"
      ? sortedValidators.length
      : (proposals?.length ?? 0);

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <Shield className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">
            Staking &amp; Governance
          </h1>
          {badgeCount > 0 && (
            <Badge variant="secondary" className="font-mono">
              {badgeCount}
            </Badge>
          )}
        </div>

        {/* Tab bar */}
        <div className="border-b border-border/50">
          <div className="flex gap-1">
            {(["validators", "proposals"] as Tab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => handleTabChange(tab)}
                className={[
                  "relative px-4 pb-3 pt-1 text-sm font-medium capitalize transition-colors",
                  activeTab === tab
                    ? "text-integra-brand"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {tab === "validators" ? "Validators" : "Proposals"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-integra-brand" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Validators tab */}
        {activeTab === "validators" && (
          <>
            {/* Top stats row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Staked */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
                    <Coins className="size-5 text-integra-brand" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Staked
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      Bonded Ratio
                    </p>
                    {loadingPool ? (
                      <SkeletonShimmer width={80} height={24} />
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xl font-bold">
                          <NumberTicker value={bondedRatio} decimalPlaces={1} />
                          %
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
          </>
        )}

        {/* Proposals tab */}
        {activeTab === "proposals" && (
          <>
            {loadingProposals ? (
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonShimmer key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : !proposals || proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <Landmark className="size-12 text-muted-foreground" />
                <h2 className="text-xl font-bold">No Proposals Found</h2>
                <p className="text-muted-foreground">
                  There are no governance proposals on this chain yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {proposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </PageTransition>
  );
}

export default function ValidatorsPage() {
  return (
    <Suspense fallback={null}>
      <StakingGovernanceContent />
    </Suspense>
  );
}
