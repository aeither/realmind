<br />
<div align="center">
    <img src="https://github.com/user-attachments/assets/b94f648d-1584-4a8f-91d5-ad3b5bb19248" alt="Logo" width="600">
</div>

# 🏛️ Realmind

a game-like learning app where users earn rewards by answering quizzes and challenging others turning study into friendly competition, with real benefits for every correct answer

DailyWiser turns learning into a real rewards. Earn tokens by completing quizzes and battle friends in live quiz duels.

## DEMO

https://realmind.vercel.app/

## Overview

We're building a fun, game-like learning app where you earn rewards for answering quizzes and challenging others. Think of it as studying meets competition, and every question you get right brings real benefits

**The Future of Decentralized Learning & Earning**

Realmind transforms education into a gamified experience where knowledge acquisition directly translates to real rewards. Built for the Core blockchain ecosystem, we're bridging the gap between traditional learning and Web3 incentives.

## 🎯 The Problem

### Current State of Education
- **Low Engagement**: Traditional learning platforms struggle to maintain user motivation
- **No Real Rewards**: Learners complete courses but gain nothing tangible
- **Isolated Experience**: Learning happens in silos without community or competition
- **Web2 Limitations**: Centralized platforms control user data and rewards

### Market Opportunity
- **$250B+ Global EdTech Market** growing at 16% annually
- **Web3 Education** is the next frontier with $50B+ potential
- **Gamification** increases learning retention by 60%
- **Tokenized Rewards** create sustainable engagement loops

## 💡 The Solution

### Realmind: Learn-to-Earn Platform
Realmind combines **interactive quizzes**, **gamified quests**, and **blockchain rewards** to create the most engaging learning experience in Web3.

**Core Value Proposition:**
- **Earn While You Learn**: Complete quizzes and quests to earn Yuzu Points
- **Competitive Learning**: Real-time leaderboards drive engagement
- **Seasonal Rewards**: Structured competitions with clear incentives
- **Web3 Native**: Seamless wallet integration and on-chain rewards

## 🏗️ Architecture

<img width="939" height="520" alt="image" src="https://github.com/user-attachments/assets/58255b2e-5227-4f13-b5d2-f8f7867da10a" />


### Technical Stack
```
Frontend: React + TypeScript + Vite
Database: PostgreSQL + Drizzle ORM
Web3: Wagmi + Viem + Core Testnet
UI: Tailwind CSS + Custom Design System
Deployment: Vercel + Railway
Smart Contracts: Solidity 0.8.30 + Foundry
```

### Smart Contract Integration
- **Token1.sol**: ERC-20 reward token for the Realmind ecosystem
- **QuizGame.sol**: On-chain quiz management and reward distribution
- **QuizDuel.sol**: PvP battle system with escrow and reward distribution  
- **GuildSystem.sol**: Guild formation, treasury management, and group battles
- **QuizNFT.sol**: NFT creator economy with EIP-2981 royalty standards
- **Farcaster Integration**: Social learning with Frame SDK

### Database Schema
```sql
-- Core Learning System
users (wallet_address, total_points, quizzes_completed)
quizzes (title, category, difficulty, questions, points_reward)
quiz_attempts (user_id, quiz_id, score, points_earned)

-- Gamification Layer
quests (title, category, points_reward, requirements)
leaderboard_entries (user_id, season_id, rank, points)
seasons (name, start_date, end_date, is_active)

-- PvP Duel System
quiz_duels (id, challenger_id, opponent_id, topic, entry_fee, status, winner_id)
duel_results (duel_id, user_id, score, time_spent, rewards_earned)
```

## 🔗 Smart Contracts

### Contract Architecture
All smart contracts are deployed on **Core Testnet2** (Chain ID: 1114) for fast, low-cost transactions.

#### **Token1.sol** - Reward Token
```solidity
// ERC-20 token for Realmind ecosystem rewards
contract Token1 is ERC20 {
    mapping(address => bool) public authorizedMinters;
    
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized");
        _mint(to, amount);
    }
}
```

#### **QuizGame.sol** - Solo Quiz System
```solidity
// On-chain quiz management with instant rewards
contract QuizGame {
    mapping(address => uint256) public userScores;
    mapping(string => Quiz) public quizzes;
    
    function startQuiz(string memory quizId, uint256 answer) external payable {
        // Entry fee validation and initial token minting
        require(msg.value >= QUIZ_ENTRY_FEE, "Insufficient entry fee");
        token.mint(msg.sender, INITIAL_REWARD);
    }
    
    function completeQuiz(uint256 finalAnswer) external {
        // Score validation and bonus token distribution
        uint256 bonus = calculateBonus(msg.sender, finalAnswer);
        token.mint(msg.sender, bonus);
    }
}
```

