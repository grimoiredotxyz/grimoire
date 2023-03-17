import { createEffect, Match, Show, Switch } from 'solid-js'
import { Button, IconSpinner } from '~/ui'
import { shortenEthereumAddress } from '~/helpers'
import { useAuthentication } from '~/hooks'
import useCurrentUser from './useCurrentUser'
import { queryClient, ROUTE_SIGN_IN } from '~/config'
import { A } from 'solid-start'
import { getEnsForAddress } from '~/services'
import { isAddress } from 'viem'
import { createQuery } from '@tanstack/solid-query'

export const MenuCurrentUser = () => {
  //@ts-ignore
  const { currentUser, currentNetwork, mutationDisconnect, queryTokenBalance } = useAuthentication()
  const { apiMenuCurrentUser } = useCurrentUser()

  const queryGetEns = createQuery(
    () => ['ens', currentUser()?.address],
    async () => {
      try {
        const ens = await getEnsForAddress({
          query: currentUser()?.address,
        })
        return ens?.data?.domains
      } catch (e) {
        console.error(e)
      }
    },
    {
      get enabled() {
        return currentUser()?.address && isAddress(currentUser()?.address) ? true : false
      },
      refetchOnWindowFocus: false,
    },
  )

  createEffect(async () => {
    if (currentUser()?.address) {
      await queryClient.invalidateQueries(['ens', currentUser()?.address])
      await queryClient.refetchQueries(['ens', currentUser()?.address])
    }
  })
  return (
    <>
      <Button
        class="hover:shadow pointer-events-auto max-w-42 overflow-hidden text-ellipsis"
        intent="neutral-outline"
        scale="xs"
        {...apiMenuCurrentUser().triggerProps}
      >
        <Switch>
          <Match when={queryGetEns?.isSuccess && queryGetEns?.data?.length > 0 && currentUser()?.address}>
            {queryGetEns?.data?.[0]?.name}
          </Match>
          <Match when={currentUser()?.address && currentUser()?.address !== ''}>
            {shortenEthereumAddress(currentUser()?.address)}
          </Match>
        </Switch>

        <span
          class=" mis-1ex"
          classList={{
            'rotate-180': apiMenuCurrentUser().isOpen === true,
          }}
          aria-hidden
        >
          ▾
        </span>
      </Button>
      <div {...apiMenuCurrentUser().positionerProps} class="w-full max-w-[200px] pointer-events-auto">
        <div
          {...apiMenuCurrentUser().contentProps}
          class="text-2xs shadow-md overflow-hidden bg-white border border-neutral-5 rounded-md"
        >
          <div class="px-3 py-1.5 border-b border-neutral-4">
            <span class="text-[0.725rem] font-medium text-neutral-11">Logged in as :</span>
            <span class="block overflow-hidden text-ellipsis text-[0.7rem] font-mono font-medium text-accent-11">
              <Show when={currentUser()?.address && currentUser()?.address !== ''}>
                {shortenEthereumAddress(currentUser()?.address)}
              </Show>
            </span>
            <div class="py-2 text-[0.75rem]">
              <span class="text-[0.725rem] font-medium text-neutral-11">Network:&nbsp;</span>
              <span class="font-bold text-accent-11">{currentNetwork()?.name}</span>
            </div>
            <div class="text-[0.75rem] flex flex-wrap items-baseline">
              <span class="text-neutral-11 [0.725rem]">Balance:&nbsp;</span>
              <Show
                fallback={<IconSpinner class="animate-spin mis-1ex" />}
                when={queryTokenBalance?.isSuccess && queryTokenBalance?.data?.formatted}
              >
                <span class="font-bold text-primary-12">
                  {new Intl.NumberFormat().format(parseFloat(queryTokenBalance?.data?.formatted).toFixed(5))}&nbsp;
                  {queryTokenBalance?.data?.symbol}
                </span>
              </Show>
            </div>
          </div>
          <div class="border-b border-neutral-4">
            <A
              class="block cursor-pointer py-4 lg:py-2 px-3 text-start font-semibold w-full hover:bg-interactive-1 focus:bg-interactive-3 hover:text-interactive-11 focus:text-interactive-12"
              href={ROUTE_SIGN_IN}
            >
              Switch network
            </A>
          </div>
          <button
            {...apiMenuCurrentUser().getItemProps({ id: 'logout' })}
            class="cursor-pointer py-4 lg:py-2 px-3 text-start font-semibold w-full hover:bg-interactive-1 focus:bg-interactive-3 hover:text-interactive-11 focus:text-interactive-12"
            onClick={() => mutationDisconnect.mutate()}
          >
            Log out
          </button>
        </div>
      </div>
    </>
  )
}
