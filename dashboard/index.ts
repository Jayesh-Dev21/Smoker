import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { cors } from "@elysiajs/cors";
import { ethers } from "ethers";
import { ABI } from "./abi";
import { readFileSync, existsSync } from "fs";

const RPC_URL = process.env.ETH_RPC_URL || "http://anvil:8545";
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

function getContractAddress(): string {
  // Try shared volume first (from deploy script)
  const sharedPath = "/shared/contract-address.txt";
  if (existsSync(sharedPath)) {
    try {
      const addr = readFileSync(sharedPath, "utf-8").trim();
      if (addr) return addr;
    } catch {}
  }
  // Fallback to env var
  return process.env.CONTRACT_ADDRESS || "";
}

const CONTRACT_ADDRESS = getContractAddress();

let provider: ethers.JsonRpcProvider;
let contract: ethers.Contract;

function connectContract() {
  provider = new ethers.JsonRpcProvider(RPC_URL);
  if (CONTRACT_ADDRESS) {
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    console.log(`Connected to contract at ${CONTRACT_ADDRESS}`);
  } else {
    console.warn(
      "No contract address found. Dashboard will run without contract."
    );
  }
}

try {
  connectContract();
} catch (e) {
  console.warn("Could not connect to contract:", e);
}

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smoker Dashboard — Contract Explorer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #111; color: #ddd; padding: 2rem; }
    h1 { color: #f97316; margin-bottom: 0.5rem; font-size: 1.5rem; }
    h2 { color: #9ca3af; font-size: 1rem; margin: 1.5rem 0 0.75rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
    .subtitle { color: #6b7280; font-size: 0.85rem; margin-bottom: 2rem; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 1rem; text-align: center; }
    .stat-value { font-size: 2rem; color: #f97316; }
    .stat-label { color: #6b7280; font-size: 0.75rem; margin-top: 0.25rem; }
    .card { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 1rem; margin-bottom: 0.75rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.7rem; }
    .badge-green { background: #064e3b; color: #34d399; }
    .badge-red { background: #450a0a; color: #f87171; }
    .badge-yellow { background: #422006; color: #fbbf24; }
    .mono { font-family: monospace; font-size: 0.8rem; color: #9ca3af; }
    .form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .form input, .form select, .form button { font-family: monospace; font-size: 0.85rem; padding: 0.5rem; background: #1a1a1a; border: 1px solid #333; color: #ddd; border-radius: 4px; }
    .form button { background: #f97316; color: #000; border: none; cursor: pointer; font-weight: bold; }
    .form button:hover { background: #fb923c; }
    #result { background: #0a0a0a; border: 1px solid #333; border-radius: 6px; padding: 1rem; font-size: 0.8rem; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
    .endpoint { color: #60a5fa; }
    a { color: #f97316; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Smoker Dashboard</h1>
  <p class="subtitle">Contract Explorer & API — <a href="/" id="docs-link">Docs</a></p>

  <h2>Contract Stats</h2>
  <div class="stats">
    <div class="stat"><div class="stat-value" id="total-scans">—</div><div class="stat-label">Total Scans</div></div>
    <div class="stat"><div class="stat-value" id="total-attestations">—</div><div class="stat-label">Attestations</div></div>
    <div class="stat"><div class="stat-value" id="total-verified">—</div><div class="stat-label">Verified</div></div>
  </div>

  <h2>API Endpoints</h2>
  <div class="card">
    <div class="mono">
      <span class="endpoint">GET</span> /api/stats — Contract statistics<br>
      <span class="endpoint">GET</span> /api/scans — All scan results<br>
      <span class="endpoint">GET</span> /api/attestations — All attestations<br>
      <span class="endpoint">GET</span> /api/package/:name/:registry — Package details<br>
      <span class="endpoint">POST</span> /api/scan — Record a scan<br>
      <span class="endpoint">POST</span> /api/attestation — Record an attestation<br>
      <span class="endpoint">POST</span> /api/verify — Verify a package<br>
      <span class="endpoint">GET</span> /api/health — Health check
    </div>
  </div>

  <h2>Try It</h2>
  <div class="form">
    <input id="pkg-name" placeholder="package name" value="axios">
    <select id="pkg-registry"><option value="npm">npm</option><option value="pypi">pypi</option><option value="crates">crates</option></select>
    <button onclick="lookupPackage()">Lookup</button>
  </div>

  <h2>Result</h2>
  <div id="result">Click "Lookup" to query a package.</div>

  <script>
    async function loadStats() {
      try {
        const r = await fetch('/api/stats');
        const d = await r.json();
        document.getElementById('total-scans').textContent = d.totalScans ?? '—';
        document.getElementById('total-attestations').textContent = d.totalAttestations ?? '—';
        document.getElementById('total-verified').textContent = d.totalVerified ?? '—';
      } catch(e) { console.error(e); }
    }

    async function lookupPackage() {
      const name = document.getElementById('pkg-name').value;
      const registry = document.getElementById('pkg-registry').value;
      const el = document.getElementById('result');
      el.textContent = 'Loading...';
      try {
        const r = await fetch('/api/package/' + encodeURIComponent(name) + '/' + registry);
        const d = await r.json();
        el.textContent = JSON.stringify(d, null, 2);
      } catch(e) { el.textContent = 'Error: ' + e.message; }
    }

    loadStats();
  </script>
</body>
</html>`;

const app = new Elysia()
  .use(cors())
  .get("/", () => html(DASHBOARD_HTML))
  .get("/api/health", () => ({
    status: "ok",
    connected: !!CONTRACT_ADDRESS,
    rpcUrl: RPC_URL,
    contractAddress: CONTRACT_ADDRESS,
    timestamp: new Date().toISOString(),
  }))
  .get("/api/stats", async () => {
    if (!contract) return { error: "Contract not connected" };
    const [totalScans, totalAttestations, totalVerified] = await Promise.all([
      contract.totalScans(),
      contract.totalAttestations(),
      contract.totalVerified(),
    ]);
    return {
      totalScans: Number(totalScans),
      totalAttestations: Number(totalAttestations),
      totalVerified: Number(totalVerified),
    };
  })
  .get("/api/scans", async () => {
    if (!contract) return { error: "Contract not connected" };
    const scans = await contract.getAllScans();
    return scans.map((s: any) => ({
      packageName: s[0],
      registry: s[1],
      trustScore: Number(s[2]),
      threatCount: Number(s[3]),
      hasProvenance: s[4],
      attestationHash: s[5],
      scannedAt: Number(s[6]),
      scanner: s[7],
    }));
  })
  .get("/api/attestations", async () => {
    if (!contract) return { error: "Contract not connected" };
    const atts = await contract.getAllAttestations();
    return atts.map((a: any) => ({
      packageName: a[0],
      registry: a[1],
      attestationHash: a[2],
      source: a[3],
      commit: a[4],
      createdAt: Number(a[5]),
      creator: a[6],
    }));
  })
  .get("/api/package/:name/:registry", async ({ params }) => {
    if (!contract) return { error: "Contract not connected" };
    const { name, registry } = params;
    const [scans, attestations, verified, scanCount, attestationCount] =
      await Promise.all([
        contract.getScans(name, registry),
        contract.getAttestations(name, registry),
        contract.isVerified(name, registry),
        contract.getScanCount(name, registry),
        contract.getAttestationCount(name, registry),
      ]);
    return {
      packageName: name,
      registry,
      verified,
      scanCount: Number(scanCount),
      attestationCount: Number(attestationCount),
      scans: scans.map((s: any) => ({
        trustScore: Number(s[2]),
        threatCount: Number(s[3]),
        hasProvenance: s[4],
        scannedAt: Number(s[6]),
      })),
      attestations: attestations.map((a: any) => ({
        attestationHash: a[2],
        source: a[3],
        commit: a[4],
        createdAt: Number(a[5]),
      })),
    };
  })
  .post("/api/scan", async ({ body }) => {
    if (!contract) return { error: "Contract not connected" };
    const {
      packageName,
      registry,
      trustScore,
      threatCount,
      hasProvenance,
      attestationHash,
    } = body as {
      packageName: string;
      registry: string;
      trustScore: number;
      threatCount: number;
      hasProvenance: boolean;
      attestationHash: string;
    };
    try {
      const tx = await contract.recordScan(
        packageName,
        registry,
        trustScore,
        threatCount,
        hasProvenance,
        attestationHash
      );
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        chainId: (await provider.getNetwork()).chainId,
      };
    } catch (e: any) {
      console.error("Failed to record scan:", e);
      return { error: e.message };
    }
  })
  .post("/api/attestation", async ({ body }) => {
    if (!contract) return { error: "Contract not connected" };
    const { packageName, registry, attestationHash, source, commit } = body as {
      packageName: string;
      registry: string;
      attestationHash: string;
      source: string;
      commit: string;
    };
    try {
      const tx = await contract.recordAttestation(
        packageName,
        registry,
        attestationHash,
        source,
        commit
      );
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        chainId: (await provider.getNetwork()).chainId,
      };
    } catch (e: any) {
      console.error("Failed to record attestation:", e);
      return { error: e.message };
    }
  })
  .listen(3002);

console.log(`Smoker Dashboard running on http://localhost:${app.server?.port}`);
