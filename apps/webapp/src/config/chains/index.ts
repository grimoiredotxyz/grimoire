import { polygonMumbai, optimismGoerli, gnosisChiado, filecoinHyperspace } from '@wagmi/core/chains'
import { Chain } from '@wagmi/core'

// Config from https://scroll.io/alpha
// Scroll alpha testnet
export const scroll_L2 = {
  id: 534353,
  name: 'Scroll Alpha Testnet',
  network: 'scrollAlpha',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://alpha-rpc.scroll.io/l2'] },
    default: { http: ['https://alpha-rpc.scroll.io/l2'] },
  },
  blockExplorers: {
    etherscan: { name: 'Blockscout', url: 'https://blockscout.scroll.io' },
    default: { name: 'Blockscout', url: 'https://blockscout.scroll.io' },
  },
} as const satisfies Chain

// Taiko Sepolia testnet
export const taikoSepolia = {
  id: 11155111,
  name: 'Taiko Sepolia',
  network: 'taikoSepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.sepolia.org'] },
    default: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'Etherscan', url: '	https://sepolia.etherscan.io/' },
    default: { name: 'Etherscan', url: '	https://sepolia.etherscan.io/' },
  },
} as const satisfies Chain

// Polygon zkEVM testnet
export const polygonZkEVMTestnet = {
  id: 1442,
  name: 'Polygon zkEVM Testnet',
  network: 'polygonZkEvmTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.public.zkevm-test.net'] },
    default: { http: ['https://rpc.public.zkevm-test.net'] },
  },
  blockExplorers: {
    etherscan: { name: 'Polygon zkEVM Testnet Explorer', url: '	https://testnet-zkevm.polygonscan.com/' },
    default: { name: 'Polygon zkEVM Testnet Explorer', url: '	https://testnet-zkevm.polygonscan.com/' },
  },
} as const satisfies Chain

export type ChainAlias = 'gnosis-chiado' | 'polygon-mumbai' | 'optimism-goerli' | 'scroll-alpha' | 'filecoin-hyperspace'
export const CHAINS_ALIAS = {
  // Gnosis
  [gnosisChiado.id]: 'gnosis-chiado',
  'gnosis-chiado': gnosisChiado.id,

  // Polygon
  [polygonMumbai.id]: 'polygon-mumbai',
  'polygon-mumbai': polygonMumbai.id,

  // Optimism
  [optimismGoerli.id]: 'optimism-goerli',
  'optimism-goerli': optimismGoerli.id,

  // Scroll
  [scroll_L2.id]: 'scroll-alpha',
  'scroll-alpha': scroll_L2.id,

  // Filecoin
  [filecoinHyperspace.id]: 'filecoin-hyperspace',
  'filecoin-hyperspace': filecoinHyperspace.id,

  // Taiko
  [taikoSepolia.id]: 'taiko-sepolia',
  'taiko-sepolia': taikoSepolia.id,

  // Polygon zkEVM
  [polygonZkEVMTestnet.id]: 'taiko-sepolia',
  'polygon-zkevm-testnet': polygonZkEVMTestnet.id,
}

export const supportedChains = [
  gnosisChiado,
  polygonMumbai,
  optimismGoerli,
  filecoinHyperspace,
  scroll_L2,
  polygonZkEVMTestnet,
  taikoSepolia,
]
