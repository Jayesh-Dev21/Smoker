import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { readFileSync, existsSync } from "fs";

const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://dashboard:3002";
const resultsCache = new Map<string, any>();

function getContractAddress(): string {
  const sharedPath = "/shared/contract-address.txt";
  if (existsSync(sharedPath)) {
    try {
      return readFileSync(sharedPath, "utf-8").trim();
    } catch {}
  }
  return process.env.CONTRACT_ADDRESS || "";
}

const popularPackages: Record<string, string[]> = {
  npm: [
    "lodash",
    "react",
    "axios",
    "chalk",
    "commander",
    "express",
    "debug",
    "tslib",
    "glob",
    "minimist",
    "uuid",
    "semver",
    "mkdirp",
    "inquirer",
    "yargs",
    "rimraf",
    "through2",
    "readable-stream",
    "color-convert",
    "supports-color",
    "strip-ansi",
    "ansi-styles",
    "has-flag",
    "wrap-ansi",
    "string-width",
    "is-fullwidth-code-point",
    "emoji-regex",
    "east-asian-width",
    "fast-deep-equal",
    "json-schema-traverse",
    "uri-js",
    "fast-json-stable-stringify",
    "call-bind",
    "function-bind",
    "has-symbols",
    "is-generator-function",
    "is-typed-array",
    "object-is",
    "object-keys",
    "object.values",
    "regexp.prototype.flags",
    "side-channel",
    "which-boxed-primitive",
    "which-collection",
    "which-typed-array",
    "get-symbol-description",
    "get-iterator",
    "array.prototype.flatmap",
    "es-abstract",
    "es-set-tostringtag",
  ],
};

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function detectThreats(
  pkgName: string,
  registry: string,
  metadata: any,
  versionMeta: any
) {
  const threats: any[] = [];

  // Typosquatting detection
  const known = popularPackages[registry] || popularPackages.npm;
  for (const popular of known) {
    const dist = editDistance(pkgName.toLowerCase(), popular.toLowerCase());
    if (
      dist > 0 &&
      dist <= 2 &&
      pkgName.toLowerCase() !== popular.toLowerCase()
    ) {
      threats.push({
        type: "typosquatting",
        severity: dist === 1 ? "high" : "medium",
        description: `Name is similar to "${popular}" (edit distance: ${dist})`,
        recommendation: `Verify this is the intended package, not a typosquat of "${popular}"`,
      });
      break;
    }
  }

  // New package detection (works for npm — time is at top level)
  if (metadata?.time?.created) {
    const created = new Date(metadata.time.created);
    const daysOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 7) {
      threats.push({
        type: "new-package",
        severity: "medium",
        description: `Package is only ${Math.floor(daysOld)} day(s) old (published ${created.toISOString().split("T")[0]})`,
        recommendation:
          "New packages carry higher risk. Review the source code and maintainer history.",
      });
    }
  }

  // Maintainer change detection (works for npm — maintainers at top level)
  if (metadata?.maintainers && metadata.maintainers.length > 0) {
    if (metadata.maintainers.length > 5) {
      threats.push({
        type: "maintainer-change",
        severity: "low",
        description: `Package has ${metadata.maintainers.length} maintainers`,
        recommendation:
          "High maintainer count can indicate supply chain risk. Verify trusted maintainers.",
      });
    }
  }

  // No provenance (npm: check version-level dist.attestations)
  const dist = versionMeta?.dist || metadata?.dist;
  if (dist && !dist.attestations) {
    threats.push({
      type: "no-provenance",
      severity: "info",
      description: "No Sigstore provenance attestation found",
      recommendation:
        "Package lacks verifiable build provenance. Consider using packages with attestations.",
    });
  }

  // Malicious script detection (npm: check version-level scripts)
  const scripts = versionMeta?.scripts || metadata?.scripts;
  if (scripts) {
    const dangerous = ["preinstall", "install", "postinstall"];
    for (const hook of dangerous) {
      if (scripts[hook]) {
        threats.push({
          type: "malicious-script",
          severity: "high",
          description: `Has a "${hook}" script: ${scripts[hook].substring(0, 100)}`,
          recommendation:
            "Lifecycle scripts can execute arbitrary code. Review before installing.",
        });
      }
    }
  }

  return threats;
}

function computeTrustScore(threats: any[], hasProvenance: boolean): number {
  let score = 100;
  for (const t of threats) {
    switch (t.severity) {
      case "critical":
        score -= 30;
        break;
      case "high":
        score -= 20;
        break;
      case "medium":
        score -= 10;
        break;
      case "low":
        score -= 5;
        break;
      case "info":
        score -= 2;
        break;
    }
  }
  if (hasProvenance) score += 5;
  return Math.max(0, Math.min(100, score));
}

