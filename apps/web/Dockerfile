# =========================
# 1) BUILDER
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Copy workspace configuration and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package files for dependency caching
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/web/.npmrc ./apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy codebase
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Ensure Next.js is available and build web
RUN pnpm --filter @meru/web exec next build

# =========================
# 2) RUNTIME
# =========================
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules

USER app

WORKDIR /app/apps/web

EXPOSE 3001

# Next.js default start script uses port 3000, but package.json says 3001
CMD ["npm", "start"]
