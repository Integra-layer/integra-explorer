# Integra Explorer Frontend

Integra Explorer is a blockchain explorer for the Integra Layer Ethermint chain, built with Next.js 16, React 19, and TypeScript.

## Quick Facts

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Runtime**: Node.js 20+ (Alpine in Docker)
- **Key Features**: Block/transaction/validator/address exploration, bech32-to-EVM address mapping, real-time updates via Soketi/Pusher, ambient lighting effects

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Type Safety | TypeScript 5 |
| Data Fetching | TanStack React Query v5 |
| Real-time | Soketi / Pusher JS |
| Themes | next-themes |
| Icons | Lucide React |
| Build | Turbopack with React Compiler |

## Architecture Decisions

1. **Standalone Output**: `output: "standalone"` in next.config.ts produces a minimal, self-contained bundle for Docker. Static files are copied separately.

2. **NEXT_PUBLIC_ Variables Are Baked In**: All `NEXT_PUBLIC_*` environment variables are embedded into the JavaScript bundle at build time, not runtime. They must be provided as `--build-arg` in Docker or as environment variables before `npm run build` locally.

3. **Bech32 Codec**: Custom implementation in `src/lib/bech32.ts` converts Cosmos bech32 addresses (e.g., `integra1...`) to EVM hex (0x...) using 5-bit to 8-bit conversion. No external library dependency.

4. **Validator Map Hook**: `src/lib/hooks/use-validators.ts` fetches and caches validators from the Cosmos REST API, enabling address → validator lookup across pages.

5. **Search Auto-Detection**: `src/lib/hooks/use-search-detect.ts` parses user input and automatically routes to the correct page: block height, tx hash, address, or proposal ID.

6. **Real-time Updates**: Soketi (Pusher-compatible) events push block/tx updates to connected clients for live feeds without polling.

7. **API Proxying**: `NEXT_PUBLIC_API_URL=/api` assumes Caddy or nginx proxies `/api/*` to the Ethernal backend. No CORS issues in production.

## File Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Home (hero + latest blocks/txs)
│   ├── blocks/       # Block list and detail pages
│   ├── transactions/ # Tx list and detail pages
│   ├── validators/   # Validator list and detail pages
│   ├── address/      # Address detail (bech32 or EVM)
│   ├── tokens/       # Token list and details
│   ├── proposals/    # Governance proposals
│   ├── passport/     # Digital asset passports
│   ├── faucet/       # Testnet faucet
│   ├── resources/    # RPC/REST endpoints, docs links
│   ├── layout.tsx    # Root layout, providers, navbar
│   └── globals.css   # Tailwind directives + custom styles
│
├── components/       # Reusable UI components
│   ├── home/         # Hero section, latest feeds
│   ├── blocks/       # Block list table, detail card
│   ├── transactions/ # Tx list table, detail card
│   ├── validators/   # Validator list, detail, status
│   ├── search/       # Global search command palette
│   ├── layout/       # Navbar, footer, breadcrumb
│   ├── address/      # Address header, balance, txs
│   ├── tokens/       # Token list, transfers
│   ├── common/       # Badge, copy button, time display
│   └── ui/           # shadcn/ui component variants
│
├── lib/              # Utilities and hooks
│   ├── api/          # Ethernal + Cosmos REST clients
│   │   ├── blocks.ts
│   │   ├── transactions.ts
│   │   ├── validators.ts
│   │   ├── addresses.ts
│   │   └── ...
│   ├── hooks/        # Custom React hooks (React Query)
│   │   ├── use-blocks.ts
│   │   ├── use-validators.ts
│   │   ├── use-search-detect.ts
│   │   └── ...
│   ├── bech32.ts     # Bech32 codec for address conversion
│   ├── format.ts     # Number formatting, time display
│   ├── utils.ts      # General utilities
│   ├── *-provider.tsx # Context providers
│   └── pusher.ts     # Soketi client initialization
└── public/           # Static assets

