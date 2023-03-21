import { IconChevronDown, IconMenu, IconPlus } from '~/ui'
import { ROUTE_REQUEST_NEW, ROUTE_TRANSCRIPTION_NEW } from '~/config'
import { useAuthentication, usePushChat } from '~/hooks'
import { A } from 'solid-start'
import useMenuActions from './useMenuActions'

export const MenuActions = () => {
  const { queryUserPushChats } = usePushChat()
  const { apiPopoverMenuActions, apiAccordionMenuActions } = useMenuActions()
  const { currentUser } = useAuthentication()

  /*
  const queryMenuContent = createQuery(
    () => ['transcriptions', currentUser()?.address ],
    async () => {
      // Fetch transcriptions created by the current user on multiple chains
      const contracts = Object.keys(CONTRACT_TRANSCRIPTIONS).map(contract => {
        return {
          ...CONTRACT_TRANSCRIPTIONS[contract],

        }
      })
    },
    {
      refetchOnWindowFocus: false,
      get enabled() {
        //@ts-ignore
        return useCurrentUser()?.address ? true : false
      },
    },
  )
  */
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
      <div class="fixed max-h-[90vh] overflow-y-auto text-[0.825rem]" {...apiPopoverMenuActions().positionerProps}>
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
                <div
                  class=" h-[60vh] overflow-y-auto"
                  {...apiAccordionMenuActions().getContentProps({ value: 'transcriptions' })}
                >
                  ... list of transcriptions
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
                <div
                  class=" h-[60vh] overflow-y-auto"
                  {...apiAccordionMenuActions().getContentProps({ value: 'requests' })}
                >
                  ... list of requests
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
                    My contributions
                  </button>
                </h3>
                <div
                  class=" h-[60vh] overflow-y-auto"
                  {...apiAccordionMenuActions().getContentProps({ value: 'contributions' })}
                >
                  ... list of contributions
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
