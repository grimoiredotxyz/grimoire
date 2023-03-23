import { createSignal, onMount, createContext, createEffect } from 'solid-js'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { connect, disconnect, fetchBalance, getNetwork, switchNetwork } from '@wagmi/core'
import { CONNECTORS, chains } from '~/config/wagmi'
import { ethers } from 'ethers'
import * as PushAPI from '@pushprotocol/restapi'
import * as eth from '@polybase/eth'
import type { Chain } from '@wagmi/core'
import { usePolybase } from '../usePolybase'

export const ContextAuthentication = createContext()
export const ProviderAuthentication = (props: any) => {
  const { db } = usePolybase()
  const [pushChatProfile, setPushChatProfile] = createSignal()
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
    },
    {
      onSuccess(data, variables) {
        //@ts-ignore
        setMethod(variables?.method)
        if (data?.currentUser) {
          setIsAuthenticated(true)
          setCurrentUser(data?.currentUser)
          db.signer(async (data: string) => {
            // A permission dialog will be presented to the user
            const accounts = await eth.requestAccounts()

            // If there is more than one account, you may wish to ask the user which
            // account they would like to use
            const account = accounts[0]

            const sig = await eth.sign(data, account)

            return { h: 'eth-personal-sign', sig }
          })
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
    setPushChatProfile()
    setCurrentNetwork()
    setCurrentUser()
    setIsAuthenticated(false)
    setMethod()
  })

  const mutationSwitchNetwork = createMutation(
    async (id: number) => {
      const newNetwork = await switchNetwork({
        chainId: id,
      })
      if (newNetwork.id === id) setCurrentNetwork(newNetwork)
      return newNetwork
    },
    {
      onError(e) {
        console.error(e)
      },
    },
  )

  // Get gas token of current network for the current user
  const queryTokenBalance = createQuery(
    () => ['balance', currentUser()?.address, currentNetwork()?.id],
    async () => {
      const balance = await fetchBalance({
        address: currentUser()?.address as `0x${string}`,
      })

      return balance
    },
    {
      refetchOnWindowFocus: true,
      get enabled() {
        return !currentUser()?.address || !currentNetwork()?.id ? false : true
      },
    },
  )

  const mutationCreatePushChatProfile = createMutation(
    async () => {
      return await PushAPI.user.create({
        account: currentUser()?.address,
      })
    },
    {
      onSuccess(data) {
        setPushChatProfile(data)
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

  createEffect(async () => {
    if (currentUser()?.address) {
      const user = await PushAPI.user.get({
        account: `eip155:${currentUser()?.address}`,
      })

      if (user === null) {
        await mutationCreatePushChatProfile.mutateAsync()
      } else {
        setPushChatProfile(user)
      }
    }
  })
  const authentication = {
    pushChatProfile,
    mutationCreatePushChatProfile,
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
