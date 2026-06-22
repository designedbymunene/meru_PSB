# =========================
# 1) BUILDER
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Copy workspace configuration and lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install dependencies with shamefully-hoist to flatten structure
# This makes all packages available at root node_modules
RUN echo "shamefully-hoist=true" > .npmrc && pnpm install --frozen-lockfile

# Copy codebase
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

# Build Next.js app - next binary is at root due to shamefully-hoist
RUN node node_modules/next/dist/bin/next build apps/web

# =========================
# 2) RUNTIME
# =========================
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy built app and dependencies
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/packages/shared ./packages/shared

USER app

WORKDIR /app/apps/web

EXPOSE 3001

CMD ["npm", "start"]
