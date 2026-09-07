FROM oven/bun:1-slim AS production
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

COPY index.ts ./
COPY abi.ts ./

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002
CMD ["bun", "run", "index.ts"]
