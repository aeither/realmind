// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {QuizGame, Token1} from "../src/QuizGame.sol";

contract QuizGameScript is Script {
    QuizGame public quizGame;
    Token1 public token;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy Token1 with custom name/symbol
        token = new Token1("Season3", "S3");
        
        // Deploy QuizGame
        quizGame = new QuizGame(address(token));
        
        // Transfer token ownership to QuizGame
        token.transferOwnership(address(quizGame));

        vm.stopBroadcast();
    }
}