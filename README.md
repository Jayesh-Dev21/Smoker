# Smoker

**Where there's smoke, there's fire.**

Software supply chain smoke detection tool. Scans dependencies, detects threats, verifies Sigstore provenance, and anchors trust records to Ethereum.

## Quick Start

```bash
# Clone
git clone git@github.com:Jayesh-Dev21/Smoker.git
cd Smoker

# Install dependencies
bun install

# Run with Docker
docker compose up --build

# Or run locally
cd frontend && bun run dev    # localhost:3000
cd backend && bun run dev     # localhost:3001
```

## Architecture

```
smoker/
├── frontend/          # Next.js 16 — dashboard + scan UI
│   └── Dockerfile
├── backend/           # Elysia — API server
│   └── Dockerfile
├── shared/            # TypeScript types
├── docker-compose.yml
├── .env               # Shared environment variables
└── SETUP.md           # Configuration guide
```

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Elysia, Bun, TypeScript
- **Tooling**: Husky, commitlint, lint-staged, Prettier
- **DevOps**: Docker, docker-compose

## API Endpoints

| Method | Route              | Description                 |
| ------ | ------------------ | --------------------------- |
| `GET`  | `/api/health`      | Health check                |
| `POST` | `/api/scan`        | Scan a package for threats  |
| `GET`  | `/api/results/:id` | Get scan results            |
| `POST` | `/api/verify`      | Verify Sigstore attestation |

## Threat Detection

| Threat               | Detection Method                              |
| -------------------- | --------------------------------------------- |
| Typosquatting        | Edit distance analysis against known packages |
| Dependency Confusion | Internal name collision detection             |
| Maintainer Change    | Account age + commit history analysis         |
| New Package          | Publication date threshold (< 7 days)         |
| No Provenance        | Missing Sigstore attestation                  |
| Malicious Scripts    | Postinstall script analysis                   |

## Development

```bash
# Lint
bun run lint

# Format
npx prettier --write .

# Commit (conventional commits enforced by commitlint)
git commit -m "feat: add new feature"
```

## License

MIT
