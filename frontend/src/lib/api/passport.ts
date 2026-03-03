import type { AssetPassport } from "./passport-types";

const PASSPORT_API =
  process.env.NEXT_PUBLIC_PASSPORT_API_URL || "/api/passports";

// ---------------------------------------------------------------------------
// Mock passport for development / fallback when the API is not connected
// ---------------------------------------------------------------------------

export const MOCK_PASSPORT: AssetPassport = {
  id: "passport-001",
  assetName: "Marina Bay Residences - Tower A",
  status: "active",
  isPrivate: false,
  isMaster: true,
  master: [],
  createdAt: "2025-09-15T08:30:00Z",
  updatedAt: "2026-02-20T14:12:00Z",

  asset: {
    assetName: "Marina Bay Residences - Tower A",
    location: {
      street: "12 Marina Boulevard",
      city: "Singapore",
      state: "Central Region",
      country: "Singapore",
      postalCode: "018982",
      coordinates: { lat: 1.2812, lng: 103.8587 },
    },
    propertyType: "Residential",
    floorSpace: 24500,
    completionDate: "2024-06-01",
    images: {
      main: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
      ],
    },
    description:
      "A premium 45-storey residential tower featuring 320 luxury apartments with panoramic marina views, smart-home integration, and world-class amenities including infinity pool, private cinema, and concierge service.",
  },

  entity: {
    developer: {
      name: "Integra Developments Pte Ltd",
      description:
        "Award-winning real estate developer specializing in sustainable luxury properties across Asia-Pacific. Over 15 years of experience with $2.5B in completed projects.",
      registrationNumber: "202301234X",
      did: "did:integra:dev:0x1234567890abcdef1234567890abcdef12345678",
    },
    governance: {
      rules:
        "Token holders with 1%+ ownership may propose and vote on building management decisions. Quorum requires 25% of total token supply. Voting period: 14 days.",
      votingMechanism:
        "Token-weighted quadratic voting via on-chain governance",
    },
  },

  property: {
    structuringOverview:
      "The asset is structured as a tokenized REIT with ERC-6960 multi-class tokens representing ownership fractions. Class A tokens carry voting rights and priority dividend distribution.",
    returnProfile:
      "Target annual yield of 4.5-6.2% from rental income, with projected capital appreciation of 3-5% per annum based on Singapore residential market trends.",
    transferRestrictions:
      "Tokens may be transferred to KYC-verified wallets only. 12-month lock-up period from initial purchase. Secondary market trading available on Integra DEX after lock-up.",
    valuations: [
      {
        date: "2024-06-15",
        value: 180000000,
        currency: "USD",
        appraiser: "Knight Frank Singapore",
      },
      {
        date: "2025-01-10",
        value: 192000000,
        currency: "USD",
        appraiser: "CBRE Asia Pacific",
      },
      {
        date: "2025-09-01",
        value: 198500000,
        currency: "USD",
        appraiser: "JLL Singapore",
      },
    ],
    unitMixes: [
      { unitType: "Studio", beds: 0, baths: 1, space: 35, count: 40 },
      { unitType: "1-Bedroom", beds: 1, baths: 1, space: 55, count: 80 },
      { unitType: "2-Bedroom", beds: 2, baths: 2, space: 85, count: 120 },
      { unitType: "3-Bedroom", beds: 3, baths: 2, space: 120, count: 60 },
      { unitType: "Penthouse", beds: 4, baths: 3, space: 250, count: 20 },
    ],
  },

  valuation: {
    assetStatus: "Completed & Operational",
    minYield: 4.5,
    maxYield: 6.2,
    minRoi: 8.0,
    maxRoi: 12.5,
    payoutSchedule: "Quarterly",
    redemption:
      "Redeemable after 12-month lock-up via secondary market or quarterly buyback window",
    leverage: "40% LTV senior secured loan from DBS Bank",
    purchasePrice: 198500000,
    debt: 79400000,
    currency: "USD",
  },

  stakeholders: {
    ownerships: [
      {
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        percentage: 35,
        purchasePrice: 69475000,
        currency: "USD",
      },
      {
        walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        percentage: 25,
        purchasePrice: 49625000,
        currency: "USD",
      },
      {
        walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
        percentage: 20,
        purchasePrice: 39700000,
        currency: "USD",
      },
      {
        walletAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
        percentage: 15,
        purchasePrice: 29775000,
        currency: "USD",
      },
      {
        walletAddress: "0x1111222233334444555566667777888899990000",
        percentage: 5,
        purchasePrice: 9925000,
        currency: "USD",
      },
    ],
    involvedParties: [
      {
        did: "did:integra:issuer:0xaaaa",
        type: "token_issuer",
        name: "Integra Securities",
        role: "Token issuance, compliance, and distribution",
      },
      {
        did: "did:integra:pm:0xbbbb",
        type: "property_manager",
        name: "Savills Property Management",
        role: "Day-to-day property management and tenant relations",
      },
      {
        did: "did:integra:legal:0xcccc",
        type: "legal_counsel",
        name: "Allen & Overy LLP",
        role: "Legal structuring and regulatory compliance",
      },
      {
        did: "did:integra:audit:0xdddd",
        type: "auditor",
        name: "PricewaterhouseCoopers",
        role: "Annual financial audit and token reconciliation",
      },
      {
        did: "did:integra:reg:0xeeee",
        type: "regulator",
        name: "Monetary Authority of Singapore",
        role: "Regulatory oversight and licensing",
      },
    ],
  },

  tokenization: {
    contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
    chain: "Integra Layer",
    standard: "ERC-6960",
    tokenId: "1",
    subTokenId: "0",
    totalSupply: "1000000",
    tokenizedPercentage: 100,
    valuation: 198500000,
    marketCap: 198500000,
    ownerWallet: "0x1234567890abcdef1234567890abcdef12345678",
    currency: "USD",
  },

  verification: {
    attestations: [
      {
        documentType: "Title Deed",
        ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        verificationStatus: "verified",
        verifier: {
          did: "did:integra:verifier:0x1111",
          type: "Legal Authority",
          name: "Singapore Land Authority",
        },
        downloadUrl: "#",
        timestamp: "2024-06-15T10:00:00Z",
      },
      {
        documentType: "Building Completion Certificate",
        ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        verificationStatus: "verified",
        verifier: {
          did: "did:integra:verifier:0x2222",
          type: "Government Authority",
          name: "Building & Construction Authority",
        },
        downloadUrl: "#",
        timestamp: "2024-06-20T14:30:00Z",
      },
      {
        documentType: "Valuation Report (2025)",
        ipfsHash: "QmZ4tDuvesekSs4qM5DPBsKQy5tP4hFBqyu1jHU3Ewx8Rr",
        verificationStatus: "verified",
        verifier: {
          did: "did:integra:verifier:0x3333",
          type: "Appraiser",
          name: "JLL Singapore",
        },
        downloadUrl: "#",
        timestamp: "2025-09-01T09:15:00Z",
      },
      {
        documentType: "Environmental Impact Assessment",
        ipfsHash: "QmPZ9gcCEpqKTo6aq8SiQjr2Vro5JYvZuTNg3rRfHj5j1r",
        verificationStatus: "pending",
        verifier: {
          did: "did:integra:verifier:0x4444",
          type: "Environmental Authority",
          name: "National Environment Agency",
        },
        timestamp: "2026-01-15T11:00:00Z",
      },
    ],
  },

  history: {
    transactions: [
      {
        hash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
        type: "Token Issuance",
        fromAddress: "0x0000000000000000000000000000000000000000",
        toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
        amount: "1000000",
        blockNumber: 248500,
        gasFee: "0.0025",
        status: "success",
        timestamp: "2025-09-15T08:30:00Z",
      },
      {
        hash: "0xdef456abc789012345678901234567890abcdef1234567890abcdef12345678",
        type: "Ownership Transfer",
        fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
        toAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        amount: "250000",
        blockNumber: 250120,
        gasFee: "0.0018",
        status: "success",
        timestamp: "2025-10-01T12:00:00Z",
      },
      {
        hash: "0x789012345678901234567890abcdef1234567890abcdef1234567890abcdef12",
        type: "Dividend Distribution",
        fromAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
        toAddress: "0x1234567890abcdef1234567890abcdef12345678",
        amount: "2485000",
        blockNumber: 265890,
        gasFee: "0.0032",
        status: "success",
        timestamp: "2025-12-31T23:59:00Z",
      },
      {
        hash: "0x345678901234567890abcdef1234567890abcdef1234567890abcdef12345678",
        type: "Ownership Transfer",
        fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
        toAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
        amount: "150000",
        blockNumber: 270450,
        gasFee: "0.0021",
        status: "success",
        timestamp: "2026-01-15T09:30:00Z",
      },
      {
        hash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
        type: "Attestation Submission",
        fromDid: "did:integra:verifier:0x3333",
        toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
        amount: "0",
        blockNumber: 275100,
        gasFee: "0.0015",
        status: "pending",
        timestamp: "2026-02-20T14:12:00Z",
      },
    ],
  },

  metadata: {
    fieldPrivacy: {
      "stakeholders.ownerships": false,
      "valuation.debt": false,
    },
  },
};

