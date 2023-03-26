import { Title, useParams } from 'solid-start'
import { Switch, Match } from 'solid-js'
import { useRouteData } from 'solid-start'
import { getOnChainRequest } from '~/services'
import RequestDetails from '~/components/pages/RequestDetails'
import { createQuery } from '@tanstack/solid-query'

export function routeData() {
  const params = useParams<{ chain: string; idRequest: string }>()

  const queryRequest = createQuery(
    () => ['request', `${params?.chain}/${params?.idRequest}`],
    async () => {
      return await getOnChainRequest({
        chainAlias: params?.chain,
        idRequest: params?.idRequest,
      })
    },
  )

  return queryRequest
}

export default function Page() {
  const queryRequest = useRouteData<typeof routeData>()
  return (
    <>
      <Switch>
        <Match when={queryRequest?.isLoading}>
          <div class="m-auto">
            <Title> Loading request... | Grimoire</Title>
            <p class="font-bold text-lg animate-pulse">Loading...</p>
          </div>
        </Match>
        <Match
          when={
            !queryRequest?.data?.request_id ||
            queryRequest?.data?.request_id === '0x0000000000000000000000000000000000000000000000000000000000000000'
          }
        >
          <Title> Request not found | Grimoire</Title>
          <div class="container grow mx-auto flex flex-col justify-center items-center">
            <h1 class="font-bold text-2xl pb-4 text-accent-12">Request not found</h1>
            <p class="text-accent-11">This request wasn't deleted or doesn't exist.</p>
          </div>
        </Match>
        <Match
          when={queryRequest?.data?.request_id !== '0x0000000000000000000000000000000000000000000000000000000000000000'}
        >
          <Title> {queryRequest?.data?.source_media_title} | Grimoire</Title>
          <RequestDetails request={queryRequest} />
        </Match>
      </Switch>
    </>
  )
}
