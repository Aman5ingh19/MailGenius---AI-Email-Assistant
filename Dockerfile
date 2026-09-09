# syntax=docker/dockerfile:1

# ── Stage 1: Base Image ────────────────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ── Stage 2: Dependencies ───────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./
# Install all dependencies (including devDependencies needed for build like Tailwind)
RUN npm ci --include=dev --ignore-scripts

# ── Stage 3: Builder ────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js standalone application
RUN npm run build

# ── Stage 4: Production Runner ──────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create secure non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set correct permissions for prerender cache & public files
RUN mkdir .next && \
    mkdir logs && \
    chown nextjs:nodejs .next logs

# Copy standalone build output and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch the standalone Next.js server
CMD ["node", "server.js"]
