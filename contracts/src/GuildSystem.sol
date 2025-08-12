// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./QuizGame.sol";

/// @title GuildSystem - Study Guilds with Treasury Management
/// @notice Enables guild formation, treasury management, and guild vs guild battles
contract GuildSystem is Ownable {
    Token1 public token;
    
    struct Guild {
        string name;
        address leader;
        address[] members;
        uint256 treasury;
        uint256 totalScore;
        uint256 ranking;
        bool active;
        uint256 createdAt;
        mapping(address => bool) isMember;
        mapping(address => uint256) memberContributions;
    }
    
    struct GuildBattle {
        uint256 guildA;
        uint256 guildB;
        uint256 prizePool;
        uint256 guildAScore;
        uint256 guildBScore;
        uint256 winner; // 0 = none, guildA id, or guildB id
        bool completed;
        uint256 deadline;
        mapping(address => bool) hasParticipated;
        mapping(address => uint256) playerScores;
    }
    
    mapping(uint256 => Guild) public guilds;
    mapping(string => uint256) public guildNameToId; // Unique guild names
    mapping(address => uint256) public playerGuild; // One guild per player
    mapping(uint256 => GuildBattle) public battles;
    
    uint256 public nextGuildId = 1;
    uint256 public nextBattleId = 1;
    uint256 public constant MAX_GUILD_SIZE = 10;
    uint256 public constant MIN_BATTLE_PARTICIPANTS = 3;
    
    event GuildCreated(uint256 indexed guildId, string name, address indexed leader);
    event PlayerJoinedGuild(uint256 indexed guildId, address indexed player);
    event PlayerLeftGuild(uint256 indexed guildId, address indexed player);
    event TreasuryDeposit(uint256 indexed guildId, address indexed player, uint256 amount);
    event BattleCreated(uint256 indexed battleId, uint256 indexed guildA, uint256 indexed guildB, uint256 prizePool);
    event BattleCompleted(uint256 indexed battleId, uint256 indexed winnerGuild, uint256 prize);
    event GuildRankingUpdated(uint256 indexed guildId, uint256 newRanking);
    
    constructor(address tokenAddress) Ownable(msg.sender) {
        token = Token1(tokenAddress);
    }
    
    /// @notice Create a new guild
    function createGuild(string memory name) external payable {
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Invalid guild name");
        require(guildNameToId[name] == 0, "Guild name already exists");
        require(playerGuild[msg.sender] == 0, "Already in a guild");
        require(msg.value >= 0.01 ether, "Minimum treasury deposit required");
        
        uint256 guildId = nextGuildId++;
        Guild storage guild = guilds[guildId];
        
        guild.name = name;
        guild.leader = msg.sender;
        guild.members.push(msg.sender);
        guild.treasury = msg.value;
        guild.totalScore = 0;
        guild.ranking = 0;
        guild.active = true;
        guild.createdAt = block.timestamp;
        guild.isMember[msg.sender] = true;
        guild.memberContributions[msg.sender] = msg.value;
        
        guildNameToId[name] = guildId;
        playerGuild[msg.sender] = guildId;
        
        emit GuildCreated(guildId, name, msg.sender);
        emit TreasuryDeposit(guildId, msg.sender, msg.value);
    }
    
    /// @notice Join an existing guild
    function joinGuild(uint256 guildId) external payable {
        Guild storage guild = guilds[guildId];
        require(guild.active, "Guild not active");
        require(!guild.isMember[msg.sender], "Already a member");
        require(guild.members.length < MAX_GUILD_SIZE, "Guild is full");
        require(playerGuild[msg.sender] == 0, "Already in a guild");
        require(msg.value >= 0.005 ether, "Minimum contribution required");
        
        guild.members.push(msg.sender);
        guild.isMember[msg.sender] = true;
        guild.treasury += msg.value;
        guild.memberContributions[msg.sender] = msg.value;
        
        playerGuild[msg.sender] = guildId;
        
        emit PlayerJoinedGuild(guildId, msg.sender);
        emit TreasuryDeposit(guildId, msg.sender, msg.value);
    }
    
    /// @notice Leave guild
    function leaveGuild() external {
        uint256 guildId = playerGuild[msg.sender];
        require(guildId != 0, "Not in a guild");
        
        Guild storage guild = guilds[guildId];
        require(guild.leader != msg.sender, "Leader cannot leave, transfer leadership first");
        
        // Remove from members array
        for (uint256 i = 0; i < guild.members.length; i++) {
            if (guild.members[i] == msg.sender) {
                guild.members[i] = guild.members[guild.members.length - 1];
                guild.members.pop();
                break;
            }
        }
        
        guild.isMember[msg.sender] = false;
        playerGuild[msg.sender] = 0;
        
        emit PlayerLeftGuild(guildId, msg.sender);
    }
    
    /// @notice Contribute to guild treasury
    function contributeToTreasury(uint256 guildId) external payable {
        Guild storage guild = guilds[guildId];
        require(guild.isMember[msg.sender], "Not a guild member");
        require(msg.value > 0, "No contribution amount");
        
        guild.treasury += msg.value;
        guild.memberContributions[msg.sender] += msg.value;
        
        emit TreasuryDeposit(guildId, msg.sender, msg.value);
    }
    
    /// @notice Start a guild vs guild battle
    function createGuildBattle(uint256 opponentGuildId) external payable {
        uint256 challengerGuildId = playerGuild[msg.sender];
        require(challengerGuildId != 0, "Not in a guild");
        require(opponentGuildId != challengerGuildId, "Cannot battle own guild");
        require(guilds[challengerGuildId].leader == msg.sender, "Only guild leader can create battles");
        require(guilds[opponentGuildId].active, "Opponent guild not active");
        require(msg.value > 0, "Prize pool required");
        
        uint256 battleId = nextBattleId++;
        GuildBattle storage battle = battles[battleId];
        
        battle.guildA = challengerGuildId;
        battle.guildB = opponentGuildId;
        battle.prizePool = msg.value;
        battle.guildAScore = 0;
        battle.guildBScore = 0;
        battle.winner = 0;
        battle.completed = false;
        battle.deadline = block.timestamp + 1800; // 30 minutes to complete
        
        emit BattleCreated(battleId, challengerGuildId, opponentGuildId, msg.value);
    }
    
    /// @notice Participate in guild battle
    function participateInBattle(uint256 battleId, uint256 score) external {
        GuildBattle storage battle = battles[battleId];
        require(!battle.completed, "Battle already completed");
        require(block.timestamp <= battle.deadline, "Battle deadline passed");
        require(!battle.hasParticipated[msg.sender], "Already participated");
        
        uint256 playerGuildId = playerGuild[msg.sender];
        require(playerGuildId == battle.guildA || playerGuildId == battle.guildB, "Not in battle guilds");
        
        battle.hasParticipated[msg.sender] = true;
        battle.playerScores[msg.sender] = score;
        
        if (playerGuildId == battle.guildA) {
            battle.guildAScore += score;
        } else {
            battle.guildBScore += score;
        }
        
        // Update guild total score
        guilds[playerGuildId].totalScore += score;
    }
    
    /// @notice Complete guild battle and distribute rewards
    function completeBattle(uint256 battleId) external {
        GuildBattle storage battle = battles[battleId];
        require(!battle.completed, "Battle already completed");
        require(block.timestamp > battle.deadline, "Battle still ongoing");
        
        battle.completed = true;
        
        uint256 winnerGuildId;
        if (battle.guildAScore > battle.guildBScore) {
            winnerGuildId = battle.guildA;
        } else if (battle.guildBScore > battle.guildAScore) {
            winnerGuildId = battle.guildB;
        } else {
            // Tie - refund to both guilds
            guilds[battle.guildA].treasury += battle.prizePool / 2;
            guilds[battle.guildB].treasury += battle.prizePool / 2;
            return;
        }
        
        battle.winner = winnerGuildId;
        
        // Transfer prize to winning guild's treasury
        guilds[winnerGuildId].treasury += battle.prizePool;
        
        // Mint bonus tokens for winning guild members
        Guild storage winningGuild = guilds[winnerGuildId];
        uint256 bonusPerMember = (battle.prizePool * 100) / winningGuild.members.length;
        
        for (uint256 i = 0; i < winningGuild.members.length; i++) {
            try token.mint(winningGuild.members[i], bonusPerMember) {} catch {}
        }
        
        emit BattleCompleted(battleId, winnerGuildId, battle.prizePool);
        
        // Update rankings
        _updateGuildRankings();
    }
    
    /// @notice Update guild rankings based on total scores
    function _updateGuildRankings() internal {
        // Simplified ranking system for demo
        // In production, this would be more sophisticated
        for (uint256 i = 1; i < nextGuildId; i++) {
            if (guilds[i].active) {
                uint256 newRanking = guilds[i].totalScore / 1000; // Simplified calculation
                if (newRanking != guilds[i].ranking) {
                    guilds[i].ranking = newRanking;
                    emit GuildRankingUpdated(i, newRanking);
                }
            }
        }
    }
    
    /// @notice Withdraw from guild treasury (leader only)
    function withdrawFromTreasury(uint256 amount) external {
        uint256 guildId = playerGuild[msg.sender];
        require(guildId != 0, "Not in a guild");
        
        Guild storage guild = guilds[guildId];
        require(guild.leader == msg.sender, "Only leader can withdraw");
        require(guild.treasury >= amount, "Insufficient treasury balance");
        
        guild.treasury -= amount;
        
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Withdrawal failed");
    }
    
    /// @notice Transfer guild leadership
    function transferLeadership(address newLeader) external {
        uint256 guildId = playerGuild[msg.sender];
        require(guildId != 0, "Not in a guild");
        
        Guild storage guild = guilds[guildId];
        require(guild.leader == msg.sender, "Only current leader can transfer");
        require(guild.isMember[newLeader], "New leader must be guild member");
        
        guild.leader = newLeader;
    }
    
    /// @notice Get guild information
    function getGuildInfo(uint256 guildId) external view returns (
        string memory name,
        address leader,
        address[] memory members,
        uint256 treasury,
        uint256 totalScore,
        uint256 ranking,
        bool active
    ) {
        Guild storage guild = guilds[guildId];
        return (
            guild.name,
            guild.leader,
            guild.members,
            guild.treasury,
            guild.totalScore,
            guild.ranking,
            guild.active
        );
    }
    
    /// @notice Get battle information
    function getBattleInfo(uint256 battleId) external view returns (
        uint256 guildA,
        uint256 guildB,
        uint256 prizePool,
        uint256 guildAScore,
        uint256 guildBScore,
        uint256 winner,
        bool completed,
        uint256 deadline
    ) {
        GuildBattle storage battle = battles[battleId];
        return (
            battle.guildA,
            battle.guildB,
            battle.prizePool,
            battle.guildAScore,
            battle.guildBScore,
            battle.winner,
            battle.completed,
            battle.deadline
        );
    }
    
    /// @notice Emergency guild dissolution (owner only)
    function dissolveGuild(uint256 guildId) external onlyOwner {
        Guild storage guild = guilds[guildId];
        guild.active = false;
        
        // Refund treasury to members proportionally
        uint256 totalContributions = 0;
        for (uint256 i = 0; i < guild.members.length; i++) {
            totalContributions += guild.memberContributions[guild.members[i]];
        }
        
        if (totalContributions > 0) {
            for (uint256 i = 0; i < guild.members.length; i++) {
                address member = guild.members[i];
                uint256 refund = (guild.treasury * guild.memberContributions[member]) / totalContributions;
                if (refund > 0) {
                    (bool sent, ) = member.call{value: refund}("");
                    require(sent, "Refund failed");
                }
                playerGuild[member] = 0;
            }
        }
        
        guild.treasury = 0;
    }
    
    receive() external payable {}
}