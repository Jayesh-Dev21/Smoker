FROM oven/bun:1-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV ETH_RPC_URL=http://anvil:8545
ENV CONTRACT_ADDRESS=

COPY node_modules ./node_modules
COPY index.ts ./
COPY abi.ts ./
COPY package.json ./

EXPOSE 3002
CMD ["bun", "run", "index.ts"]
