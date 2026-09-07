// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/SmokerVerifier.sol";

contract DeploySmokerVerifier is Script {
    function run() external returns (SmokerVerifier) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        SmokerVerifier verifier = new SmokerVerifier();
        vm.stopBroadcast();

        console.log("SmokerVerifier deployed at:", address(verifier));
        return verifier;
    }
}
