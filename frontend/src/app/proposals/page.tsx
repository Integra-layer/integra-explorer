"use client";

import { Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageTransition, SkeletonShimmer } from "@/components/effects";
import { ProposalCard } from "@/components/proposals/proposal-card";
import { useProposals } from "@/lib/hooks/use-proposals";

export default function ProposalsPage() {
  const { data: proposals, isLoading } = useProposals();

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <Landmark className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">
            Governance Proposals
          </h1>
          {proposals && proposals.length > 0 && (
            <Badge variant="secondary" className="font-mono">
              {proposals.length}
            </Badge>
          )}
        </div>

        {/* Proposals list */}
        {isLoading ? (
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
      </section>
    </PageTransition>
  );
}
