# Integra Explorer — Local Development Guide

Complete instructions to run the Integra Explorer stack locally: backend, frontends, PM2 server, workers, and supporting services.

---

## Architecture Overview

| Component | Port | Description |
|-----------|------|-------------|
| **Backend (run/)** | 8888 | Express API, database access, job queue |
| **Vue Admin (root)** | 8080 | Ethernal admin UI (create explorers, manage sync) |
| **Next.js Explorer (frontend/)** | 3000 | Public Integra block explorer |
| **PM2 Server (pm2-server/)** | 9090 | Manages block sync processes |
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Job queue (BullMQ) |
| **Soketi** | 6001 | WebSocket server (real-time updates) |

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **PostgreSQL** 14+ or 17 with TimescaleDB
- **Redis** 7+ (6.2+ also works; used for BullMQ job queue)
- **ethernal-light** (for block sync): `yarn global add ethernal-light` or `npm install -g ethernal-light`
- **Soketi** (for real-time updates): `npm install -g @soketi/soketi`
- **Anvil** (optional, for local EVM RPC): `curl -L https://foundry.paradigm.xyz | bash` then `foundryup`

---

## 1. Database & Redis

Ensure PostgreSQL (with TimescaleDB) and Redis are running locally. Note connection details for `run/.env`.

---

## 1b. Soketi (WebSocket server)

Required for real-time block/transaction updates in the admin and explorer.

```bash
npm install -g @soketi/soketi
soketi start
```

Soketi listens on **6001** (HTTP) and **9601** (metrics). Default credentials: `app-id`, `app-key`, `app-secret`. Redis is optional for single-instance local dev (required for multi-instance presence).

---

## 1c. Anvil (local EVM RPC, optional)

For local blockchain testing. The frontend uses `NEXT_PUBLIC_EVM_RPC_URL=http://127.0.0.1:8545` by default.

```bash
# Install Foundry (includes Anvil)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Run local chain (--block-time 2 = mine a new block every 2 seconds)
anvil --block-time 2
```

Anvil listens on **8545**. Use a remote RPC (e.g. `https://testnet.integralayer.com/evm`) if you don't need a local node.

---

## 2. Backend (`run/`)

### Environment: `run/.env`

```env
NODE_ENV=development

# Database (Sequelize uses DB_* vars, not DATABASE_URL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ethernal

# Redis
REDIS_URL=redis://localhost:6379

# Encryption & Secrets (generate with: openssl rand -hex 16)
ENCRYPTION_KEY=CHANGE_ME_32_CHAR_HEX
ENCRYPTION_JWT_SECRET=CHANGE_ME_64_CHAR_HEX
SECRET=CHANGE_ME_32_CHAR_ALPHANUMERIC
AUTH_SECRET=CHANGE_ME_64_CHAR_HEX

# Firebase Auth (self-hosted)
FIREBASE_SIGNER_KEY=localdevsignerkey1234567890abcdef
FIREBASE_SALT_SEPARATOR=Bw==
FIREBASE_ROUNDS=8
FIREBASE_MEM_COST=14

# Soketi / WebSocket
SOKETI_DEFAULT_APP_ID=app-id
SOKETI_DEFAULT_APP_KEY=app-key
SOKETI_DEFAULT_APP_SECRET=app-secret
SOKETI_HOST=localhost
SOKETI_PORT=6001
SOKETI_SCHEME=http

# App
APP_DOMAIN=localhost:8080
APP_URL=http://localhost:8080
PORT=8888
SELF_HOSTED=true
DEFAULT_PLAN_SLUG=self-hosted

# PM2 Server (block sync)
PM2_HOST=http://localhost:9090
PM2_SECRET=your-pm2-secret

# Stripe (for /plans, create explorers)
STRIPE_SECRET_KEY=your-stripe-test-key-from-dashboard
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Logging (optional)
LOG_LEVEL=debug
```

### Commands

```bash
cd run
npm install
npx sequelize db:migrate
npx sequelize db:seed:all   # Seeds stripe_plans (e.g. self-hosted plan)
npm start
```

### Workers (separate terminals)

```bash
cd run
npm run worker:high &
npm run worker:medium &
npm run worker:low &
```

---

## 3. PM2 Server (`pm2-server/`)

Manages block sync processes. Must be running for Start Sync to work.

### Environment: `pm2-server/.env`

