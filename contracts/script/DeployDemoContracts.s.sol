// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/QuizGame.sol";
import "../src/QuizDuel.sol";
import "../src/GuildSystem.sol";
import "../src/QuizNFT.sol";

contract DeployDemoContracts is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Token1 first
        Token1 token = new Token1();
        console.log("Token1 deployed at:", address(token));

        // Deploy QuizGame
        QuizGame quizGame = new QuizGame(address(token));
        console.log("QuizGame deployed at:", address(quizGame));

        // Deploy QuizDuel
        QuizDuel quizDuel = new QuizDuel(address(token));
        console.log("QuizDuel deployed at:", address(quizDuel));

        // Deploy GuildSystem
        GuildSystem guildSystem = new GuildSystem(address(token));
        console.log("GuildSystem deployed at:", address(guildSystem));

        // Deploy QuizNFT
        QuizNFT quizNFT = new QuizNFT(address(token));
        console.log("QuizNFT deployed at:", address(quizNFT));

        // Set up initial permissions
        token.transferOwnership(address(quizGame));
        console.log("Token ownership transferred to QuizGame");

        vm.stopBroadcast();

        // Log all addresses for easy copying
        console.log("\n=== DEPLOYED CONTRACTS ===");
        console.log("Token1:", address(token));
        console.log("QuizGame:", address(quizGame));
        console.log("QuizDuel:", address(quizDuel));
        console.log("GuildSystem:", address(guildSystem));
        console.log("QuizNFT:", address(quizNFT));
    }
}