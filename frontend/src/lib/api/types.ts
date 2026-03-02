// =============================================================================
// Ethernal API Type Definitions
// Based on actual Ethernal database schema
// =============================================================================

// --- Explorer Config (from /api/explorers/search) ---

export interface ExplorerThemes {
  light: Record<string, string>;
  logo: string;
  favicon: string;
  font: string;
  links: Array<{ name: string; url: string }>;
  banner: { enabled: boolean; text: string; link: string } | null;
}

export interface ExplorerConfig {
  id: number;
  slug: string;
  domain: string;
  themes: ExplorerThemes;
  token: string;
  nativeToken: string;
  totalSupply: string;
  workspace: {
    id: number;
    name: string;
    rpcServer: string;
    chainId: number;
  };
  admin: {
    firebaseUserId: string;
  };
}

// --- Block ---

export interface Block {
  id: number;
  workspaceId: number;
  number: number;
  timestamp: string;
  baseFeePerGas: string | null;
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  miner: string;
  nonce: string;
  parentHash: string;
  transactionsCount: number;
  transactions?: Transaction[];
  createdAt: string;
  updatedAt: string;
}

// --- Transaction ---

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  logIndex: number;
  decoded?: {
    name: string;
    args: Record<string, string>;
  };
}

export interface TransactionReceipt {
  status: boolean;
  gasUsed: string;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  contractAddress: string | null;
  logs: TransactionLog[];
}

export interface Transaction {
  id: number;
  workspaceId: number;
  blockNumber: number;
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string | null;
  data: string;
  nonce: number;
  timestamp: string;
  transactionIndex: number;
  type: number;
  receipt?: TransactionReceipt;
  methodDetails?: {
    name: string;
    label: string;
  };
  rawError?: string;
  parsedError?: string;
  state: "syncing" | "ready" | "error";
  createdAt: string;
  updatedAt: string;
}

// --- Address ---

export interface TokenBalance {
  token: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  balance: string;
}

export interface Address {
  address: string;
  balance: string;
  transactionCount: number;
  contract?: Contract | null;
  tokenBalances?: TokenBalance[];
}

// --- Contract ---

export interface Contract {
  id: number;
  address: string;
  name: string | null;
  abi: unknown[] | null;
  patterns: string[];
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number | null;
  tokenTotalSupply: string | null;
  verificationStatus: string | null;
  has721Metadata: boolean;
  has721Enumerable: boolean;
  proxy: string | null;
}

// --- Stats ---

export interface ChainStats {
  txCount24h: number;
  txCountTotal: number;
  activeWalletCount: number;
}

// --- Sync Status ---

export interface SyncStatus {
  isLive: boolean;
  latestBlock: number;
  syncedBlock: number;
}

// --- Paginated Response ---

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  count: number;
}

// --- Search ---

export type SearchResultType =
  | "address"
  | "transaction"
  | "block"
  | "contract"
  | "token";

export interface SearchResult {
  type: SearchResultType;
  data: unknown;
}

// --- Query Params ---

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
}

export interface SearchParams {
  type?: SearchResultType;
  query: string;
}

// =============================================================================
// Cosmos REST API Type Definitions
// Used for validators, staking, and governance data
// =============================================================================

// --- Cosmos Validator ---

export type ValidatorBondStatus =
  | "BOND_STATUS_BONDED"
  | "BOND_STATUS_UNBONDING"
  | "BOND_STATUS_UNBONDED";

export interface CosmosValidator {
  operator_address: string;
  consensus_pubkey: { "@type": string; key: string };
  jailed: boolean;
  status: ValidatorBondStatus;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    commission_rates: {
      rate: string;
      max_rate: string;
      max_change_rate: string;
    };
    update_time: string;
  };
  min_self_delegation: string;
}

// --- Cosmos Delegation ---

export interface CosmosDelegation {
  delegation: {
    delegator_address: string;
    validator_address: string;
    shares: string;
  };
  balance: {
    denom: string;
    amount: string;
  };
}

// --- Staking Pool ---

export interface StakingPool {
  bonded_tokens: string;
  not_bonded_tokens: string;
}
