import { Title, useParams } from 'solid-start'
import { Switch, Match } from 'solid-js'
import { useRouteData } from 'solid-start'
import { getOnChainTranscription } from '~/services'
import TranscriptionDetails from '~/components/pages/TranscriptionDetails'
import { createQuery } from '@tanstack/solid-query'

export function routeData() {
  const params = useParams<{ chain: string; idTranscription: string }>()
  const queryTranscription = createQuery(
    () => ['transcription', `${params?.chain}/${params?.idTranscription}`],
    async () => {
      return await getOnChainTranscription({
        chainAlias: params?.chain,
        idTranscription: params?.idTranscription,
      })
    },
  )

  return queryTranscription
}

export default function Page() {
  const queryTranscription = useRouteData<typeof routeData>()

  return (
    <>
      <Switch>
        <Match when={queryTranscription?.isLoading}>
          <div class="m-auto">
            <Title> Loading transcription... | Grimoire</Title>

            <p class="font-bold text-lg animate-pulse">Loading...</p>
          </div>
        </Match>
        <Match
          when={
            !queryTranscription?.data?.transcription_id ||
            queryTranscription?.data?.transcription_id ===
              '0x0000000000000000000000000000000000000000000000000000000000000000'
          }
        >
          <Title> Transcription not found | Grimoire</Title>
          <div class="container grow mx-auto flex flex-col justify-center items-center">
            <h1 class="font-bold text-2xl pb-4 text-accent-12">Transcription not found</h1>
            <p class="text-accent-11">This transcription wasn't deleted or doesn't exist.</p>
          </div>
        </Match>
        <Match
          when={
            queryTranscription?.data?.transcription_id !==
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          }
        >
          <Title> {queryTranscription?.data?.source_media_title} | Transcribed on Grimoire</Title>

          <TranscriptionDetails transcription={queryTranscription} />
        </Match>
      </Switch>
    </>
  )
}
