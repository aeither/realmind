// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./QuizGame.sol";

/// @title QuizDuel - PvP Quiz Battle System
/// @notice Enables real-time quiz duels with commit-reveal scheme and instant settlement
contract QuizDuel is Ownable {
    Token1 public token;
    
    enum DuelState { Created, Active, Completed, Cancelled }
    
    struct Duel {
        address challenger;
        address opponent;
        uint256 entryFee;
        uint256 totalPrize;
        string category;
        bytes32 questionHash; // Hash of the question and correct answer
        DuelState state;
        uint256 deadline;
        
        // Commit-reveal scheme
        bytes32 challengerCommit;
        bytes32 opponentCommit;
        uint256 challengerAnswer;
        uint256 opponentAnswer;
        bool challengerRevealed;
        bool opponentRevealed;
        
        address winner;
        uint256 timestamp;
    }
    
    mapping(uint256 => Duel) public duels;
    mapping(address => uint256) public activeDuel; // One active duel per player
    uint256 public nextDuelId = 1;
    
    // Oracle integration for dynamic questions (mock for demo)
    mapping(string => uint256) public oracleAnswers;
    
    event DuelCreated(uint256 indexed duelId, address indexed challenger, uint256 entryFee, string category);
    event DuelJoined(uint256 indexed duelId, address indexed opponent);
    event DuelCompleted(uint256 indexed duelId, address indexed winner, uint256 prize);
    event CommitSubmitted(uint256 indexed duelId, address indexed player);
    event AnswerRevealed(uint256 indexed duelId, address indexed player, uint256 answer);
    
    constructor(address tokenAddress) Ownable(msg.sender) {
        token = Token1(tokenAddress);
        
        // Mock oracle data for demo
        oracleAnswers["CORE_PRICE"] = 1; // Index 1 = $1.23
        oracleAnswers["ETH_PRICE"] = 2; // Index 2 = $2,450
    }
    
    /// @notice Create a new duel challenge
    function createDuel(string memory category, bytes32 questionHash) external payable {
        require(msg.value > 0, "Entry fee required");
        require(activeDuel[msg.sender] == 0, "Already in active duel");
        
        uint256 duelId = nextDuelId++;
        
        duels[duelId] = Duel({
            challenger: msg.sender,
            opponent: address(0),
            entryFee: msg.value,
            totalPrize: msg.value,
            category: category,
            questionHash: questionHash,
            state: DuelState.Created,
            deadline: block.timestamp + 300, // 5 minutes to join
            challengerCommit: 0,
            opponentCommit: 0,
            challengerAnswer: 0,
            opponentAnswer: 0,
            challengerRevealed: false,
            opponentRevealed: false,
            winner: address(0),
            timestamp: block.timestamp
        });
        
        activeDuel[msg.sender] = duelId;
        
        emit DuelCreated(duelId, msg.sender, msg.value, category);
    }
    
    /// @notice Join an existing duel
    function joinDuel(uint256 duelId) external payable {
        Duel storage duel = duels[duelId];
        require(duel.state == DuelState.Created, "Duel not available");
        require(duel.challenger != msg.sender, "Cannot join own duel");
        require(msg.value == duel.entryFee, "Incorrect entry fee");
        require(block.timestamp <= duel.deadline, "Duel expired");
        require(activeDuel[msg.sender] == 0, "Already in active duel");
        
        duel.opponent = msg.sender;
        duel.totalPrize += msg.value;
        duel.state = DuelState.Active;
        duel.deadline = block.timestamp + 120; // 2 minutes to complete
        
        activeDuel[msg.sender] = duelId;
        
        emit DuelJoined(duelId, msg.sender);
    }
    
    /// @notice Submit encrypted answer commitment
    function commitAnswer(uint256 duelId, bytes32 commitment) external {
        Duel storage duel = duels[duelId];
        require(duel.state == DuelState.Active, "Duel not active");
        require(block.timestamp <= duel.deadline, "Time expired");
        require(msg.sender == duel.challenger || msg.sender == duel.opponent, "Not a participant");
        
        if (msg.sender == duel.challenger) {
            require(duel.challengerCommit == 0, "Already committed");
            duel.challengerCommit = commitment;
        } else {
            require(duel.opponentCommit == 0, "Already committed");
            duel.opponentCommit = commitment;
        }
        
        emit CommitSubmitted(duelId, msg.sender);
    }
    
    /// @notice Reveal answer and nonce
    function revealAnswer(uint256 duelId, uint256 answer, uint256 nonce) external {
        Duel storage duel = duels[duelId];
        require(duel.state == DuelState.Active, "Duel not active");
        require(duel.challengerCommit != 0 && duel.opponentCommit != 0, "Commits not submitted");
        
        bytes32 expectedCommit = keccak256(abi.encodePacked(answer, nonce));
        
        if (msg.sender == duel.challenger) {
            require(duel.challengerCommit == expectedCommit, "Invalid reveal");
            require(!duel.challengerRevealed, "Already revealed");
            duel.challengerAnswer = answer;
            duel.challengerRevealed = true;
        } else {
            require(msg.sender == duel.opponent, "Not a participant");
            require(duel.opponentCommit == expectedCommit, "Invalid reveal");
            require(!duel.opponentRevealed, "Already revealed");
            duel.opponentAnswer = answer;
            duel.opponentRevealed = true;
        }
        
        emit AnswerRevealed(duelId, msg.sender, answer);
        
        // If both revealed, determine winner
        if (duel.challengerRevealed && duel.opponentRevealed) {
            _completeDuel(duelId);
        }
    }
    
    /// @notice Complete duel and distribute rewards
    function _completeDuel(uint256 duelId) internal {
        Duel storage duel = duels[duelId];
        
        // Get correct answer from question hash (simplified for demo)
        uint256 correctAnswer = uint256(duel.questionHash) % 4; // 0-3 for 4 options
        
        bool challengerCorrect = duel.challengerAnswer == correctAnswer;
        bool opponentCorrect = duel.opponentAnswer == correctAnswer;
        
        address winner;
        
        if (challengerCorrect && !opponentCorrect) {
            winner = duel.challenger;
        } else if (!challengerCorrect && opponentCorrect) {
            winner = duel.opponent;
        } else {
            // Tie or both wrong - refund both players
            _refundDuel(duelId);
            return;
        }
        
        duel.winner = winner;
        duel.state = DuelState.Completed;
        
        // Transfer prize to winner
        (bool sent, ) = winner.call{value: duel.totalPrize}("");
        require(sent, "Prize transfer failed");
        
        // Mint bonus tokens
        uint256 bonusTokens = duel.totalPrize * 50; // 50x multiplier
        try token.mint(winner, bonusTokens) {} catch {}
        
        // Clear active duels
        activeDuel[duel.challenger] = 0;
        activeDuel[duel.opponent] = 0;
        
        emit DuelCompleted(duelId, winner, duel.totalPrize);
    }
    
    /// @notice Refund duel in case of tie
    function _refundDuel(uint256 duelId) internal {
        Duel storage duel = duels[duelId];
        duel.state = DuelState.Completed;
        
        // Refund entry fees
        (bool sentChallenger, ) = duel.challenger.call{value: duel.entryFee}("");
        (bool sentOpponent, ) = duel.opponent.call{value: duel.entryFee}("");
        
        require(sentChallenger && sentOpponent, "Refund failed");
        
        // Clear active duels
        activeDuel[duel.challenger] = 0;
        activeDuel[duel.opponent] = 0;
    }
    
    /// @notice Get duel information
    function getDuel(uint256 duelId) external view returns (Duel memory) {
        return duels[duelId];
    }
    
    /// @notice Cancel expired duel
    function cancelExpiredDuel(uint256 duelId) external {
        Duel storage duel = duels[duelId];
        require(block.timestamp > duel.deadline, "Duel not expired");
        require(duel.state == DuelState.Created || duel.state == DuelState.Active, "Cannot cancel");
        
        duel.state = DuelState.Cancelled;
        
        if (duel.state == DuelState.Created) {
            // Refund challenger only
            (bool sent, ) = duel.challenger.call{value: duel.entryFee}("");
            require(sent, "Refund failed");
            activeDuel[duel.challenger] = 0;
        } else {
            // Refund both players
            _refundDuel(duelId);
        }
    }
    
    /// @notice Update oracle answer (owner only, for demo)
    function updateOracleAnswer(string memory key, uint256 value) external onlyOwner {
        oracleAnswers[key] = value;
    }
    
    /// @notice Withdraw contract balance
    function withdraw() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "Withdrawal failed");
    }
    
    receive() external payable {}
}