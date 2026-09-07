"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Threat {
  type: string;
  severity: string;
  description: string;
  recommendation: string;
}

interface ScanResult {
  id: string;
  package: { name: string; version: string; registry: string };
  threats: Threat[];
  provenance: { hasAttestation: boolean; verified: boolean };
  trustScore: number;
  scannedAt: string;
}

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
  info: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function Home() {
  const [packageName, setPackageName] = useState("");
  const [registry, setRegistry] = useState("npm");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  async function handleScan() {
    if (!packageName.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: packageName.trim(),
          packageRegistry: registry,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  function trustScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-1">Smoker</h1>
        <p className="text-zinc-500 mb-8">
          Software supply chain smoke detection.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Package name
            </label>
            <input
              type="text"
              placeholder="e.g. axios, lodash, react"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Registry</label>
            <select
              value={registry}
              onChange={(e) => setRegistry(e.target.value)}
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
            >
              <option value="npm">npm</option>
              <option value="pypi">PyPI</option>
              <option value="crates">crates.io</option>
            </select>
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !packageName.trim()}
            className="bg-zinc-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 rounded p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="border border-zinc-200 rounded p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {result.package.name}
                  </h2>
                  <p className="text-zinc-500 text-sm">
                    {result.package.registry} · {result.package.version}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-3xl font-bold ${trustScoreColor(result.trustScore)}`}
                  >
                    {result.trustScore}
                  </div>
                  <div className="text-xs text-zinc-500">Trust Score</div>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-zinc-600">
                <span>
                  Threats:{" "}
                  <span
                    className={
                      result.threats.length > 0
                        ? "text-red-600 font-medium"
                        : "text-green-600"
                    }
                  >
                    {result.threats.length}
                  </span>
                </span>
                <span>
                  Provenance:{" "}
                  {result.provenance.hasAttestation ? (
                    <span className="text-green-600 font-medium">verified</span>
                  ) : (
                    <span className="text-zinc-400">none</span>
                  )}
                </span>
              </div>
            </div>

            {result.threats.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Threats Detected</h3>
                <div className="space-y-3">
                  {result.threats.map((t, i) => (
                    <div
                      key={i}
                      className={`border rounded p-4 text-sm ${severityColors[t.severity] || "border-zinc-200 bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold uppercase text-xs">
                          {t.type}
                        </span>
                        <span className="text-xs opacity-70">
                          · {t.severity}
                        </span>
                      </div>
                      <p>{t.description}</p>
                      <p className="mt-1 text-xs opacity-70">
                        → {t.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-zinc-400">
              Scanned at {new Date(result.scannedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
