// Shared types for Smoker

export interface ScanRequest {
  packageRegistry: "npm" | "pypi" | "crates";
  packageName: string;
  version?: string;
}

export interface ScanResult {
  id: string;
  package: {
    name: string;
    version: string;
    registry: string;
  };
  threats: Threat[];
  provenance: ProvenanceInfo;
  trustScore: number; // 0-100
  ethereumAnchor?: EthereumAnchor;
  scannedAt: string;
}

export interface Threat {
  type: ThreatType;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

export type ThreatType =
  | "typosquatting"
  | "dependency-confusion"
  | "maintainer-change"
  | "new-package"
  | "no-provenance"
  | "malicious-script"
  | "vulnerability";

export interface ProvenanceInfo {
  hasAttestation: boolean;
  source?: string;
  commit?: string;
  builder?: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface EthereumAnchor {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  chainId: number;
}

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  version: string;
}