#### **QuizDuel.sol** - PvP Battle System
```solidity
// Real-time PvP duels with commit-reveal scheme
contract QuizDuel {
    struct Duel {
        address challenger;
        address opponent;
        uint256 entryFee;
        uint256 prizePool;
        DuelState state;
    }
    
    function startDuel(address opponent, uint256 stake) external payable {
        // Create duel with entry fees
        require(msg.value >= MIN_ENTRY_FEE, "Insufficient stake");
        duels[duelId] = Duel(msg.sender, opponent, msg.value, msg.value * 2, DuelState.Active);
    }
    
    function submitAnswer(bytes32 hashedAnswer) external {
        // Commit-reveal implementation for fair play
        commitments[msg.sender] = hashedAnswer;
    }
    
    function revealAnswer(uint256 answer, bytes32 salt) external {
        // Reveal and determine winner
        require(keccak256(abi.encodePacked(answer, salt)) == commitments[msg.sender]);
        determineWinner(msg.sender, answer);
    }
}
```

#### **GuildSystem.sol** - Community Management
```solidity
// Guild formation with treasury and group battles
contract GuildSystem {
    struct Guild {
        string name;
        address[] members;
        uint256 treasury;
        uint256 wins;
        uint256 totalEarnings;
    }
    
    function createGuild(string memory name) external payable {
        // Guild registration with initial treasury
        require(msg.value >= MIN_TREASURY, "Insufficient initial treasury");
        guilds[guildId] = Guild(name, [msg.sender], msg.value, 0, 0);
    }
    
    function contributeToTreasury(uint256 guildId) external payable {
        // Treasury funding by guild members
        guilds[guildId].treasury += msg.value;
        emit TreasuryContributed(guildId, msg.sender, msg.value);
    }
    
    function startGuildBattle(uint256 guild1, uint256 guild2) external payable {
        // Guild vs Guild battle with prize pool
        require(msg.value >= MIN_BATTLE_PRIZE, "Insufficient prize pool");
        battles[battleId] = Battle(guild1, guild2, msg.value, BattleState.Active);
    }
}
```

#### **QuizNFT.sol** - Creator Economy
```solidity
// NFT quiz creator with EIP-2981 royalties
contract QuizNFT is ERC721, ERC721URIStorage, IERC2981 {
    struct Quiz {
        string title;
        address creator;
        uint256 playFee;
        uint256 royaltyPercent;
        uint256 playCount;
        uint256 totalEarnings;
        string ipfsHash;
    }
    
    function mintQuiz(
        string memory title,
        uint256 playFee,
        uint256 royaltyPercent,
        string memory ipfsHash
    ) external returns (uint256) {
        // NFT creation with royalty setup
        uint256 tokenId = nextTokenId++;
        quizzes[tokenId] = Quiz(title, msg.sender, playFee, royaltyPercent, 0, 0, ipfsHash);
        _mint(msg.sender, tokenId);
    }
    
    function playQuiz(uint256 tokenId, uint256 score) external payable {
        // Quiz playing with automatic royalty distribution
        Quiz storage quiz = quizzes[tokenId];
        require(msg.value >= quiz.playFee, "Insufficient payment");
        
        uint256 royaltyAmount = (msg.value * quiz.royaltyPercent) / 10000;
        (bool success, ) = quiz.creator.call{value: royaltyAmount}("");
        require(success, "Royalty payment failed");
        
        quiz.playCount++;
        quiz.totalEarnings += msg.value;
    }
    
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external view override returns (address, uint256) {
        // EIP-2981 royalty standard implementation
        address creator = quizzes[tokenId].creator;
        uint256 royaltyAmount = (salePrice * quizzes[tokenId].royaltyPercent) / 10000;
        return (creator, royaltyAmount);
    }
}
```

### Core Blockchain Integration
- **Fast Finality**: Sub-second transaction confirmation enables real-time gaming
- **Low Gas Costs**: Affordable fees make micro-rewards economically viable  
- **EVM Compatibility**: Seamless integration with existing Web3 tooling
- **Real-time Updates**: Instant state changes for live user experiences

## 🚀 Key Features

### 📚 Learning Engine
- **Personalized Quizzes**: AI-driven content based on user progress
- **Multi-Category Content**: Math, Science, History, Web3, and more
- **Adaptive Difficulty**: Questions adjust to user skill level
- **Real-time Feedback**: Immediate explanations and learning tips

