# =========================
# 1) BUILDER / MIGRATIONS
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy full source including drizzle config + migrations
COPY . .

# Build app
RUN pnpm build


# =========================
# 2) RUNTIME / API
# =========================
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Production artifacts only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

USER app
EXPOSE 4000

CMD ["node", "dist/index.js"]
