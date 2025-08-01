import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { SUPPORTED_CHAINS, hyperionTestnet, coreDaoTestnet } from './libs/supportedChains';

const config = getDefaultConfig({
  appName: 'RealMind',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: SUPPORTED_CHAINS,
  ssr: true,
});

export { config, hyperionTestnet, coreDaoTestnet };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
