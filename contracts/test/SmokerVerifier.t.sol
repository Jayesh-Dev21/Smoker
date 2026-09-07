// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/SmokerVerifier.sol";

contract SmokerVerifierTest is Test {
    SmokerVerifier public verifier;

    function setUp() public {
        verifier = new SmokerVerifier();
    }

    function testRecordScan() public {
        uint256 idx = verifier.recordScan("axios", "npm", 85, 0, true, "sha256:abc123");
        assertEq(idx, 1, "Should return scan index 1");
        assertEq(verifier.getScanCount("axios", "npm"), 1, "Should have 1 scan");
        assertEq(verifier.totalScans(), 1, "Total scans should be 1");
    }

    function testRecordAttestation() public {
        uint256 idx = verifier.recordAttestation("axios", "npm", "sha256:def456", "https://github.com/axios/axios", "abc123");
        assertEq(idx, 1, "Should return attestation index 1");
        assertEq(verifier.getAttestationCount("axios", "npm"), 1, "Should have 1 attestation");
    }

    function testVerifyPackage() public {
        verifier.verifyPackage("axios", "npm", true);
        assertTrue(verifier.isVerified("axios", "npm"), "Should be verified");
        assertEq(verifier.totalVerified(), 1, "Total verified should be 1");
    }

    function testMultipleScans() public {
        verifier.recordScan("axios", "npm", 85, 0, true, "sha256:abc");
        verifier.recordScan("axios", "npm", 90, 1, false, "sha256:def");
        assertEq(verifier.getScanCount("axios", "npm"), 2, "Should have 2 scans");
        assertEq(verifier.totalScans(), 2, "Total scans should be 2");
    }

    function testDifferentRegistries() public {
        verifier.recordScan("requests", "pypi", 92, 0, true, "sha256:py");
        verifier.recordScan("requests", "npm", 10, 3, false, "sha256:nm");
        assertEq(verifier.getScanCount("requests", "pypi"), 1, "PyPI should have 1");
        assertEq(verifier.getScanCount("requests", "npm"), 1, "npm should have 1");
    }

    function testGetAllScans() public {
        verifier.recordScan("axios", "npm", 85, 0, true, "sha256:abc");
        verifier.recordScan("lodash", "npm", 95, 0, true, "sha256:def");
        SmokerVerifier.ScanResult[] memory all = verifier.getAllScans();
        assertEq(all.length, 2, "Should return all scans");
    }
}
