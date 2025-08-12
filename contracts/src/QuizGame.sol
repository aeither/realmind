// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token1 is ERC20, Ownable {
    constructor() ERC20("Token1", "TK1") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract QuizGame is Ownable {
    Token1 public token;

    // Mapping: user address => active quiz session (only one allowed at a time)
    mapping(address => QuizSession) public userSessions;

    struct QuizSession {
        bool active;
        uint256 userAnswer;
        uint256 amountPaid;
        uint256 timestamp;
        string quizId;
    }

    event QuizStarted(address indexed user, string quizId, uint256 userAnswer);
    event QuizCompleted(address indexed user, string quizId, bool success, uint256 tokensMinted);

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = Token1(tokenAddress);
    }

    function setToken(address tokenAddress) external onlyOwner {
        token = Token1(tokenAddress);
    }

    function startQuiz(string memory quizId, uint256 userAnswer) external payable {
        require(msg.value > 0, "Must send ETH");
        require(bytes(quizId).length > 0, "Quiz ID cannot be empty");

        QuizSession storage session = userSessions[msg.sender];
        require(!session.active, "Active quiz in progress. Complete it first.");

        // Start new session
        session.active = true;
        session.userAnswer = userAnswer;
        session.amountPaid = msg.value;
        session.timestamp = block.timestamp;
        session.quizId = quizId;

        // Mint initial tokens: 100x ETH paid
        uint256 initialTokens = msg.value * 100;
        try token.mint(msg.sender, initialTokens) {
            // Success - ignore failure to avoid blocking quiz
        } catch {
            // Log or handle silently
        }

        emit QuizStarted(msg.sender, quizId, userAnswer);
    }

    function completeQuiz(uint256 submittedAnswer) external {
        QuizSession storage session = userSessions[msg.sender];
        require(session.active, "No active quiz session");

        // Mark as inactive first
        session.active = false;

        bool correct = (submittedAnswer == session.userAnswer);
        uint256 initialTokens = session.amountPaid * 100;
        uint256 totalTokens = initialTokens;

        if (correct) {
            // Random bonus: 10% to 90%
            uint256 bonusPercent = 10 + (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 81);
            uint256 bonusTokens = (initialTokens * bonusPercent) / 100;
            totalTokens += bonusTokens;

            try token.mint(msg.sender, bonusTokens) {
                emit QuizCompleted(msg.sender, session.quizId, true, totalTokens);
            } catch {
                emit QuizCompleted(msg.sender, session.quizId, true, initialTokens);
            }
        } else {
            emit QuizCompleted(msg.sender, session.quizId, false, initialTokens);
        }
    }

    // View function to get user's current quiz session
    function getQuizSession(address user) external view returns (QuizSession memory) {
        return userSessions[user];
    }

    // Check if user has an active quiz
    function hasActiveQuiz(address user) external view returns (bool) {
        return userSessions[user].active;
    }

    // Owner-only token minting
    function mintToken(address to, uint256 amount) external onlyOwner {
        token.mint(to, amount);
    }

    // Withdraw ETH collected
    function withdraw() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "Withdrawal failed");
    }

    // Allow receiving ETH
    receive() external payable {}
}