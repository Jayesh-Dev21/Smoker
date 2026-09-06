# Smoker

**Where there's smoke, there's fire.**

A smoke detection tool for software supply chain threats. Scans dependencies, detects attacks, verifies Sigstore provenance, and anchors trust records to Ethereum.

## Project Structure

```
smoker/
├── frontend/          # Next.js (bun) — dashboard + scan UI
├── backend/           # Elysia (bun) — API server
├── shared/            # Shared types
├── AGENTS.md          # This file
└── .env               # Shared environment variables
```

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Elysia, Bun, TypeScript
- **Tooling**: Husky, commitlint, lint-staged, Prettier
- **DevOps**: Docker

## Commands

```bash
# Frontend
cd frontend && bun run dev    # localhost:3000

# Backend
cd backend && bun run dev     # localhost:3001

# Lint
bun run lint

# Format
npx prettier --write .
```

## API Routes

- `GET /api/health` — Health check
- `POST /api/scan` — Scan a package for threats
- `GET /api/results/:id` — Get scan results
- `POST /api/verify` — Verify Sigstore attestation

## Threat Detection

| Threat               | Detection Method                              |
| -------------------- | --------------------------------------------- |
| Typosquatting        | Edit distance analysis against known packages |
| Dependency Confusion | Internal name collision detection             |
| Maintainer Change    | Account age + commit history analysis         |
| New Package          | Publication date threshold (< 7 days)         |
| No Provenance        | Missing Sigstore attestation                  |
| Malicious Scripts    | Postinstall script analysis                   |

## Environment Variables

Shared via `.env` at project root. Both frontend and backend read from it.
