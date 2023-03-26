import type { CreateQueryResult } from '@tanstack/solid-query'
import { For, Match, Show, Switch } from 'solid-js'
import { A } from 'solid-start'
import { LOCALES, ROUTE_TRANSCRIPTION_DETAILS } from '~/config'
import { deriveEthAddressFromPublicKey } from '~/helpers'
import { IconStarFilled, Identity } from '~/ui'

interface ListTranscriptionsProps {
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
export const ListTranscriptions = (props: ListTranscriptionsProps) => {
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
                  const averageRating = Object.values(request?.data?.rating).reduce((average, value, _, { length }) => {
                    return (average as number) + (value as number) / length
                  }, 0)
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
                        </Show>
                      </span>
                      <p class="pb-2 flex items-center text-2xs text-neutral-11">
                        Average rating:{' '}
                        <span class="pis-2 flex gap-0.5">
                          <For each={[...Array(5).keys()]}>
                            {(x, i) => (
                              <>
                                <IconStarFilled
                                  class="w-3 h-3"
                                  classList={{
                                    'text-accent-5': averageRating <= x,
                                    'text-accent-11': averageRating > x,
                                  }}
                                />
                              </>
                            )}
                          </For>
                        </span>
                      </p>

                      <A
                        class="absolute z-0 inset-0 block w-full h-full opacity-0"
                        href={ROUTE_TRANSCRIPTION_DETAILS.replace(
                          '[chain]/transcription/[idTranscription]',
                          request.data.slug.replace('/', '/transcription/'),
                        )}
                      >
                        View detailed transcription
                      </A>
                      <div class="space-y-4">
                        <span class="link block text-2xs" aria-hidden="true">
                          View detailed transcription
                        </span>
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

export default ListTranscriptions
