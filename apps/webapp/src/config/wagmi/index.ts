import { configureChains, createClient } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { publicProvider } from '@wagmi/core/providers/public'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { supportedChains } from '../chains'

//@ts-ignore
export const { chains, provider } = configureChains(supportedChains, [
  jsonRpcProvider({
    rpc: (chain) => {
      switch (chain.id) {
        case 80001:
          return {
            http: 'https://rpc.ankr.com/polygon_mumbai',
          }
          break
        case 420:
          return {
            http: 'https://rpc.ankr.com/optimism_testnet',
          }
          break
        case 10200:
          return {
            http: 'https://rpc.chiadochain.net',
          }
          break
        case 534353:
          return {
            http: 'https://alpha-rpc.scroll.io/l2',
          }
          break
        default:
          break
      }
    },
  }),
  publicProvider(),
])

export const CONNECTORS = {
  injected: new InjectedConnector({
    chains,
    options: {
      name: 'Injected',
      shimDisconnect: true,
    },
  }),
}

export const wagmiClient = createClient({
  provider,
  autoConnect: false,
  connectors: [CONNECTORS.injected],
})

export default wagmiClient
