// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {Counter} from "src/Counter.sol";

contract CounterDeploy is Script {
    function run() public {
        // Begin broadcasting transactions
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Use deterministic CREATE2 with a fixed salt
        bytes32 salt = bytes32(abi.encodePacked("my_unique_salt_123"));

        // Deploy using CREATE2
        new Counter{salt: salt}();

        vm.stopBroadcast();
    }
}