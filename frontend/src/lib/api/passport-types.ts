/**
 * Asset Passport data model types.
 * Based on the Integra passport specification for tokenized real-world assets.
 */

// Main passport structure
export interface AssetPassport {
  id: string;
  assetName: string;
  status: "active" | "pending" | "archived";
  isPrivate: boolean;
  isMaster: boolean;
  master?: string[]; // chain-of-custody parent passport IDs
  createdAt: string;
  updatedAt: string;

  // Tab data
  asset: AssetInfo;
  entity: EntityInfo;
  property: PropertyInfo;
  valuation: ValuationInfo;
  stakeholders: StakeholderInfo;
  tokenization: TokenizationInfo;
  verification: VerificationInfo;
  history: HistoryInfo;

  metadata?: {
    fieldPrivacy?: Record<string, boolean>; // field-level privacy
  };
}

// Tab 1: Asset
export interface AssetInfo {
  assetName: string;
  location: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };
  propertyType: string; // "Residential", "Commercial", etc.
  floorSpace: number; // in sqm
  completionDate: string;
  images: {
    main: string; // URL
    gallery: string[]; // URLs
  };
  description?: string;
}

// Tab 2: Entity
export interface EntityInfo {
  developer: {
    name: string;
    description: string;
    registrationNumber: string;
    did?: string; // W3C DID
  };
  governance: {
    rules: string;
    votingMechanism?: string;
  };
}

// Tab 3: Property
export interface PropertyInfo {
  structuringOverview: string;
  returnProfile: string;
  transferRestrictions: string;
  valuations: Array<{
    date: string;
    value: number;
    currency: string;
    appraiser: string;
  }>;
  unitMixes: Array<{
    unitType: string;
    beds: number;
    baths: number;
    space: number; // sqm
    count: number;
  }>;
}

// Tab 4: Valuation
export interface ValuationInfo {
  assetStatus: string;
  minYield: number;
  maxYield: number;
  minRoi: number;
  maxRoi: number;
  payoutSchedule: string;
  redemption: string;
  leverage: string;
  purchasePrice: number;
  debt: number;
  currency: string;
}

// Tab 5: Stakeholder
export interface StakeholderInfo {
  ownerships: Array<{
    walletAddress: string;
    percentage: number;
    purchasePrice: number;
    currency: string;
  }>;
  involvedParties: Array<{
    did: string;
    type:
      | "token_issuer"
      | "property_manager"
      | "legal_counsel"
      | "auditor"
      | "regulator";
    name: string;
    role: string;
  }>;
}

// Tab 6: Tokenization
export interface TokenizationInfo {
  contractAddress: string;
  chain: string;
  standard: "ERC-20" | "ERC-721" | "ERC-1155" | "ERC-6960";
  tokenId?: string;
  subTokenId?: string;
  totalSupply: string;
  tokenizedPercentage: number;
  valuation: number;
  marketCap: number;
  ownerWallet: string;
  currency: string;
}

// Tab 7: Verification
export interface VerificationInfo {
  attestations: Array<{
    documentType: string;
    ipfsHash: string;
    verificationStatus: "verified" | "pending" | "rejected";
    verifier: {
      did: string;
      type: string;
      name: string;
    };
    downloadUrl?: string;
    timestamp: string;
  }>;
}

// Tab 8: History
export interface HistoryInfo {
  transactions: Array<{
    hash: string;
    type: string;
    fromDid?: string;
    fromAddress?: string;
    toDid?: string;
    toAddress?: string;
    amount: string;
    blockNumber: number;
    gasFee: string;
    status: "success" | "pending" | "failed";
    timestamp: string;
  }>;
}
