#!/bin/bash
set -e

echo "Waiting for Anvil to be ready..."
for i in $(seq 1 30); do
  if cast chain-id --rpc-url http://anvil:8545 > /dev/null 2>&1; then
    echo "Anvil is ready"
    break
  fi
  sleep 1
done

echo "Deploying SmokerVerifier..."
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol \
  --rpc-url http://anvil:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast 2>&1)

echo "$DEPLOY_OUTPUT"

# Extract contract address from output
CONTRACT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -oP 'SmokerVerifier deployed at: \K0x[a-fA-F0-9]{40}' || \
                echo "$DEPLOY_OUTPUT" | grep -oP 'Contract Address: \K0x[a-fA-F0-9]{40}')

if [ -n "$CONTRACT_ADDR" ]; then
  echo "Writing contract address to shared volume..."
  echo "$CONTRACT_ADDR" > /shared/contract-address.txt
  echo "Contract deployed at: $CONTRACT_ADDR"
else
  echo "ERROR: Could not extract contract address from deploy output"
  exit 1
fi
