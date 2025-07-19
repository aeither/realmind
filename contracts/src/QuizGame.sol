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
    uint256 public playAmount;
    Token1 public token;
    address payable public admin;

    // Mapping to track user quiz sessions
    mapping(address => QuizSession) public userSessions;

    struct QuizSession {
        bool active;
        uint256 userAnswer;
        uint256 amountPaid;
        uint256 timestamp;
    }

    event QuizStarted(address indexed user, uint256 userAnswer);
    event QuizCompleted(address indexed user, bool success, uint256 payout);

    constructor(uint256 _playAmount, address tokenAddress) Ownable(msg.sender) {
        playAmount = _playAmount;
        admin = payable(msg.sender);
        token = Token1(tokenAddress);
    }

    function setPlayAmount(uint256 _amount) external onlyOwner {
        playAmount = _amount;
    }

    function setToken(address tokenAddress) external onlyOwner {
        token = Token1(tokenAddress);
    }

    function startQuiz(uint256 userAnswer) external payable {
        require(msg.value == playAmount, "Incorrect ETH sent");
        require(!userSessions[msg.sender].active, "Quiz already active for user");

        // Create new quiz session
        userSessions[msg.sender] = QuizSession({
            active: true,
            userAnswer: userAnswer,
            amountPaid: msg.value,
            timestamp: block.timestamp
        });

        // Mint tokens (1 ETH = 1 Token1)
        token.mint(msg.sender, msg.value);

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
            // Simulate random: 10% to 120% payout
            uint256 randomPercent = 10 + (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 111);
            uint256 payout = (session.amountPaid * randomPercent) / 100;
            
            if (payout <= address(this).balance) {
                (bool sent, ) = msg.sender.call{value: payout}("");
                require(sent, "ETH transfer failed");
                emit QuizCompleted(msg.sender, true, payout);
            } else {
                emit QuizCompleted(msg.sender, false, 0);
            }
        } else {
            emit QuizCompleted(msg.sender, false, 0);
        }
    }

    function getQuizSession(address user) external view returns (QuizSession memory) {
        return userSessions[user];
    }

    // Allow admin to withdraw ETH collected
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fallback to receive ETH
    receive() external payable {}
}
