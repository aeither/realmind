import { coreTestnet } from './coreChain';

// Export all supported chains as a reusable array
export const SUPPORTED_CHAINS = [
  coreTestnet,
] as const;

// Export chain IDs for easy checking
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(chain => chain.id);

// Currency configuration for different chains
export const CURRENCY_CONFIG = {
  1114: { // Core Testnet2
    symbol: 'CORE',
    multiplier: 1,
    defaultAmounts: ['0.1', '0.5', '2.5']
  },
  default: { // Fallback configuration
    symbol: 'CORE',
    multiplier: 1,
    defaultAmounts: ['0.001', '0.005', '2.5']
  }
} as const; 