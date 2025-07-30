# 🧠 RealMind

Interactive learning platform that rewards users with **Yuzu Points** through daily quizzes, quests, and challenges. Built for the **Open Campus (OC) EDU Chain** ecosystem.

## ✨ Key Features

- **📚 Daily Learning**: Take personalized daily quizzes to earn points
- **🗺️ Quest System**: Complete special quests across various subjects
- **🏆 Leaderboards**: Compete with other learners and track your progress
- **🍋 Yuzu Points**: Earn points that convert to EDU tokens on the EDU Chain
- **🎯 Season-based**: Participate in seasonal competitions with rewards
- **🔐 Web3 Ready**: Seamless wallet integration for blockchain rewards

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Web3 wallet (MetaMask, WalletConnect, etc.)
- [Open Campus EDU Chain](https://docs.opencampus.xyz/) knowledge

### Setup

```bash
# Install dependencies
pnpm install

# Environment setup
cp .env.example .env.local
```

**Required Environment Variables:**
```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:port/db

# Web3 Configuration
VITE_RPC_URL=https://mainnet.base.org
VITE_CHAIN_ID=8453

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id
```

### Run
```bash
# Development
pnpm dev

# Database setup  
pnpm db:push

# Production build
pnpm build
```

## 🏗️ Core Features

### 📊 Learning & Earning System

**Daily Quizzes:**
```typescript
// Quiz completion tracking
interface QuizResult {
  userId: string;
  quizId: string;
  score: number;
  timeSpent: number;
  pointsEarned: number;
  completedAt: Date;
}

// Points calculation
const calculatePoints = (score: number, difficulty: number, timeBonus: number) => {
  return Math.floor(score * difficulty * timeBonus);
};
```

**Quest System:**
```typescript
// Quest completion
interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsReward: number;
  requirements: QuestRequirement[];
  isActive: boolean;
}

// Leaderboard tracking
interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  rank: number;
  season: string;
}
```

**Key Features:**
- ✅ **Personalized quizzes** based on user progress
- ✅ **Multi-category quests** (Math, Science, History, etc.)
- ✅ **Real-time leaderboards** with seasonal rankings
- ✅ **Point conversion** to Yuzu Points for EDU Chain
- ✅ **Progress tracking** and achievement system

### 🏆 Leaderboard System

**Seasonal Competitions:**
```typescript
// Season management
interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  totalParticipants: number;
  totalPointsDistributed: number;
  isActive: boolean;
}

// User rankings
interface UserRanking {
  userId: string;
  seasonId: string;
  rank: number;
  points: number;
  quizzesCompleted: number;
  questsCompleted: number;
  lastActivity: Date;
}
```

**Key Features:**
- ✅ **Season-based competitions** with clear start/end dates
- ✅ **Real-time rankings** updated after each activity
- ✅ **Historical data** tracking across seasons
- ✅ **Achievement badges** for milestones
- ✅ **Social features** to compare with friends

## 📊 Database Schema

```sql
-- User profiles and progress
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    total_points INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    quests_completed INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT now(),
    last_active TIMESTAMP DEFAULT now()
);

-- Quiz system
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    questions JSONB NOT NULL,
    points_reward INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- User quiz attempts
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_id INTEGER REFERENCES quizzes(id),
    score INTEGER NOT NULL,
    time_spent INTEGER, -- seconds
    points_earned INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT now()
);

-- Quest system
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    points_reward INTEGER NOT NULL,
    requirements JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- Leaderboard entries
CREATE TABLE leaderboard_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    season_id VARCHAR(50) NOT NULL,
    total_points INTEGER NOT NULL,
    rank INTEGER,
    updated_at TIMESTAMP DEFAULT now()
);

-- Seasons
CREATE TABLE seasons (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);
```

## 🛠️ Key Scripts

```bash
# Database operations
pnpm db:generate      # Generate migrations
pnpm db:push         # Push schema to database  
pnpm db:studio       # Open database browser

# Development utilities
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm preview        # Preview production build

# Testing
pnpm test           # Run test suite
pnpm test:watch     # Run tests in watch mode
```

## 🔧 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Database**: PostgreSQL + Drizzle ORM
- **Web3**: Wagmi + Viem for wallet integration
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Vercel (recommended)

## 🍋 Yuzu Points Integration

### How RealMind Integrates with EDU Chain

**Core Integration:**
RealMind is designed to work seamlessly with the Open Campus EDU Chain ecosystem:

1. **Point Accumulation**: Users earn points through daily quizzes and quests
2. **Season Conversion**: At the end of each season, points convert to Yuzu Points
3. **EDU Chain Rewards**: Yuzu Points can be used for EDU tokens and EDULand NFT rentals
4. **Decentralized Education**: Part of the broader OC ecosystem for learning rewards

**Technical Implementation:**
- **Point Tracking**: Comprehensive system for tracking user engagement
- **Season Management**: Structured seasons with clear conversion periods
- **Leaderboard System**: Competitive rankings to encourage participation
- **Web3 Ready**: Wallet integration for future blockchain rewards

**Educational Model**: Transforms learning into a gamified experience where knowledge acquisition directly translates to real rewards in the decentralized education ecosystem.

## 🌐 Production Deployment

**Environment Setup:**
- PostgreSQL database (Railway, Supabase, or Vercel Postgres recommended)
- Vercel for frontend hosting
- Environment variables for database and analytics
- SSL certificate for secure connections

**Security Considerations:**
- Input validation for all user data
- Rate limiting for quiz submissions
- Secure database connections
- User data privacy protection

## 🏆 Season 3 Features

### DailyWiser Season 3 Integration

**Key Components:**
- **Daily Quizzes**: Personalized learning content
- **Quest System**: Special challenges across subjects
- **Leaderboards**: Real-time competitive rankings
- **Point Conversion**: Season 3 points → Yuzu Points → EDU tokens
- **Social Features**: Community engagement and sharing

**Season Timeline:**
1. **Launch Phase**: New DailyWiser product release
2. **Quest Period**: Special quests and daily challenges
3. **Competition**: Leaderboard rankings and community engagement
4. **Rewards**: Point conversion and EDU Chain integration

## 📖 Documentation

- [Open Campus EDU Chain Docs](https://docs.opencampus.xyz/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

**Built for the future of decentralized education** 🧠✨