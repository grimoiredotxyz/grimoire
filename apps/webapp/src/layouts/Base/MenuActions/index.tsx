import { createQuery, useQueryClient } from '@tanstack/solid-query'
import { createEffect, For, Match, Show, Switch } from 'solid-js'
import { A } from 'solid-start'
import {
  CHAINS_ALIAS,
  ROUTE_REQUEST_DETAILS,
  ROUTE_REQUEST_NEW,
  ROUTE_SIGN_IN,
  ROUTE_TRANSCRIPTION_DETAILS,
  ROUTE_TRANSCRIPTION_NEW,
} from '~/config'
import { shortenEthereumAddress } from '~/helpers'
import { useAuthentication, usePushChat } from '~/hooks'
import { getUserContributions } from '~/services'
import {
  Button,
  IconArrowPathRounded,
  IconChevronDown,
  IconChevronUpDown,
  IconEnvelope,
  IconMenu,
  IconPlus,
  IconRightOnRectangle,
  IconSpinner,
  Identity,
} from '~/ui'
import useMenuActions from './useMenuActions'

export const MenuActions = () => {
  const queryClient = useQueryClient()
  const { queryUserPushChats } = usePushChat()
  const { apiPopoverMenuActions, apiAccordionMenuActions } = useMenuActions()
  //@ts-ignore
  const { currentUser, mutationGetPushUser, pushChatProfile, currentNetwork, mutationDisconnect, queryTokenBalance } =
    useAuthentication()

  const queryMenuContent = createQuery(
    () => ['shortcuts', currentUser()?.address],
    async () => {
      return await getUserContributions({
        address: currentUser()?.address,
      })
    },
    {
      refetchOnWindowFocus: false,
      get enabled() {
        //@ts-ignore
        return currentUser()?.address ? true : false
      },
    },
  )
  createEffect(async () => {
    if (currentUser()?.address) {
      await queryClient.invalidateQueries(['ens', currentUser()?.address])
      await queryClient.refetchQueries(['ens', currentUser()?.address])
    }
  })

  createEffect(() => {
    console.log(queryUserPushChats?.data)
  })
  return (
    <>
      <button
        type="button"
        classList={{
          'bg-neutral-7 shadow-inner': apiPopoverMenuActions().isOpen,
        }}
        {...apiPopoverMenuActions().triggerProps}
        class="aspect-square p-2 rounded-md hover:bg-neutral-4"
      >
        <IconMenu class="w-7 h-7" />
      </button>
      <div class="fixed max-h-[90vh] text-[0.825rem]" {...apiPopoverMenuActions().positionerProps}>
        <div
          class="w-[240px] rounded-lg inline-start-0.5 bg-white shadow-lg border border-neutral-7 divide-y divide-neutral-5"
          {...apiPopoverMenuActions().contentProps}
        >
          <div {...apiPopoverMenuActions().titleProps} class="sr-only">
            Menu
          </div>
          <div {...apiPopoverMenuActions().descriptionProps}>
            <div class="divide-y divide-neutral-5" {...apiAccordionMenuActions().rootProps}>
              <div {...apiAccordionMenuActions().getItemProps({ value: 'profile' })}>
                <h3 class="w-full p-2 flex items-center justify-between gap-0.5">
                  <button
                    class="text-ellipsis overflow-hidden text-2xs group bg-accent-1 rounded-md hover:bg-accent-2 focus:outline-none focus:bg-accent-3 focus:text-accent-12 w-full group p-2 flex items-center hover:text-accent-12 hover:text-opacity-75 font-bold"
                    title="Click to toggle your transcriptions close/open"
                    {...apiAccordionMenuActions().getTriggerProps({ value: 'profile' })}
                  >
                    <IconChevronUpDown
                      class="-mis-2 shrink-0 text-neutral-9 group:hover:text-accent-9 mie-1ex w-5 h-5"
                      stroke-width="2"
                      classList={{
                        'text-neutral-11': apiAccordionMenuActions().value === 'profile',
                      }}
                    />

                    <span class="block text-accent-11 text-ellipsis overflow-hidden">
                      <Identity address={currentUser()?.address} shortenOnFallback={true} />
                    </span>
                  </button>
                </h3>
                <div class="max-h-[50vh]" {...apiAccordionMenuActions().getContentProps({ value: 'profile' })}>
                  <div class="text-2xs overflow-hidden ">
                    <div class="px-3 pb-1.5 ">
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
                            {new Intl.NumberFormat().format(parseFloat(queryTokenBalance?.data?.formatted).toFixed(5))}
                            &nbsp;
                            {queryTokenBalance?.data?.symbol}
                          </span>
                        </Show>
                      </div>
                    </div>
                    <div class="text-2xs">
                      <div>
                        <A
                          class="text-[0.85em] flex items-center cursor-pointer py-4 md:py-2 px-3 text-start font-semibold w-full hover:bg-interactive-1 focus:bg-interactive-3 hover:text-interactive-11 focus:text-interactive-12"
                          href={ROUTE_SIGN_IN}
                        >
                          <IconArrowPathRounded class="w-4 h-4 mie-1ex" stroke-width="2" />
                          Switch network
                        </A>
                      </div>
                      <button
                        class="text-[0.85em] cursor-pointer flex items-center py-4 md:py-2 px-3 text-start font-semibold w-full hover:bg-interactive-1 focus:bg-interactive-3 hover:text-interactive-11 focus:text-interactive-12"
                        onClick={() => mutationDisconnect.mutate()}
                      >
                        <IconRightOnRectangle class="w-4 h-4 mie-1ex" stroke-width="2" />
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pb-2" {...apiAccordionMenuActions().getItemProps({ value: 'messages' })}>
                <h3 class="w-full px-2 pt-2 flex items-center justify-between gap-0.5">
                  <button
                    class="focus:outline-none focus:bg-neutral-3 focus:text-neutral-12 w-full group h-9 lg:h-7 py-1 px-2 flex items-center rounded-md hover:bg-neutral-2 hover:text-neutral-12 hover:text-opacity-75 font-bold"
                    title="Click to toggle your messages close/open"
                    {...apiAccordionMenuActions().getTriggerProps({ value: 'messages' })}
                  >
                    <IconEnvelope
                      class="-mis-1 text-neutral-9 mie-1ex w-4 h-4"
                      stroke-width="3"
                      classList={{
                        'text-neutral-11': apiAccordionMenuActions().value !== 'messages',
                        'text-accent-11': apiAccordionMenuActions().value === 'messages',
                      }}
                    />

                    <span class="pie-1ex grow text-start">
                      My messages{' '}
                      <Show when={!pushChatProfile()}>
                        <span class="italic text-[0.8em] font-medium text-neutral-9">&nbsp;(activate)</span>
                      </Show>
                    </span>

                    <Switch>
                      <Match
                        when={mutationGetPushUser.isLoading || (pushChatProfile() && queryUserPushChats.isLoading)}
                      >
                        <IconSpinner class="w-4 h-4  shrink-0 animate-spin" />
                      </Match>
                      <Match when={!pushChatProfile() || (pushChatProfile() && queryUserPushChats?.data?.length > 0)}>
                        <IconChevronDown
                          class="text-neutral-9 -mis-1 mie-1ex w-3 h-3"
                          stroke-width="3"
                          classList={{
                            '-rotate-90 text-neutral-11': apiAccordionMenuActions().value !== 'requests',
                            'text-accent-11': apiAccordionMenuActions().value === 'requests',
                          }}
                        />
                      </Match>
                      <Match when={queryUserPushChats?.data?.length > 0}>
                        <span class="bg-accent-3 py-0.5 px-[0.5em] flex justify-center items-center text-accent-11 rounded-md text-[0.85em]">
                          {queryUserPushChats?.data?.length ?? 0}
                        </span>
                      </Match>
                    </Switch>
                  </button>
                </h3>
                <div class="max-h-[50vh] p-2" {...apiAccordionMenuActions().getContentProps({ value: 'messages' })}>
                  <Switch>
                    <Match when={!pushChatProfile()}>
                      <div class="text-center text-neutral-9 py-4">
                        <p class="text-[0.85em] pb-4">
                          Click on the button below and sign the message in your wallet to access your messages and
                          group chats.
                        </p>
                        <Button
                          class="flex m-auto items-center"
                          isLoading={mutationGetPushUser.isLoading}
                          disabled={mutationGetPushUser.isLoading}
                          scale="xs"
                          intent="interactive-ghost"
                          onClick={async () => mutationGetPushUser.mutateAsync()}
                        >
                          <span
                            classList={{
                              'pis-1ex': mutationGetPushUser.isLoading,
                            }}
                          >
                            <Switch fallback="Activate">
                              <Match when={mutationGetPushUser.isLoading}>Sign message...</Match>
                              <Match when={mutationGetPushUser.isSuccess}>Activated !</Match>
                            </Switch>
                          </span>
                        </Button>
                      </div>
                    </Match>
                    <Match when={queryUserPushChats?.isLoading}>
                      <IconSpinner class="m-auto animate-spin w-5 h-5" />
                    </Match>
                    <Match when={queryUserPushChats?.data?.length === 0}>
                      <p class="py-4 italic text-center text-neutral-9">No chats yet</p>
                    </Match>
                    <Match when={queryUserPushChats?.data?.length > 0}>chats !</Match>
                  </Switch>
                </div>
              </div>

              <div class="pb-2" {...apiAccordionMenuActions().getItemProps({ value: 'transcriptions' })}>
                <h3 class="w-full px-2 pt-2 flex items-center justify-between gap-0.5">
                  <button
                    class="focus:outline-none focus:bg-neutral-3 focus:text-neutral-12 w-full group h-9 lg:h-7 py-1 px-2 flex items-center rounded-md hover:bg-neutral-2 hover:text-neutral-12 hover:text-opacity-75 font-bold"
                    title="Click to toggle your transcriptions close/open"
                    {...apiAccordionMenuActions().getTriggerProps({ value: 'transcriptions' })}
                  >
                    <IconChevronDown
                      class="-mis-1 text-neutral-9 mie-1ex w-3 h-3"
                      stroke-width="3"
                      classList={{
                        '-rotate-90 text-neutral-11': apiAccordionMenuActions().value !== 'transcriptions',
                        'text-accent-11': apiAccordionMenuActions().value === 'transcriptions',
                      }}
                    />
                    <Switch>
                      <Match when={queryMenuContent?.isLoading}>
                        <IconSpinner class="w-4 h-4 animate-spin" />
                      </Match>
                      <Match when={queryMenuContent?.data?.transcriptions?.data?.length > 0}>
                        <span class="bg-accent-3 py-0.5 px-[0.5em] flex justify-center items-center text-accent-11 rounded-md text-[0.85em]">
                          {queryMenuContent?.data?.transcriptions?.data?.length ?? 0}
                        </span>
                      </Match>
                    </Switch>
                    <span class="pis-1ex">My transcriptions</span>
                  </button>
                  <A
                    href={ROUTE_TRANSCRIPTION_NEW}
                    title="Create new transcription"
                    class="shrink-0 flex items-center justify-center aspect-square focus:bg-neutral-3 hover:bg-neutral-2 hover:text-neutral-12 hover:text-opacity-75 focus:text-neutral-12 focus:outline-none w-9 lg:w-7 h-9 lg:h-7 rounded-md"
                  >
                    <IconPlus class="w-3 h-3" />
                    <span class="sr-only">Create new transcription</span>
                  </A>
                </h3>
                <div class="max-h-[50vh]" {...apiAccordionMenuActions().getContentProps({ value: 'transcriptions' })}>
                  <Switch>
                    <Match when={queryMenuContent?.isLoading}>
                      <IconSpinner class="w-4 h-4 animate-spin" />
                    </Match>
                    <Match when={queryMenuContent?.data?.transcriptions?.data?.length > 0}>
                      <ul class="divide-y divide-neutral-6 overflow-y-auto">
                        <For each={queryMenuContent?.data?.transcriptions?.data}>
                          {(t: { data: any }) => {
                            const transcription = t?.data
                            return (
                              <li class="whitespace-nowrap p-2 md:pb-0">
                                <A
                                  class="p-4 md:pt-1 md:pb-3 hover:bg-interactive-2 overflow-auto text-ellipsis rounded-md hover:text-interactive-11 focus:text-interactive-11 block  w-full"
                                  href={ROUTE_TRANSCRIPTION_DETAILS.replace(
                                    '[chain]',
                                    //@ts-ignore
                                    CHAINS_ALIAS[transcription?.chain_id] as string,
                                  ).replace('[idTranscription]', transcription?.id)}
                                >
                                  {transcription?.title}
                                </A>
                              </li>
                            )
                          }}
                        </For>
                      </ul>
                    </Match>
                  </Switch>
                </div>
              </div>

              <div class="pb-2" {...apiAccordionMenuActions().getItemProps({ value: 'requests' })}>
                <h3 class="w-full px-2 pt-2 flex items-center justify-between gap-0.5">
                  <button
                    class="focus:outline-none focus:bg-neutral-3 focus:text-neutral-12 w-full group h-9 lg:h-7 py-1 px-2 flex items-center rounded-md hover:bg-neutral-2 hover:text-neutral-12 hover:text-opacity-75 font-bold"
                    title="Click to toggle your requests close/open"
                    {...apiAccordionMenuActions().getTriggerProps({ value: 'requests' })}
                  >
                    <IconChevronDown
                      class="text-neutral-9 -mis-1 mie-1ex w-3 h-3"
                      stroke-width="3"
                      classList={{
                        '-rotate-90 text-neutral-11': apiAccordionMenuActions().value !== 'requests',
                        'text-accent-11': apiAccordionMenuActions().value === 'requests',
                      }}
                    />
                    <Switch>
                      <Match when={queryMenuContent?.isLoading}>
                        <IconSpinner class="w-4 h-4 animate-spin" />
                      </Match>
                      <Match when={queryMenuContent?.data?.requests?.data?.length > 0}>
                        <span class="bg-accent-3 py-0.5 px-[0.5em] flex justify-center items-center text-accent-11 rounded-md text-[0.85em]">
                          {queryMenuContent?.data?.requests?.data?.length ?? 0}
                        </span>
                      </Match>
                    </Switch>
                    <span class="pis-1ex">My requests</span>
                  </button>
                  <A
                    href={ROUTE_REQUEST_NEW}
                    title="Create new transcription"
                    class="shrink-0 flex items-center justify-center aspect-square focus:bg-neutral-3 hover:bg-neutral-2 hover:text-neutral-12 hover:text-opacity-75 focus:text-neutral-12 focus:outline-none w-9 lg:w-7 h-9 lg:h-7 rounded-md"
                  >
                    <IconPlus class="w-3 h-3" />
                    <span class="sr-only">Create new request</span>
                  </A>
                </h3>
                <div class="max-h-[50vh]" {...apiAccordionMenuActions().getContentProps({ value: 'requests' })}>
                  <Switch>
                    <Match when={queryMenuContent?.isLoading}>
                      <IconSpinner class="w-4 h-4 animate-spin" />
                    </Match>
                    <Match when={queryMenuContent?.data?.requests?.data?.length > 0}>
                      <ul class="divide-y divide-neutral-6 overflow-y-auto">
                        <For each={queryMenuContent?.data?.requests?.data}>
                          {(r: { data: any }) => {
                            const request = r?.data
                            return (
                              <li class="whitespace-nowrap p-2 md:pb-0">
                                <A
                                  class="overflow-auto text-ellipsis p-4 md:pt-1 md:pb-3 hover:bg-interactive-2 rounded-md hover:text-interactive-11 focus:text-interactive-11 inline-flex w-full"
                                  href={ROUTE_REQUEST_DETAILS.replace(
                                    '[chain]',
                                    //@ts-ignore
                                    CHAINS_ALIAS[request?.chain_id] as string,
                                  ).replace('[idRequest]', request?.id)}
                                >
                                  {request?.source_media_title}
                                </A>
                              </li>
                            )
                          }}
                        </For>
                      </ul>
                    </Match>
                  </Switch>
                </div>
              </div>

              <div class="pb-2" {...apiAccordionMenuActions().getItemProps({ value: 'contributions' })}>
                <h3 class="w-full px-2 pt-2 flex items-center justify-between gap-0.5">
                  <button
                    class="focus:outline-none focus:bg-neutral-3 focus:text-neutral-12 w-full group h-9 lg:h-7 py-1 px-2 flex items-center rounded-md hover:bg-neutral-2 hover:text-neutral-12 hover:text-opacity-75 font-bold"
                    title="Click to toggle your contributions close/open"
                    {...apiAccordionMenuActions().getTriggerProps({ value: 'contributions' })}
                  >
                    <IconChevronDown
                      class="text-neutral-9 -mis-1 mie-1ex w-3 h-3"
                      stroke-width="3"
                      classList={{
                        '-rotate-90 text-neutral-11': apiAccordionMenuActions().value !== 'contributions',
                        'text-accent-11': apiAccordionMenuActions().value === 'contributions',
                      }}
                    />
                    <Switch>
                      <Match when={queryMenuContent?.isLoading}>
                        <IconSpinner class="w-4 h-4 animate-spin" />
                      </Match>
                      <Match when={queryMenuContent?.data?.revisions?.data?.length > 0}>
                        <span class="bg-accent-3 py-0.5 px-[0.5em] flex justify-center items-center text-accent-11 rounded-md text-[0.85em]">
                          {queryMenuContent?.data?.revisions?.data?.length ?? 0}
                        </span>
                      </Match>
                    </Switch>

                    <span class="pis-1ex">My revisions</span>
                  </button>
                </h3>
                <div class="max-h-[50vh]" {...apiAccordionMenuActions().getContentProps({ value: 'contributions' })}>
                  <Switch>
                    <Match when={queryMenuContent?.isLoading}>
                      <IconSpinner class="w-4 h-4 animate-spin" />
                    </Match>
                    <Match when={queryMenuContent?.data?.revisions?.data?.length > 0}>
                      <ul class="divide-y divide-neutral-6 overflow-y-auto">
                        <For each={queryMenuContent?.data?.revisions?.data}>
                          {(r: { data: any }) => {
                            const revision = r?.data
                            return (
                              <li class="whitespace-nowrap p-2 md:pb-0">
                                <A
                                  class="overflow-auto text-ellipsis p-4 md:pt-1 md:pb-2 hover:bg-interactive-2 rounded-md hover:text-interactive-11 focus:text-interactive-11 inline-flex w-full"
                                  href={ROUTE_TRANSCRIPTION_DETAILS.replace(
                                    '[chain]',
                                    //@ts-ignore
                                    CHAINS_ALIAS[revision?.chain_id] as string,
                                  ).replace('[idTranscription]', revision?.id)}
                                >
                                  {revision?.title}
                                </A>
                              </li>
                            )
                          }}
                        </For>
                      </ul>
                    </Match>
                  </Switch>
                </div>
              </div>
            </div>
          </div>
          <button
            class="focus:outline-none w-full py-2 text-[0.75rem] hover:bg-neutral-2 overflow-hidden focus:bg-neutral-3 focus:text-neutral-11 focus:shadow-inner text-neutral-10"
            {...apiPopoverMenuActions().closeTriggerProps}
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

export default MenuActions
