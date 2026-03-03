# Integra Explorer Frontend

A blockchain explorer for the Integra Layer Ethermint chain. Built with Next.js 16, React 19, Tailwind CSS, and shadcn/ui.

## Features

- **Block & Transaction Explorer** — Browse blocks, transactions, and their details
- **Validator Directory** — View active validators, bonded status, voting power
- **Address Details** — Display address balances, transaction history (both bech32 and EVM formats)
- **Governance** — View on-chain proposals and voting results
- **Bech32-to-EVM Conversion** — Automatic address format detection and conversion
- **Real-time Updates** — Live block and transaction feeds via Soketi
- **Token Explorer** — Browse token contracts and transfers
- **Testnet/Mainnet Toggle** — Network mode display in UI
- **Dark Mode** — Full dark theme support with Tailwind + next-themes

## Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start dev server (http://localhost:3000)
npm run dev
```

Changes to files in `src/` hot-reload automatically.

### Production Build

```bash
# Build optimized bundle
npm run build

# Test the build locally
npm start
# Open http://localhost:3000
```

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_NETWORK_MODE` | Yes | "testnet" or "mainnet" — controls UI badge |
| `NEXT_PUBLIC_API_URL` | Yes | Path to Ethernal backend (e.g., `/api`) |
| `NEXT_PUBLIC_WORKSPACE_ID` | Yes | Workspace name in Ethernal (must match exactly) |
| `NEXT_PUBLIC_COSMOS_API_URL` | Yes | Cosmos REST API endpoint |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full site URL for SSR calls |
| `NEXT_PUBLIC_PUSHER_KEY` | No | Soketi key for real-time updates (optional) |
| `NEXT_PUBLIC_PUSHER_HOST` | No | Soketi hostname (optional) |
| `NEXT_PUBLIC_PUSHER_PORT` | No | Soketi WebSocket port (default: 6002) |

See [CLAUDE.md](./CLAUDE.md) for detailed variable descriptions.

## Docker

### Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_NETWORK_MODE=testnet \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg NEXT_PUBLIC_WORKSPACE_ID="Integra Testnet" \
  --build-arg NEXT_PUBLIC_PUSHER_HOST=testnet.explorer.integralayer.com \
  --build-arg NEXT_PUBLIC_COSMOS_API_URL=https://testnet.integralayer.com/api \
  --build-arg NEXT_PUBLIC_SITE_URL=https://testnet.explorer.integralayer.com \
  -t integra-explorer:latest .
```

### Run

```bash
docker run -p 3000:3000 integra-explorer:latest
```

The app will be available at `http://localhost:3000`.

**Important**: All `NEXT_PUBLIC_*` variables must be provided as `--build-arg` during build. They are embedded into the JavaScript bundle and cannot be changed at runtime.

## Production Deployment

### Prerequisites

- Ethernal backend running and accessible at your API endpoint
- Cosmos REST API endpoint available
- Reverse proxy (Caddy or nginx) configured to proxy `/api/*` to Ethernal

### Steps

1. Build the Docker image with production environment variables:

```bash
docker build \
  --build-arg NEXT_PUBLIC_NETWORK_MODE=mainnet \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg NEXT_PUBLIC_WORKSPACE_ID="Integra Mainnet" \
  --build-arg NEXT_PUBLIC_PUSHER_HOST=explorer.integralayer.com \
  --build-arg NEXT_PUBLIC_COSMOS_API_URL=https://mainnet.integralayer.com/api \
  --build-arg NEXT_PUBLIC_SITE_URL=https://explorer.integralayer.com \
  -t integra-explorer:mainnet .
```

2. Push to your registry (Docker Hub, ECR, etc.):

```bash
docker tag integra-explorer:mainnet myregistry/integra-explorer:mainnet
docker push myregistry/integra-explorer:mainnet
```

3. Deploy via your orchestration tool (Kubernetes, Docker Compose, VM, etc.):

```bash
# Example: Docker Compose
docker-compose up -d
```

4. Configure your reverse proxy to:
   - Proxy `/api/*` to the Ethernal backend
   - Proxy `/rpc`, `/rest`, `/ws` to chain endpoints
   - Enable CORS headers if needed
   - Set up TLS certificates (Let's Encrypt recommended)

## Architecture

See [CLAUDE.md](./CLAUDE.md) for:
- Technology stack details
- File structure overview
- Key architecture decisions
- Development patterns
- Common gotchas

## Scripts

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Key Patterns

### Bech32 Address Conversion

Automatically converts Cosmos bech32 addresses (e.g., `integra1...`) to EVM hex (0x...) using the `bech32Decode` utility.

```typescript
import { bech32Decode } from "@/lib/bech32";
const evmAddress = bech32Decode("integra1abc...");
```

### Search Auto-Detection

Smart search parses input and routes to the correct page:
- Block height (numeric): → blocks
- Transaction hash (0x...): → transactions
- Address (0x... or bech32): → address detail
- Proposal ID (proposal-...): → proposals

### React Query Data Fetching

All API calls use React Query for automatic caching, refetching, and pagination:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["blocks"],
  queryFn: () => fetchBlocks(),
});
```

### Real-time Updates

Soketi/Pusher events automatically push new blocks and transactions to all connected clients.

## Testing

### Manual

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Test key flows:
   - Block list → block detail
   - Search with address, block height, tx hash
   - Validator directory
   - Address detail (both formats)

### Build

```bash
npm run build
npm start
# Verify all pages load
```

### Lint

```bash
npm run lint
```

## Troubleshooting

### Environment variables not updating

NEXT_PUBLIC_* variables are baked into the bundle at build time. If you changed `.env.local`, you must rebuild:

```bash
npm run build
npm start
```

### API calls failing

Check that:
- `NEXT_PUBLIC_API_URL` is correct (default: `/api`)
- Your reverse proxy correctly routes `/api/*` to Ethernal
- `NEXT_PUBLIC_WORKSPACE_ID` exactly matches the workspace name in Ethernal
- CORS headers are set if frontend and backend are on different origins

### Real-time updates not working

Check that:
- `NEXT_PUBLIC_PUSHER_KEY` is set (or leave empty to disable)
- Soketi server is running and accessible on `NEXT_PUBLIC_PUSHER_HOST:NEXT_PUBLIC_PUSHER_PORT`
- Firewall allows WebSocket connections on the specified port

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) — Developer guide, architecture, patterns
- [Integra Layer Docs](https://integra-layer.notion.site) — Chain documentation
- [Next.js Docs](https://nextjs.org/docs) — Framework reference
- [Tailwind CSS](https://tailwindcss.com) — Styling guide

## License

Refer to the LICENSE file in the repository root.
