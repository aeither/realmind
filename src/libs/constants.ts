// Contract addresses by chain ID
const CONTRACT_ADDRESSES = {
  // Core Testnet2
  1114: {
    token1ContractAddress: "0xdED87fD6213A8f4ea824B8c74128fAf3DE65BFFE",
    quizGameContractAddress: "0x9a486C66c308db15aD6a3d1aF4cb20244bD1e2c3",
    // New demo contracts (placeholder addresses - update after deployment)
    quizDuelContractAddress: "0x0000000000000000000000000000000000000001",
    guildSystemContractAddress: "0x0000000000000000000000000000000000000002",
    quizNFTContractAddress: "0x0000000000000000000000000000000000000003"
  }
} as const;

// Function to get contract addresses by chain ID
export function getContractAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || {
    token1ContractAddress: "0x0000000000000000000000000000000000000000",
    quizGameContractAddress: "0x0000000000000000000000000000000000000000"
  };
}

// Legacy exports for backward compatibility (defaults to Core Testnet)
export const token1ContractAddress = CONTRACT_ADDRESSES[1114].token1ContractAddress;
export const quizGameContractAddress = CONTRACT_ADDRESSES[1114].quizGameContractAddress;

// Demo configuration
export const DEMO_CONFIG = {
  AUTO_PLAY_INTERVAL: 30000, // 30 seconds per step
  STEP_DURATION: {
    1: 20000, // Solo Quiz: 20 seconds
    2: 29000, // PvP Duel: 29 seconds  
    3: 29000, // Guild System: 29 seconds
    4: 26000  // NFT Quizzes: 26 seconds
  },
  MOCK_DATA: {
    ORACLE_PRICES: {
      CORE: { price: 1.23, index: 1 },
      ETH: { price: 2450.50, index: 2 }
    },
    GUILD_MEMBERS: [
      { name: "Alex", score: 850, avatar: "👤", fid: 12345 },
      { name: "Sarah", score: 720, avatar: "👩", fid: 23456 },
      { name: "Mike", score: 680, avatar: "👨", fid: 34567 },
      { name: "Emma", score: 590, avatar: "👱‍♀️", fid: 45678 }
    ]
  }
} as const;