next.config.ts       # Build config (standalone, turbopack, react compiler)
tsconfig.json        # TypeScript config
Dockerfile           # Multi-stage Docker build
.env.local.example   # Environment variable template
.dockerignore        # Docker build exclusions
```

## Environment Variables

All variables prefixed with `NEXT_PUBLIC_` are embedded into the client bundle at build time.

| Variable | Type | Example | Purpose |
|----------|------|---------|---------|
| `NEXT_PUBLIC_NETWORK_MODE` | "testnet" \| "mainnet" | `testnet` | Controls network badge visibility on UI |
| `NEXT_PUBLIC_API_URL` | string | `/api` | Base path for Ethernal API (proxied by Caddy) |
| `NEXT_PUBLIC_WORKSPACE_ID` | string | `Integra Testnet` | Workspace name in Ethernal (NOT numeric ID) |
| `NEXT_PUBLIC_PUSHER_KEY` | string | (empty for testnet) | Soketi/Pusher public key for real-time events |
| `NEXT_PUBLIC_PUSHER_HOST` | string | `testnet.explorer.integralayer.com` | Soketi server hostname |
| `NEXT_PUBLIC_PUSHER_PORT` | number | `6002` | Soketi WebSocket port |
| `NEXT_PUBLIC_COSMOS_API_URL` | string | `https://testnet.integralayer.com/api` | Cosmos REST API for validators/governance |
| `NEXT_PUBLIC_SITE_URL` | string | `https://testnet.explorer.integralayer.com` | Full site URL (used for SSR API calls) |

### Development vs. Production

**Development**: Copy `.env.local.example` to `.env.local` and fill in values. `npm run dev` will read these at runtime.

**Production (Docker)**: Pass variables as `--build-arg` during build. They are baked into the JavaScript bundle:

```bash
docker build \
  --build-arg NEXT_PUBLIC_NETWORK_MODE=mainnet \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg NEXT_PUBLIC_WORKSPACE_ID="Integra Mainnet" \
  --build-arg NEXT_PUBLIC_PUSHER_HOST=explorer.integralayer.com \
  --build-arg NEXT_PUBLIC_COSMOS_API_URL=https://mainnet.integralayer.com/api \
  --build-arg NEXT_PUBLIC_SITE_URL=https://explorer.integralayer.com \
  -t integra-explorer:latest .
```

**Gotcha**: If you build the image locally and then push to production without rebuilding, the environment variables will be wrong (they were baked in at build time). Always rebuild on the target server or use a CI/CD pipeline that rebuilds for each environment.

## Build & Deployment

### Local Development

```bash
# Install dependencies
npm install

# Run dev server (hot reload, reads .env.local at runtime)
npm run dev
# Open http://localhost:3000
```

### Build for Production

```bash
# Build the Next.js app (generates .next/standalone and .next/static)
npm run build

# Test the built app locally
npm start
# Open http://localhost:3000
```

### Docker Build

```bash
# Build image with testnet config
docker build \
  --build-arg NEXT_PUBLIC_NETWORK_MODE=testnet \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg NEXT_PUBLIC_WORKSPACE_ID="Integra Testnet" \
  --build-arg NEXT_PUBLIC_PUSHER_HOST=testnet.explorer.integralayer.com \
  --build-arg NEXT_PUBLIC_COSMOS_API_URL=https://testnet.integralayer.com/api \
  --build-arg NEXT_PUBLIC_SITE_URL=https://testnet.explorer.integralayer.com \
  -t integra-explorer:testnet .

# Run container
docker run -p 3000:3000 integra-explorer:testnet
```

### Production Deployment

1. Build the image with production environment variables.
2. Push to registry (e.g., Docker Hub, AWS ECR).
3. Deploy via Kubernetes, Docker Swarm, or VM (e.g., Docker Compose on EC2).
4. Ensure Caddy or nginx proxies `/api/*` to the Ethernal backend.
5. Configure TLS (Let's Encrypt) for HTTPS.

## Key Patterns

### Bech32 Address Conversion

```typescript
import { bech32Decode } from "@/lib/bech32";

const address = "integra1abc..."; // Cosmos bech32
const evmAddress = bech32Decode(address); // 0x123...
```

- Converts 5-bit bech32 data to 8-bit bytes.
- Returns 20-byte EVM hex address.
- Returns `null` if checksum fails or address is invalid.

### Validator Map Hook

```typescript
import { useValidators } from "@/lib/hooks/use-validators";

export function SomeComponent() {
  const { validators, isLoading } = useValidators();
  const validator = validators.find(v => v.address === myAddress);
  // ...
}
```

- Fetches validators once from `NEXT_PUBLIC_COSMOS_API_URL/cosmos/staking/v1beta1/validators`.
- Caches result using React Query.
- Used across pages for address → validator name/details lookup.

### Search Auto-Detection

```typescript
import { useSearchDetect } from "@/lib/hooks/use-search-detect";

const { type, value } = useSearchDetect("0xABC123..."); // { type: "address", value: "0xABC123..." }
```

- Detects block height (numeric), tx hash (0x...), address (0x... or bech32), proposal ID.
- Routes user to correct page without manual selection.

### React Query Data Fetching

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchBlocks } from "@/lib/api/blocks";

