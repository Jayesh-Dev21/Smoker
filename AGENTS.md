# Smoker

**Where there's smoke, there's fire.**

Software supply chain smoke detection tool. Scans dependencies, detects threats, verifies Sigstore provenance, and anchors trust records to Ethereum.

## Project Structure

```
smoker/
├── frontend/          # Next.js 16 — scan UI
├── backend/           # Elysia — API server
├── dashboard/         # Elysia — contract explorer + API dashboard
├── contracts/         # Foundry — SmokerVerifier Solidity contract
├── shared/            # TypeScript types
├── docker-compose.yml
├── .env.example
├── README.md
└── SETUP.md
```

## Quick Start

```bash
# Clone
git clone git@github.com:Jayesh-Dev21/Smoker.git
cd Smoker

# Copy env
cp .env.example .env

# Run everything with Docker
docker compose up --build

# Services:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:3001
#   Dashboard: http://localhost:3002
#   Anvil:     http://localhost:8545
```

## Architecture

- **Frontend**: Next.js scan UI — enter package name, see threats + provenance
- **Backend**: Elysia API — scans packages, verifies Sigstore, writes to Ethereum
- **Dashboard**: Contract explorer — view on-chain scans, attestations, stats
- **Contracts**: SmokerVerifier — Solidity contract storing scan results + attestations on Ethereum

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Elysia, Bun, TypeScript
- **Dashboard**: Elysia, Bun, ethers.js
- **Contracts**: Solidity, Foundry (forge, anvil, cast)
- **Tooling**: Husky, commitlint, lint-staged, Prettier
- **DevOps**: Docker, docker-compose

## API Endpoints

### Backend (port 3001)

| Method | Route              | Description                 |
| ------ | ------------------ | --------------------------- |
| `GET`  | `/api/health`      | Health check                |
| `POST` | `/api/scan`        | Scan a package for threats  |
| `GET`  | `/api/results/:id` | Get scan results            |
| `POST` | `/api/verify`      | Verify Sigstore attestation |

### Dashboard (port 3002)

| Method | Route                          | Description           |
| ------ | ------------------------------ | --------------------- |
| `GET`  | `/`                            | Dashboard UI          |
| `GET`  | `/api/health`                  | Health check          |
| `GET`  | `/api/stats`                   | Contract statistics   |
| `GET`  | `/api/scans`                   | All scan results      |
| `GET`  | `/api/attestations`            | All attestations      |
| `GET`  | `/api/package/:name/:registry` | Package details       |
| `POST` | `/api/scan`                    | Record a scan         |
| `POST` | `/api/attestation`             | Record an attestation |
| `POST` | `/api/verify`                  | Verify a package      |

## Threat Detection

| Threat               | Detection Method                              |
| -------------------- | --------------------------------------------- |
| Typosquatting        | Edit distance analysis against known packages |
| Dependency Confusion | Internal name collision detection             |
| Maintainer Change    | Account age + commit history analysis         |
| New Package          | Publication date threshold (< 7 days)         |
| No Provenance        | Missing Sigstore attestation                  |
| Malicious Scripts    | Postinstall script analysis                   |

## License

MIT
