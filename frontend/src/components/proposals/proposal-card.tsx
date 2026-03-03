"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HoverLift } from "@/components/effects";
import { VotingBar } from "./voting-bar";
import { getProposalTally } from "@/lib/api/proposals";
import type { CosmosProposal } from "@/lib/api/proposals";

interface ProposalCardProps {
  proposal: CosmosProposal;
}

function getStatusInfo(status: CosmosProposal["status"]) {
  switch (status) {
    case "PROPOSAL_STATUS_VOTING_PERIOD":
      return {
        label: "Voting",
        color: "bg-integra-info/10 text-integra-info",
        icon: Clock,
      };
    case "PROPOSAL_STATUS_PASSED":
      return {
        label: "Passed",
        color: "bg-integra-success/10 text-integra-success",
        icon: CheckCircle2,
      };
    case "PROPOSAL_STATUS_REJECTED":
      return {
        label: "Rejected",
        color: "bg-integra-danger/10 text-integra-danger",
        icon: XCircle,
      };
    case "PROPOSAL_STATUS_DEPOSIT_PERIOD":
      return {
        label: "Deposit",
        color: "bg-integra-warning/10 text-integra-warning",
        icon: Timer,
      };
    case "PROPOSAL_STATUS_FAILED":
      return {
        label: "Failed",
        color: "bg-integra-danger/10 text-integra-danger",
        icon: AlertTriangle,
      };
    default:
      return {
        label: "Unknown",
        color: "bg-muted text-muted-foreground",
        icon: Clock,
      };
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "0001-01-01T00:00:00Z") return "--";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCountdown(endTime: string): string | null {
  if (!endTime || endTime === "0001-01-01T00:00:00Z") return null;
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const status = getStatusInfo(proposal.status);
  const StatusIcon = status.icon;
  const isVoting = proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD";
  const isVotingOrConcluded =
    proposal.status !== "PROPOSAL_STATUS_DEPOSIT_PERIOD";
  const countdown = isVoting ? getCountdown(proposal.voting_end_time) : null;

  // Fetch tally for active voting (live) and concluded proposals (final results)
  const tallyEnabled =
    proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD" ||
    proposal.status === "PROPOSAL_STATUS_PASSED" ||
    proposal.status === "PROPOSAL_STATUS_REJECTED";
  const { data: liveTally } = useQuery({
    queryKey: ["proposal-tally", proposal.id],
    queryFn: () => getProposalTally(proposal.id),
    enabled: tallyEnabled,
    refetchInterval: isVoting ? 30_000 : false,
  });

  const tally = liveTally ?? proposal.final_tally_result;

  return (
    <Link href={`/proposals/${proposal.id}`}>
      <HoverLift className="h-full rounded-xl">
        <Card className="h-full cursor-pointer transition-all duration-200 hover:border-integra-brand/20 hover:shadow-[0_0_20px_rgba(255,109,73,0.08)]">
          <CardContent className="space-y-3">
            {/* Top: ID + Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  variant="secondary"
                  className="shrink-0 font-mono text-xs"
                >
                  #{proposal.id}
                </Badge>
                <h3 className="truncate text-base font-bold">
                  {proposal.title || "Untitled Proposal"}
                </h3>
              </div>
              <Badge className={`shrink-0 gap-1 ${status.color}`}>
                <StatusIcon className="size-3" />
                {status.label}
              </Badge>
            </div>

            {/* Summary (truncated) */}
            {proposal.summary && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {proposal.summary}
              </p>
            )}

            {/* Voting Bar */}
            {isVotingOrConcluded && <VotingBar tally={tally} />}

            {/* Footer: dates + countdown */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Submitted {formatDate(proposal.submit_time)}</span>
              {proposal.voting_end_time &&
                proposal.voting_end_time !== "0001-01-01T00:00:00Z" && (
                  <span>
                    Voting ends {formatDate(proposal.voting_end_time)}
                  </span>
                )}
              {countdown && (
                <span className="font-medium text-integra-info">
                  {countdown}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </HoverLift>
    </Link>
  );
}
