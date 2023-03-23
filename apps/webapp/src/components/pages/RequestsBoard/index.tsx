import { Switch, Match, Show } from 'solid-js'
import { A } from 'solid-start'
import { ROUTE_REQUEST_NEW } from '~/config'
import { IconPlus } from '~/ui'
import ListRequests from './ListRequests'
import { useBoard } from './useBoard'

export const RequestsBoard = () => {
  const { searchParams, setSearchParams, queryRequestsBoard, apiTabs } = useBoard()

  return (
    <>
      <div class="container flex flex-col-reverse xs:flex-row flex-wrap gap-4 mx-auto pb-6">
        <div class="max-w-prose">
          <h1 class="font-serif text-2xl flex flex-col font-bold">
            <span class="font-sans font-black uppercase tracking-widest text-accent-10 italic">
              Board &nbsp;-&nbsp;
            </span>
            Transcriptions requests
          </h1>
        </div>
        <div class="xs:mt-2 xs:mis-auto">
          <A
            href={ROUTE_REQUEST_NEW}
            class="flex items-center xs:aspect-square focus:bg-neutral-7 focus:shadow-inner border-neutral-5 border focus:border-transparent text-neutral-11 p-2 rounded-md hover:bg-neutral-4"
          >
            <IconPlus class="w-5 h-5" />

            <span class="pis-1ex text-2xs font-medium xs:pis-0 xs:sr-only">Create new request</span>
          </A>
        </div>
      </div>
      <main {...apiTabs().rootProps}>
        <div class="border-neutral-4 border-b">
          <div class="container flex flex-col xs:flex-row mx-auto" {...apiTabs().tablistProps}>
            <button
              class="data-[selected]:text-interactive-11 data-[selected]:underline xs:data-[selected]:no-underline p-2 xs:pb-2 xs:pt-0.5 font-semibold text-2xs text-neutral-11 xs:data-[selected]:border-b-2 xs:border-b-2 xs:border-transparent xs:data-[selected]:border-b-interactive-9"
              {...apiTabs().getTriggerProps({ value: 'active' })}
            >
              Active
            </button>
            <button
              class="data-[selected]:text-interactive-11 data-[selected]:underline xs:data-[selected]:no-underline p-2 xs:pb-2 xs:pt-0.5 font-semibold text-2xs text-neutral-11 xs:data-[selected]:border-b-2 xs:border-b-2 xs:border-transparent xs:data-[selected]:border-b-interactive-9"
              {...apiTabs().getTriggerProps({ value: 'fulfilled' })}
            >
              Fulfilled
            </button>
          </div>
        </div>
        <div class="container pt-12 mx-auto">
          <div {...apiTabs().getContentProps({ value: 'active' })}>
            <h2 class="pb-4 text-2xs uppercase tracking-wide text-accent-9 font-bold">Active requests</h2>
            <ListRequests filterStatus="active" query={queryRequestsBoard} />
          </div>
          <div {...apiTabs().getContentProps({ value: 'fulfilled' })}>
            <h2 class="pb-4 text-2xs uppercase tracking-wide text-accent-9 font-bold">Fulfilled requests</h2>
            <ListRequests filterStatus="fulfilled" query={queryRequestsBoard} />
          </div>
        </div>
      </main>
    </>
  )
}
