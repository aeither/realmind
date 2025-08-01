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
        token = new Token1();
        
        // Deploy QuizGame
        quizGame = new QuizGame(address(token));
        
        // Transfer token ownership to quizGame
        token.transferOwnership(address(quizGame));
    }

    function testCompleteQuizFlow_CorrectAnswer() public {
        vm.deal(player, 1 ether);
        uint256 initialBalance = player.balance;
        uint256 initialTokens = token.balanceOf(player);
        
        // Start quiz with custom amount
        uint256 playAmount = 0.0015 ether;
        vm.prank(player);
        quizGame.startQuiz{value: playAmount}(42);
        
        // Player gets initial tokens (100x the amount paid)
        uint256 expectedInitialTokens = playAmount * 100;
        assertEq(token.balanceOf(player), expectedInitialTokens);
        
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
        
        // Player should get bonus tokens (10% to 90% of initial tokens)
        uint256 finalTokens = token.balanceOf(player);
        assertTrue(finalTokens > expectedInitialTokens); // Should have more tokens than initial
        assertTrue(finalTokens <= expectedInitialTokens * 190 / 100); // Max 190% of initial (100% + 90% bonus)
    }

    function testCompleteQuizFlow_IncorrectAnswer() public {
        vm.deal(player, 1 ether);
        uint256 initialBalance = player.balance;
        
        // Start quiz
        uint256 playAmount = 0.001 ether;
        vm.prank(player);
        quizGame.startQuiz{value: playAmount}(42);
        
        // Player gets initial tokens
        uint256 expectedInitialTokens = playAmount * 100;
        assertEq(token.balanceOf(player), expectedInitialTokens);
        
        // Complete with wrong answer
        vm.prank(player);
        quizGame.completeQuiz(999);
        
        // Player keeps initial tokens but gets no bonus
        assertEq(token.balanceOf(player), expectedInitialTokens);
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
        assertEq(token.balanceOf(player), 0.001 ether * 100);
        assertEq(token.balanceOf(player2), 0.002 ether * 100);
        
        // Player 1 completes correctly
        vm.prank(player);
        quizGame.completeQuiz(42);
        
        // Player 2 completes incorrectly
        vm.prank(player2);
        quizGame.completeQuiz(999);
        
        // Verify outcomes
        assertFalse(quizGame.getQuizSession(player).active);
        assertFalse(quizGame.getQuizSession(player2).active);
        
        // Player 1 should have more tokens than initial (got bonus)
        assertTrue(token.balanceOf(player) > 0.001 ether * 100);
        
        // Player 2 should have exactly initial tokens (no bonus for wrong answer)
        assertEq(token.balanceOf(player2), 0.002 ether * 100);
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

    function testTokenRewardCalculation() public {
        vm.deal(player, 1 ether);
        
        // Start quiz with 0.01 ETH
        uint256 playAmount = 0.01 ether;
        vm.prank(player);
        quizGame.startQuiz{value: playAmount}(42);
        
        // Should get 1 token (0.01 ETH * 100 = 1 token)
        assertEq(token.balanceOf(player), 1 ether);
        
        // Complete correctly
        vm.prank(player);
        quizGame.completeQuiz(42);
        
        // Should get bonus tokens (10% to 90% of 1 token)
        uint256 finalTokens = token.balanceOf(player);
        assertTrue(finalTokens > 1 ether); // More than initial 1 token
        assertTrue(finalTokens <= 1.9 ether); // Max 1.9 tokens (1 + 0.9 bonus)
    }
}