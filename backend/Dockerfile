FROM oven/bun:1
WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001
CMD ["bun", "run", "index.ts"]