### 🎮 Gamification System
- **Daily Challenges**: Consistent engagement through daily quests
- **Seasonal Competitions**: 3-month cycles with escalating rewards
- **Achievement Badges**: NFT-based milestones and accomplishments
- **Social Leaderboards**: Community-driven competitive learning

### 💰 Reward Economy
- **Yuzu Points**: Earned through learning activities
- **CORE Token Conversion**: Points convert to Core tokens
- **Seasonal Rewards**: Bonus distributions for top performers
- **NFT Achievements**: On-chain proof of learning milestones

### ⚔️ PvP Quiz Duels (Coming Q2 2024)
- **Simple Duel Flow**: Connect → Pick Topic → Challenge → Earn
- **On-Chain Battles**: Direct wallet-to-wallet quiz competitions
- **Topic Selection**: Choose from Math, Science, Web3, History, and more
- **Winner Takes All**: Loser pays entry fee, winner gets rewards + opponent's stake
- **Social Features**: Challenge friends, share results, build reputation

## 🎯 Vision & Roadmap

### Phase 1: Foundation (Q1 2024) ✅
- [x] Core quiz platform with Farcaster integration
- [x] Basic reward system and leaderboards
- [x] Smart contract deployment on Core Testnet
- [x] Initial user acquisition and testing

### Phase 2: Growth (Q2 2024)
- [ ] Advanced AI-powered content personalization
- [ ] **PvP On-Chain Quiz Duels** - Simple duel flow: connect → pick topic → challenge → earn
- [ ] Multi-chain reward distribution
- [ ] Mobile app development
- [ ] Partnership with educational institutions

### Phase 3: Scale (Q3-Q4 2024)
- [ ] Global expansion with localized content
- [ ] Advanced analytics and learning insights
- [ ] Enterprise solutions for organizations
- [ ] Full DAO governance implementation

### Phase 4: Ecosystem (2025+)
- [ ] Realmind Academy: Educational content marketplace
- [ ] Cross-chain interoperability
- [ ] AI-powered learning assistants
- [ ] Metaverse learning environments

## 🏆 Competitive Advantage

### Why Realmind Wins
1. **First-Mover Advantage**: First learn-to-earn platform on Core blockchain
2. **Social Integration**: Native Farcaster integration drives viral growth
3. **Token Economics**: Sustainable reward model with real utility
4. **Community-Driven**: User-generated content and governance
5. **Technical Excellence**: Modern stack with proven scalability
6. **Real-time Gaming**: Sub-second finality enables live PvP experiences
7. **Creator Economy**: NFT quizzes with automatic royalty distribution

### Market Positioning
- **Target Audience**: Web3 learners, crypto enthusiasts, students
- **Geographic Focus**: Global with emphasis on emerging markets
- **Revenue Model**: Platform fees, premium features, enterprise solutions
- **Growth Strategy**: Community-driven with strategic partnerships

## 🔧 Quick Start

### Demo Access
- **Live Demo**: Navigate to `/demo` route for interactive 4-step demo
- **Smart Contracts**: All contracts deployed on Core Testnet2 (Chain ID: 1114)
- **Contract Addresses**: See `src/libs/constants.ts` for deployed addresses

### For Developers
```bash
# Clone and setup
git clone https://github.com/your-org/realmind.git
cd realmind
pnpm install

# Environment setup
cp .env.example .env.local
# Configure your environment variables

# Run development
pnpm dev

# Smart Contract Development
cd contracts
forge build
forge test
forge script script/DeployDemoContracts.s.sol --rpc-url https://rpc.test2.btcs.network --broadcast
```

### For Users
1. **Connect Wallet**: Use MetaMask or WalletConnect
2. **Sign in with Farcaster**: Authenticate your social identity
3. **Start Learning**: Take daily quizzes and complete quests
4. **Earn Rewards**: Accumulate points and compete on leaderboards
5. **Convert to CORE**: Exchange points for Core tokens

### Demo Flow (Available Now)
1. **Solo Quiz**: Start quiz → Answer questions → Claim rewards
2. **PvP Duel**: Start duel → Battle with RedStone Oracle → Claim winnings
3. **Guild System**: Create guild → Contribute treasury → Start battle → Win rewards
4. **NFT Creator**: Create quiz → Mint as NFT → Earn royalties

### PvP Quiz Duels Flow (Q2 2024)
1. **Connect**: Link your wallet and Farcaster account
2. **Pick Topic**: Choose from Math, Science, Web3, History, etc.
3. **Challenge**: Send duel invitation to opponent (friend or random)
4. **Battle**: Both players take same quiz simultaneously
5. **Earn**: Winner gets entry fee + opponent's stake + bonus rewards
