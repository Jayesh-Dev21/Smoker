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
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json .

EXPOSE 3001
CMD ["bun", "run", "dist/index.js"]
