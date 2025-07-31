import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";

// Define Hyperion Testnet chain
export const hyperionTestnet = defineChain({
  id: 133717,
  name: 'Hyperion Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tMETIS',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    default: {
      http: ['https://hyperion-testnet.metisdevops.link'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperion Testnet Explorer',
      url: 'https://hyperion-testnet-explorer.metisdevops.link',
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [base, hyperionTestnet],
  connectors: [
    farcasterFrame(),
    injected({ shimDisconnect: true })
  ],
  transports: {
    [base.id]: http(),
    [hyperionTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
