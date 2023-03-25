import { A } from 'solid-start'
import { ROUTE_TRANSCRIPTION_NEW } from '~/config'
import { IconPlus } from '~/ui'
import ListTranscriptions from './ListTranscriptions'
import { useBoard } from './useBoard'

export const TranscriptionsBoard = () => {
  const { searchParams, setSearchParams, queryTranscriptionsBoard } = useBoard()

  return (
    <>
      <div class="container flex flex-col-reverse xs:flex-row flex-wrap gap-4 mx-auto pb-6">
        <div class="max-w-prose">
          <h1 class="font-serif text-2xl flex flex-col font-bold">
            <span class="font-sans font-black uppercase tracking-widest text-accent-10 italic">
              Board &nbsp;-&nbsp;
            </span>
            Transcriptions
          </h1>
        </div>
        <div class="xs:mt-2 xs:mis-auto">
          <A
            href={ROUTE_TRANSCRIPTION_NEW}
            class="flex items-center xs:aspect-square focus:bg-neutral-7 focus:shadow-inner border-neutral-5 border focus:border-transparent text-neutral-11 p-2 rounded-md hover:bg-neutral-4"
          >
            <IconPlus class="w-5 h-5" />

            <span class="pis-1ex text-2xs font-medium xs:pis-0 xs:sr-only">Create new transcription</span>
          </A>
        </div>
      </div>
      <main class="border-neutral-4 border-t">
        <div class="container pt-12 mx-auto">
          <ListTranscriptions query={queryTranscriptionsBoard} />
        </div>
      </main>
    </>
  )
}
