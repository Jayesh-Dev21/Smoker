import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .get("/api/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  }))
  .post("/api/scan", async ({ body }) => {
    const { packageRegistry, packageName, version } = body as {
      packageRegistry: string;
      packageName: string;
      version?: string;
    };
    // TODO: Implement scanning logic
    return {
      id: crypto.randomUUID(),
      package: {
        name: packageName,
        version: version || "latest",
        registry: packageRegistry,
      },
      threats: [],
      provenance: {
        hasAttestation: false,
        verified: false,
      },
      trustScore: 0,
      scannedAt: new Date().toISOString(),
    };
  })
  .get("/api/results/:id", ({ params }) => {
    const { id } = params;
    // TODO: Implement results retrieval
    return { id, status: "not_found" };
  })
  .post("/api/verify", async ({ body }) => {
    const { packageName, registry } = body as {
      packageName: string;
      registry: string;
    };
    // TODO: Implement Sigstore verification
    return {
      packageName,
      registry,
      verified: false,
      attestation: null,
    };
  })
  .listen(3001);

console.log(`Smoker API running on http://localhost:${app.server?.port}`);
