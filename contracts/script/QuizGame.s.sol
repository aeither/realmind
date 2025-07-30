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

        // Deploy Token1 first
        token = new Token1();
        
        // Deploy QuizGame with 0.001 ETH play amount
        quizGame = new QuizGame(0.001 ether, address(token));
        
        // Transfer ownership of token to quizGame so it can mint
        token.transferOwnership(address(quizGame));

        vm.stopBroadcast();
    }
}
