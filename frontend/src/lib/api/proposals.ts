// =============================================================================
// Cosmos REST API Client — Governance Proposals
// Fetches data from the Cosmos SDK REST governance endpoints.
// =============================================================================

// --- Types ---

export type ProposalStatus =
  | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
  | "PROPOSAL_STATUS_VOTING_PERIOD"
  | "PROPOSAL_STATUS_PASSED"
  | "PROPOSAL_STATUS_REJECTED"
  | "PROPOSAL_STATUS_FAILED";

export type VoteOption =
  | "VOTE_OPTION_YES"
  | "VOTE_OPTION_NO"
  | "VOTE_OPTION_ABSTAIN"
  | "VOTE_OPTION_NO_WITH_VETO";

export interface TallyResult {
  yes_count: string;
  abstain_count: string;
  no_count: string;
  no_with_veto_count: string;
}

export interface CosmosProposal {
  id: string;
  messages: Array<{ "@type": string; [key: string]: unknown }>;
  status: ProposalStatus;
  final_tally_result: TallyResult;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: Array<{ denom: string; amount: string }>;
  voting_start_time: string;
  voting_end_time: string;
  metadata: string;
  title: string;
  summary: string;
  proposer: string;
}

export interface CosmosVote {
  proposal_id: string;
  voter: string;
  options: Array<{
    option: VoteOption;
    weight: string;
  }>;
  metadata: string;
}

// --- API Client ---

const COSMOS_API =
  process.env.NEXT_PUBLIC_COSMOS_API_URL ||
  "https://testnet.integralayer.com/api";

/**
 * Fetch all proposals (newest first, up to 100).
 */
export async function getProposals(): Promise<CosmosProposal[]> {
  const res = await fetch(
    `${COSMOS_API}/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=100`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch proposals: ${res.status}`);
  }
  const data = await res.json();
  return data.proposals || [];
}

/**
 * Fetch a single proposal by ID.
 */
export async function getProposal(id: string): Promise<CosmosProposal> {
  const res = await fetch(
    `${COSMOS_API}/cosmos/gov/v1/proposals/${id}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch proposal ${id}: ${res.status}`);
  }
  const data = await res.json();
  return data.proposal;
}

/**
 * Fetch the live tally for a proposal.
 */
export async function getProposalTally(id: string): Promise<TallyResult> {
  const res = await fetch(
    `${COSMOS_API}/cosmos/gov/v1/proposals/${id}/tally`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch tally for proposal ${id}: ${res.status}`);
  }
  const data = await res.json();
  return data.tally;
}

/**
 * Fetch votes for a proposal (up to 100).
 */
export async function getProposalVotes(id: string): Promise<CosmosVote[]> {
  const res = await fetch(
    `${COSMOS_API}/cosmos/gov/v1/proposals/${id}/votes?pagination.limit=100`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch votes for proposal ${id}: ${res.status}`);
  }
  const data = await res.json();
  return data.votes || [];
}
