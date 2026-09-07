FROM ghcr.io/foundry-rs/foundry:latest
USER root
WORKDIR /app

RUN mkdir -p /shared

COPY . .

RUN chmod +x scripts/deploy.sh

CMD ["bash", "scripts/deploy.sh"]
