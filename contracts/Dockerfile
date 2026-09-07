FROM foundryup:latest AS foundry

FROM ubuntu:22.04
WORKDIR /app

# Install foundry binaries
COPY --from=foundry /root/.foundry/bin/ /usr/local/bin/

# Install solc
RUN apt-get update && apt-get install -y curl jq && rm -rf /var/lib/apt/lists/*

# Copy contracts
COPY . .

# Build contracts
RUN forge build

# Make deploy script executable
RUN chmod +x scripts/deploy.sh

EXPOSE 8545

CMD ["bash", "scripts/deploy.sh"]
