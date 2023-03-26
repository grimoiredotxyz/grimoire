import type { CreateQueryResult } from '@tanstack/solid-query'
import { For, Match, Show, Switch } from 'solid-js'
import { A } from 'solid-start'
import { LOCALES, ROUTE_REQUEST_DETAILS } from '~/config'
import { deriveEthAddressFromPublicKey } from '~/helpers'
import { Identity } from '~/ui'
import Upvote from '../RequestDetails/Upvote'

interface ListRequestsProps {
  filterStatus: string
  query: CreateQueryResult<
    {
      data: {
        data: {
          creator: `0x${string}`
          id: `0x${string}`
          keywords: string
          language: string
          slug: string
          source_media_title: string
          upvotes: number
          voters: `0x${string}`[]
        }
      }[]
      cursor: {
        before: string
        after: string
      }
    },
    unknown
  >
}
export const ListRequests = (props: ListRequestsProps) => {
  return (
    <>
      <Switch>
        <Match when={props.query?.isLoading}>
          <p class="font-bold animate-pulse pt-12 text-interactive-11">Loading requests...</p>
        </Match>
        <Match when={props.query?.isSuccess}>
          <Show
            fallback={
              <>
                <p class="italic">No active requests</p>
              </>
            }
            when={(props.query?.data?.data?.length as number) > 0}
          >
            <ul class="space-y-4">
              <For each={props.query?.data?.data}>
                {(request) => {
                  return (
                    <li class="relative bg-neutral-1 border focus-within:ring-2 border-neutral-6 p-3 xs:p-4 rounded-md">
                      <p class="pb-1 text-accent-11 text-xs">{LOCALES[request.data.language]} </p>
                      <p class="font-bold font-serif text-accent-12">{request.data.source_media_title}</p>
                      <span class="pb-3 block pt-1 text-2xs text-neutral-9 italic">
                        Published on{' '}
                        <span class="capitalize font-semibold">
                          {request.data.slug.split('/')?.[0]?.replace('-', ' ')}
                        </span>
                        &nbsp;{' '}
                        <Show when={request?.data?.creator?.slice(0, 2) === '0x'}>
                          by{' '}
                          <Identity
                            address={deriveEthAddressFromPublicKey(request?.data?.creator) as `0x${string}`}
                            shortenOnFallback={true}
                          />
                        </Show>{' '}
                        | <span>{Object.keys(request?.data?.voters).length} votes</span>
                      </span>

                      <A
                        class="absolute z-0 inset-0 block w-full h-full opacity-0"
                        href={ROUTE_REQUEST_DETAILS.replace(
                          '[chain]/request/[idRequest]',
                          request.data.slug.replace('/', '/request/'),
                        )}
                      >
                        View more details
                      </A>
                      <div class="space-y-4">
                        <span class="link block text-2xs" aria-hidden="true">
                          View more details
                        </span>
                        <Upvote
                          idRequest={request.data?.id}
                          voters={request?.data?.voters}
                          class="relative flex items-center w-auto z-10"
                          scale="sm"
                          intent="neutral-outline"
                        />
                      </div>
                    </li>
                  )
                }}
              </For>
            </ul>
          </Show>
        </Match>
      </Switch>
    </>
  )
}

export default ListRequests
