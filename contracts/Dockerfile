FROM ghcr.io/foundry-rs/foundry:latest
WORKDIR /app

RUN mkdir -p cache out

COPY . .

RUN chmod -R 777 cache out

RUN forge build

RUN chmod +x scripts/deploy.sh

EXPOSE 8545

CMD ["bash", "scripts/deploy.sh"]
