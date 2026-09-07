FROM oven/bun:1-slim
WORKDIR /app

COPY . .

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001
CMD ["bun", "run", "index.ts"]
