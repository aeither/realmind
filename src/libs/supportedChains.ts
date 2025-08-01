import { baseSepolia, base, eduChain, sepolia } from 'wagmi/chains';

// Hyperion Testnet configuration
export const hyperionTestnet = {
  id: 133717,
  name: 'Hyperion Testnet',
  network: 'hyperion-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tMETIS',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    public: { http: ['https://hyperion-testnet.metisdevops.link'] },
    default: { http: ['https://hyperion-testnet.metisdevops.link'] },
  },
  blockExplorers: {
    etherscan: { name: 'Hyperion Explorer', url: 'https://hyperion-testnet-explorer.metisdevops.link' },
    default: { name: 'Hyperion Explorer', url: 'https://hyperion-testnet-explorer.metisdevops.link' },
  },
} as const;

// Core DAO Testnet configuration
export const coreDaoTestnet = {
  id: 1114,
  name: 'Core Blockchain TestNet',
  network: 'core-dao-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tCORE2',
    symbol: 'tCORE2',
  },
  rpcUrls: {
    public: { http: ['https://rpc.test2.btcs.network'] },
    default: { http: ['https://rpc.test2.btcs.network'] },
  },
  blockExplorers: {
    etherscan: { name: 'Core DAO Explorer', url: 'https://scan.test2.btcs.network' },
    default: { name: 'Core DAO Explorer', url: 'https://scan.test2.btcs.network' },
  },
} as const;

// Export all supported chains as a reusable array
export const SUPPORTED_CHAINS = [
  sepolia,
  base,
  baseSepolia,
  eduChain,
  hyperionTestnet,
  coreDaoTestnet,
] as const;

// Export chain IDs for easy checking
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(chain => chain.id);

// Currency configuration for different chains
export const CURRENCY_CONFIG = {
  133717: { // Hyperion Testnet
    symbol: 'tMETIS',
    multiplier: 1,
    defaultAmounts: ['1', '5', '25']
  },
  12345: { // EduChain
    symbol: 'EDU',
    multiplier: 1000, // EDU worth way less
    defaultAmounts: ['1', '5', '25']
  },
  1114: { // Core DAO Testnet
    symbol: 'tCORE',
    multiplier: 1,
    defaultAmounts: ['1', '5', '25']
  },
  default: { // All other chains (Sepolia, Base, etc.)
    symbol: 'ETH',
    multiplier: 1,
    defaultAmounts: ['0.001', '0.005', '0.025']
  }
} as const; 