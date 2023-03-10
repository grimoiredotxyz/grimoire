import { configureChains, createClient } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { publicProvider } from '@wagmi/core/providers/public'
import { supportedChains } from '../chains'

//@ts-ignore
export const { chains, provider } = configureChains(supportedChains, [publicProvider()])

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
