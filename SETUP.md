# Smoker Setup Guide

Everything you need to configure before running Smoker.

## Environment Variables

Copy `.env` to `.env.local` (for local dev) or set these in your environment:

```bash
cp .env .env.local
```

### Required

| Variable              | Description            | How to get                       |
| --------------------- | ---------------------- | -------------------------------- |
| `PORT`                | Backend server port    | Default: `3001`                  |
| `HOST`                | Backend bind address   | Default: `0.0.0.0`               |
| `NEXT_PUBLIC_API_URL` | Frontend → Backend URL | Default: `http://localhost:3001` |

### Ethereum (for trust anchoring)

| Variable           | Description                | How to get                                                                 |
| ------------------ | -------------------------- | -------------------------------------------------------------------------- |
| `ETH_RPC_URL`      | Ethereum RPC endpoint      | [Infura](https://infura.io), [Alchemy](https://alchemy.com), or local node |
| `ETH_PRIVATE_KEY`  | Wallet private key         | Generate via MetaMask or `cast wallet new`                                 |
| `CONTRACT_ADDRESS` | Deployed verifier contract | Deploy or use existing registry                                            |

### Sigstore (for provenance verification)

| Variable              | Description            | How to get                               |
| --------------------- | ---------------------- | ---------------------------------------- |
| `SIGSTORE_FULCIO_URL` | Fulcio CA endpoint     | Default: `https://fulcio.sigstore.dev`   |
| `SIGSTORE_REKOR_URL`  | Rekor transparency log | Default: `https://rekor.sigstore.dev`    |
| `SIGSTORE_TSA_URL`    | Timestamp authority    | Default: `http://timestamp.sigstore.dev` |

### Scanning

| Variable               | Description         | Default |
| ---------------------- | ------------------- | ------- |
| `SCAN_TIMEOUT`         | Scan timeout in ms  | `30000` |
| `MAX_CONCURRENT_SCANS` | Parallel scan limit | `10`    |

## External APIs

### npm Registry

No API key needed. Used for:

- Fetching package metadata
- Checking publication dates
- Listing maintainers

```bash
curl https://registry.npmjs.org/axios | jq '.time.created'
```

### PyPI

No API key needed. Used for:

- Package metadata
- Version history

```bash
curl https://pypi.org/pypi/requests/json | jq '.info.name'
```

### crates.io

No API key needed. Used for:

- Package metadata
- Download counts

```bash
curl https://crates.io/api/v1/crates/serde | jq '.crate.name'
```

### Sigstore

Public endpoints, no API key needed:

- **Fulcio**: Issues short-lived certificates for signing
- **Rekor**: Transparency log for attestations
- **Cosign**: Verifies signatures (install via `brew install sigstore/cosign/cosign`)

```bash
# Verify a package attestation
cosign verify-attestation \
  --type spdxjson \
  --certificate-identity-regexp 'https://github.com/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  ghcr.io/example/image:tag
```

### Ethereum

Need an RPC provider:

- **Infura** (free tier): `https://mainnet.infura.io/v3/YOUR_KEY`
- **Alchemy** (free tier): `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`
- **Local node**: `http://localhost:8545` (Hardhat/Foundry)

## Docker Setup

```bash
# Build and run
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

## Local Development

```bash
# Install bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run frontend
cd frontend && bun run dev

# Run backend (separate terminal)
cd backend && bun run dev
```

## First Run Checklist

1. [ ] Copy `.env` to `.env.local`
2. [ ] Set `ETH_RPC_URL` to your RPC provider
3. [ ] Set `NEXT_PUBLIC_API_URL` (default works for local)
4. [ ] Run `docker compose up --build`
5. [ ] Open `http://localhost:3000`
6. [ ] Enter a package name and click Scan
7. [ ] Check `http://localhost:3001/api/health` returns `{"status":"ok"}`
