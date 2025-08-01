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

    // Mapping to track user quiz sessions
    mapping(address => QuizSession) public userSessions;

    struct QuizSession {
        bool active;
        uint256 userAnswer;
        uint256 amountPaid;
        uint256 timestamp;
    }

    event QuizStarted(address indexed user, uint256 userAnswer);
    event QuizCompleted(address indexed user, bool success, uint256 tokensMinted);

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = Token1(tokenAddress);
    }

    function setToken(address tokenAddress) external onlyOwner {
        token = Token1(tokenAddress);
    }

    function startQuiz(uint256 userAnswer) external payable {
        require(msg.value > 0, "Must send ETH");
        require(!userSessions[msg.sender].active, "Quiz already active for user");

        // Create new quiz session
        userSessions[msg.sender] = QuizSession({
            active: true,
            userAnswer: userAnswer,
            amountPaid: msg.value,
            timestamp: block.timestamp
        });

        // Mint initial tokens (100x the amount paid)
        uint256 initialTokens = msg.value * 100;
        try token.mint(msg.sender, initialTokens) {
            // Success - tokens minted
        } catch {
            // Failed - tokens not minted, but quiz can still proceed
        }

        emit QuizStarted(msg.sender, userAnswer);
    }

    function completeQuiz(uint256 submittedAnswer) external {
        QuizSession storage session = userSessions[msg.sender];
        require(session.active, "No active quiz session");
        require(block.timestamp <= session.timestamp + 1 hours, "Quiz session expired");

        // Mark session as completed
        session.active = false;

        // Check if the submitted answer matches the user's original answer
        if (submittedAnswer == session.userAnswer) {
            // Calculate bonus tokens: 10% to 90% of the initial tokens
            uint256 initialTokens = session.amountPaid * 100;
            uint256 bonusPercent = 10 + (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 81); // 10% to 90%
            uint256 bonusTokens = (initialTokens * bonusPercent) / 100;
            uint256 totalTokens = initialTokens + bonusTokens;
            
            // Mint bonus tokens for correct answer
            try token.mint(msg.sender, bonusTokens) {
                emit QuizCompleted(msg.sender, true, totalTokens);
            } catch {
                // Failed to mint bonus tokens, but quiz is still completed
                emit QuizCompleted(msg.sender, true, initialTokens);
            }
        } else {
            emit QuizCompleted(msg.sender, false, session.amountPaid * 100);
        }
    }

    function getQuizSession(address user) external view returns (QuizSession memory) {
        return userSessions[user];
    }

    // Allow owner to mint tokens to any address
    function mintToken(address to, uint256 amount) external onlyOwner {
        token.mint(to, amount);
    }

    // Allow owner to withdraw ETH collected
    function withdraw() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "Withdrawal failed");
    }

    // Fallback to receive ETH
    receive() external payable {}
} 