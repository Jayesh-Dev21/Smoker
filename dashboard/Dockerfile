FROM oven/bun:1
WORKDIR /app

COPY package.json ./
RUN bun install

COPY index.ts ./
COPY abi.ts ./

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002
CMD ["bun", "run", "index.ts"]