```env
SECRET=your-pm2-secret
ETHERNAL_HOST=http://localhost:8888
ETHERNAL_SECRET=CHANGE_ME_32_CHAR_ALPHANUMERIC
PORT=9090
```

- `SECRET` must match `PM2_SECRET` in `run/.env`
- `ETHERNAL_SECRET` must match `SECRET` in `run/.env`

### Commands

```bash
cd pm2-server
npm install
yarn global add ethernal-light   # or: npm install -g ethernal-light
npm run start:dev
```

---

## 4. Vue Admin (root)

Ethernal admin UI for creating explorers, managing sync, etc.

### Environment: `.env` (project root)

```env
# Soketi / WebSocket (for real-time updates in admin)
VITE_SOKETI_HOST=localhost
VITE_SOKETI_PORT=6001
VITE_SOKETI_KEY=app-key
```

The admin fetches from the backend via Vite proxy. Ensure `run/.env` is correct for the backend.

### Commands

```bash
cd /path/to/integra-explorer
yarn install
yarn dev
```

Opens at **http://localhost:8080**. API requests are proxied to `http://localhost:8888`.

---

## 5. Next.js Explorer (`frontend/`)

Public Integra block explorer.

### Environment: `frontend/.env.local`

```env
# Network mode
NEXT_PUBLIC_NETWORK_MODE=testnet

# Backend API (direct URL for local dev)
NEXT_PUBLIC_API_URL=http://localhost:8888/api

# Workspace (must match DB)
NEXT_PUBLIC_WORKSPACE_ID=Integra Testnet
NEXT_PUBLIC_ETHERNAL_WORKSPACE_DB_ID=6
ETHERNAL_WORKSPACE_ID=6

# Soketi (for pusher-auth route)
SOKETI_DEFAULT_APP_KEY=app-key
SOKETI_DEFAULT_APP_SECRET=app-secret

# Pusher / real-time updates
NEXT_PUBLIC_PUSHER_KEY=app-key
NEXT_PUBLIC_PUSHER_HOST=localhost
NEXT_PUBLIC_PUSHER_PORT=6001

# Cosmos API
NEXT_PUBLIC_COSMOS_API_URL=https://testnet.integralayer.com/api

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Reown (WalletConnect)
NEXT_PUBLIC_REOWN_PROJECT_ID=your-project-id

# EVM RPC (local node or remote)
NEXT_PUBLIC_EVM_RPC_URL=http://127.0.0.1:8545

# Faucet & Blockscout (optional)
NEXT_PUBLIC_FAUCET_API_URL=/api/faucet
NEXT_PUBLIC_BLOCKSCOUT_URL=https://testnet.blockscout.integralayer.com

# Firebase User ID (owner of workspace, required for API auth)
NEXT_PUBLIC_FIREBASE_USER_ID=your-firebase-user-id

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=
```

### Commands

```bash
cd frontend
npm install
npm run dev
```

Opens at **http://localhost:3000**.

---

## Start Order (Recommended)

1. PostgreSQL + Redis
2. Soketi (for real-time updates)
3. Anvil (optional, if using local RPC)
4. Backend
5. Workers (high, medium, low)
6. PM2 server
7. Vue admin (or Next.js explorer)

```bash
# Terminal 1: Backend
cd run && npm start

# Terminal 2–4: Workers
cd run && npm run worker:high
cd run && npm run worker:medium
cd run && npm run worker:low

# Terminal 5: PM2 server
cd pm2-server && npm run start:dev

# Terminal 6: Vue admin
yarn dev

# Terminal 7: Next.js explorer (optional)
cd frontend && npm run dev
```

---

## Environment Variables Summary

