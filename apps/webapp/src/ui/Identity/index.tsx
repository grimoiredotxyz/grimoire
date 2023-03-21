import { createQuery } from '@tanstack/solid-query'
import { Match, Switch } from 'solid-js'
import { isAddress } from 'viem'
import { shortenEthereumAddress } from '~/helpers'
import { getEnsForAddress } from '~/services'

interface IdentityProps {
  address: `0x${string}`
  shortenOnFallback: boolean
}

export const Identity = (props: IdentityProps) => {
  const queryGetEns = createQuery(
    () => ['ens', props.address],
    async () => {
      try {
        const ens = await getEnsForAddress({
          query: props.address,
        })
        return ens?.data?.domains
      } catch (e) {
        console.error(e)
      }
    },
    {
      get enabled() {
        return props.address && isAddress(props.address) ? true : false
      },
      refetchOnWindowFocus: false,
    },
  )
  return (
    <>
      <Switch>
        <Match when={queryGetEns?.isSuccess && queryGetEns?.data?.length > 0 && props?.address}>
          {queryGetEns?.data?.[0]?.name}
        </Match>
        <Match when={props?.address && props?.address !== '' && props.shortenOnFallback}>
          {shortenEthereumAddress(props?.address)}
        </Match>
        <Match when={props?.address && props?.address !== '' && !props.shortenOnFallback}>{props?.address}</Match>
      </Switch>
    </>
  )
}

export default Identity
