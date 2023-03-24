import { createQueries } from '@tanstack/solid-query'
import { For, Show } from 'solid-js'
import { useParams } from 'solid-start'
import { CHAINS_ALIAS } from '~/config'
import { web3UriToUrl } from '~/helpers'
import RevisionDetails from './RevisionDetails'

export const ListRevisions = (props) => {
  const params = useParams()
  const queriesRevisionsProposals = createQueries({
    queries: props.query?.data?.map(
      (raw: {
        [0]: string // id revision
        [1]: string // transcript id
        [2]: `0x${string}` // creator
        [3]: string // content_uri
        [4]: number // state
      }) => ({
        queryKey: () => ['revision', `${params.chain}/${params.idTranscription}/${raw[0]}`],
        queryFn: async () => {
          const chainId = CHAINS_ALIAS[params.chain]
          const idRevision = raw[0]
          const idTranscription = raw[1]
          const creator = raw[2]
          const metadataUri = raw[3]
          const state = raw[4]
          const uri = web3UriToUrl(metadataUri)
          const response = await fetch(uri)
          const metadata = await response.json()
          let data = {
            chainId,
            slug: `${params.chain}/${idTranscription}/revision/${idRevision}`,
            transcription_id: idTranscription,
            state,
            creator,
            metadata_uri: metadataUri,
            keywords: null,
            language: null,
            lrc_file_uri: null,
            notes: null,
            source_media_title: null,
            source_media_uris: null,
            srt_file_uri: null,
            title: null,
            transcription_plain_text: null,
            vtt_file_uri: null,
            id_revision: idRevision,
            reviewers: props?.contributors,
          }

          data = {
            ...data,
            ...metadata,
          }

          return data
        },
      }),
    ),
  })

  return (
    <>
      <ul class="space-y-6">
        <For each={queriesRevisionsProposals}>
          {(query) => {
            return (
              <>
                <Show when={query?.data}>
                  <li class="bg-neutral-1 relative border focus-within:ring-2 border-neutral-6 p-3 xs:p-4 rounded-md">
                    <RevisionDetails query={query} />
                  </li>
                </Show>
              </>
            )
          }}
        </For>
      </ul>

      <Show when={queriesRevisionsProposals.filter((query) => query.status === 'loading')?.length > 0}>
        <p>Loading details...</p>
      </Show>
    </>
  )
}

export default ListRevisions
