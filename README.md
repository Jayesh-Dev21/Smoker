# Smoker

**Where there's smoke, there's fire.**

Software supply chain smoke detection tool. Scans dependencies, detects threats (typosquatting, malicious scripts, new packages, no provenance), verifies Sigstore provenance, and anchors trust records to Ethereum via a Solidity contract (`SmokerVerifier`).

## 🟢 Working End-to-End Flow

```bash
# 1. Clone and start everything with Docker
git clone git@github.com:Jayesh-Dev21/Smoker.git
cd Smoker
docker compose up --build

# 2. Services are available at:
#   Frontend:  http://localhost:3000  (scan UI)
#   Backend:   http://localhost:3001   (scan API)
#   Dashboard: http://localhost:3002   (contract explorer)
#   Anvil:     http://localhost:8545   (local Ethereum node)

# 3. Open http://localhost:3000 in your browser
# 4. Enter a package name (e.g., "axios", "axiost", "lodash")
# 5. Click "Scan" — results show:
#    • Threats detected (typosquatting, malicious scripts, new package, no provenance)
#    • Trust score (100 = clean, lower = higher risk)
#    • Provenance status (verified / none)
#    • 🔗 Ethereum anchor (tx hash + block number — clickable Etherscan link)
```

### Tested Package Results

| Package    | Registry | Threats                                      | Trust Score | Provenance             |
| ---------- | -------- | -------------------------------------------- | ----------- | ---------------------- |
| `axios`    | npm      | None                                         | 100         | ✅ Verified (Sigstore) |
| `axiost`   | npm      | Typosquatting (edit distance 1 from "axios") | 80          | ❌ None                |
| `lodash`   | npm      | No provenance                                | 98          | ❌ None                |
| `requests` | PyPI     | None                                         | 100         | ❌ None (no Sigstore)  |

> **Note**: The compromised axios versions from the March 31, 2026 supply chain attack (`axios@1.14.1`, `axios@0.30.4`) and `plain-crypto-js@4.2.1` have been removed from npm. The scanner still detects typosquatting attempts (e.g., `axiost` → flagged as similar to `axios`) and missing provenance for all packages.

## Architecture

```
smoker/
├── frontend/          # Next.js 16 — scan UI + contract explorer
│   └── Dockerfile
├── backend/           # Elysia — scan API, threat detection, Ethereum anchoring
│   └── Dockerfile
├── dashboard/         # Elysia — contract stats + API explorer
│   └── Dockerfile
├── contracts/         # Foundry — SmokerVerifier Solidity contract
├── shared/            # TypeScript types (ScanResult, Threat, ProvenanceInfo, etc.)
├── docker-compose.yml
├── .env.example
└── SETUP.md
```

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Elysia, Bun, TypeScript, ethers.js
- **Contracts**: Solidity, Foundry (forge, anvil, cast)
- **Dashboard**: Elysia, ethers.js, HTML dashboard UI
- **Tooling**: Husky, commitlint, lint-staged, Prettier
- **DevOps**: Docker, docker-compose

## API Endpoints

### Backend (port 3001)

| Method | Route              | Description                                                                |
| ------ | ------------------ | -------------------------------------------------------------------------- |
| `GET`  | `/api/health`      | Health check                                                               |
| `POST` | `/api/scan`        | Scan a package for threats (returns threats + trustScore + ethereumAnchor) |
| `GET`  | `/api/results/:id` | Get a scan result by ID (cached in-memory)                                 |
| `POST` | `/api/verify`      | Verify Sigstore attestation for a package                                  |
| `GET`  | `/api/history`     | List all scanned results (most recent first)                               |

### Dashboard (port 3002)

| Method | Route                          | Description                                                        |
| ------ | ------------------------------ | ------------------------------------------------------------------ |
| `GET`  | `/`                            | Dashboard UI with stats + API docs                                 |
| `GET`  | `/api/stats`                   | Contract statistics (totalScans, totalAttestations, totalVerified) |
| `GET`  | `/api/scans`                   | All on-chain scan results                                          |
| `GET`  | `/api/attestations`            | All on-chain attestations                                          |
| `GET`  | `/api/package/:name/:registry` | Package details from contract                                      |
| `POST` | `/api/scan`                    | Record a scan to Ethereum                                          |
| `POST` | `/api/attestation`             | Record an attestation to Ethereum                                  |
| `POST` | `/api/verify`                  | Verify a package on-chain                                          |

## Threat Detection

| Threat                | Detection Method                                                                                                                | Severity      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **Typosquatting**     | Edit distance analysis against 50+ known popular packages (lodash, react, axios, chalk, commander, express, debug, tslib, etc.) | high / medium |
| **New Package**       | Publication date < 7 days old                                                                                                   | medium        |
| **No Provenance**     | Missing Sigstore provenance attestation (`dist.attestations`)                                                                   | info          |
| **Malicious Scripts** | Detection of `preinstall`/`install`/`postinstall` lifecycle scripts                                                             | high          |
| **Maintainer Change** | >5 maintainers indicated possible compromise                                                                                    | low           |

Score computation: `100 - (30×critical + 20×high + 10×medium + 5×low + 2×info) + 5×hasProvenance`

## Quick Start

```bash
# Clone
git clone git@github.com:Jayesh-Dev21/Smoker.git
cd Smoker

# Start everything with Docker (all 4 services: anvil, backend, dashboard, frontend)
docker compose up --build

# Services:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:3001
#   Dashboard: http://localhost:3002
#   Anvil:     http://localhost:8545
```

## Development

```bash
# Lint
bun run lint

# Format
npx prettier --write .

# Commit (conventional commits enforced by commitlint)
git commit --no-gpg-sign -m "fix: description of change"
```

## License

MIT
