import { Title, useParams } from 'solid-start'
import { createResource, Switch, Match } from 'solid-js'
import { useRouteData } from 'solid-start'
import { getOnChainRequest } from '~/services'
import RequestDetails from '~/components/pages/RequestDetails'

export function routeData() {
  const params = useParams<{ chain: string; idRequest: string }>()

  const [request, { mutate, refetch }] = createResource(async () => {
    return await getOnChainRequest({
      chainAlias: params?.chain,
      idRequest: params?.idRequest,
    })
  })
  return { request, mutate }
}

export default function Page() {
  const { request, mutate } = useRouteData<typeof routeData>()
  return (
    <>
      <Switch
        fallback={
          <div class="m-auto">
            <Title> Loading request... | Grimoire</Title>

            <p class="font-bold text-lg animate-pulse">Loading...</p>
          </div>
        }
      >
        <Match
          when={
            !request()?.request_id ||
            request()?.request_id === '0x0000000000000000000000000000000000000000000000000000000000000000'
          }
        >
          <Title> Request not found | Grimoire</Title>
          <div class="container grow mx-auto flex flex-col justify-center items-center">
            <h1 class="font-bold text-2xl pb-4 text-accent-12">Request not found</h1>
            <p class="text-accent-11">This request wasn't deleted or doesn't exist.</p>
          </div>
        </Match>
        <Match when={request()?.request_id !== '0x0000000000000000000000000000000000000000000000000000000000000000'}>
          <Title> {request()?.source_media_title} | Grimoire</Title>
          <RequestDetails mutate={mutate} request={request} />
        </Match>
      </Switch>
    </>
  )
}
