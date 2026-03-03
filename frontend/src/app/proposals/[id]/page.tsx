"use client";

import { use } from "react";
import Link from "next/link";
import {
  Landmark,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  User,
  Coins,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DetailRow } from "@/components/ui/detail-row";
import {
  GlassCard,
  PageTransition,
  SkeletonShimmer,
  CopyButton,
} from "@/components/effects";
import { VotingBar } from "@/components/proposals/voting-bar";
import {
  useProposal,
  useProposalTally,
  useProposalVotes,
} from "@/lib/hooks/use-proposals";
import { truncateAddress } from "@/lib/format";
import type { ProposalStatus, VoteOption } from "@/lib/api/proposals";

interface ProposalDetailPageProps {
  params: Promise<{ id: string }>;
}

function getStatusBadge(status: ProposalStatus) {
  switch (status) {
    case "PROPOSAL_STATUS_VOTING_PERIOD":
      return (
        <Badge className="gap-1 bg-integra-info/10 text-integra-info">
          <Clock className="size-3" />
          Voting
        </Badge>
      );
    case "PROPOSAL_STATUS_PASSED":
      return (
        <Badge className="gap-1 bg-integra-success/10 text-integra-success">
          <CheckCircle2 className="size-3" />
          Passed
        </Badge>
      );
    case "PROPOSAL_STATUS_REJECTED":
      return (
        <Badge className="gap-1 bg-integra-danger/10 text-integra-danger">
          <XCircle className="size-3" />
          Rejected
        </Badge>
      );
    case "PROPOSAL_STATUS_DEPOSIT_PERIOD":
      return (
        <Badge className="gap-1 bg-integra-warning/10 text-integra-warning">
          <Timer className="size-3" />
          Deposit Period
        </Badge>
      );
    case "PROPOSAL_STATUS_FAILED":
      return (
        <Badge className="gap-1 bg-integra-danger/10 text-integra-danger">
          <AlertTriangle className="size-3" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr || dateStr === "0001-01-01T00:00:00Z") return "--";
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVoteOption(option: VoteOption): {
  label: string;
  color: string;
} {
  switch (option) {
    case "VOTE_OPTION_YES":
      return { label: "Yes", color: "text-integra-success" };
    case "VOTE_OPTION_NO":
      return { label: "No", color: "text-integra-danger" };
    case "VOTE_OPTION_ABSTAIN":
      return { label: "Abstain", color: "text-muted-foreground" };
    case "VOTE_OPTION_NO_WITH_VETO":
      return { label: "No With Veto", color: "text-orange-600" };
    default:
      return { label: "Unknown", color: "text-muted-foreground" };
  }
}

function formatDeposit(
  deposits: Array<{ denom: string; amount: string }>,
): string {
  if (!deposits || deposits.length === 0) return "None";
  return deposits
    .map((d) => {
      const amount = Number(d.amount) / 1e18;
      const denom = d.denom === "airl" ? "IRL" : d.denom;
      return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${denom}`;
    })
    .join(", ");
}

function formatVoteCount(count: string): string {
  const num = Number(count) || 0;
  if (num === 0) return "0";
  if (num >= 1e15) {
    return (num / 1e18).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }
  return num.toLocaleString();
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SkeletonShimmer width={240} height={32} />
        <SkeletonShimmer width={80} height={24} className="rounded-full" />
      </div>
      <SkeletonShimmer className="h-20 rounded-xl" />
      <SkeletonShimmer className="h-64 rounded-xl" />
      <SkeletonShimmer className="h-48 rounded-xl" />
    </div>
  );
}

interface VoteBreakdownCardProps {
  label: string;
  count: string;
  percentage: number;
  color: string;
  bgColor: string;
}

function VoteBreakdownCard({
  label,
  count,
  percentage,
  color,
  bgColor,
}: VoteBreakdownCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block size-3 rounded-full ${bgColor}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <p className={`text-2xl font-bold font-mono ${color}`}>
          {formatVoteCount(count)}
        </p>
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(1)}%
        </p>
      </div>
    </GlassCard>
  );
}

export default function ProposalDetailPage({
  params,
}: ProposalDetailPageProps) {
  const { id } = use(params);
  const { data: proposal, isLoading: loadingProposal } = useProposal(id);
  const { data: tally, isLoading: loadingTally } = useProposalTally(id);
  const { data: votes, isLoading: loadingVotes } = useProposalVotes(id);

  const isLoading = loadingProposal || loadingTally;

  // Calculate percentages from tally
  const tallyData = tally || proposal?.final_tally_result;
  const yes = Number(tallyData?.yes_count || "0");
  const no = Number(tallyData?.no_count || "0");
  const abstain = Number(tallyData?.abstain_count || "0");
  const veto = Number(tallyData?.no_with_veto_count || "0");
  const totalVotes = yes + no + abstain + veto;
  const yesPercent = totalVotes > 0 ? (yes / totalVotes) * 100 : 0;
  const noPercent = totalVotes > 0 ? (no / totalVotes) * 100 : 0;
  const abstainPercent = totalVotes > 0 ? (abstain / totalVotes) * 100 : 0;
  const vetoPercent = totalVotes > 0 ? (veto / totalVotes) * 100 : 0;

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : !proposal ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <Landmark className="size-12 text-muted-foreground" />
            <h2 className="text-xl font-bold">Proposal Not Found</h2>
            <p className="text-muted-foreground">
              Proposal #{id} could not be loaded.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
              <Landmark className="size-6 text-integra-brand" />
              <h1 className="text-2xl font-bold tracking-tight">
                Proposal #{proposal.id}
              </h1>
              {getStatusBadge(proposal.status)}
            </div>

            {/* Title + Summary */}
            <GlassCard className="p-6 space-y-4">
              <h2 className="text-xl font-bold">
                {proposal.title || "Untitled Proposal"}
              </h2>
              {proposal.summary && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {proposal.summary}
                </p>
              )}
            </GlassCard>

            {/* Voting Bar (large, with labels) */}
            {tallyData && (
              <GlassCard className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Vote Distribution</h3>
                <VotingBar tally={tallyData} showLabels />
              </GlassCard>
            )}

            {/* Vote Breakdown Cards */}
            {tallyData && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <VoteBreakdownCard
                  label="Yes"
                  count={tallyData.yes_count}
                  percentage={yesPercent}
                  color="text-integra-success"
                  bgColor="bg-integra-success"
                />
                <VoteBreakdownCard
                  label="No"
                  count={tallyData.no_count}
                  percentage={noPercent}
                  color="text-integra-danger"
                  bgColor="bg-integra-danger"
                />
                <VoteBreakdownCard
                  label="Abstain"
                  count={tallyData.abstain_count}
                  percentage={abstainPercent}
                  color="text-muted-foreground"
                  bgColor="bg-muted-foreground/50"
                />
                <VoteBreakdownCard
                  label="No With Veto"
                  count={tallyData.no_with_veto_count}
                  percentage={vetoPercent}
                  color="text-orange-600"
                  bgColor="bg-orange-600"
                />
              </div>
            )}

            {/* Proposal Details */}
            <GlassCard className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Details</h3>
              <div className="space-y-3">
                <DetailRow variant="inline" label="Proposer">
                  <Link
                    href={`/address/${proposal.proposer}`}
                    className="inline-flex items-center gap-1 text-integra-brand hover:underline"
                  >
                    <User className="size-3" />
                    <span className="hidden md:inline font-mono">
                      {proposal.proposer}
                    </span>
                    <span className="md:hidden font-mono">
                      {truncateAddress(proposal.proposer, 8)}
                    </span>
                  </Link>
                  <CopyButton text={proposal.proposer} />
                </DetailRow>

                <DetailRow variant="inline" label="Deposit">
                  <span className="inline-flex items-center gap-1">
                    <Coins className="size-3" />
                    {formatDeposit(proposal.total_deposit)}
                  </span>
                </DetailRow>

                <DetailRow variant="inline" label="Submit Time">
                  {formatDateTime(proposal.submit_time)}
                </DetailRow>

                <DetailRow variant="inline" label="Deposit End Time">
                  {formatDateTime(proposal.deposit_end_time)}
                </DetailRow>

                <DetailRow variant="inline" label="Voting Start">
                  {formatDateTime(proposal.voting_start_time)}
                </DetailRow>

                <DetailRow variant="inline" label="Voting End">
                  {formatDateTime(proposal.voting_end_time)}
                </DetailRow>

                {proposal.messages && proposal.messages.length > 0 && (
                  <DetailRow variant="inline" label="Message Type">
                    <span className="break-all font-mono text-xs">
                      {proposal.messages[0]["@type"]}
                    </span>
                  </DetailRow>
                )}
              </div>
            </GlassCard>

            {/* Voters Table */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                Voters
                {votes && votes.length > 0 && (
                  <Badge variant="secondary" className="font-mono">
                    {votes.length}
                  </Badge>
                )}
              </h3>

              {loadingVotes ? (
                <SkeletonShimmer className="h-48 rounded-xl" />
              ) : !votes || votes.length === 0 ? (
                <GlassCard className="p-6">
                  <p className="text-center text-muted-foreground">
                    No votes recorded.
                  </p>
                </GlassCard>
              ) : (
                <GlassCard className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-left">
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Voter
                          </th>
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Vote
                          </th>
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Weight
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {votes.map((vote) => {
                          const primaryOption = vote.options[0];
                          const voteInfo = primaryOption
                            ? formatVoteOption(primaryOption.option)
                            : {
                                label: "Unknown",
                                color: "text-muted-foreground",
                              };
                          return (
                            <tr
                              key={vote.voter}
                              className="border-b border-border/50 transition-colors hover:bg-muted/20"
                            >
                              <td className="px-4 py-3">
                                <Link
                                  href={`/address/${vote.voter}`}
                                  className="inline-flex items-center gap-1 text-integra-brand hover:underline"
                                >
                                  <span className="hidden lg:inline font-mono">
                                    {vote.voter}
                                  </span>
                                  <span className="lg:hidden font-mono">
                                    {truncateAddress(vote.voter, 8)}
                                  </span>
                                </Link>
                                <CopyButton text={vote.voter} />
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`font-medium ${voteInfo.color}`}
                                >
                                  {voteInfo.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono">
                                {primaryOption
                                  ? `${(Number(primaryOption.weight) * 100).toFixed(0)}%`
                                  : "--"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </div>
          </>
        )}
      </section>
    </PageTransition>
  );
}
