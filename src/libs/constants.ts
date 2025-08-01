// Contract addresses by chain ID
const CONTRACT_ADDRESSES = {
  // Hyperion Testnet
  133717: {
    token1ContractAddress: "0xE8FA684Ba5E71f2940395300108a04ABc125F7b2",
    quizGameContractAddress: "0x814089B328D027422E76b07ad75c99591903e6cb"
  },
  // Sepolia Testnet
  11155111: {
    token1ContractAddress: "0x295119f7c3879aa11a5b63bcd97f745aee5fa07f", // Placeholder
    quizGameContractAddress: "0xd30f00db1975cfc498896a3d19291baac385cef6"  // Placeholder
  },
  // Base
  8453: {
    token1ContractAddress: "0x0000000000000000000000000000000000000000", // Placeholder
    quizGameContractAddress: "0x0000000000000000000000000000000000000000"  // Placeholder
  },
  // Base Sepolia
  84532: {
    token1ContractAddress: "0x7e9532d025b0d0c06e5913170d5271851b37cf39", // Placeholder
    quizGameContractAddress: "0xc0ee7f9763f414d82c1b59441a6338999eafa80e"  // Placeholder
  },
  // EduChain
  12345: {
    token1ContractAddress: "0x0000000000000000000000000000000000000000", // Placeholder
    quizGameContractAddress: "0x0000000000000000000000000000000000000000"  // Placeholder
  },
  // Core DAO Testnet
  1114: {
    token1ContractAddress: "0xc0Fa47fAD733524291617F341257A97b79488ecE", // Placeholder
    quizGameContractAddress: "0x0000000000000000000000000000000000000000"  // Placeholder
  }
} as const;

// Function to get contract addresses by chain ID
export function getContractAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || {
    token1ContractAddress: "0x0000000000000000000000000000000000000000",
    quizGameContractAddress: "0x0000000000000000000000000000000000000000"
  };
}

// Legacy exports for backward compatibility (defaults to Hyperion Testnet)
export const token1ContractAddress = CONTRACT_ADDRESSES[133717].token1ContractAddress;
export const quizGameContractAddress = CONTRACT_ADDRESSES[133717].quizGameContractAddress;