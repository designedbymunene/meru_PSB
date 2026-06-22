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
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy codebase
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build backend
RUN pnpm --filter @meru/backend build

# =========================
# 2) RUNTIME / API
# =========================
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy node_modules and built artifacts preserving monorepo structure
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/drizzle.config.ts ./apps/backend/drizzle.config.ts
COPY --from=builder /app/apps/backend/src ./apps/backend/src
COPY --from=builder /app/packages/shared ./packages/shared

# Create uploads directories and set ownership to app user
RUN mkdir -p /app/apps/uploads /app/apps/backend/uploads && \
    chown -R app:app /app/apps/uploads /app/apps/backend/uploads

USER app

# Set workdir to the backend folder so node resolution handles symlinks correctly
WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["node", "dist/index.js"]
