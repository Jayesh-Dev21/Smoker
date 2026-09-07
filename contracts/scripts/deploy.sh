#!/bin/bash
set -e

echo "Starting Anvil..."
anvil --host 0.0.0.0 --port 8545 &
ANVIL_PID=$!

sleep 2

echo "Deploying SmokerVerifier..."
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

echo "Anvil running on port 8545 (PID: $ANVIL_PID)"
wait $ANVIL_PID
