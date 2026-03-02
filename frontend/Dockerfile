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
ARG NEXT_PUBLIC_PUSHER_PORT=6002
ARG NEXT_PUBLIC_WORKSPACE_ID=
ARG NEXT_PUBLIC_COSMOS_API_URL=https://testnet.integralayer.com/api
ARG NEXT_PUBLIC_SITE_URL=

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_HOST=$NEXT_PUBLIC_PUSHER_HOST
ENV NEXT_PUBLIC_PUSHER_PORT=$NEXT_PUBLIC_PUSHER_PORT
ENV NEXT_PUBLIC_WORKSPACE_ID=$NEXT_PUBLIC_WORKSPACE_ID
ENV NEXT_PUBLIC_COSMOS_API_URL=$NEXT_PUBLIC_COSMOS_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output
# turbopack.root: ".." nests output under the WORKDIR name (app/ in Docker)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./app/.next/static
COPY --from=builder /app/public ./app/public

EXPOSE 3000

CMD ["node", "app/server.js"]