### `run/.env` (Backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_USER` | Yes | PostgreSQL user |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | Yes | Database name |
| `REDIS_URL` | Yes | Redis connection string |
| `ENCRYPTION_KEY` | Yes | 32-char hex |
| `ENCRYPTION_JWT_SECRET` | Yes | 64-char hex |
| `SECRET` | Yes | App secret |
| `AUTH_SECRET` | Yes | Auth secret |
| `FIREBASE_SIGNER_KEY` | Yes | Firebase signer key |
| `FIREBASE_SALT_SEPARATOR` | Yes | Firebase salt separator |
| `FIREBASE_ROUNDS` | No | Default 8 |
| `FIREBASE_MEM_COST` | No | Default 14 |
| `SOKETI_DEFAULT_APP_ID` | No | Soketi app ID |
| `SOKETI_DEFAULT_APP_KEY` | No | Soketi app key |
| `SOKETI_DEFAULT_APP_SECRET` | No | Soketi app secret |
| `SOKETI_HOST` | No | Soketi host |
| `SOKETI_PORT` | No | Soketi port |
| `SOKETI_SCHEME` | No | http or https |
| `APP_DOMAIN` | Yes | Domain (e.g. localhost:8080) |
| `APP_URL` | Yes | Full URL |
| `PORT` | No | Default 6000, use 8888 for consistency |
| `SELF_HOSTED` | No | Set true for self-hosted |
| `DEFAULT_PLAN_SLUG` | No | Default plan (e.g. self-hosted) |
| `PM2_HOST` | Yes | e.g. http://localhost:9090 |
| `PM2_SECRET` | Yes | Must match pm2-server SECRET |
| `STRIPE_SECRET_KEY` | For /plans | Stripe test key |
| `STRIPE_WEBHOOK_SECRET` | For /plans | Stripe webhook secret |
| `LOG_LEVEL` | No | debug, info, etc. |

### `.env` (root — Vue admin)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SOKETI_HOST` | No | Soketi host (default: localhost) |
| `VITE_SOKETI_PORT` | No | Soketi port (default: 6001) |
| `VITE_SOKETI_KEY` | No | Soketi app key (default: app-key) |

### `pm2-server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET` | Yes | Must match run PM2_SECRET |
| `ETHERNAL_HOST` | Yes | Backend URL (e.g. http://localhost:8888) |
| `ETHERNAL_SECRET` | Yes | Must match run SECRET |
| `PORT` | No | Default 9090 |

### `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (e.g. http://localhost:8888/api) |
| `NEXT_PUBLIC_WORKSPACE_ID` | Yes | Workspace name in DB |
| `NEXT_PUBLIC_ETHERNAL_WORKSPACE_DB_ID` | No | Workspace DB ID |
| `ETHERNAL_WORKSPACE_ID` | No | Workspace DB ID (for pusher-auth) |
| `SOKETI_DEFAULT_APP_KEY` | No | For pusher-auth route |
| `SOKETI_DEFAULT_APP_SECRET` | No | For pusher-auth route |
| `NEXT_PUBLIC_PUSHER_KEY` | No | Soketi key for real-time |
| `NEXT_PUBLIC_PUSHER_HOST` | No | Soketi host |
| `NEXT_PUBLIC_PUSHER_PORT` | No | Soketi port |
| `NEXT_PUBLIC_FIREBASE_USER_ID` | Yes | Owner's Firebase UID |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full site URL |
| `NEXT_PUBLIC_COSMOS_API_URL` | Yes | Cosmos REST API |
| `NEXT_PUBLIC_EVM_RPC_URL` | No | EVM RPC URL |
| `NEXT_PUBLIC_NETWORK_MODE` | No | testnet or mainnet |
| `NEXT_PUBLIC_FAUCET_API_URL` | No | Faucet endpoint |
| `NEXT_PUBLIC_BLOCKSCOUT_URL` | No | Blockscout URL |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | No | WalletConnect project ID |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN |

---

## Troubleshooting

### 404 on `/api/blocks` or `/api/explorers/search`

- **Workspace not public**: Set `public = true` for the workspace in DB, or ensure `firebaseUserId` matches the workspace owner.
- **localhost on explorers/search**: The explorer search endpoint looks up by domain. There is no explorer for `localhost`; either make the workspace public or add a backend fallback for localhost.

### 404 on `/api/explorers/plans`

- Stripe must be enabled: set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `run/.env`.
- Run `npx sequelize db:seed:all` in `run/` to seed `stripe_plans`.

### CSP blocking `http://127.0.0.1:8545`

- Add `http://127.0.0.1:*` and `ws://127.0.0.1:*` to `connect-src` in `frontend/next.config.ts` for development (already applied).

### Start Sync button keeps loading

- PM2 server must be running on 9090.
- Workers must be running (they process `updateExplorerSyncingProcess`).
- `PM2_HOST` and `PM2_SECRET` in `run/.env` must match pm2-server.
- Install `ethernal-light`: `yarn global add ethernal-light`.

### Hydration mismatch (theme toggle)

- Fixed by deferring theme-dependent rendering until after mount (already applied in `theme-toggle.tsx`).

