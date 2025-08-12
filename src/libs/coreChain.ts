import { defineChain } from 'viem'

// Core Testnet2 configuration
export const coreTestnet = defineChain({
  id: 1114,
  name: 'Core Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'CORE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test2.btcs.network'],
      webSocket: ['wss://rpc.test2.btcs.network/wsp'],
    },
    public: {
      http: ['https://rpc.test2.btcs.network'],
      webSocket: ['wss://rpc.test2.btcs.network/wsp'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Core Testnet Explorer',
      url: 'https://scan.test2.btcs.network',
    },
  },
  testnet: true,
})

// Core Mainnet configuration for future use
export const coreMainnet = defineChain({
  id: 1116,
  name: 'Core',
  nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'CORE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/core'],
    },
    public: {
      http: ['https://rpc.ankr.com/core'],
    },
    ankr: {
      http: ['https://rpc.ankr.com/core'],
    },
    '1rpc': {
      http: ['https://1rpc.io/core'],
    },
    infstones: {
      http: ['https://core.public.infstones.com'],
    },
    icecreamswap: {
      http: ['https://rpc-core.icecreamswap.com'],
    },
    zan: {
      http: ['https://api.zan.top/core-mainnet'],
    },
    drpc: {
      http: ['https://core.drpc.org'],
      webSocket: ['wss://core.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Core Explorer',
      url: 'https://scan.coredao.org',
    },
  },
})