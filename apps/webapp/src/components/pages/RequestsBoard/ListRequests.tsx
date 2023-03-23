import type { CreateQueryResult } from '@tanstack/solid-query'
import { For, Match, Show, Switch } from 'solid-js'
import { A } from 'solid-start'
import { CHAINS_ALIAS, LOCALES, ROUTE_REQUEST_DETAILS } from '~/config'
import { useAuthentication } from '~/hooks'
import { Button } from '~/ui'
import useRequestActions from '../RequestDetails/useRequestActions'

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
  const { currentUser } = useAuthentication()
  const { mutationUpvoteRequest } = useRequestActions()
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
            <ul>
              <For each={props.query?.data?.data}>
                {(request) => {
                  return (
                    <li class="relative border focus-within:ring-2 border-neutral-6 p-3 xs:p-4 rounded-md">
                      <p class="pb-1 text-accent-11 text-xs">{LOCALES[request.data.language]} </p>
                      <p class="font-bold font-serif text-accent-12">{request.data.source_media_title}</p>
                      <span class="pb-3 block pt-1 text-2xs text-neutral-9 italic">
                        Published on{' '}
                        <span class="capitalize font-semibold">
                          {request.data.slug.split('/')?.[0]?.replace('-', ' ')}
                        </span>
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
                        <Button
                          isLoading={mutationUpvoteRequest.isLoading}
                          onClick={async () => await mutationUpvoteRequest.mutateAsync({ idRequest: request.data.id })}
                          disabled={
                            !currentUser()?.address ||
                            mutationUpvoteRequest.isLoading ||
                            request.data.voters.includes(!currentUser()?.address)
                          }
                          type="button"
                          class="relative z-10"
                          scale="sm"
                          intent="neutral-outline"
                        >
                          <span
                            classList={{
                              'pis-1ex': mutationUpvoteRequest.isLoading,
                            }}
                          >
                            Upvote
                          </span>
                        </Button>
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