const app = new Elysia()
  .use(cors())
  .get("/api/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    contractAddress: getContractAddress(),
  }))
  .post("/api/scan", async ({ body }) => {
    const { packageRegistry, packageName, version } = body as {
      packageRegistry: string;
      packageName: string;
      version?: string;
    };

    // Fetch package metadata from registry
    let metadata: any = null;
    let registryUrl = "";

    if (packageRegistry === "npm") {
      registryUrl = `https://registry.npmjs.org/${packageName}`;
      try {
        const res = await fetch(registryUrl);
        if (res.ok) {
          metadata = await res.json();
        }
      } catch (e) {
        console.warn(`Failed to fetch npm metadata for ${packageName}:`, e);
      }
    } else if (packageRegistry === "pypi") {
      registryUrl = `https://pypi.org/pypi/${packageName}/json`;
      try {
        const res = await fetch(registryUrl);
        if (res.ok) metadata = await res.json();
      } catch (e) {
        console.warn(`Failed to fetch PyPI metadata for ${packageName}:`, e);
      }
    } else if (packageRegistry === "crates") {
      registryUrl = `https://crates.io/api/v1/crates/${packageName}`;
      try {
        const res = await fetch(registryUrl);
        if (res.ok) metadata = await res.json();
      } catch (e) {
        console.warn(
          `Failed to fetch crates.io metadata for ${packageName}:`,
          e
        );
      }
    }

    // Determine version info and extract version-level metadata
    let resolvedVersion = version || "latest";
    let versionMeta: any = null;

    if (
      metadata?.["dist-tags"]?.latest ||
      metadata?.["dist-tags"]?.[resolvedVersion]
    ) {
      // npm full document: extract from versions[dist-tags.latest]
      const tag =
        metadata["dist-tags"]?.[resolvedVersion] ||
        metadata["dist-tags"].latest;
      resolvedVersion = tag;
      versionMeta = metadata?.versions?.[tag] || null;
    } else if (metadata?.version) {
      // PyPI / crates: version at top level
      resolvedVersion = metadata.version;
      versionMeta = metadata;
    }

    // Detect threats (pass versionMeta for scripts/dist access)
    const threats = detectThreats(
      packageName,
      packageRegistry,
      metadata,
      versionMeta
    );

    // Check provenance (use version-level dist if available)
    const dist = versionMeta?.dist || metadata?.dist;
    const hasAttestation = !!dist?.attestations;
    const provenance = {
      hasAttestation,
      verified: hasAttestation,
      source: hasAttestation ? "sigstore" : undefined,
    };

    const trustScore = computeTrustScore(threats, hasAttestation);

    const result = {
      id: crypto.randomUUID(),
      package: {
        name: packageName,
        version: resolvedVersion,
        registry: packageRegistry,
      },
      threats,
      provenance,
      trustScore,
      scannedAt: new Date().toISOString(),
    };

    // Cache result for retrieval
    resultsCache.set(result.id, result);

    // Record to Ethereum via dashboard
    try {
      const dashRes = await fetch(`${DASHBOARD_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName,
          registry: packageRegistry,
          trustScore,
          threatCount: threats.length,
          hasProvenance: hasAttestation,
          attestationHash: hasAttestation
            ? `0x${crypto.randomUUID().replace(/-/g, "")}`
            : "0x0",
        }),
      });
      if (dashRes.ok) {
        const anchor = await dashRes.json();
        Object.assign(result, { ethereumAnchor: anchor });
      }
    } catch (e) {
      console.warn("Could not record to Ethereum:", e);
    }

    return result;
  })
  .get("/api/results/:id", ({ params }) => {
    const result = resultsCache.get(params.id);
    if (result) return result;
    return {
      id: params.id,
      status: "not_found",
      message: "Results are ephemeral in this demo",
    };
  })
  .get("/api/history", () => {
    return Array.from(resultsCache.values()).sort(
      (a, b) =>
        new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  })
  .post("/api/verify", async ({ body }) => {
    const { packageName, registry } = body as {
      packageName: string;
      registry: string;
    };
    try {
      const res = await fetch(
        `${DASHBOARD_URL}/api/package/${encodeURIComponent(packageName)}/${registry}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { packageName, registry, verified: false, attestation: null };
  })
  .listen(3001);

console.log(`Smoker API running on http://localhost:${app.server?.port}`);