const MOCK_PASSPORT_PRIVATE: AssetPassport = {
  ...MOCK_PASSPORT,
  id: "passport-002",
  assetName: "Orchard Road Commercial Complex",
  status: "pending",
  isPrivate: true,
  isMaster: false,
  master: ["passport-001"],
  createdAt: "2026-01-10T10:00:00Z",
  updatedAt: "2026-02-18T16:45:00Z",
  asset: {
    ...MOCK_PASSPORT.asset,
    assetName: "Orchard Road Commercial Complex",
    propertyType: "Commercial",
    floorSpace: 42000,
    location: {
      street: "238 Orchard Road",
      city: "Singapore",
      state: "Central Region",
      country: "Singapore",
      postalCode: "238855",
      coordinates: { lat: 1.3048, lng: 103.832 },
    },
    description:
      "A flagship mixed-use commercial complex featuring Grade A office space, premium retail, and a rooftop urban farm.",
  },
  tokenization: {
    ...MOCK_PASSPORT.tokenization,
    contractAddress: "0x8Fc4532925a3b844Bc9e7595f2bD28742d35Cc66",
    standard: "ERC-1155",
    totalSupply: "5000000",
    valuation: 450000000,
    marketCap: 450000000,
  },
  metadata: {
    fieldPrivacy: {
      "valuation.debt": true,
      "stakeholders.ownerships": true,
    },
  },
};

const MOCK_PASSPORTS: AssetPassport[] = [MOCK_PASSPORT, MOCK_PASSPORT_PRIVATE];

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getPassports(): Promise<AssetPassport[]> {
  try {
    const res = await fetch(`${PASSPORT_API}/assets`);
    if (!res.ok) return MOCK_PASSPORTS;
    return res.json();
  } catch {
    // API not connected — return mock data for development
    return MOCK_PASSPORTS;
  }
}

export async function getPassport(id: string): Promise<AssetPassport | null> {
  try {
    const res = await fetch(`${PASSPORT_API}/assets/${id}`);
    if (!res.ok) {
      // Fallback to mock data
      return MOCK_PASSPORTS.find((p) => p.id === id) ?? null;
    }
    return res.json();
  } catch {
    return MOCK_PASSPORTS.find((p) => p.id === id) ?? null;
  }
}

export async function verifyPassportPassword(
  id: string,
  password: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `${PASSPORT_API}/assets/verify-private-link-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      },
    );
    return res.ok;
  } catch {
    // Fail closed — deny access on any API error
    return false;
  }
}
