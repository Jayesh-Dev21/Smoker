FROM oven/bun:1 AS base

# Install dependencies
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Production
FROM oven/bun:1-slim AS production
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/package.json .
COPY --from=base /app/next.config.ts .

EXPOSE 3000
CMD ["bun", "run", "start"]
