#!/bin/bash
set -e

echo "Waiting for Anvil to be ready..."
for i in $(seq 1 30); do
  if cast chain-id --rpc-url http://127.0.0.1:8545 > /dev/null 2>&1; then
    echo "Anvil is ready"
    break
  fi
  echo "  Waiting... ($i/30)"
  sleep 1
done

echo "Deploying SmokerVerifier..."
forge script script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast 2>&1 | tee /tmp/deploy.log

CONTRACT_ADDR=$(grep -oP '0x[a-fA-F0-9]{40}' /tmp/deploy.log | tail -1)

if [ -n "$CONTRACT_ADDR" ]; then
  echo "$CONTRACT_ADDR" > /shared/contract-address.txt
  echo "SUCCESS: Contract deployed at $CONTRACT_ADDR"
else
  echo "ERROR: Could not extract contract address"
  cat /tmp/deploy.log
  exit 1
fi
