import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, eduChain } from 'wagmi/chains';

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

const config = getDefaultConfig({
  appName: 'RealMind',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [
    base,
    eduChain,
    hyperionTestnet,
  ],
  ssr: true,
});

export { config };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
