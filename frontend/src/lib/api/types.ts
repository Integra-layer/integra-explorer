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
  name: string;
  slug: string;
  domain: string;
  workspaceId: number;
  themes: ExplorerThemes;
  token: string;
  nativeToken: string;
  totalSupply: string;
  rpcServer: string;
  chainId: number;
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
  input: string;
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
  blockCount24h: number;
  blockCountTotal: number;
  activeWalletCount: number;
  cumulativeWalletCount: number;
  averageGasPrice: string;
  averageTransactionFee: string;
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
