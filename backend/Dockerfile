# Install deps
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Production
FROM oven/bun:1-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY index.ts ./
COPY package.json ./

EXPOSE 3001
CMD ["bun", "run", "index.ts"]
