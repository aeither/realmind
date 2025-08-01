// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {QuizGame, Token1} from "../src/QuizGame.sol";

contract QuizGameScript is Script {
    QuizGame public quizGame;
    Token1 public token;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Use deterministic CREATE2 with a fixed salt
        bytes32 salt = bytes32(abi.encodePacked("my_unique_salt_12345"));

        // Deploy Token1
        token = new Token1{salt: salt}();
        console.log("Token1 deployed at:", address(token));

        // Deploy QuizGame
        quizGame = new QuizGame{salt: salt}(address(token));
        console.log("QuizGame deployed at:", address(quizGame));

        console.log("All contracts deployed successfully!");
        console.log("Token1:", address(token));
        console.log("QuizGame:", address(quizGame));

        vm.stopBroadcast();
    }
}
