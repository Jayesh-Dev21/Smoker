# Smoker

**Software supply chain attack prevention tool.**

Scans dependencies, verifies Sigstore provenance, and anchors trust records to Ethereum.

## Project Structure

```
Smoker/
├── frontend/          # Next.js (bun) — dashboard + scan UI
├── backend/           # Elysia (bun) — API server
├── shared/            # Shared types and utilities
├── AGENTS.md          # This file
├── docker-compose.yml # Dev orchestration
└── .env               # Shared environment variables
```

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Elysia, Bun, TypeScript
- **Shared**: TypeScript types
- **DevOps**: Docker, docker-compose

## Commands

```bash
# Frontend
cd frontend && bun run dev    # localhost:3000

# Backend
cd backend && bun run dev     # localhost:3001
```

## API Routes

- `GET /api/health` — Health check
- `POST /api/scan` — Scan a package registry
- `GET /api/results/:id` — Get scan results
- `POST /api/verify` — Verify Sigstore attestation

## Environment Variables

Shared via `.env` at project root. Both frontend and backend read from it.
