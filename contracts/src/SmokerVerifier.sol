// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SmokerVerifier {
    struct ScanResult {
        string packageName;
        string registry;
        uint8 trustScore;
        uint256 threatCount;
        bool hasProvenance;
        string attestationHash;
        uint256 scannedAt;
        address scanner;
    }

    struct Attestation {
        string packageName;
        string registry;
        string attestationHash;
        string source;
        string commit;
        uint256 createdAt;
        address creator;
    }

    uint256 public totalScans;
    uint256 public totalAttestations;
    uint256 public totalVerified;

    ScanResult[] public allScans;
    Attestation[] public allAttestations;

    mapping(bytes32 => ScanResult[]) private scansByKey;
    mapping(bytes32 => Attestation[]) private attestationsByKey;
    mapping(bytes32 => bool) public verifiedPackages;

    event ScanRecorded(string packageName, string registry, uint8 trustScore, uint256 timestamp);
    event AttestationRecorded(string packageName, string registry, string attestationHash, uint256 timestamp);
    event PackageVerified(string packageName, string registry, bool verified, uint256 timestamp);

    function _key(string memory name, string memory registry) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, registry));
    }

    function recordScan(
        string memory _packageName,
        string memory _registry,
        uint8 _trustScore,
        uint256 _threatCount,
        bool _hasProvenance,
        string memory _attestationHash
    ) external returns (uint256) {
        bytes32 key = _key(_packageName, _registry);

        ScanResult memory result = ScanResult({
            packageName: _packageName,
            registry: _registry,
            trustScore: _trustScore,
            threatCount: _threatCount,
            hasProvenance: _hasProvenance,
            attestationHash: _attestationHash,
            scannedAt: block.timestamp,
            scanner: msg.sender
        });

        scansByKey[key].push(result);
        allScans.push(result);
        totalScans++;

        emit ScanRecorded(_packageName, _registry, _trustScore, block.timestamp);
        return scansByKey[key].length;
    }

    function recordAttestation(
        string memory _packageName,
        string memory _registry,
        string memory _attestationHash,
        string memory _source,
        string memory _commit
    ) external returns (uint256) {
        bytes32 key = _key(_packageName, _registry);

        Attestation memory att = Attestation({
            packageName: _packageName,
            registry: _registry,
            attestationHash: _attestationHash,
            source: _source,
            commit: _commit,
            createdAt: block.timestamp,
            creator: msg.sender
        });

        attestationsByKey[key].push(att);
        allAttestations.push(att);
        totalAttestations++;

        emit AttestationRecorded(_packageName, _registry, _attestationHash, block.timestamp);
        return attestationsByKey[key].length;
    }

    function verifyPackage(
        string memory _packageName,
        string memory _registry,
        bool _verified
    ) external {
        bytes32 key = _key(_packageName, _registry);
        verifiedPackages[key] = _verified;
        if (_verified) totalVerified++;
        emit PackageVerified(_packageName, _registry, _verified, block.timestamp);
    }

    function getScans(string memory _packageName, string memory _registry) external view returns (ScanResult[] memory) {
        return scansByKey[_key(_packageName, _registry)];
    }

    function getAttestations(string memory _packageName, string memory _registry) external view returns (Attestation[] memory) {
        return attestationsByKey[_key(_packageName, _registry)];
    }

    function isVerified(string memory _packageName, string memory _registry) external view returns (bool) {
        return verifiedPackages[_key(_packageName, _registry)];
    }

    function getScanCount(string memory _packageName, string memory _registry) external view returns (uint256) {
        return scansByKey[_key(_packageName, _registry)].length;
    }

    function getAttestationCount(string memory _packageName, string memory _registry) external view returns (uint256) {
        return attestationsByKey[_key(_packageName, _registry)].length;
    }

    function getAllScans() external view returns (ScanResult[] memory) {
        return allScans;
    }

    function getAllAttestations() external view returns (Attestation[] memory) {
        return allAttestations;
    }
}
