FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json ./
RUN bun install

COPY index.ts ./
COPY abi.ts ./

FROM oven/bun:1-slim AS production
WORKDIR /app
COPY --from=builder /app /app

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002
CMD ["bun", "run", "index.ts"]
