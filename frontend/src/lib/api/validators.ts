// =============================================================================
// Cosmos REST API Client — Validators & Staking
// Fetches data from the Cosmos SDK REST endpoints (not Ethernal).
// =============================================================================

import type { CosmosValidator, CosmosDelegation, StakingPool } from "./types";

const COSMOS_API =
  process.env.NEXT_PUBLIC_COSMOS_API_URL ||
  "https://testnet.integralayer.com/api";

const COSMOS_TIMEOUT_MS = 15_000;

function cosmosAbort(): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), COSMOS_TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

async function parseJson<T>(res: Response, label: string): Promise<T> {
  try {
    return await res.json();
  } catch {
    throw new Error(`Failed to parse ${label} response`);
  }
}

/**
 * Fetch all validators (up to 100).
 * Sorted by tokens descending on the server side by default.
 */
export async function getValidators(): Promise<CosmosValidator[]> {
  const { signal, clear } = cosmosAbort();
  try {
    const res = await fetch(
      `${COSMOS_API}/cosmos/staking/v1beta1/validators?pagination.limit=100`,
      { signal },
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch validators: HTTP ${res.status}`);
    }
    const data = await parseJson<{ validators?: CosmosValidator[] }>(
      res,
      "validators",
    );
    return data.validators || [];
  } finally {
    clear();
  }
}

/**
 * Fetch a single validator by operator address (integravaloper...).
 */
export async function getValidator(
  operatorAddress: string,
): Promise<CosmosValidator> {
  const { signal, clear } = cosmosAbort();
  try {
    const res = await fetch(
      `${COSMOS_API}/cosmos/staking/v1beta1/validators/${operatorAddress}`,
      { signal },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to fetch validator ${operatorAddress}: HTTP ${res.status}`,
      );
    }
    const data = await parseJson<{ validator: CosmosValidator }>(
      res,
      "validator",
    );
    return data.validator;
  } finally {
    clear();
  }
}

/**
 * Fetch the staking pool (bonded + not-bonded totals).
 */
export async function getStakingPool(): Promise<StakingPool> {
  const { signal, clear } = cosmosAbort();
  try {
    const res = await fetch(`${COSMOS_API}/cosmos/staking/v1beta1/pool`, {
      signal,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch staking pool: HTTP ${res.status}`);
    }
    const data = await parseJson<{ pool: StakingPool }>(res, "staking pool");
    return data.pool;
  } finally {
    clear();
  }
}

/**
 * Fetch delegations for a specific validator (up to 100).
 */
export async function getValidatorDelegations(
  operatorAddress: string,
): Promise<CosmosDelegation[]> {
  const { signal, clear } = cosmosAbort();
  try {
    const res = await fetch(
      `${COSMOS_API}/cosmos/staking/v1beta1/validators/${operatorAddress}/delegations?pagination.limit=100`,
      { signal },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to fetch delegations for ${operatorAddress}: HTTP ${res.status}`,
      );
    }
    const data = await parseJson<{
      delegation_responses?: CosmosDelegation[];
    }>(res, "delegations");
    return data.delegation_responses || [];
  } finally {
    clear();
  }
}
