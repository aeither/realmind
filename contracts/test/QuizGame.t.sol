// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {QuizGame, Token1} from "../src/QuizGame.sol";

contract QuizGameTest is Test {
    QuizGame public quizGame;
    Token1 public token;
    address public player = address(0x123);
    address public player2 = address(0x456);

    function setUp() public {
        // Deploy Token1 first
        token = new Token1();
        
        // Deploy QuizGame with 0.001 ETH play amount
        quizGame = new QuizGame(0.001 ether, address(token));
        
        // Transfer ownership of token to quizGame so it can mint
        token.transferOwnership(address(quizGame));
    }

    function testCompleteQuizFlow_CorrectAnswer() public {
        vm.deal(player, 1 ether);
        uint256 initialBalance = player.balance;
        
        // Step 1: Start quiz with answer 42
        vm.prank(player);
        quizGame.startQuiz{value: 0.001 ether}(42);
        
        // Player should get tokens immediately
        assertEq(token.balanceOf(player), 0.001 ether);
        
        // Check quiz session is active
        QuizGame.QuizSession memory session = quizGame.getQuizSession(player);
        assertTrue(session.active);
        assertEq(session.userAnswer, 42);
        assertEq(session.amountPaid, 0.001 ether);
        
        // Step 2: Complete quiz with same answer
        vm.prank(player);
        quizGame.completeQuiz(42);
        
        // Session should be inactive now
        session = quizGame.getQuizSession(player);
        assertFalse(session.active);
        
        // Player should get some ETH back (random payout between 10-120%)
        assertTrue(player.balance >= initialBalance - 0.001 ether);
    }

    function testCompleteQuizFlow_IncorrectAnswer() public {
        vm.deal(player, 1 ether);
        uint256 initialBalance = player.balance;
        
        // Step 1: Start quiz with answer 42
        vm.prank(player);
        quizGame.startQuiz{value: 0.001 ether}(42);
        
        // Player should get tokens immediately
        assertEq(token.balanceOf(player), 0.001 ether);
        
        // Step 2: Complete quiz with different answer
        vm.prank(player);
        quizGame.completeQuiz(999);
        
        // Session should be inactive now
        QuizGame.QuizSession memory session = quizGame.getQuizSession(player);
        assertFalse(session.active);
        
        // Player should not get ETH back for wrong answer
        assertEq(player.balance, initialBalance - 0.001 ether);
    }

    function testStartQuiz_InsufficientETH() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        
        vm.expectRevert("Incorrect ETH sent");
        quizGame.startQuiz{value: 0.0005 ether}(42);
    }

    function testStartQuiz_AlreadyActive() public {
        vm.deal(player, 1 ether);
        
        // Start first quiz
        vm.prank(player);
        quizGame.startQuiz{value: 0.001 ether}(42);
        
        // Try to start another quiz without completing the first
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
        
        // Fast forward more than 1 hour
        vm.warp(block.timestamp + 2 hours);
        
        // Try to complete expired quiz
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
        
        // Player 2 starts quiz with different answer
        vm.prank(player2);
        quizGame.startQuiz{value: 0.001 ether}(123);
        
        // Both should have active sessions
        assertTrue(quizGame.getQuizSession(player).active);
        assertTrue(quizGame.getQuizSession(player2).active);
        
        // Player 1 completes correctly
        vm.prank(player);
        quizGame.completeQuiz(42);
        
        // Player 2 completes incorrectly
        vm.prank(player2);
        quizGame.completeQuiz(999);
        
        // Both sessions should be inactive
        assertFalse(quizGame.getQuizSession(player).active);
        assertFalse(quizGame.getQuizSession(player2).active);
    }
}
