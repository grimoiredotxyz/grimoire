import { createSignal, onMount, createContext } from 'solid-js'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { connect, disconnect, fetchBalance, getNetwork, switchNetwork } from '@wagmi/core'
import { CONNECTORS, chains } from '~/config/wagmi'
import { ethers } from 'ethers'
import type { Chain } from '@wagmi/core'

export const ContextAuthentication = createContext()
export const ProviderAuthentication = (props: any) => {
  const [currentNetwork, setCurrentNetwork] = createSignal<Chain | undefined>()
  const [currentUser, setCurrentUser] = createSignal<
    | {
        address: `0x${string}`
      }
    | undefined
  >()
  const [isReady, setIsReady] = createSignal(false)
  const [method, setMethod] = createSignal<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = createSignal(false)

  // Connect user with a specified method (injected wallet, SSO...)
  const mutationSignIn = createMutation(
    async (args: {
      method: 'injected' // We will just allow users with an injected wallet to sign-in for now, but we could enable magic links and other SSO methods (google, twitter...)
      connector?: 'injected'
    }) => {
      try {
        let connector = CONNECTORS[args?.method]
        const connection = await connect({
          chainId: chains[0].id,
          connector,
        })
        let user
        if (['injected'].includes(args?.method)) {
          user = {
            address: connection?.account,
          }
        }
        return {
          currentUser: user,
        }
      } catch (e) {
        console.error(e)
        setMethod()
        setIsAuthenticated(false)
      }
    },
    {
      onSuccess(data, variables) {
        //@ts-ignore
        setMethod(variables?.method)
        if (data?.currentUser) {
          setIsAuthenticated(true)
          setCurrentUser(data?.currentUser)
        } else {
          setIsAuthenticated(false)
        }
      },
      onError() {
        setMethod()
        setIsAuthenticated(false)
      },
    },
  )

  // Disconnect current user
  const mutationDisconnect = createMutation(async () => {
    await disconnect()
    setCurrentNetwork()
    setCurrentUser()
    setIsAuthenticated(false)
    setMethod()
  })

  const mutationSwitchNetwork = createMutation(async (id: number) => {
    try {
      const newNetwork = await switchNetwork({
        chainId: id,
      })
      if (newNetwork.id === id) setCurrentNetwork(newNetwork)
      return newNetwork
    } catch (e) {
      console.error(e)
    }
  })

  // Get gas token of current network for the current user
  const queryTokenBalance = createQuery(
    () => ['balance', currentUser()?.address, currentNetwork()?.id],
    async () => {
      try {
        const balance = await fetchBalance({
          address: currentUser()?.address as `0x${string}`,
        })

        return balance
      } catch (e) {
        console.error(e)
      }
    },
    {
      refetchOnWindowFocus: true,
      get enabled() {
        return !currentUser()?.address || !currentNetwork()?.id ? false : true
      },
    },
  )

  onMount(async () => {
    try {
      //@ts-ignore
      await window.ethereum.enable()
      //@ts-ignore
      const provider = new ethers.providers.Web3Provider(window?.ethereum, 'any')
      provider.on('network', async (newNetwork, oldNetwork) => {
        const network = chains.filter((c) => c?.id === newNetwork?.chainId)?.[0]
        if (network) {
          setCurrentNetwork(network)
        } else {
          const newChain = await getNetwork()
          setCurrentNetwork(newChain?.chain)
        }
      })

      setIsReady(true)
    } catch (e) {
      console.error(e)
    }
  })

  const authentication = {
    currentNetwork,
    queryTokenBalance,
    isReady,
    currentUser,
    isAuthenticated,
    mutationSignIn,
    mutationDisconnect,
    mutationSwitchNetwork,
    method,
  }

  return <ContextAuthentication.Provider value={authentication}>{props.children}</ContextAuthentication.Provider>
}
