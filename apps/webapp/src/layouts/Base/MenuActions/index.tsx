import { createQuery } from '@tanstack/solid-query'
import { For, Match, Switch } from 'solid-js'
import { A } from 'solid-start'
import {
  CHAINS_ALIAS,
  ROUTE_REQUEST_DETAILS,
  ROUTE_REQUEST_NEW,
  ROUTE_TRANSCRIPTION_DETAILS,
  ROUTE_TRANSCRIPTION_NEW,
} from '~/config'
import { useAuthentication, usePushChat } from '~/hooks'
import { getUserContributions } from '~/services'
import { IconChevronDown, IconMenu, IconPlus, IconSpinner } from '~/ui'
import useMenuActions from './useMenuActions'

export const MenuActions = () => {
  const { queryUserPushChats } = usePushChat()
  const { apiPopoverMenuActions, apiAccordionMenuActions } = useMenuActions()
  //@ts-ignore
  const { currentUser } = useAuthentication()

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
                    My transcriptions
                    <Switch>
                      <Match when={queryMenuContent?.isLoading}>
                        <IconSpinner class="w-4 h-4 animate-spin" />
                      </Match>
                      <Match when={queryMenuContent?.data?.transcriptions?.data?.length > 0}>
                        ({queryMenuContent?.data?.transcriptions?.data?.length ?? 0})
                      </Match>
                    </Switch>
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
                    My requests
                    <Switch>
                      <Match when={queryMenuContent?.isLoading}>
                        <IconSpinner class="w-4 h-4 animate-spin" />
                      </Match>
                      <Match when={queryMenuContent?.data?.requests?.data?.length > 0}>
                        ({queryMenuContent?.data?.requests?.data?.length ?? 0})
                      </Match>
                    </Switch>
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
                    My contributions{' '}
                    <Switch>
                      <Match when={queryMenuContent?.isLoading}>
                        <IconSpinner class="w-4 h-4 animate-spin" />
                      </Match>
                      <Match when={queryMenuContent?.data?.revisions?.data?.length > 0}>
                        ({queryMenuContent?.data?.revisions?.data?.length ?? 0})
                      </Match>
                    </Switch>
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