export function BlockList() {
  const { data, isLoading } = useQuery({
    queryKey: ["blocks"],
    queryFn: () => fetchBlocks(),
  });
  // ...
}
```

- All API calls wrapped in React Query for caching, refetching, pagination.
- Queries auto-refresh on window focus.
- Stale data is revalidated in background.

## Testing

### Manual Testing

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Test key flows:
   - Block list → block detail
   - Transaction list → tx detail
   - Search: enter "0x...", "integra1...", "123" (block height), "proposal-1"
   - Validator list → validator detail
   - Address detail (both bech32 and EVM formats)

### Build Verification

```bash
npm run build
npm start
# Visit http://localhost:3000 and verify all pages load
```

### Linting

```bash
npm run lint
# Fix issues with ESLint
```

## Common Gotchas

### 1. NEXT_PUBLIC Variables in Docker

Variables prefixed `NEXT_PUBLIC_` are embedded into the JavaScript bundle at build time. If you build the image, then change `.env.local`, the running container will still use the old values. **Always rebuild the image** when environment changes.

### 2. Bech32 5-Bit Encoding

Bech32 uses 5-bit encoding, but EVM addresses are 8-bit bytes. The conversion must pad and reframe:

```
5-bit: 11111 11111 ... (bech32 charset)
8-bit: 11111111 11111111 ... (bytes)
```

The `convertBits` function in `src/lib/bech32.ts` handles this. Incorrect padding breaks the address.

### 3. Workspace ID Must Match Ethernal

`NEXT_PUBLIC_WORKSPACE_ID` must exactly match the workspace name in Ethernal (e.g., "Integra Testnet"), NOT the numeric workspace ID. If it doesn't match, API calls will fail silently.

### 4. Cors in Local Dev

In development, the app runs on `http://localhost:3000` and the API is likely on another port/host. Make sure the backend has CORS headers set, or use a local proxy (e.g., `next.config.ts` rewrites).

### 5. Soketi Port Must Be Accessible

If `NEXT_PUBLIC_PUSHER_PORT` is 6002, ensure the firewall and reverse proxy allow WebSocket connections on that port. HTTP upgrades to WS may fail if not configured.

## Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production (generates .next/standalone)
npm start        # Start production server (uses built .next/)
npm run lint     # Run ESLint
```

## Dependencies

### Production

- `next` 16.1.6 — Framework
- `react` 19.2.3, `react-dom` 19.2.3 — UI library
- `@tanstack/react-query` 5.90.21 — Data fetching
- `tailwindcss` 4 — Utility CSS
- `framer-motion` 12.34.4 — Animations
- `lucide-react` 0.576.0 — Icons
- `next-themes` 0.4.6 — Theme switching
- `pusher-js` 8.4.0 — Real-time updates
- `radix-ui` 1.4.3, `class-variance-authority`, `clsx`, `tailwind-merge` — shadcn/ui dependencies

### Development

- TypeScript 5, ESLint 9, Prettier — Code quality
- `@tailwindcss/postcss` 4 — Tailwind v4
- `babel-plugin-react-compiler` 1.0.0 — React Compiler

## Related Documentation

- [Integra Explorer Architecture](../docs/architecture.md) — System design, data flow
- [Ethernal API Docs](../docs/ethernal-api.md) — Block, tx, validator endpoints
- [Cosmos REST API](https://docs.cosmos.network/main/build/modules/staking) — Validator endpoints

## Questions?

Refer to the [Integra Layer Developer Docs](https://integra-layer.notion.site) or contact the core team.
