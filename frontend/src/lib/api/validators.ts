// =============================================================================
// Cosmos REST API Client — Validators & Staking
// Fetches data from the Cosmos SDK REST endpoints (not Ethernal).
// =============================================================================

import type { CosmosValidator, CosmosDelegation, StakingPool } from "./types";

const COSMOS_API =
  process.env.NEXT_PUBLIC_COSMOS_API_URL ||
  "https://testnet.integralayer.com/api";

/**
 * Fetch all validators (up to 100).
 * Sorted by tokens descending on the server side by default.
 */
export async function getValidators(): Promise<CosmosValidator[]> {
  const res = await fetch(
    `${COSMOS_API}/cosmos/staking/v1beta1/validators?pagination.limit=100`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch validators: ${res.status}`);
  }
  const data = await res.json();
  return data.validators || [];
}

/**
 * Fetch a single validator by operator address (integravaloper...).
 */
export async function getValidator(
  operatorAddress: string,
): Promise<CosmosValidator> {
  const res = await fetch(
    `${COSMOS_API}/cosmos/staking/v1beta1/validators/${operatorAddress}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch validator ${operatorAddress}: ${res.status}`);
  }
  const data = await res.json();
  return data.validator;
}

/**
 * Fetch the staking pool (bonded + not-bonded totals).
 */
export async function getStakingPool(): Promise<StakingPool> {
  const res = await fetch(`${COSMOS_API}/cosmos/staking/v1beta1/pool`);
  if (!res.ok) {
    throw new Error(`Failed to fetch staking pool: ${res.status}`);
  }
  const data = await res.json();
  return data.pool;
}

/**
 * Fetch delegations for a specific validator (up to 100).
 */
export async function getValidatorDelegations(
  operatorAddress: string,
): Promise<CosmosDelegation[]> {
  const res = await fetch(
    `${COSMOS_API}/cosmos/staking/v1beta1/validators/${operatorAddress}/delegations?pagination.limit=100`,
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch delegations for ${operatorAddress}: ${res.status}`,
    );
  }
  const data = await res.json();
  return data.delegation_responses || [];
}
