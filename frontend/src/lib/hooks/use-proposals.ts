"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProposals,
  getProposal,
  getProposalTally,
  getProposalVotes,
} from "@/lib/api/proposals";

/**
 * Fetch all governance proposals. Refetches every 60 seconds.
 */
export function useProposals() {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: getProposals,
    staleTime: 60_000,
  });
}

/**
 * Fetch a single proposal by ID.
 * Disabled when id is empty/undefined.
 */
export function useProposal(id: string) {
  return useQuery({
    queryKey: ["proposal", id],
    queryFn: () => getProposal(id),
    enabled: !!id,
  });
}

/**
 * Fetch the live tally for a proposal.
 * Disabled when id is empty/undefined.
 */
export function useProposalTally(id: string) {
  return useQuery({
    queryKey: ["proposal-tally", id],
    queryFn: () => getProposalTally(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Fetch votes for a proposal.
 * Disabled when id is empty/undefined.
 */
export function useProposalVotes(id: string) {
  return useQuery({
    queryKey: ["proposal-votes", id],
    queryFn: () => getProposalVotes(id),
    enabled: !!id,
  });
}
