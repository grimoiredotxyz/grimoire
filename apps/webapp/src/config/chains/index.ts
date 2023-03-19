import { polygonMumbai, optimismGoerli, gnosisChiado, filecoinHyperspace } from '@wagmi/core/chains'
import { Chain } from '@wagmi/core'

// Config from https://scroll.io/alpha
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

export type ChainAlias = 'gnosis-chiado' | 'polygon-mumbai' | 'optimism-goerli' | 'scroll-alpha' | 'filecoin-hyperspace'
export const CHAINS_ALIAS = {
  // Gnosis
  [gnosisChiado.id]: 'gnosis-chiado',
  'gnosis-chiado': gnosisChiado.id,
  
  // Polygon
  [polygonMumbai.id]: 'polygon-mumbai',
  'polygon-mumbai': polygonMumbai.id,
  
  // Optimism
  [optimismGoerli.id] : 'optimism-goerli',
  'optimism-goerli': optimismGoerli.id,

  // Scroll
  [scroll_L2.id] : 'scroll-alpha',
  'scroll-alpha': scroll_L2.id,

  // Filecoin
  [filecoinHyperspace.id]: 'filecoin-hyperspace',
  'filecoin-hyperspace': filecoinHyperspace.id,
}

export const supportedChains = [gnosisChiado, polygonMumbai, optimismGoerli, filecoinHyperspace, scroll_L2]
