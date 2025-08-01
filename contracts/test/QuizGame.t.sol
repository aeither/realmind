// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {QuizGame, Token1} from "../src/QuizGame.sol";

contract QuizGameTest is Test {
    QuizGame public quizGame;
    Token1 public token;
    address public player = address(0x123);
    address public player2 = address(0x456);
    address public owner;

    function setUp() public {
        owner = address(this);
        // Deploy Token1 with custom name/symbol
        token = new Token1("CustomToken", "CTK");
        
        // Deploy QuizGame
        quizGame = new QuizGame(address(token));
        
        // Transfer token ownership to quizGame
        token.transferOwnership(address(quizGame));
    }

    function testCompleteQuizFlow_CorrectAnswer() public {
        vm.deal(player, 1 ether);
        uint256 initialBalance = player.balance;
        
        // Start quiz with custom amount
        uint256 playAmount = 0.0015 ether;
        vm.prank(player);
        quizGame.startQuiz{value: playAmount}(42);
        
        // Player gets tokens immediately (1:1 ratio)
        assertEq(token.balanceOf(player), playAmount);
        
        // Verify session
        QuizGame.QuizSession memory session = quizGame.getQuizSession(player);
        assertTrue(session.active);
        assertEq(session.userAnswer, 42);
        assertEq(session.amountPaid, playAmount);
        
        // Complete quiz correctly
        vm.prank(player);
        quizGame.completeQuiz(42);
        
        // Session should be inactive
        session = quizGame.getQuizSession(player);
        assertFalse(session.active);
        
        // Player should get some ETH back (random payout)
        assertTrue(player.balance > initialBalance - playAmount);
    }

    function testCompleteQuizFlow_IncorrectAnswer() public {
        vm.deal(player, 1 ether);
        uint256 initialBalance = player.balance;
        
        // Start quiz
        uint256 playAmount = 0.001 ether;
        vm.prank(player);
        quizGame.startQuiz{value: playAmount}(42);
        
        // Complete with wrong answer
        vm.prank(player);
        quizGame.completeQuiz(999);
        
        // Player loses all ETH
        assertEq(player.balance, initialBalance - playAmount);
    }

    function testStartQuiz_ZeroETH() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Must send ETH");
        quizGame.startQuiz{value: 0}(42);
    }

    function testStartQuiz_AlreadyActive() public {
        vm.deal(player, 1 ether);
        
        // Start first quiz
        vm.prank(player);
        quizGame.startQuiz{value: 0.001 ether}(42);
        
        // Try to start another
        vm.prank(player);
        vm.expectRevert("Quiz already active for user");
        quizGame.startQuiz{value: 0.001 ether}(123);
    }

    function testCompleteQuiz_NoActiveSession() public {
        vm.prank(player);
        vm.expectRevert("No active quiz session");
        quizGame.completeQuiz(42);
    }

    function testCompleteQuiz_Expired() public {
        vm.deal(player, 1 ether);
        
        // Start quiz
        vm.prank(player);
        quizGame.startQuiz{value: 0.001 ether}(42);
        
        // Fast forward 2 hours
        vm.warp(block.timestamp + 2 hours);
        
        vm.prank(player);
        vm.expectRevert("Quiz session expired");
        quizGame.completeQuiz(42);
    }

    function testMultipleUsers() public {
        vm.deal(player, 1 ether);
        vm.deal(player2, 1 ether);
        
        // Player 1 starts quiz
        vm.prank(player);
        quizGame.startQuiz{value: 0.001 ether}(42);
        
        // Player 2 starts quiz
        vm.prank(player2);
        quizGame.startQuiz{value: 0.002 ether}(123);
        
        // Verify both sessions
        assertTrue(quizGame.getQuizSession(player).active);
        assertTrue(quizGame.getQuizSession(player2).active);
        assertEq(token.balanceOf(player), 0.001 ether);
        assertEq(token.balanceOf(player2), 0.002 ether);
        
        // Player 1 completes correctly
        vm.prank(player);
        quizGame.completeQuiz(42);
        
        // Player 2 completes incorrectly
        vm.prank(player2);
        quizGame.completeQuiz(999);
        
        // Verify outcomes
        assertFalse(quizGame.getQuizSession(player).active);
        assertFalse(quizGame.getQuizSession(player2).active);
        assertTrue(player.balance > 0.999 ether); // Got some payout
        assertEq(player2.balance, 0.998 ether);   // Lost full amount
    }

    function testOwnerMintToken() public {
        // Owner mints tokens to player
        quizGame.mintToken(player, 1000);
        
        assertEq(token.balanceOf(player), 1000);
    }

    function testNonOwnerCannotMint() public {
        vm.prank(player);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", player));
        quizGame.mintToken(player, 1000);
    }
}