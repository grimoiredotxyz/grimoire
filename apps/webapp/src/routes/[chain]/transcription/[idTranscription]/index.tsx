import { Title, useParams } from 'solid-start'
import { createResource, Switch, Match } from 'solid-js'
import { useRouteData } from 'solid-start'
import { getOnChainTranscription } from '~/services'
import TranscriptionDetails from '~/components/pages/TranscriptionDetails'

export function routeData() {
  const params = useParams<{ chain: string; idTranscription: string }>()

  const [transcription] = createResource(async () => {
    return await getOnChainTranscription({
      chainAlias: params?.chain,
      idTranscription: params?.idTranscription,
    })
  })
  return { transcription }
}

export default function Page() {
  const { transcription } = useRouteData<typeof routeData>()

  return (
    <>
      <Switch
        fallback={
          <div class="m-auto">
            <Title> Loading transcription... | Grimoire</Title>

            <p class="font-bold text-lg animate-pulse">Loading...</p>
          </div>
        }
      >
        <Match
          when={
            !transcription()?.transcription_id ||
            transcription()?.transcription_id === '0x0000000000000000000000000000000000000000000000000000000000000000'
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
            transcription()?.transcription_id !== '0x0000000000000000000000000000000000000000000000000000000000000000'
          }
        >
          <Title> {transcription()?.source_media_title} | Transcribed on Grimoire</Title>

          <TranscriptionDetails transcription={transcription} />
        </Match>
      </Switch>
    </>
  )
}
