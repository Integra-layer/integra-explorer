# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* are baked into the JS at build time)
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_PUSHER_KEY=
ARG NEXT_PUBLIC_PUSHER_HOST=
ARG NEXT_PUBLIC_PUSHER_PORT=443
ARG NEXT_PUBLIC_WORKSPACE_ID=
ARG NEXT_PUBLIC_COSMOS_API_URL=https://testnet.integralayer.com/api
ARG NEXT_PUBLIC_SITE_URL=
ARG NEXT_PUBLIC_NETWORK_MODE=testnet
ARG NEXT_PUBLIC_REOWN_PROJECT_ID=
ARG NEXT_PUBLIC_EVM_RPC_URL=
ARG NEXT_PUBLIC_PASSPORT_API_URL=

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_HOST=$NEXT_PUBLIC_PUSHER_HOST
ENV NEXT_PUBLIC_PUSHER_PORT=$NEXT_PUBLIC_PUSHER_PORT
ENV NEXT_PUBLIC_WORKSPACE_ID=$NEXT_PUBLIC_WORKSPACE_ID
ENV NEXT_PUBLIC_COSMOS_API_URL=$NEXT_PUBLIC_COSMOS_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_NETWORK_MODE=$NEXT_PUBLIC_NETWORK_MODE
ENV NEXT_PUBLIC_REOWN_PROJECT_ID=$NEXT_PUBLIC_REOWN_PROJECT_ID
ENV NEXT_PUBLIC_EVM_RPC_URL=$NEXT_PUBLIC_EVM_RPC_URL
ENV NEXT_PUBLIC_PASSPORT_API_URL=$NEXT_PUBLIC_PASSPORT_API_URL

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
# turbopack.root: ".." nests output under the WORKDIR name (app/ in Docker)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./app/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "app/server.js"]
