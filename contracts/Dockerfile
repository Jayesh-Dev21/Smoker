FROM ghcr.io/foundry-rs/foundry:latest
WORKDIR /app

COPY . .

RUN forge build

RUN chmod +x scripts/deploy.sh

EXPOSE 8545

CMD ["bash", "scripts/deploy.sh"]
