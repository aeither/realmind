// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {QuizGame, Token1} from "../src/QuizGame.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract QuizGameScript is Script {
    QuizGame public quizGame;
    Token1 public token;

    // Predictable salt - same across all chains
    bytes32 public constant SALT = keccak256("RealMind-QuizGame-v1.0");

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Prepare deployment bytecode for Token1
        bytes memory tokenBytecode = abi.encodePacked(
            type(Token1).creationCode,
            abi.encode("Season3", "S3")
        );
        
        // Deploy Token1 using CREATE2
        address predictedTokenAddress = Create2.computeAddress(SALT, keccak256(tokenBytecode));
        console.log("Predicted Token1 address:", predictedTokenAddress);
        
        address tokenAddress = Create2.deploy(0, SALT, tokenBytecode);
        token = Token1(tokenAddress);
        console.log("Token1 deployed at:", address(token));

        // Prepare deployment bytecode for QuizGame
        bytes memory quizGameBytecode = abi.encodePacked(
            type(QuizGame).creationCode,
            abi.encode(tokenAddress)
        );
        
        // Deploy QuizGame using CREATE2
        address predictedQuizGameAddress = Create2.computeAddress(SALT, keccak256(quizGameBytecode));
        console.log("Predicted QuizGame address:", predictedQuizGameAddress);
        
        address quizGameAddress = Create2.deploy(0, SALT, quizGameBytecode);
        quizGame = QuizGame(payable(quizGameAddress));
        console.log("QuizGame deployed at:", address(quizGame));

        // Transfer token ownership to QuizGame
        token.transferOwnership(address(quizGame));
        console.log("Token ownership transferred to QuizGame");

        // Verify addresses match predictions
        require(address(token) == predictedTokenAddress, "Token address mismatch");
        require(address(quizGame) == predictedQuizGameAddress, "QuizGame address mismatch");
        
        console.log("All contracts deployed successfully with CREATE2!");
        console.log("Token1:", address(token));
        console.log("QuizGame:", address(quizGame));

        vm.stopBroadcast();
    }

    // Helper function to predict addresses without deploying
    function predictAddresses() public view returns (address predictedToken, address predictedQuizGame) {
        // Predict Token1 address
        bytes memory tokenBytecode = abi.encodePacked(
            type(Token1).creationCode,
            abi.encode("Season3", "S3")
        );
        predictedToken = Create2.computeAddress(SALT, keccak256(tokenBytecode));
        
        // Predict QuizGame address
        bytes memory quizGameBytecode = abi.encodePacked(
            type(QuizGame).creationCode,
            abi.encode(predictedToken)
        );
        predictedQuizGame = Create2.computeAddress(SALT, keccak256(quizGameBytecode));
    }
}