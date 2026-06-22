# =========================
# 1) BUILDER
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy package files
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install dependencies using npm for proper node_modules structure
# First install shared package dependencies
WORKDIR /app/packages/shared
RUN npm install --legacy-peer-deps

# Then install web app dependencies
WORKDIR /app/apps/web
RUN npm install --legacy-peer-deps

# Copy codebase
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Set working directory back to root
WORKDIR /app

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

# Build Next.js app
WORKDIR /app/apps/web
RUN npm run build

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
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

USER app

WORKDIR /app/apps/web

EXPOSE 3001

CMD ["npm", "start"]
